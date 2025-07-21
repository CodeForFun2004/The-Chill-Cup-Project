import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import orderReducer from './slices/orderSlice';
import notificationReducer from './slices/notificationSlice';
import userReducer from './slices/userSlice'
import categoryReducer from './slices/categorySlice'
import productReducer from './slices/productSlice'

const rootReducer = combineReducers({
  auth: authReducer,
  cart: cartReducer,
  order: orderReducer,
  notification: notificationReducer,
  user: userReducer, // ✅ thêm dòng này
  category: categoryReducer,
  product: productReducer
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
