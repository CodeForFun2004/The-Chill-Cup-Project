// api/axios.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.110.22:8080/api';

let apiInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Định nghĩa interface cho các actions cần thiết
interface AuthActions {
  setAccessToken: (token: string) => { type: string; payload: string };
  logout: () => { type: string };
}

// Một hàm để khởi tạo và cấu hình interceptors, nhận `dispatch` và các actions cụ thể
export const setupAxiosInterceptors = (dispatch: any, authActions: AuthActions) => {
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

          await AsyncStorage.setItem('accessToken', newAccessToken);

          // Sử dụng actions đã được truyền vào
          dispatch(authActions.setAccessToken(newAccessToken));

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiInstance(originalRequest);
        } catch (err) {
          await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
          // Sử dụng actions đã được truyền vào
          dispatch(authActions.logout());
          return Promise.reject(err);
        }
      }
      return Promise.reject(error);
    }
  );
};

export default apiInstance;