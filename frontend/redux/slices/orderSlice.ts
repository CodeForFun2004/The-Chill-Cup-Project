// redux/orderSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../api/axios'; // Đảm bảo đường dẫn này đúng với instance axios của bạn

// Định nghĩa kiểu dữ liệu cho một Product bên trong OrderItem khi đã được populate
interface OrderProduct {
  _id: string;
  name: string;
  description: string;
  basePrice: number;
  image: string;
  status: string;
  rating: number;
  sizeOptions: string[]; // IDs của các tùy chọn size
  toppingOptions: string[]; // IDs của các tùy chọn topping
  storeId: string;
  categoryId: string[];
  isBanned: boolean;
  __v: number;
}

// Định nghĩa kiểu dữ liệu cho một mục sản phẩm trong đơn hàng
interface OrderItem {
  productId: OrderProduct; // Đối tượng sản phẩm đã được populate từ backend
  name: string; // Tên sản phẩm, có thể dùng productId.name
  size?: string; // Kích cỡ sản phẩm (ví dụ: "L", "M", "S")
  toppings?: { id: string; name: string }[]; // Toppings kèm theo (ID và tên)
  quantity: number;
  price: number; // Giá đã tính cho item này (quantity * basePrice + toppingPrices)
  _id: string;
}

// Định nghĩa kiểu dữ liệu đầy đủ cho một đơn hàng (như trả về từ API getOrderById)
interface Order {
  _id: string;
  userId: string;
  storeId: string;
  orderNumber: string;
  items: OrderItem[]; // Danh sách các sản phẩm trong đơn hàng
  subtotal: number; // Tổng tiền trước thuế và phí giao hàng, sau giảm giá
  discount?: number; // Số tiền giảm giá nếu có
  tax: number; // Thuế áp dụng
  total: number; // Tổng tiền cuối cùng
  deliveryFee: number; // Phí giao hàng
  deliveryAddress: string;
  phone: string;
  paymentMethod: 'vnpay' | 'cod';
  deliveryTime: string; // Thời gian giao hàng ước tính (ví dụ: "25-35 phút")
  status: 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled'; // Trạng thái đơn hàng
  cancelReason: string | null;
  shipperAssigned: string | null; // ID của shipper nếu có
  appliedPromoCode?: string | null; // Mã khuyến mãi đã áp dụng
  createdAt: string;
  updatedAt?: string;
  __v: number;
}

// Payload cho action createOrder
interface CreateOrderPayload {
  deliveryAddress: string;
  phone: string;
  paymentMethod: 'vnpay' | 'cod';
  storeId: string;
}

// Định nghĩa trạng thái của slice order
interface OrderState {
  currentOrder: Order | null; // Đơn hàng hiện tại sau khi tạo và fetch chi tiết
  loading: boolean; // Trạng thái loading cho các thao tác order
  error: string | null; // Thông báo lỗi nếu có
  orderCreatedSuccessfully: boolean; // Cờ báo hiệu order đã được tạo thành công trên backend
}

// Trạng thái khởi tạo của slice order
const initialState: OrderState = {
  currentOrder: null,
  loading: false,
  error: null,
  orderCreatedSuccessfully: false,
};

// --- THUNKS ---

/**
 * @thunk createOrder
 * @description Gửi yêu cầu tạo đơn hàng mới lên backend.
 * Trả về ID của đơn hàng vừa tạo khi thành công.
 */
export const createOrder = createAsyncThunk(
  'order/createOrder',
  async (orderData: CreateOrderPayload, thunkAPI) => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        return thunkAPI.rejectWithValue('No access token found. Please log in.');
      }

      const response = await api.post('/orders', orderData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Backend API createOrder trả về { message: string, order: { _id: string, ... } }
      // Chúng ta chỉ cần trả về _id để dùng cho fetchOrderById
      return response.data.order._id as string;
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Failed to create order';
      console.error('Error creating order:', error.response?.data || error.message || error);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

/**
 * @thunk fetchOrderById
 * @description Lấy chi tiết đầy đủ của một đơn hàng dựa trên ID.
 * Trả về đối tượng Order đầy đủ khi thành công.
 */
export const fetchOrderById = createAsyncThunk(
  'order/fetchOrderById',
  async (orderId: string, thunkAPI) => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        return thunkAPI.rejectWithValue('No access token found. Please log in.');
      }

      const response = await api.get(`/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Backend API getOrderById trả về trực tiếp đối tượng Order
      return response.data as Order;
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Failed to fetch order details';
      console.error('Error fetching order details:', error.response?.data || error.message || error);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// --- ORDER SLICE ---

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    /**
     * @action resetOrderState
     * @description Đặt lại toàn bộ trạng thái của slice order về trạng thái ban đầu.
     * Hữu ích sau khi đơn hàng được xử lý xong (ví dụ: sau khi điều hướng đến màn hình thành công).
     */
    resetOrderState: (state) => {
      state.currentOrder = null;
      state.loading = false;
      state.error = null;
      state.orderCreatedSuccessfully = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- Xử lý trạng thái của createOrder thunk ---
      .addCase(createOrder.pending, (state) => {
        state.loading = true; // Bắt đầu loading
        state.error = null; // Xóa lỗi cũ
        state.orderCreatedSuccessfully = false; // Reset cờ thành công
        state.currentOrder = null; // Xóa dữ liệu order cũ
      })
      .addCase(createOrder.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false; // Kết thúc loading
        state.orderCreatedSuccessfully = true; // Đặt cờ thành công
        // currentOrder vẫn là null, nó sẽ được fetchOrderById cập nhật sau
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false; // Kết thúc loading
        state.error = action.payload as string; // Lưu thông báo lỗi
        state.orderCreatedSuccessfully = false; // Đặt cờ thành công là false
        state.currentOrder = null; // Xóa dữ liệu order nếu có lỗi
      })
      // --- Xử lý trạng thái của fetchOrderById thunk ---
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true; // Bắt đầu loading (để fetch details)
        state.error = null; // Xóa lỗi cũ
        // KHÔNG reset orderCreatedSuccessfully ở đây.
        // Nó phải giữ nguyên giá trị true từ createOrder.fulfilled.
      })
      .addCase(fetchOrderById.fulfilled, (state, action: PayloadAction<Order>) => {
        state.loading = false; // Kết thúc loading
        state.currentOrder = action.payload; // Cập nhật currentOrder với dữ liệu đầy đủ từ API
        state.error = null; // Xóa lỗi nếu fetch thành công
        state.orderCreatedSuccessfully = true; // Đảm bảo cờ thành công vẫn là true
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false; // Kết thúc loading
        state.error = action.payload as string; // Lưu thông báo lỗi
        state.currentOrder = null; // Xóa dữ liệu order nếu fetch thất bại
        state.orderCreatedSuccessfully = false; // Đặt cờ thành công là false
      });
  },
});

export const { resetOrderState } = orderSlice.actions;
export default orderSlice.reducer;