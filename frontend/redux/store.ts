import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice'; 
import orderReducer from './slices/orderSlice'; 
import notificationReducer from './slices/notificationSlice'
import staffReducer from "./slices/staffSlice"

const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer, 
    order: orderReducer, // ✅ Thêm dòng này
    notification: notificationReducer,
    staff: staffReducer
  },
  
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
