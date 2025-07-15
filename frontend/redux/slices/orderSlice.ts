// import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// // Type cho từng item trong đơn hàng
// export interface OrderItem {
//   name: string;
//   quantity: number;
//   price: number;
//   image?: any;
// }

// // Type cho đơn hàng
// export interface Order {
//   id: string;                  // Mã định danh nội bộ
//   orderNumber: string;         // Mã hiển thị đơn hàng (ORD-XXXX)
//   items: OrderItem[];
//   total: number;
//   address: string;
//   paymentMethod: string;
//   deliveryTime: string;
//   date: string;
//   time: string;
//   status: 'Completed' | 'Cancelled' | 'Pending' | 'Processing' | 'Preparing' | 'Ready' | 'Delivering';
//   estimatedDelivery?: string;
//   deliveryAddress?: string;
//   phoneNumber?: string;
// }

// // Trạng thái khởi tạo rỗng
// const initialState: Order = {
//   id: '',
//   orderNumber: '',
//   items: [],
//   total: 0,
//   address: '',
//   paymentMethod: '',
//   deliveryTime: '',
//   date: '',
//   time: '',
//   status: 'Processing',
//   estimatedDelivery: '',
//   deliveryAddress: '',
//   phoneNumber: '',
// };

// // Slice Redux
// const orderSlice = createSlice({
//   name: 'order',
//   initialState,
//   reducers: {
//     setOrderInfo: (state, action: PayloadAction<Order>) => {
//       return { ...state, ...action.payload };
//     },
//     clearOrderInfo: () => initialState,
//   },
// });

// export const { setOrderInfo, clearOrderInfo } = orderSlice.actions;
// export default orderSlice.reducer;


// redux/orderSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../api/axios'; // Đảm bảo đường dẫn đúng đến instance axios của bạn

// Định nghĩa kiểu dữ liệu cho một Product bên trong OrderItem (vì nó được populate)
interface OrderProduct {
  _id: string;
  name: string;
  description: string;
  basePrice: number;
  image: string;
  status: string;
  rating: number;
  sizeOptions: string[];
  toppingOptions: string[];
  storeId: string;
  categoryId: string[];
  isBanned: boolean;
  __v: number;
}

// Định nghĩa kiểu dữ liệu cho một CartItem (bây giờ là OrderItem)
interface OrderItem {
  productId: OrderProduct; // Đã được populate
  name: string; // Tên sản phẩm từ Cart (có thể không cần nếu dùng productId.name)
  size?: string; // Nếu có trường size trong CartItem
  toppings?: { id: string; name: string }[]; // Nếu có toppings
  quantity: number;
  price: number; // Giá đã tính cho item này
  _id: string;
}

// Định nghĩa kiểu dữ liệu đầy đủ cho một đơn hàng từ API getOrderById
interface Order {
  _id: string;
  userId: string;
  storeId: string;
  orderNumber: string;
  items: OrderItem[]; // Danh sách các sản phẩm trong đơn hàng
  subtotal: number;
  discount?: number; // Optional nếu không phải lúc nào cũng có
  tax: number;
  total: number;
  deliveryFee: number;
  deliveryAddress: string;
  phone: string;
  paymentMethod: 'vnpay' | 'cod';
  deliveryTime: string;
  status: string; // e.g., 'pending', 'confirmed', 'shipping', 'delivered', 'cancelled'
  cancelReason: string | null;
  shipperAssigned: string | null;
  appliedPromoCode?: string | null; // Có thể có từ createOrder, nhưng không xuất hiện trong getOrderById
  createdAt: string;
  updatedAt?: string; // Có thể có hoặc không tùy model
  __v: number;
}

interface CreateOrderPayload {
  deliveryAddress: string;
  phone: string;
  paymentMethod: 'vnpay' | 'cod';
  storeId: string;
}

interface OrderState {
  currentOrder: Order | null;
  loading: boolean;
  error: string | null;
  orderCreatedSuccessfully: boolean; // Đổi tên để rõ ràng hơn
}

const initialState: OrderState = {
  currentOrder: null,
  loading: false,
  error: null,
  orderCreatedSuccessfully: false,
};

// ✅ Thunk để tạo đơn hàng mới
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

      // API createOrder trả về { message, order }, nhưng chúng ta cần orderId
      // để gọi getOrderById. API getOrderById trả về đầy đủ Order object.
      // Dựa trên yêu cầu, chúng ta sẽ trả về orderId để fetch lại.
      return response.data.order._id; // Trả về chỉ _id của order mới tạo
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Failed to create order';
      console.error('Error creating order:', error.response?.data || error.message || error);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// ✅ Thunk để lấy chi tiết đơn hàng theo ID
export const fetchOrderById = createAsyncThunk(
  'order/fetchOrderById',
  async (orderId: string, thunkAPI) => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        return thunkAPI.rejectWithValue('No access token found. Please log in.');
      }

      const response = await api.get(`/orders/${orderId}`, { // Endpoint là '/orders/:orderId'
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('Order details fetched successfully:', response.data);
      return response.data; // API trả về trực tiếp Order object
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Failed to fetch order details';
      console.error('Error fetching order details:', error.response?.data || error.message || error);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    resetOrderState: (state) => {
      state.currentOrder = null;
      state.loading = false;
      state.error = null;
      state.orderCreatedSuccessfully = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Xử lý tạo đơn hàng
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.orderCreatedSuccessfully = false;
      })
      .addCase(createOrder.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        // Sau khi tạo thành công, chúng ta chỉ nhận được orderId
        // state.currentOrder sẽ được cập nhật bởi fetchOrderById
        state.orderCreatedSuccessfully = true;
        state.currentOrder = null; // Đặt lại để chuẩn bị cho fetch details
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.orderCreatedSuccessfully = false;
      })
      // Xử lý lấy chi tiết đơn hàng
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.orderCreatedSuccessfully = false; // Reset trạng thái thành công khi fetch lại
      })
      .addCase(fetchOrderById.fulfilled, (state, action: PayloadAction<Order>) => {
        state.loading = false;
        state.currentOrder = action.payload; // Cập nhật currentOrder với dữ liệu đầy đủ
        state.error = null; // Đảm bảo lỗi được xóa nếu có
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.currentOrder = null; // Xóa order nếu fetch chi tiết thất bại
      });
  },
});

export const { resetOrderState } = orderSlice.actions;
export default orderSlice.reducer;