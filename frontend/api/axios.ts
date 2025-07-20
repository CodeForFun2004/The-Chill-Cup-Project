// api/axios.ts (hoặc một tên khác như api/configuredAxios.ts)
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.110.22:8080/api';

// Tạo một biến để giữ instance của axios
let apiInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Một hàm để khởi tạo và cấu hình interceptors, nhận `store` như một tham số
export const setupAxiosInterceptors = (store: any) => { // Sử dụng 'any' để tránh phụ thuộc trực tiếp vào kiểu Store
  apiInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const refreshToken = await AsyncStorage.getItem('refreshToken');
          const res = await apiInstance.post('/auth/refresh', { refreshToken });

          const newAccessToken = res.data.accessToken;

          // Lưu vào storage
          await AsyncStorage.setItem('accessToken', newAccessToken);

          // Dispatch action thông qua store được truyền vào
          // Thay vì import trực tiếp setAccessToken, chúng ta sẽ dùng hàm từ store
          // Đảm bảo authSlice đã export setAccessToken
          store.dispatch(require('../redux/slices/authSlice').setAccessToken(newAccessToken)); // Tránh import trực tiếp tại đây

          // Thử lại request gốc
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiInstance(originalRequest);
        } catch (err) {
          // Xóa dữ liệu xác thực và dispatch logout
          await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
          store.dispatch(require('../redux/slices/authSlice').logout()); // Tránh import trực tiếp tại đây
          return Promise.reject(err);
        }
      }
      return Promise.reject(error);
    }
  );
};

export default apiInstance;