// import { defineStore } from 'pinia'
// import { supabase } from '@/services/supabase'
// import { useAuthStore } from './auth'
//
// // function generateSafeFileName(file) {
// //   const ext = file.name.split('.').pop()
// //   return `${Date.now()}.${ext}`
// // }
// /* Генерируем безопасное имя для storage */
// function generateSafeFileName(file) {
//   const ext = file.name.split('.').pop()
//   return `${Date.now()}-${crypto.randomUUID()}.${ext}`
// }
//
// export const useTasksStore = defineStore('tasks', {
//   state: () => ({
//     tasks: [],
//     loading: false,
//     error: null,
//   }),
//
//   actions: {
//     async fetchTasks() {
//       const auth = useAuthStore()
//
//       const { data, error } = await supabase
//         .from('tasks')
//         .select(`
//       id,
//       title,
//       deadline,
//       priority,
//       created_at
//     `)
//         .eq('user_id', auth.user.id)
//         .order('created_at', { ascending: false })
//
//       if (error) throw error
//
//       this.tasks = data.map(task => ({
//         ...task,
//         task_files: undefined // ⬅ важно
//       }))
//     },
//
//     // async fetchTasks() {
//     //   const auth = useAuthStore()
//     //
//     //   if (!auth.user) return
//     //
//     //   this.loading = true
//     //
//     //   const {data, error} = await supabase
//     //     .from('tasks')
//     //     .select('*')
//     //     .eq('user_id', auth.user.id)
//     //     .order('created_at', {ascending: false})
//     //
//     //   if (error) throw error
//     //
//     //   this.tasks = data
//     //   this.loading = false
//     // },
//
//     // async fetchTaskFiles(taskId) {
//     //   const { data, error } = await supabase
//     //     .from('task_files')
//     //     .select('*')
//     //     .eq('task_id', taskId)
//     //
//     //   if (error) throw error
//     //   return data
//     // },
//     async loadTaskFiles(taskId) {
//       const task = this.tasks.find(t => t.id === taskId)
//       if (!task) return
//
//       // ⛔️ если уже загружены — не дергаем API
//       if (Array.isArray(task.task_files)) return
//
//       const { data, error } = await supabase
//         .from('task_files')
//         .select('*')
//         .eq('task_id', taskId)
//         .order('created_at')
//
//       if (error) throw error
//
//       // ✅ один раз
//       task.task_files = data
//     },
//
//
//     async addTask(payload) {
//       const auth = useAuthStore()
//       if (!auth.user) throw new Error('Not authenticated')
//
//       /** 1. Создаём задачу */
//       const { data: task, error } = await supabase
//         .from('tasks')
//         .insert({
//           title: payload.title,
//           description: payload.description,
//           deadline: payload.deadline,
//           priority: payload.priority,
//           user_id: auth.user.id
//         })
//         .select()
//         .single()
//
//       if (error) throw error
//
//
//       await this.fetchTasks()
//     },
//
//     async updateTask(taskId, payload) {
//       const auth = useAuthStore()
//       if (!auth.user) throw new Error('Not authenticated')
//
//       /* 1️⃣ update task fields */
//       const { error } = await supabase
//         .from('tasks')
//         .update({
//           title: payload.title,
//           description: payload.description,
//           priority: payload.priority,
//           deadline: payload.deadline,
//           updated_at: new Date()
//         })
//         .eq('id', taskId)
//         .eq('user_id', auth.user.id)
//
//       if (error) throw error
//
//       /* 2️⃣ delete files */
//       for (const file of payload.filesToDelete || []) {
//         await supabase.storage
//           .from('task-files')
//           .remove([file.file_path])
//
//         await supabase
//           .from('task_files')
//           .delete()
//           .eq('id', file.id)
//       }
//
//       /* 3️⃣ upload new files */
//       await this.uploadMultipleFiles(taskId, payload.newFiles || [])
//
//       /* 4️⃣ ОБНОВЛЯЕМ ТОЛЬКО ЛОКАЛЬНО (без fetchTasks) */
//       const taskIndex = this.tasks.findIndex(t => t.id === taskId)
//       if (taskIndex !== -1) {
//         this.tasks[taskIndex] = {
//           ...this.tasks[taskIndex],
//           title: payload.title,
//           description: payload.description,
//           priority: payload.priority,
//           deadline: payload.deadline
//         }
//       }
//     },
//
//     // async uploadMultipleFiles(taskId, files) {
//     //   const auth = useAuthStore()
//     //   if (!auth.user || !files?.length) return
//     //
//     //   const task = this.tasks.find(t => t.id === taskId)
//     //   if (!task) return
//     //
//     //   for (const file of files) {
//     //     const safeName = generateSafeFileName(file)
//     //     const filePath = `${auth.user.id}/${taskId}/${safeName}`
//     //
//     //     /* 1️⃣ upload to storage */
//     //     const { error: uploadError } = await supabase.storage
//     //       .from('task-files')
//     //       .upload(filePath, file, {
//     //         contentType: file.type,
//     //         upsert: false
//     //       })
//     //
//     //     if (uploadError) throw uploadError
//     //
//     //     /* 2️⃣ insert metadata */
//     //     const { data, error } = await supabase
//     //       .from('task_files')
//     //       .insert({
//     //         task_id: taskId,
//     //         file_name: file.name,
//     //         file_path: filePath,
//     //         file_type: file.type,
//     //         file_size: file.size
//     //       })
//     //       .select()
//     //       .single()
//     //
//     //     if (error) throw error
//     //
//     //     /* 3️⃣ OPTIMISTIC UPDATE */
//     //     task.task_files = task.task_files || []
//     //     task.task_files.push(data)
//     //   }
//     // },
//
//     async uploadMultipleFiles(taskId, files) {
//       const auth = useAuthStore()
//       const task = this.tasks.find(t => t.id === taskId)
//
//       if (!task || !files?.length) return
//
//       for (const file of files) {
//         const tempId = crypto.randomUUID()
//
//         // 1️⃣ optimistic add
//         task.task_files.push({
//           id: tempId,
//           task_id: taskId,
//           file_name: file.name,
//           uploading: true
//         })
//
//         const safeName = generateSafeFileName(file)
//         const filePath = `${auth.user.id}/${taskId}/${safeName}`
//
//         try {
//           await supabase.storage
//             .from('task-files')
//             .upload(filePath, file)
//
//           const { data, error } = await supabase
//             .from('task_files')
//             .insert({
//               task_id: taskId,
//               file_name: file.name,
//               file_path: filePath,
//               file_type: file.type,
//               file_size: file.size
//             })
//             .select()
//             .single()
//
//           if (error) throw error
//
//           // 2️⃣ replace temp
//           const index = task.task_files.findIndex(f => f.id === tempId)
//           task.task_files[index] = data
//
//         } catch (e) {
//           task.task_files = task.task_files.filter(f => f.id !== tempId)
//           throw e
//         }
//       }
//     },
//
//     // async deleteFile(file) {
//     //   /* storage */
//     //   await supabase.storage
//     //     .from('task-files')
//     //     .remove([file.file_path])
//     //
//     //   /* DB */
//     //   const { error } = await supabase
//     //     .from('task_files')
//     //     .delete()
//     //     .eq('id', file.id)
//     //
//     //   if (error) throw error
//     //
//     //   /* OPTIMISTIC */
//     //   const task = this.tasks.find(t => t.id === file.task_id)
//     //   if (task) {
//     //     task.task_files = task.task_files.filter(f => f.id !== file.id)
//     //   }
//     // },
//
//     async deleteFile(file) {
//       const task = this.tasks.find(t => t.id === file.task_id)
//
//       // UI сразу
//       task.task_files = task.task_files.filter(f => f.id !== file.id)
//
//       await supabase.storage
//         .from('task-files')
//         .remove([file.file_path])
//
//       await supabase
//         .from('task_files')
//         .delete()
//         .eq('id', file.id)
//     },
//
//     /* =========================
//        DELETE TASK
//     ========================= */
//     async deleteTask(taskId) {
//       const { error } = await supabase
//         .from('tasks')
//         .delete()
//         .eq('id', taskId)
//
//       if (error) throw error
//       this.tasks = this.tasks.filter(t => t.id !== taskId)
//     }
//   }
// })

