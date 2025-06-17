import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Type cho từng item trong đơn hàng
export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image?: any;
}

// Type cho đơn hàng
export interface Order {
  id: string;                  // Mã định danh nội bộ
  orderNumber: string;         // Mã hiển thị đơn hàng (ORD-XXXX)
  items: OrderItem[];
  total: number;
  address: string;
  paymentMethod: string;
  deliveryTime: string;
  date: string;
  time: string;
  status: 'Completed' | 'Cancelled' | 'Pending' | 'Processing' | 'Preparing' | 'Ready' | 'Delivering';
  estimatedDelivery?: string;
  deliveryAddress?: string;
  phoneNumber?: string;
}

// Trạng thái khởi tạo rỗng
const initialState: Order = {
  id: '',
  orderNumber: '',
  items: [],
  total: 0,
  address: '',
  paymentMethod: '',
  deliveryTime: '',
  date: '',
  time: '',
  status: 'Processing',
  estimatedDelivery: '',
  deliveryAddress: '',
  phoneNumber: '',
};

// Slice Redux
const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    setOrderInfo: (state, action: PayloadAction<Order>) => {
      return { ...state, ...action.payload };
    },
    clearOrderInfo: () => initialState,
  },
});

export const { setOrderInfo, clearOrderInfo } = orderSlice.actions;
export default orderSlice.reducer;
