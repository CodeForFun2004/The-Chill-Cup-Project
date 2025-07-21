// redux/store.ts
import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './rootReducer';
import { setupAxiosInterceptors } from '../api/axios'; // Import hàm setup

// ✅ Import cả logout và setAccessToken action creators từ authSlice
import { logout, setAccessToken } from './slices/authSlice'; 

export const store = configureStore({
  reducer: rootReducer,
});

// ✅ Sau khi store được tạo, gọi hàm setupAxiosInterceptors với store.dispatch
// và một object chứa cả logout và setAccessToken
setupAxiosInterceptors(store.dispatch, { logout, setAccessToken }); 

export type AppDispatch = typeof store.dispatch;