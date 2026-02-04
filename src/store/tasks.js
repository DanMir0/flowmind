import { defineStore } from 'pinia'
import { supabase } from '@/services/supabase'
import { useAuthStore } from './auth'

export const useTasksStore = defineStore('tasks', {
  state: () => ({
    tasks: [],
    loading: false,
    error: null
  }),

  actions: {
    /* =========================
       FETCH TASKS (NO FILES)
    ========================= */
    async fetchTasks() {
      const auth = useAuthStore()
      if (!auth.user) return

      this.loading = true

      const { data, error } = await supabase
        .from('tasks_with_files_count')
        .select('*')
        .eq('user_id', auth.user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      this.tasks = data.map(task => ({
        ...task,
        task_files: undefined // lazy load
      }))

      this.loading = false
    },

    /* =========================
       LOAD FILES FOR ONE TASK
    ========================= */
    async loadTaskFiles(taskId) {
      const task = this.tasks.find(t => t.id === taskId)
      if (!task) return

      if (Array.isArray(task.task_files)) return

      const { data, error } = await supabase
        .from('task_files')
        .select('*')
        .eq('task_id', taskId)
        .order('uploaded_at', { ascending: true })

      if (error) throw error

      task.task_files = data
    },

    /* =========================
       ADD TASK
    ========================= */
    async addTask(payload) {
      const auth = useAuthStore()
      if (!auth.user) throw new Error('Not authenticated')

      const { data: task, error } = await supabase
        .from('tasks')
        .insert({
          title: payload.title,
          description: payload.description,
          deadline: payload.deadline,
          priority: payload.priority,
          user_id: auth.user.id
        })
        .select(`
          id,
          title,
          description,
          priority,
          deadline,
          created_at,
          files_count
        `)
        .single()

      if (error) throw error

      const newTask = {
        ...task,
        task_files: []
      }

      this.tasks.unshift(newTask)

      /* upload files (if any) */
      if (payload.newFiles?.length) {
        await this.uploadMultipleFiles(newTask.id, payload.newFiles)
      }
    },

    async updateTask(taskId, payload) {
      const auth = useAuthStore()
      if (!auth.user) throw new Error('Not authenticated')

      /* update task fields */
      await supabase
        .from('tasks')
        .update({
          title: payload.title,
          description: payload.description,
          priority: payload.priority,
          deadline: payload.deadline,
          updated_at: new Date()
        })
        .eq('id', taskId)
        .eq('user_id', auth.user.id)

      /* delete files */
      for (const file of payload.filesToDelete || []) {
        await supabase.storage
          .from('task-files')
          .remove([file.file_path])

        await supabase
          .from('task_files')
          .delete()
          .eq('id', file.id)
      }

      /* upload new files */
      await this.uploadMultipleFiles(taskId, payload.newFiles || [])

      /* 🔥 ПЕРЕЗАГРУЖАЕМ ФАЙЛЫ ИЗ БД */
      const { data: files, error: filesError } = await supabase
        .from('task_files')
        .select('*')
        .eq('task_id', taskId)
        .order('uploaded_at', { ascending: true })

      if (filesError) throw filesError

      /* 🔥 ПЕРЕЗАГРУЖАЕМ ЗАДАЧУ */
      const { data: freshTask, error } = await supabase
        .from('tasks')
        .select(`
      id,
      title,
      description,
      priority,
      deadline,
      created_at,
      files_count
    `)
        .eq('id', taskId)
        .single()

      if (error) throw error

      /* 🔥 АТОМАРНАЯ ЗАМЕНА */
      const index = this.tasks.findIndex(t => t.id === taskId)

      this.tasks[index] = {
        ...freshTask,
        task_files: files
      }
    },

    async uploadMultipleFiles(taskId, files) {
      const auth = useAuthStore()
      const task = this.tasks.find(t => t.id === taskId)
      if (!auth.user || !task || !files?.length) return

      task.task_files ??= []

      for (const file of files) {
        const tempId = crypto.randomUUID()

        /* optimistic UI */
        task.task_files.push({
          id: tempId,
          task_id: taskId,
          file_name: file.name,
          uploading: true
        })

        const ext = file.name.split('.').pop()
        const safeName = `${Date.now()}-${crypto.randomUUID()}.${ext}`
        const filePath = `${auth.user.id}/${taskId}/${safeName}`

        try {
          /* upload */
          await supabase.storage
            .from('task-files')
            .upload(filePath, file)

          /* insert metadata */
          const { data: savedFile, error } = await supabase
            .from('task_files')
            .insert({
              task_id: taskId,
              file_name: file.name,
              file_path: filePath,
              file_type: file.type,
              file_size: file.size
            })
            .select()
            .single()

          if (error) throw error

          /* replace temp */
          const idx = task.task_files.findIndex(f => f.id === tempId)
          task.task_files[idx] = savedFile

        } catch (e) {
          /* rollback */
          task.task_files = task.task_files.filter(f => f.id !== tempId)
          throw e
        }
      }
    },

    async deleteFile(file) {
      const task = this.tasks.find(t => t.id === file.task_id)
      if (!task) return

      /* optimistic UI */
      task.task_files = task.task_files.filter(f => f.id !== file.id)

      await supabase.storage
        .from('task-files')
        .remove([file.file_path])

      await supabase
        .from('task_files')
        .delete()
        .eq('id', file.id)

      const { data: newCount } = await supabase.rpc(
        'task_increment_files',
        { task_id: file.task_id, delta: -1 }
      )

      task.files_count = Math.max(0, newCount)
    },

    /* =========================
       DELETE TASK
    ========================= */
    async deleteTask(taskId) {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)

      if (error) throw error

      this.tasks = this.tasks.filter(t => t.id !== taskId)
    },

    async toggleTaskCompleted(taskId) {
      const task = this.tasks.find(t => t.id === taskId)
      if (!task) return

      const previous = task.completed
      const newValue = !previous

      // optimistic
      task.completed = newValue
      task.completed_at = newValue ? new Date() : null

      const { error } = await supabase
        .from('tasks')
        .update({
          completed: newValue,
          completed_at: task.completed_at
        })
        .eq('id', taskId)

      if (error) {
        // rollback
        task.completed = previous
        task.completed_at = previous ? task.completed_at : null
        throw error
      }
    }


  }
})
