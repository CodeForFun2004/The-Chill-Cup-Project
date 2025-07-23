// redux/orderSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../api/axios';
import { RootState } from '../rootReducer';

// Định nghĩa kiểu dữ liệu cho một Product bên trong OrderItem khi đã được populate
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

// Định nghĩa kiểu dữ liệu cho một mục sản phẩm trong đơn hàng
export interface OrderItem {
    productId: OrderProduct;
    name: string;
    size?: string;
    toppings?: { id: string; name: string }[];
    quantity: number;
    price: number;
    _id: string;
}

// Định nghĩa kiểu dữ liệu cho yêu cầu hoàn tiền
export interface RefundRequest {
    _id: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    reason?: string;
    requestedAt: string;
    processedAt?: string;
}

// Định nghĩa kiểu dữ liệu đầy đủ cho một đơn hàng
export interface Order {
    _id: string;
    userId: string;
    storeId: string;
    orderNumber: string;
    items: OrderItem[];
    subtotal: number;
    discount?: number;
    tax: number;
    total: number;
    deliveryFee: number;
    deliveryAddress: string;
    phone: string;
    paymentMethod: 'vietqr' | 'cod';
    deliveryTime: string;
    status: 'pending'| 'processing'| 'preparing'| 'ready'| 'delivering'| 'completed'| 'cancelled';
    cancelReason: string | null;
    shipperAssigned: string | null;
    appliedPromoCode?: string | null;
    createdAt: string;
    updatedAt?: string;
    __v: number;
    refundRequests?: RefundRequest[];
    // ✅ Thêm thuộc tính qrCodeUrl vào interface
    qrCodeUrl?: string; 
}

// Payload cho action createOrder
interface CreateOrderPayload {
    deliveryAddress: string;
    phone: string;
    paymentMethod: 'vietqr' | 'cod';
    storeId: string;
}

// Định nghĩa trạng thái của slice order
interface OrderState {
    currentOrder: Order | null;
    loading: boolean;
    error: string | null;
    orderCreatedSuccessfully: boolean;
}

const initialState: OrderState = {
    currentOrder: null,
    loading: false,
    error: null,
    orderCreatedSuccessfully: false,
};

// --- THUNKS ---

/**
 * @thunk createOrder
 * @description Gửi yêu cầu tạo đơn hàng mới.
 * Trả về toàn bộ đối tượng order và qrCodeUrl khi thành công.
 */
export const createOrder = createAsyncThunk<
    { order: Order; qrCodeUrl?: string }, 
    CreateOrderPayload,
    { state: RootState }
>(
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
            
            // ✅ Trả về toàn bộ object từ response
            return response.data;
            
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
                state.loading = true;
                state.error = null;
                state.orderCreatedSuccessfully = false;
                state.currentOrder = null;
            })
            .addCase(createOrder.fulfilled, (state, action) => {
                state.loading = false;
                state.orderCreatedSuccessfully = true;
                state.error = null;
                // ✅ Cập nhật toàn bộ thông tin order, bao gồm cả qrCodeUrl
                state.currentOrder = {
                    ...action.payload.order,
                    qrCodeUrl: action.payload.qrCodeUrl,
                };
            })
            .addCase(createOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.orderCreatedSuccessfully = false;
                state.currentOrder = null;
            })
            // --- Xử lý trạng thái của fetchOrderById thunk ---
            .addCase(fetchOrderById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOrderById.fulfilled, (state, action: PayloadAction<Order>) => {
                state.loading = false;
                state.currentOrder = action.payload;
                state.error = null;
                state.orderCreatedSuccessfully = true;
            })
            .addCase(fetchOrderById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.currentOrder = null;
                state.orderCreatedSuccessfully = false;
            });
    },
});

export const { resetOrderState } = orderSlice.actions;
export default orderSlice.reducer;