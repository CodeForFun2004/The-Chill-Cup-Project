import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import AsyncStorage from '@react-native-async-storage/async-storage'
import api from '../../api/axios'

// Interfaces phù hợp với backend API
export interface StaffOrder {
  _id: string
  userId: string
  storeId: string
  orderNumber: string
  items: Array<{
    productId: string
    name: string
    size?: string
    toppings?: { id: string; name: string }[]
    quantity: number
    price: number
  }>
  subtotal: number
  discount?: number
  tax: number
  total: number
  deliveryFee: number
  deliveryAddress: string
  phone: string
  paymentMethod: string
  deliveryTime: string
  status: "pending" | "processing" | "preparing" | "ready" | "delivering" | "completed" | "cancelled"
  cancelReason?: string
  shipperAssigned?: string
  appliedPromoCode?: string
  createdAt: string
  updatedAt?: string
  
  // Thông tin bổ sung cho staff UI (có thể được compute từ backend hoặc enhance ở frontend)
  customerName?: string
  customerPhone?: string
  notes?: string
  orderType?: "Dine-in" | "Takeaway" | "Delivery"
  orderTime?: string
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
  filterStatus: "All" | "pending" | "processing" | "preparing" | "ready" | "delivering" | "completed" | "cancelled"
  loading: boolean
  error: string | null
  shippers: Array<{
    _id: string
    fullname: string
    staffId: string
    status: "available" | "assigned"
  }>
  shippersLoading: boolean
}

// Helper function để tính toán order stats
const calculateOrderStats = (orders: StaffOrder[]): OrderStats => {
  return {
    totalOrders: orders.length,
    pendingOrders: orders.filter((o) => o.status === "pending").length,
    completedOrders: orders.filter((o) => o.status === "completed").length,
    cancelledOrders: orders.filter((o) => o.status === "cancelled").length,
    preparingOrders: orders.filter((o) => ["processing", "preparing"].includes(o.status)).length,
    readyOrders: orders.filter((o) => o.status === "ready").length,
    deliveringOrders: orders.filter((o) => o.status === "delivering").length,
  }
}

