import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import {
  type StaffOrder,
  type OrderStats,
  type RevenueStats,
  mockStaffOrders,
  mockOrderStats,
  mockRevenueStats,
} from "../../data/staffData"

interface StaffState {
  orders: StaffOrder[]
  orderStats: OrderStats
  revenueStats: RevenueStats
  selectedOrder: StaffOrder | null
  filterStatus: "All" | "Pending" | "Confirmed" | "Preparing" | "Ready" | "Delivering" | "Completed" | "Cancelled"
}

const initialState: StaffState = {
  orders: mockStaffOrders,
  orderStats: mockOrderStats,
  revenueStats: mockRevenueStats,
  selectedOrder: null,
  filterStatus: "All",
}

const staffSlice = createSlice({
  name: "staff",
  initialState,
  reducers: {
    // Cập nhật trạng thái đơn hàng
    updateOrderStatus: (state, action: PayloadAction<{ orderId: string; status: StaffOrder["status"] }>) => {
      const { orderId, status } = action.payload
      const order = state.orders.find((o) => o.id === orderId)
      if (order) {
        order.status = status
        // Cập nhật stats
        state.orderStats = calculateOrderStats(state.orders)
      }
    },

    // Xác nhận đơn hàng mới
    confirmOrder: (state, action: PayloadAction<string>) => {
      const order = state.orders.find((o) => o.id === action.payload)
      if (order && order.status === "Pending") {
        order.status = "Confirmed"
        state.orderStats = calculateOrderStats(state.orders)
      }
    },

    // Hủy đơn hàng
    cancelOrder: (state, action: PayloadAction<{ orderId: string; reason?: string }>) => {
      const { orderId } = action.payload
      const order = state.orders.find((o) => o.id === orderId)
      if (order) {
        order.status = "Cancelled"
        state.orderStats = calculateOrderStats(state.orders)
      }
    },

    // Thêm ghi chú cho đơn hàng
    addOrderNote: (state, action: PayloadAction<{ orderId: string; note: string }>) => {
      const { orderId, note } = action.payload
      const order = state.orders.find((o) => o.id === orderId)
      if (order) {
        order.notes = note
      }
    },

    // Đặt filter status
    setFilterStatus: (state, action: PayloadAction<StaffState["filterStatus"]>) => {
      state.filterStatus = action.payload
    },

    // Chọn đơn hàng để xem chi tiết
    setSelectedOrder: (state, action: PayloadAction<StaffOrder | null>) => {
      state.selectedOrder = action.payload
    },

    // Thêm đơn hàng mới
    addNewOrder: (state, action: PayloadAction<StaffOrder>) => {
      state.orders.unshift(action.payload)
      state.orderStats = calculateOrderStats(state.orders)
    },

    // Cập nhật thống kê doanh thu
    updateRevenueStats: (state, action: PayloadAction<RevenueStats>) => {
      state.revenueStats = action.payload
    },

    // Reset về trạng thái ban đầu
    resetStaffData: () => initialState,
  },
})

// Helper function để tính toán stats
function calculateOrderStats(orders: StaffOrder[]): OrderStats {
  return {
    totalOrders: orders.length,
    pendingOrders: orders.filter((o) => o.status === "Pending").length,
    completedOrders: orders.filter((o) => o.status === "Completed").length,
    cancelledOrders: orders.filter((o) => o.status === "Cancelled").length,
  }
}

export const {
  updateOrderStatus,
  confirmOrder,
  cancelOrder,
  addOrderNote,
  setFilterStatus,
  setSelectedOrder,
  addNewOrder,
  updateRevenueStats,
  resetStaffData,
} = staffSlice.actions

export default staffSlice.reducer
