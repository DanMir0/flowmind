import { defineStore } from 'pinia'
import { supabase } from '@/services/supabase'
import { useAuthStore } from './auth'
import { handleSupabaseError } from '@/utils/appError.js'

const MAX_ACTIVE_TASKS = 500;
export const useTasksStore = defineStore('tasks', {
  state: () => ({
    tasks: [],
    archivedTasks: [],
    loading: false,
    error: null,
    isInitialized: false,
  }),

  actions: {
    /* =========================
       FETCH TASKS (NO FILES)
    ========================= */
    async fetchTasks() {
      const auth = useAuthStore()
      if (!auth.user) return

      try {
        this.loading = true

        const { data, error } = await supabase
          .from('tasks')
          .select(`*,
          task_files(id,file_name,file_path)`)
          .eq('user_id', auth.user.id)
          .eq('archived', false)
          .order('position', { ascending: true })

        if (error) handleSupabaseError(error, 'fetchTasks')

        this.tasks = data.map(task => ({
          ...task,
          completed: Boolean(task.completed),
        }))
      } catch (e) {
        this.error = e.message || 'Failed to load tasks'
      } finally {
        this.loading = false
      }
    },

    /* =========================
       LOAD FILES FOR ONE TASK
    ========================= */
    async loadTaskFiles(taskId) {
      const task = this.tasks.find(t => t.id === taskId)
      if (!task) return

      const { data, error } = await supabase
        .from('task_files')
        .select('*')
        .eq('task_id', taskId)
        .order('uploaded_at', { ascending: true })

      if (error) throw error

      task.task_files = data

      return data
    },


    /* =========================
       ADD TASK
    ========================= */
    async addTask(payload) {
      const auth = useAuthStore()
      if (!auth.user) throw new Error('Not authenticated')

      if (this.tasks.length >= MAX_ACTIVE_TASKS) {
        throw new Error('Active tasks limit reached (500). Archive old tasks.')
      }

      if (payload.deadline) {
        const d = new Date(payload.deadline)
        if (isNaN(d.getTime())) {
          throw new Error('Invalid date')
        }
      }

      const { data: task, error } = await supabase
        .from('tasks')
        .insert({
          title: payload.title,
          description: payload.description,
          deadline: payload.deadline,
          priority: payload.priority,
          user_id: auth.user.id,
          position: Date.now(),
          category: payload.category,
          time: payload.time,
        })
        .select(`
          id,
          title,
          description,
          priority,
          deadline,
          category,
          time,
          created_at,
          files_count,
          position
        `)
        .single()

      if (error) handleSupabaseError(error, 'addTask')

      const newTask = {
        ...task,
        task_files: []
      }

      this.tasks.unshift(newTask)

      /* upload files (if any) */
      if (payload.newFiles?.length) {
        await this.uploadMultipleFiles(newTask, payload.newFiles)
      }

    },

    async updateTask(taskId, payload) {
      const auth = useAuthStore()
      if (!auth.user) throw new Error('Not authenticated')

      const task = this.tasks.find(t => t.id === taskId)

      /* update task fields */
      await supabase
        .from('tasks')
        .update({
          title: payload.title,
          description: payload.description,
          priority: payload.priority,
          deadline: payload.deadline,
          updated_at: new Date(),
          category: payload.category,
          time: payload.time
        })
        .eq('id', taskId)
        .eq('user_id', auth.user.id)

      /* delete files */
      for (const file of payload.filesToDelete || []) {
        await this.deleteFile(file)
      }

      /* upload new files */
      await this.uploadMultipleFiles(task, payload.newFiles || [])

      /* ПЕРЕЗАГРУЖАЕМ ФАЙЛЫ ИЗ БД */
      const { data: files, error: filesError } = await supabase
        .from('task_files')
        .select('*')
        .eq('task_id', taskId)
        .order('uploaded_at', { ascending: true })

      if (filesError) throw filesError

      /* ПЕРЕЗАГРУЖАЕМ ЗАДАЧУ */
      const { data: freshTask, error } = await supabase
        .from('tasks')
        .select(`
      id,
      title,
      description,
      priority,
      deadline,
      category,
      time,
      created_at,
      files_count,
      position
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

    async uploadMultipleFiles(task, files) {
      if (!files?.length) return

      await Promise.all(files.map(file => this.uploadSingleFile(task, file)))

      await this.loadTaskFiles(task.id)
    },

    async uploadSingleFile(task, file) {
      const auth = useAuthStore()

      const tempId = crypto.randomUUID()

      // optimistic UI
      task.task_files.push({
        id: tempId,
        file_name: file.name,
        uploading: true
      })

      const ext = file.name.split('.').pop()
      const safeName = `${Date.now()}-${crypto.randomUUID()}.${ext}`
      const filePath = `${auth.user.id}/${task.id}/${safeName}`

      try {
        // 1. upload в storage
        const { error: uploadError } = await supabase.storage
          .from('task-files')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        // 2. insert в БД
        const { data, error } = await supabase
          .from('task_files')
          .insert({
            task_id: task.id,
            user_id: auth.user.id,
            file_name: file.name,
            file_path: filePath,
            file_type: file.type,
            file_size: file.size
          })
          .select()
          .single()

        if (error) throw error

        // 3. replace temp
        const idx = task.task_files.findIndex(f => f.id === tempId)
        if (idx !== -1) {
          task.task_files[idx] = data
        }

      } catch (e) {
        // rollback
        task.task_files = task.task_files.filter(f => f.id !== tempId)
        throw e
      }
    },

    async deleteFile(file) {
      await supabase.storage
        .from('task-files')
        .remove([file.file_path])

      await supabase
        .from('task_files')
        .delete()
        .eq('id', file.id)
    },

    /* =========================
       DELETE TASK
    ========================= */
    async deleteTask(taskId) {
      const task = this.tasks.find(t => t.id === taskId)
      if (!task) return


      const {data: files} = await supabase
        .from('task_files')
        .select('file_path')
        .eq('task_id', taskId)

      await Promise.all(files.map(f => this.deleteFile(f)))

      this.tasks = this.tasks.filter(t => t.id !== taskId)
    },

    async toggleTaskCompleted(taskId) {
      const task = this.tasks.find(t => t.id === taskId)
      if (!task) return

      const prevCompleted = task.completed
      const prevCompletedAt = task.completed_at

      const newValue = !prevCompleted
      const newCompletedAt = newValue ? new Date().toISOString() : null

      // optimistic
      task.completed = newValue
      task.completed_at = newCompletedAt

      const { error } = await supabase
        .from('tasks')
        .update({
          completed: newValue,
          completed_at: newCompletedAt,
        })
        .eq('id', taskId)

      if (error) {
        // rollback
        task.completed = prevCompleted
        task.completed_at = prevCompletedAt
        handleSupabaseError(error, 'toggleTaskCompleted')
      }
    },

    async updatePositions(list) {
      for (const item of list) {
        const { error } = await supabase
          .from('tasks')
          .update({ position: item.position })
          .eq('id', item.id)

        if (error) {
          console.error(error)
        }
      }
    },

    async reorderTasks(draggedId, targetId) {
      const updated = [...this.tasks]

      const fromIndex = updated.findIndex(t => t.id === draggedId)
      const toIndex = updated.findIndex(t => t.id === targetId)

      const moved = updated.splice(fromIndex, 1)[0]
      updated.splice(toIndex, 0, moved)

      // пересчитываем position
      updated.forEach((task, index) => {
        task.position = index
      })

      // обновляем store реактивно
      this.tasks = updated

      // сохраняем в БД
      await this.updatePositions(
        updated.map(t => ({
          id: t.id,
          position: t.position
        }))
      )
    },

    async autoArchiveOldCompleted() {
      const thirtySecondsAgo = new Date()
      thirtySecondsAgo.setSeconds(thirtySecondsAgo.getSeconds() - 30)

      // 1. найдём какие задачи уйдут в архив
      const toArchive = this.tasks.filter(t =>
        t.completed &&
        new Date(t.completed_at) <= thirtySecondsAgo
      )

      if (!toArchive.length) return

      const ids = toArchive.map(t => t.id)

      // 2. ОПТИМИСТИЧНО убираем из UI
      this.tasks = this.tasks.filter(t => !ids.includes(t.id))

      // (опционально) добавляем в архив локально
      this.archivedTasks.unshift(...toArchive.map(t => ({
        ...t,
        archived: true
      })))

      // 3. отправляем в БД
      const { error } = await supabase
        .from('tasks')
        .update({ archived: true })
        .in('id', ids)

      // 4. rollback если ошибка
      if (error) {
        console.error(error)

        // возвращаем назад
        this.tasks.push(...toArchive)
        this.archivedTasks = this.archivedTasks.filter(t => !ids.includes(t.id))

        throw error
      }
    },

    async initTasks() {
      if (this.isInitialized) return

      const auth = useAuthStore()
      if (!auth.user) return

      await this.fetchTasks()
      this.setupRealtime()

      this.isInitialized = true
    },

    async fetchArchivedTasks() {
      const auth = useAuthStore()
      if (!auth.user) return

      this.loading = true

      const { data, error } = await supabase
        .from('tasks_with_files_count')
        .select('*')
        .eq('user_id', auth.user.id)
        .eq('archived', true)
        .order('completed_at', { ascending: false })

      if (error) throw error

      this.archivedTasks = data
      this.loading = false
    },

    async restoreTask(taskId) {
      const task = this.archivedTasks.find(t => t.id === taskId)
      if (!task) return

      // 1. сразу обновляем UI
      this.archivedTasks = this.archivedTasks.filter(t => t.id !== taskId)
      this.tasks.unshift({ ...task, archived: false })

      // 2. запрос в БД
      const { error } = await supabase
        .from('tasks')
        .update({
          archived: false,
          position: Date.now()
        })
        .eq('id', taskId)

      // 3. rollback если ошибка
      if (error) {
        console.error(error)

        this.tasks = this.tasks.filter(t => t.id !== taskId)
        this.archivedTasks.unshift(task)

        throw error
      }
    },

    handleRealtime(payload) {
      const { eventType, new: newRow, old: oldRow } = payload

      if (eventType === 'UPDATE') {
        this.handleUpdate(newRow)
      }

      if (eventType === 'INSERT') {
        const exists = this.tasks.some(t => t.id === newRow.id)
        if (!exists) {
          this.tasks.unshift(newRow)
        }
      }

      if (eventType === 'DELETE') {
        if (!oldRow) return
        this.tasks = this.tasks.filter(t => t.id !== oldRow.id)
        this.archivedTasks = this.archivedTasks.filter(t => t.id !== oldRow.id)
      }
    },

    handleUpdate(task) {
      const isArchived = task.archived

      // удалить из обычных задач
      this.tasks = this.tasks.filter(t => t.id !== task.id)

      // удалить из архива
      this.archivedTasks = this.archivedTasks.filter(t => t.id !== task.id)

      if (isArchived) {
        this.archivedTasks.unshift(task)
      } else {
        this.tasks.unshift(task)
      }
    },

    setupRealtime() {
      const auth = useAuthStore()
      if (!auth.user) return

      const channel = supabase
        .channel('tasks-realtime')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'tasks',
            filter: `user_id=eq.${auth.user.id}`
    },
      (payload) => {
        this.handleRealtime(payload)
      }
    )
    .subscribe()

      this.channel = channel
    }
  }
})
