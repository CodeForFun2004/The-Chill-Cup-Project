// redux/store.ts
import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './rootReducer';
import { setupAxiosInterceptors } from '../api/axios'; // Import hàm setup

export const store = configureStore({
  reducer: rootReducer,
});

// Sau khi store được tạo, gọi hàm setupAxiosInterceptors
setupAxiosInterceptors(store); // Pass store instance here

export type AppDispatch = typeof store.dispatch;