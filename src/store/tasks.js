import { defineStore } from 'pinia'
import { supabase } from '@/services/supabase'
import { useAuthStore } from './auth'

// function generateSafeFileName(file) {
//   const ext = file.name.split('.').pop()
//   return `${Date.now()}.${ext}`
// }
/* Генерируем безопасное имя для storage */
function generateSafeFileName(file) {
  const ext = file.name.split('.').pop()
  return `${Date.now()}-${crypto.randomUUID()}.${ext}`
}

export const useTasksStore = defineStore('tasks', {
  state: () => ({
    tasks: [],
    loading: false,
    error: null,
  }),

  actions: {
    async fetchTasks() {
      const auth = useAuthStore()

      if (!auth.user) {
        this.loading = false
        return
      }

      this.loading = true
      this.error = null

      try {
        const { data, error } = await supabase
          .from('tasks')
          .select(`*, task_files(*)`)
          .eq('user_id', auth.user.id)
          .order('created_at', { ascending: false })

        if (error) throw error

        this.tasks = data || []
      } catch (err) {
        console.error(err)
        this.error = err.message || 'Failed to load tasks'
      } finally {

        this.loading = false
      }
    },

    async addTask(payload) {
      const auth = useAuthStore()
      if (!auth.user) throw new Error('Not authenticated')

      /** 1. Создаём задачу */
      const { data: task, error } = await supabase
        .from('tasks')
        .insert({
          title: payload.title,
          description: payload.description,
          deadline: payload.deadline,
          priority: payload.priority,
          user_id: auth.user.id
        })
        .select()
        .single()

      if (error) throw error


      await this.fetchTasks()
    },

    async updateTask(taskId, payload) {
      const auth = useAuthStore()

      const { error } = await supabase
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

      if (error) throw error

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
      if (payload.newFiles?.length) {
        await this.uploadMultipleFiles(taskId, payload.newFiles)
      }

      /* ✅ ОДИН fetch */
      await this.fetchTasks()
    },

    async uploadMultipleFiles(taskId, files) {
      const auth = useAuthStore()
      if (!auth.user || !files?.length) return

      for (const file of files) {
        const safeName = generateSafeFileName(file)
        const filePath = `${auth.user.id}/${taskId}/${safeName}`

        /* upload to storage */
        const { error: uploadError } = await supabase.storage
          .from('task-files')
          .upload(filePath, file, {
            contentType: file.type,
            upsert: false
          })

        if (uploadError) throw uploadError

        /* save metadata */
        const { error } = await supabase
          .from('task_files')
          .insert({
            task_id: taskId,
            file_name: file.name, // original (RU OK)
            file_path: filePath,
            file_type: file.type,
            file_size: file.size
          })

        if (error) throw error
      }
    },

    async deleteFile(file) {
      /* remove from storage */
      await supabase.storage
        .from('task-files')
        .remove([file.file_path])

      /* remove from DB */
      const { error } = await supabase
        .from('task_files')
        .delete()
        .eq('id', file.id)

      if (error) throw error

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
    }
  }
})