import { defineStore } from 'pinia'
import { supabase } from '@/services/supabase'
import { useAuthStore } from './auth'

function generateSafeFileName(file) {
  const ext = file.name.split('.').pop()
  return `${Date.now()}-${crypto.randomUUID()}.${ext}`
}

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
        .eq('user_id', auth.user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      this.tasks = data.map(task => ({
        ...task,
        task_files: undefined // lazy-load
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

      const { data, error } = await supabase
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

      this.tasks.unshift({
        ...data,
        task_files: undefined
      })
    },

    /* =========================
       UPDATE TASK + FILES
    ========================= */
    async updateTask(taskId, payload) {
      const auth = useAuthStore()
      if (!auth.user) throw new Error('Not authenticated')

      /* 1️⃣ update task fields */
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

      /* 2️⃣ delete files */
      for (const file of payload.filesToDelete || []) {
        await this.deleteFile(file)
      }

      /* 3️⃣ upload new files */
      await this.uploadMultipleFiles(taskId, payload.newFiles || [])

      /* 4️⃣ local update (NO fetch) */
      const task = this.tasks.find(t => t.id === taskId)
      if (task) {
        task.title = payload.title
        task.description = payload.description
        task.priority = payload.priority
        task.deadline = payload.deadline
      }
    },

    /* =========================
       UPLOAD FILES (OPTIMISTIC)
    ========================= */
    // async uploadMultipleFiles(taskId, files) {
    //   const auth = useAuthStore()
    //   const task = this.tasks.find(t => t.id === taskId)
    //
    //   if (!auth.user || !task || !files.length) return
    //
    //   task.task_files = task.task_files || []
    //
    //   for (const file of files) {
    //     const tempId = crypto.randomUUID()
    //
    //     // optimistic UI
    //     task.task_files.push({
    //       id: tempId,
    //       task_id: taskId,
    //       file_name: file.name,
    //       uploading: true
    //     })
    //
    //     const safeName = generateSafeFileName(file)
    //     const filePath = `${auth.user.id}/${taskId}/${safeName}`
    //
    //     try {
    //       await supabase.storage
    //         .from('task-files')
    //         .upload(filePath, file, { upsert: false })
    //
    //       const { data, error } = await supabase
    //         .from('task_files')
    //         .insert({
    //           task_id: taskId,
    //           file_name: file.name,
    //           file_path: filePath,
    //           file_type: file.type,
    //           file_size: file.size
    //         })
    //         .select()
    //         .single()
    //
    //       if (error) throw error
    //
    //       // replace temp
    //       const index = task.task_files.findIndex(f => f.id === tempId)
    //       task.task_files[index] = data
    //
    //       task.files_count++
    //     } catch (e) {
    //       task.task_files = task.task_files.filter(f => f.id !== tempId)
    //       throw e
    //     }
    //   }
    // },

    async uploadMultipleFiles(taskId, files) {
      const auth = useAuthStore()
      const task = this.tasks.find(t => t.id === taskId)
      if (!auth.user || !task || !files?.length) return

      for (const file of files) {
        const tempId = crypto.randomUUID()

        // optimistic UI
        task.task_files.push({
          id: tempId,
          task_id: taskId,
          file_name: file.name,
          uploading: true
        })

        const safeName = `${Date.now()}-${crypto.randomUUID()}`
        const ext = file.name.split('.').pop()
        const filePath = `${auth.user.id}/${taskId}/${safeName}.${ext}`

        try {
          await supabase.storage
            .from('task-files')
            .upload(filePath, file)

          const { data, error } = await supabase
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

          // replace temp
          const idx = task.task_files.findIndex(f => f.id === tempId)
          task.task_files[idx] = data

          // increment counter
          // task.files_count++
          await supabase.rpc('task_increment_files', {
            task_id: taskId,
            delta: 1,
          })

        } catch (e) {
          task.task_files = task.task_files.filter(f => f.id !== tempId)
          throw e
        }
      }
    },

    /* =========================
       DELETE FILE (OPTIMISTIC)
    ========================= */
    async deleteFile(file) {
      const task = this.tasks.find(t => t.id === file.task_id)
      if (!task) return

      // optimistic UI
      task.task_files = task.task_files.filter(f => f.id !== file.id)
      task.files_count--

      await supabase.storage
        .from('task-files')
        .remove([file.file_path])

      await supabase
        .from('task_files')
        .delete()
        .eq('id', file.id)

      await supabase.rpc('task_increment_files', {
        task_id: file.task_id,
        delta: -1
      })
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
