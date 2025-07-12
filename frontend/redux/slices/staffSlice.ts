import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { type Order, orders } from "../../data/orders"

// Extend Order interface để thêm thông tin staff cần
export interface StaffOrder extends Order {
  customerName?: string
  customerPhone?: string
  notes?: string
  paymentMethod?: string
  orderType?: "Dine-in" | "Takeaway" | "Delivery"
}

export interface OrderStats {
  totalOrders: number
  pendingOrders: number
  completedOrders: number
  cancelledOrders: number
  preparingOrders: number
  readyOrders: number
  deliveringOrders: number
}

export interface RevenueStats {
  dailyRevenue: number
  weeklyRevenue: number
  monthlyRevenue: number
  averageOrderValue: number
}

interface StaffState {
  orders: StaffOrder[]
  orderStats: OrderStats
  revenueStats: RevenueStats
  selectedOrder: StaffOrder | null
  filterStatus: "All" | "Pending" | "Processing" | "Preparing" | "Ready" | "Delivering" | "Completed" | "Cancelled"
}

// Helper function để enhance orders với thông tin staff
const enhanceOrdersWithStaffInfo = (baseOrders: Order[]): StaffOrder[] => {
  const customerNames = [
    "Nguyễn Văn An",
    "Trần Thị Bình",
    "Lê Minh Cường",
    "Phạm Thị Dung",
    "Hoàng Văn Em",
    "Vũ Thị Phương",
    "Đặng Minh Quang",
    "Bùi Thị Hoa",
  ]

  const phoneNumbers = [
    "0901234567",
    "0912345678",
    "0923456789",
    "0934567890",
    "0945678901",
    "0956789012",
    "0967890123",
    "0978901234",
  ]

  const paymentMethods = ["Tiền mặt", "Chuyển khoản", "Thẻ tín dụng", "Ví điện tử"]
  const orderTypes: ("Dine-in" | "Takeaway" | "Delivery")[] = ["Dine-in", "Takeaway", "Delivery"]

  return baseOrders.map((order, index) => ({
    ...order,
    customerName: customerNames[index % customerNames.length],
    customerPhone: phoneNumbers[index % phoneNumbers.length],
    paymentMethod: paymentMethods[index % paymentMethods.length],
    orderType: orderTypes[index % orderTypes.length],
    notes: index % 3 === 0 ? "Ít đường, không kem" : undefined,
  }))
}

// Helper function để tính toán order stats
const calculateOrderStats = (orders: StaffOrder[]): OrderStats => {
  return {
    totalOrders: orders.length,
    pendingOrders: orders.filter((o) => o.status === "Pending").length,
    completedOrders: orders.filter((o) => o.status === "Completed").length,
    cancelledOrders: orders.filter((o) => o.status === "Cancelled").length,
    preparingOrders: orders.filter((o) => ["Processing", "Preparing"].includes(o.status)).length,
    readyOrders: orders.filter((o) => o.status === "Ready").length,
    deliveringOrders: orders.filter((o) => o.status === "Delivering").length,
  }
}

// Helper function để tính toán revenue stats
const calculateRevenueStats = (orders: StaffOrder[]): RevenueStats => {
  const today = new Date().toISOString().split("T")[0]
  const thisWeekStart = new Date()
  thisWeekStart.setDate(thisWeekStart.getDate() - 7)
  const thisMonthStart = new Date()
  thisMonthStart.setDate(thisMonthStart.getDate() - 30)

  const completedOrders = orders.filter((o) => o.status === "Completed")

  const dailyRevenue = completedOrders.filter((o) => o.date === today).reduce((sum, o) => sum + o.total, 0)

  const weeklyRevenue = completedOrders
    .filter((o) => new Date(o.date) >= thisWeekStart)
    .reduce((sum, o) => sum + o.total, 0)

  const monthlyRevenue = completedOrders
    .filter((o) => new Date(o.date) >= thisMonthStart)
    .reduce((sum, o) => sum + o.total, 0)

  const averageOrderValue =
    completedOrders.length > 0 ? completedOrders.reduce((sum, o) => sum + o.total, 0) / completedOrders.length : 0

  return {
    dailyRevenue,
    weeklyRevenue,
    monthlyRevenue,
    averageOrderValue,
  }
}

// Initialize state với data từ orders.tsx
const enhancedOrders = enhanceOrdersWithStaffInfo(orders)
const initialState: StaffState = {
  orders: enhancedOrders,
  orderStats: calculateOrderStats(enhancedOrders),
  revenueStats: calculateRevenueStats(enhancedOrders),
  selectedOrder: null,
  filterStatus: "All",
}

const staffSlice = createSlice({
  name: "staff",
  initialState,
  reducers: {
    // Cập nhật trạng thái đơn hàng
    updateOrderStatus: (state, action: PayloadAction<{ orderId: string; status: Order["status"] }>) => {
      const { orderId, status } = action.payload
      const order = state.orders.find((o) => o.id === orderId)
      if (order) {
        order.status = status
        // Cập nhật stats
        state.orderStats = calculateOrderStats(state.orders)
        state.revenueStats = calculateRevenueStats(state.orders)
      }
    },

    // Xác nhận đơn hàng mới
    confirmOrder: (state, action: PayloadAction<string>) => {
      const order = state.orders.find((o) => o.id === action.payload)
      if (order && order.status === "Pending") {
        order.status = "Processing"
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
        state.revenueStats = calculateRevenueStats(state.orders)
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
    addNewOrder: (state, action: PayloadAction<Order>) => {
      const enhancedOrder = enhanceOrdersWithStaffInfo([action.payload])[0]
      state.orders.unshift(enhancedOrder)
      state.orderStats = calculateOrderStats(state.orders)
      state.revenueStats = calculateRevenueStats(state.orders)
    },

    // Sync với orders từ data/orders.tsx
    syncOrdersFromData: (state) => {
      const enhancedOrders = enhanceOrdersWithStaffInfo(orders)
      state.orders = enhancedOrders
      state.orderStats = calculateOrderStats(enhancedOrders)
      state.revenueStats = calculateRevenueStats(enhancedOrders)
    },

    // Reset về trạng thái ban đầu
    resetStaffData: () => initialState,
  },
})

export const {
  updateOrderStatus,
  confirmOrder,
  cancelOrder,
  addOrderNote,
  setFilterStatus,
  setSelectedOrder,
  addNewOrder,
  syncOrdersFromData,
  resetStaffData,
} = staffSlice.actions

export default staffSlice.reducer
