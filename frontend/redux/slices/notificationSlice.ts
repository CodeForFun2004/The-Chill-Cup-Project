import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { type Notification, mockNotifications } from "../../data/notifications"

// State interface cho notifications
interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  activeFilter: "all" | "order" | "promotion"
}

// Trạng thái khởi tạo
const initialState: NotificationState = {
  notifications: mockNotifications,
  unreadCount: mockNotifications.filter((n) => !n.isRead).length,
  activeFilter: "all",
}

// Slice Redux
const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    // Đánh dấu một thông báo đã đọc
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find((n) => n.id === action.payload)
      if (notification && !notification.isRead) {
        notification.isRead = true
        state.unreadCount = Math.max(0, state.unreadCount - 1)
      }
    },

    // Đánh dấu tất cả thông báo đã đọc
    markAllAsRead: (state) => {
      state.notifications.forEach((notification) => {
        notification.isRead = true
      })
      state.unreadCount = 0
    },

    // Thêm thông báo mới
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload)
      if (!action.payload.isRead) {
        state.unreadCount += 1
      }
    },

    // Xóa thông báo
    removeNotification: (state, action: PayloadAction<string>) => {
      const index = state.notifications.findIndex((n) => n.id === action.payload)
      if (index !== -1) {
        const notification = state.notifications[index]
        if (!notification.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1)
        }
        state.notifications.splice(index, 1)
      }
    },

    // Đặt bộ lọc active
    setActiveFilter: (state, action: PayloadAction<"all" | "order" | "promotion">) => {
      state.activeFilter = action.payload
    },

    // Reset notifications về trạng thái ban đầu
    resetNotifications: () => initialState,

    // Load notifications từ server (placeholder)
    loadNotifications: (state, action: PayloadAction<Notification[]>) => {
      state.notifications = action.payload
      state.unreadCount = action.payload.filter((n) => !n.isRead).length
    },
  },
})

export const {
  markAsRead,
  markAllAsRead,
  addNotification,
  removeNotification,
  setActiveFilter,
  resetNotifications,
  loadNotifications,
} = notificationSlice.actions

export default notificationSlice.reducer
