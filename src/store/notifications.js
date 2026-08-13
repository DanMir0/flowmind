import { defineStore } from 'pinia'
import { supabase } from '@/services/supabase.js'
import { useAuthStore } from '@/store/auth.js'

export const useNotificationsStore = defineStore(
  'notifications',
  {
    state: () => ({
      notifications: [],
      unreadCount: 0,
      isOpen: false,
      loading: false,
      realtimeChannel: null,
    }),

    getters: {
      unreadNotifications: (state) =>
        state.notifications.filter(
          notification => !notification.read
        ),

      hasUnread: (state) =>
        state.unreadCount > 0,
    },

    actions: {
      updateUnreadCount() {
        this.unreadCount =
          this.notifications.filter(
            notification => !notification.read
          ).length
      },

      async loadNotifications() {
        const auth = useAuthStore()

        if (!auth.user) {
          this.notifications = []
          this.unreadCount = 0
          return
        }

        this.loading = true

        try {
          const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', auth.user.id)
            .order('created_at', {
              ascending: false,
            })
            .limit(50)

          if (error) {
            throw error
          }

          this.notifications = data || []

          this.updateUnreadCount()
        } catch (error) {

          throw error
        } finally {
          this.loading = false
        }
      },

      async markAsRead(notificationId) {
        const auth = useAuthStore()

        if (!auth.user) return

        try {
          const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('id', notificationId)
            .eq('user_id', auth.user.id)

          if (error) throw error

          const notification = this.notifications.find(
            n => n.id === notificationId
          )

          if (notification) {
            notification.read = true
            this.updateUnreadCount()
          }
        } catch (error) {
          throw error
        }
      },

      async markAllAsRead() {
        const auth = useAuthStore()

        if (!auth.user) {
          return
        }

        const { error } = await supabase
          .from('notifications')
          .update({
            read: true,
          })
          .eq('user_id', auth.user.id)
          .eq('read', false)

        if (error) {
          throw error
        }

        this.notifications.forEach(
          notification => {
            notification.read = true
          }
        )

        this.unreadCount = 0
      },

      addNotification(notification) {
        const exists =
          this.notifications.some(
            item => item.id === notification.id
          )

        if (exists) {
          return
        }

        this.notifications.unshift(notification)

        if (!notification.read) {
          this.unreadCount++
        }

        // Не держим больше 50
        if (this.notifications.length > 50) {
          this.notifications =
            this.notifications.slice(0, 50)
        }
      },

      subscribeToRealtime() {
        const auth = useAuthStore()

        if (!auth.user) {
          return
        }

        this.unsubscribeFromRealtime()

        this.realtimeChannel =
          supabase
            .channel(
              `notifications:${auth.user.id}`
            )
            .on(
              'postgres_changes',
              {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${auth.user.id}`,
              },
              payload => {
                this.addNotification(payload.new)
              }
            )
            .on(
              'postgres_changes',
              {
                event: 'UPDATE',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${auth.user.id}`,
              },
              payload => {
                const index =
                  this.notifications.findIndex(
                    notification =>
                      notification.id ===
                      payload.new.id
                  )

                if (index === -1) {
                  return
                }

                this.notifications[index] =
                  payload.new

                this.updateUnreadCount()
              }
            )
            .subscribe(status => {

            })
      },

      unsubscribeFromRealtime() {
        if (this.realtimeChannel) {
          supabase.removeChannel(
            this.realtimeChannel
          )

          this.realtimeChannel = null
        }
      },

      reset() {
        this.unsubscribeFromRealtime()

        this.notifications = []
        this.unreadCount = 0
        this.isOpen = false
        this.loading = false
      },
    },
  }
)
