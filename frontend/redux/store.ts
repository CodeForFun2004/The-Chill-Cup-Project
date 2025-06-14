import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice'; 
import orderReducer from './slices/orderSlice'; 

const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer, 
    order: orderReducer, // ✅ Thêm dòng này
  },
  
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
