import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../api/axios'; // Đảm bảo 'api' là instance axios của bạn

interface UserProfile {
  _id: string;
  username: string;
  fullname: string;
  email?: string;
  phone?: string; // Có thể có hoặc không
  avatar?: string; // Nếu có trong model và được trả về
  address?: string; // Có thể có hoặc không
  role: 'customer' | 'admin' | 'staff' | 'shipper';
  staffId?: string | null;
  status?: 'available' | 'assigned';
  isBanned: boolean;
  googleId?: string;
  refreshToken?: string; // Mặc dù không nên dùng ở frontend, nhưng nếu API trả về thì vẫn cần khai báo để khớp kiểu
  storeId?: string | null;
  createdAt: string;
  updatedAt: string;
  __v: number; // Trường này thường có trong MongoDB
  [key: string]: any;
}


interface Order {
  id: string;
  orderNumber: string;
  date: string;
  time: string;
  status: string;
  total: number;
  items: any[];
  estimatedDelivery?: string;
  deliveryAddress?: string;
  phoneNumber?: string;
}

// Backend order interface
interface BackendOrder {
  _id: string;
  orderNumber: string;
  createdAt: string;
  status: string;
  total: number;
  items: any[];
  deliveryTime?: string;
  deliveryAddress?: string;
  phone?: string;
}

// Mapping function to transform backend data to frontend format
const mapBackendOrderToFrontend = (backendOrder: BackendOrder): Order => {
  return {
    id: backendOrder._id,
    orderNumber: backendOrder.orderNumber,
    date: new Date(backendOrder.createdAt).toLocaleDateString('en-GB'),
    time: new Date(backendOrder.createdAt).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    status: backendOrder.status,
    total: backendOrder.total,
    items: backendOrder.items.map((item: any) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    })),
    estimatedDelivery: backendOrder.deliveryTime,
    deliveryAddress: backendOrder.deliveryAddress,
    phoneNumber: backendOrder.phone,
  };
};

interface UserState {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  orders: Order[];
  ordersLoading: boolean;
  ordersError: string | null;
  currentOrder: Order | null;
  currentOrderLoading: boolean;
  currentOrderError: string | null;
}

const initialState: UserState = {
  profile: null,
  loading: false,
  error: null,
  orders: [],
  ordersLoading: false,
  ordersError: null,
  currentOrder: null,
  currentOrderLoading: false,
  currentOrderError: null,
};
// Lấy chi tiết đơn hàng theo ID
export const fetchOrderById = createAsyncThunk(
  'user/fetchOrderById',
  async (orderId: string, thunkAPI) => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        return thunkAPI.rejectWithValue('No access token found. Please log in.');
      }
      console.log('Fetching order details for ID:', orderId);
      
      const response = await api.get(`/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log('Raw backend order detail:', response.data);
      
      // Map backend data to frontend format
      const mappedOrder = mapBackendOrderToFrontend(response.data);
      console.log('Mapped order detail for frontend:', mappedOrder);
      
      return mappedOrder;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch order details';
      console.error('Error fetching order details:', error.response?.data || error.message || error);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Lấy lịch sử đơn hàng của user
export const fetchUserOrders = createAsyncThunk(
  'user/fetchUserOrders',
  async (_, thunkAPI) => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        return thunkAPI.rejectWithValue('No access token found. Please log in.');
      }
      console.log('Fetching user orders with token from AsyncStorage');
      
      // Đường dẫn API lấy lịch sử đơn hàng của user
      const response = await api.get('/orders/user', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log('Raw backend orders:', response.data);
      
      // Map backend data to frontend format
      const mappedOrders = response.data.map(mapBackendOrderToFrontend);
      console.log('Mapped orders for frontend:', mappedOrders);
      
      return mappedOrders;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch orders';
      console.error('Error fetching user orders:', error.response?.data || error.message || error);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  'user/fetchUserProfile',
  async (_, thunkAPI) => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      console.log('Fetching user profile with token:', token ? 'Token available' : 'No token found');

      if (!token) {
        return thunkAPI.rejectWithValue('No access token found. Please log in.');
      }

      // ✅ CẬP NHẬT ĐƯỜNG DẪN API TẠI ĐÂY
      const response = await api.get('/users/me', { // Thay đổi '/user/profile' thành '/users/me'
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log('User profile fetched successfully:', response.data); // Log dữ liệu trả về
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch profile';
      console.error('Error fetching user profile:', error.response?.data || error.message || error);
      return thunkAPI.rejectWithValue(message);
    }
  }
);


const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUserProfile: (state) => {
      state.profile = null;
      state.error = null;
    },
    updateUserProfile: (state, action: PayloadAction<Partial<UserProfile>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Thêm xử lý cho fetchUserOrders
      .addCase(fetchUserOrders.pending, (state) => {
        state.ordersLoading = true;
        state.ordersError = null;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.ordersLoading = false;
        state.orders = action.payload;
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.ordersLoading = false;
        state.ordersError = action.payload as string;
      })
      // Thêm xử lý cho fetchOrderById
      .addCase(fetchOrderById.pending, (state) => {
        state.currentOrderLoading = true;
        state.currentOrderError = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.currentOrderLoading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.currentOrderLoading = false;
        state.currentOrderError = action.payload as string;
      });
  },
});

export const { clearUserProfile, updateUserProfile } = userSlice.actions;
export default userSlice.reducer;