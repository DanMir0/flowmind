import { defineStore } from 'pinia'
import { supabase } from '@/services/supabase'
import { useAuthStore } from './auth'
import { handleSupabaseError } from '@/utils/appError.js'
import { data } from 'autoprefixer'

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
          .select(`*, task_files(*)`)
          .eq('user_id', auth.user.id)
          .eq('archived', false)
          .order('position', { ascending: true })

        if (error) handleSupabaseError(error, 'fetchTasks')

        data.forEach(newTask => {
          const existing = this.tasks.find(t => t.id === newTask.id)

          if (existing) {
            Object.assign(existing, newTask)
          } else {
            this.tasks.push({
              ...newTask,
              task_files: newTask.task_files ?? [],
              _filesLoaded: true,
              completed: Boolean(newTask.completed)
            })
          }
        })
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

      if (task._filesLoaded) return

      const { data, error } = await supabase
        .from('task_files')
        .select('*')
        .eq('task_id', taskId)
        .order('uploaded_at', { ascending: true })

      if (error) throw error

      task.task_files ??= []
      task.task_files.splice(0, task.task_files.length, ...data)

      task._filesLoaded = true
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
        .select('*')
        .single()

      if (error) handleSupabaseError(error, 'addTask')

      const storeTask = {
        ...task,
        task_files: [],
        files_loading: true,
        status: 'creating'
      }

      this.tasks.unshift(storeTask)

      /* только upload */
      if (payload.newFiles?.length) {
        await this.uploadMultipleFiles(storeTask, payload.newFiles)
      }

      await this.syncTaskFiles(task.id)

      const idx = this.tasks.findIndex(t => t.id === task.id)
      if (idx !== -1) {
        this.tasks[idx].files_loading = false
        this.tasks[idx].status = 'ready'
      }

    },

    async updateTask(taskId, payload) {
      const auth = useAuthStore()
      if (!auth.user) throw new Error('Not authenticated')

      /* 1. update task */
      const { error: updateError } = await supabase
        .from('tasks')
        .update({
          title: payload.title,
          description: payload.description,
          priority: payload.priority,
          deadline: payload.deadline,
          category: payload.category,
          time: payload.time,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)
        .eq('user_id', auth.user.id)

      if (updateError) throw updateError

      /* 2. delete files */
      if (payload.filesToDelete?.length) {
        for (const file of payload.filesToDelete) {
          await supabase.storage
            .from('task-files')
            .remove([file.file_path])

          await supabase
            .from('task_files')
            .delete()
            .eq('id', file.id)
        }
      }

      /* 3. upload files */
      if (payload.newFiles?.length) {
        for (const file of payload.newFiles) {
          const ext = file.name.split('.').pop()
          const filePath = `${auth.user.id}/${taskId}/${Date.now()}-${crypto.randomUUID()}.${ext}`

          const { error: uploadError } = await supabase.storage
            .from('task-files')
            .upload(filePath, file)

          if (uploadError) throw uploadError

          const { error: insertError } = await supabase
            .from('task_files')
            .insert({
              task_id: taskId,
              user_id: auth.user.id,
              file_name: file.name,
              file_path: filePath,
              file_type: file.type,
              file_size: file.size
            })

          if (insertError) throw insertError
        }
      }
      await this.refreshTaskFiles(taskId)
    },

    async uploadMultipleFiles(task, files) {
      if (!files?.length) return

      // task.task_files ??= []

      for (const file of files) {
        await this.uploadSingleFile(task, file)
      }
      // await Promise.all(files.map(file => this.uploadSingleFile(task, file)))
    },

    async uploadSingleFile(task, file) {
      const auth = useAuthStore()

      const ext = file.name.split('.').pop()
      const safeName = `${Date.now()}-${crypto.randomUUID()}.${ext}`
      const filePath = `${auth.user.id}/${task.id}/${safeName}`

      try {
        // 2. upload storage
        const { error: uploadError } = await supabase.storage
          .from('task-files')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        // 3. insert DB
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


      } catch (e) {
        console.error('UPLOAD FAILED:', e)

        throw e
      }
    },

    async deleteFile(file) {
      const task = this.tasks.find(t => t.id === file.task_id)
      if (!task) return

      task.task_files = task.task_files ?? []

      const idx = task.task_files.findIndex(f => f.id === file.id)
      if (idx !== -1)
      {
        task.task_files.splice(idx, 1)
      }

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
      const {error} = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)

      if (error) throw error
      this.tasks = this.tasks.filter(t => t.id !== taskId)
      // const task = this.tasks.find(t => t.id === taskId)
      // if (!task) return
      //
      //
      // const { data: files, error } = await supabase
      //   .from('task_files')
      //   .select('id, file_path')
      //   .eq('task_id', taskId)
      //
      // if (error) throw error
      //
      // // удаляем файлы
      // if (files?.length) {
      //   await Promise.all(files.map(f => this.deleteFile(f)))
      // }
      //
      // // удаляем задачу
      // const { error: deleteError } = await supabase
      //   .from('tasks')
      //   .delete()
      //   .eq('id', taskId)
      //
      // if (deleteError) throw deleteError
      //
      // this.tasks = this.tasks.filter(t => t.id !== taskId)
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

    async fetchTaskFiles(taskId) {
      const { data, error } = await supabase
        .from('task_files')
        .select('*')
        .eq('task_id', taskId)

      if (error) throw error

      const task = this.tasks.find(t => t.id === taskId)
      if (task) {
        task.task_files = data
      }
    },

    async refreshTaskFiles(taskId) {
      const { data, error } = await supabase
        .from('task_files')
        .select('*')
        .eq('task_id', taskId)

      if (error) throw error

      const task = this.tasks.find(t => t.id === taskId)
      if (task) {
        task.task_files = data
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
    },

    initRealtime() {

      supabase
        .channel('task-files-realtime')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'task_files'
          },
          (payload) => {
            console.log('REALTIME:', payload)

            const { eventType, new: newRow, old: oldRow } = payload

            if (eventType === 'INSERT') {
              this.onFileInsert(newRow)
            }

            if (eventType === 'DELETE') {
              this.onFileDelete(oldRow)
            }
          }
        )
        .subscribe()

      supabase
        .channel('tasks-realtime')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'tasks'
          },
          (payload) => {
            this.onTaskUpdate(payload.new)
          }
        )
        .subscribe()
    },

    onFileInsert(file) {
      const task = this.tasks.find(t => t.id === file.task_id)
      if (!task) return

      task.task_files = task.task_files ?? []

      const exists = task.task_files.some(f => f.id === file.id)
      if (!exists) {
        task.task_files.push(file)
      }
    },

    onFileDelete(file) {
      const task = this.tasks.find(t => t.id === file.task_id)
      if (!task) return

      task.task_files = task.task_files ?? []

      task.task_files = task.task_files.filter(f => f.id !== file.id)
    },

    onTaskUpdate(updatedTask) {
      const index = this.tasks.findIndex(t => t.id === updatedTask.id)

      if (index !== -1) {
        this.tasks[index] = {
          ...this.tasks[index],
          ...updatedTask,
          completed: Boolean(updatedTask.completed)
        }
      }
    },

    async syncTaskFiles(taskId) {
      const { data } = await supabase
        .from('task_files')
        .select('*')
        .eq('task_id', taskId)

      const idx = this.tasks.findIndex(t => t.id === taskId)

      if (idx !== -1) {
        this.tasks[idx].task_files = data
        this.tasks[idx].files_loading = false
        this.tasks[idx].status = 'ready'
      }
      // const task = this.tasks.find(t => t.id === taskId)
      // if (task) {
      //   task.task_files = data
      // }
    },
  }
})