// Helper function để tính toán revenue stats
const calculateRevenueStats = (orders: StaffOrder[]): RevenueStats => {
  const today = new Date().toISOString().split("T")[0]
  const thisWeekStart = new Date()
  thisWeekStart.setDate(thisWeekStart.getDate() - 7)
  const thisMonthStart = new Date()
  thisMonthStart.setDate(thisMonthStart.getDate() - 30)

  const completedOrders = orders.filter((o) => o.status === "completed")

  const dailyRevenue = completedOrders.filter((o) => 
    o.createdAt && o.createdAt.split("T")[0] === today
  ).reduce((sum, o) => sum + o.total, 0)

  const weeklyRevenue = completedOrders
    .filter((o) => o.createdAt && new Date(o.createdAt) >= thisWeekStart)
    .reduce((sum, o) => sum + o.total, 0)

  const monthlyRevenue = completedOrders
    .filter((o) => o.createdAt && new Date(o.createdAt) >= thisMonthStart)
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

// Async Thunks
export const fetchStaffOrders = createAsyncThunk(
  'staff/fetchStaffOrders',
  async (params: { status?: string } = {}, thunkAPI) => {
    try {
      const token = await AsyncStorage.getItem('accessToken')
      if (!token) {
        return thunkAPI.rejectWithValue('No access token found. Please log in.')
      }
      
      const queryParams = params.status ? { status: params.status } : {}
      const response = await api.get('/orders/staff', {
        headers: { Authorization: `Bearer ${token}` },
        params: queryParams,
      })
      
      return response.data as StaffOrder[]
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Failed to fetch staff orders'
      return thunkAPI.rejectWithValue(message)
    }
  }
)

export const updateOrderStatusByStaff = createAsyncThunk(
  'staff/updateOrderStatusByStaff',
  async ({ orderId, status, cancelReason }: { orderId: string; status: string; cancelReason?: string }, thunkAPI) => {
    try {
      const token = await AsyncStorage.getItem('accessToken')
      if (!token) {
        return thunkAPI.rejectWithValue('No access token found. Please log in.')
      }
      
      const response = await api.put(`/orders/staff/${orderId}`, { status, cancelReason }, {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      return response.data.order as StaffOrder
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Failed to update order status'
      return thunkAPI.rejectWithValue(message)
    }
  }
)

export const assignShipperToOrder = createAsyncThunk(
  'staff/assignShipperToOrder',
  async ({ orderId, assignShipperId }: { orderId: string; assignShipperId: string }, thunkAPI) => {
    try {
      const token = await AsyncStorage.getItem('accessToken')
      if (!token) {
        return thunkAPI.rejectWithValue('No access token found. Please log in.')
      }
      
      const response = await api.put(`/orders/staff/${orderId}`, { assignShipperId }, {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      return response.data.order as StaffOrder
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Failed to assign shipper'
      return thunkAPI.rejectWithValue(message)
    }
  }
)

export const fetchAvailableShippers = createAsyncThunk(
  'staff/fetchAvailableShippers',
  async (_, thunkAPI) => {
    try {
      const token = await AsyncStorage.getItem('accessToken')
      if (!token) {
        return thunkAPI.rejectWithValue('No access token found. Please log in.')
      }
      
      const response = await api.get('/orders/staff/shippers', {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      return response.data
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Failed to fetch shippers'
      return thunkAPI.rejectWithValue(message)
    }
  }
)

// Initialize state
const initialState: StaffState = {
  orders: [],
  orderStats: {
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    preparingOrders: 0,
    readyOrders: 0,
    deliveringOrders: 0,
  },
  revenueStats: {
    dailyRevenue: 0,
    weeklyRevenue: 0,
    monthlyRevenue: 0,
    averageOrderValue: 0,
  },
  selectedOrder: null,
  filterStatus: "All",
  loading: false,
  error: null,
  shippers: [],
  shippersLoading: false,
}

const staffSlice = createSlice({
  name: "staff",
  initialState,
  reducers: {
    // Đặt filter status
    setFilterStatus: (state, action: PayloadAction<StaffState["filterStatus"]>) => {
      state.filterStatus = action.payload
    },

    // Chọn đơn hàng để xem chi tiết
    setSelectedOrder: (state, action: PayloadAction<StaffOrder | null>) => {
      state.selectedOrder = action.payload
    },

    // Reset lỗi
    clearError: (state) => {
      state.error = null
    },

    // Reset về trạng thái ban đầu
    resetStaffData: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // --- Xử lý fetchStaffOrders ---
      .addCase(fetchStaffOrders.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchStaffOrders.fulfilled, (state, action: PayloadAction<StaffOrder[]>) => {
        state.loading = false
        state.orders = action.payload
        state.orderStats = calculateOrderStats(action.payload)
        state.revenueStats = calculateRevenueStats(action.payload)
        state.error = null
      })
      .addCase(fetchStaffOrders.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // --- Xử lý updateOrderStatusByStaff ---
      .addCase(updateOrderStatusByStaff.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateOrderStatusByStaff.fulfilled, (state, action: PayloadAction<StaffOrder>) => {
        state.loading = false
        // Cập nhật order vừa thay đổi
        const updatedOrder = action.payload
        state.orders = state.orders.map(order => order._id === updatedOrder._id ? updatedOrder : order)
        // Tính lại stats
        state.orderStats = calculateOrderStats(state.orders)
        state.revenueStats = calculateRevenueStats(state.orders)
        state.error = null
      })
      .addCase(updateOrderStatusByStaff.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // --- Xử lý assignShipperToOrder ---
      .addCase(assignShipperToOrder.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(assignShipperToOrder.fulfilled, (state, action: PayloadAction<StaffOrder>) => {
        state.loading = false
        const updatedOrder = action.payload
        state.orders = state.orders.map(order => order._id === updatedOrder._id ? updatedOrder : order)
        state.orderStats = calculateOrderStats(state.orders)
        state.revenueStats = calculateRevenueStats(state.orders)
        state.error = null
      })
      .addCase(assignShipperToOrder.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // --- Xử lý fetchAvailableShippers ---
      .addCase(fetchAvailableShippers.pending, (state) => {
        state.shippersLoading = true
        state.error = null
      })
      .addCase(fetchAvailableShippers.fulfilled, (state, action) => {
        state.shippersLoading = false
        state.shippers = action.payload
        state.error = null
      })
      .addCase(fetchAvailableShippers.rejected, (state, action) => {
        state.shippersLoading = false
        state.error = action.payload as string
      })
  },
})

export const {
  setFilterStatus,
  setSelectedOrder,
  clearError,
  resetStaffData,
} = staffSlice.actions

export default staffSlice.reducer
