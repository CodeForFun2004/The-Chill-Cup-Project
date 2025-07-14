import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import store from '../redux/store';
import { setAccessToken } from '../redux/slices/authSlice';

const API_URL = 'http://192.168.110.22:8080/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        const res = await api.post('/auth/refresh', { refreshToken });

        const newAccessToken = res.data.accessToken;

        // Save to storage + Redux
        await AsyncStorage.setItem('accessToken', newAccessToken);
        store.dispatch(setAccessToken(newAccessToken));

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (err) {
        // Optional: clear auth, force logout
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
        store.dispatch({ type: 'auth/logout' });
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
