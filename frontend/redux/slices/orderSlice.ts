// redux/slices/orderSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type OrderState = {
  orderId: string;
  items: string;
  total: number;
  address: string;
  paymentMethod: string;
  deliveryTime: string;
};

const initialState: OrderState = {
  orderId: '',
  items: '',
  total: 0,
  address: '',
  paymentMethod: '',
  deliveryTime: '',
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    setOrderInfo: (state, action: PayloadAction<OrderState>) => {
      return { ...state, ...action.payload };
    },
    clearOrderInfo: () => initialState,
  },
});

export const { setOrderInfo, clearOrderInfo } = orderSlice.actions;
export default orderSlice.reducer;
