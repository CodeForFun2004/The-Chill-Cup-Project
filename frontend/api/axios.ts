// api/axios.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';


const API_URL = 'http://192.168.11.108:8080/api';


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

// API Services cho Shipper
export const shipperAPI = {
  // Lấy danh sách đơn hàng được phân công
  getOrders: async (params?: {
    status?: string
    page?: number
    limit?: number
    sortBy?: string
    sortOrder?: string
  }) => {
    const response = await apiInstance.get("/shipper", { params })
    return response.data
  },

  // Cập nhật trạng thái giao hàng
  updateOrderStatus: async (orderId: string, status: string, cancelReason?: string) => {
    const response = await apiInstance.put(`/shipper/${orderId}/status`, {
      status,
      cancelReason,
    })
    return response.data
  },

  // Lấy lịch sử giao hàng
  getDeliveryHistory: async (params?: {
    page?: number
    limit?: number
    startDate?: string
    endDate?: string
    filter?: string
  }) => {
    const response = await apiInstance.get("/shipper/history", { params })
    return response.data
  },

  // Lấy tổng quan thu nhập
  getEarningsSummary: async (params?: {
    startDate?: string
    endDate?: string
    filter?: string
  }) => {
    const response = await apiInstance.get("/shipper/earnings", { params })
    return response.data
  },

  // Bật/tắt trạng thái sẵn sàng
  toggleAvailability: async (isAvailable: boolean) => {
    const response = await apiInstance.put("/shipper/toggle-availability", {
      isAvailable,
    })
    return response.data
  },
}

// API Services cho Discount Management
export const discountAPI = {
  // Lấy tất cả mã giảm giá
  getAllDiscounts: async () => {
    const response = await apiInstance.get("/discounts")
    return response.data
  },

  // Tạo mã giảm giá mới
  createDiscount: async (discountData: {
    title: string
    description: string
    discountPercent: number
    expiryDate: string
    minOrder: number
    pointsRequired: number
    image?: string
  }) => {
    const response = await apiInstance.post("/discounts", discountData)
    return response.data
  },

  // Cập nhật mã giảm giá
  updateDiscount: async (
    id: string,
    discountData: {
      title?: string
      description?: string
      discountPercent?: number
      expiryDate?: string
      minOrder?: number
      pointsRequired?: number
      image?: string
    },
  ) => {
    const response = await apiInstance.put(`/discounts/${id}`, discountData)
    return response.data
  },

  // Xóa mã giảm giá
  deleteDiscount: async (id: string) => {
    const response = await apiInstance.delete(`/discounts/${id}`)
    return response.data
  },

  // Khóa/mở khóa mã giảm giá
  lockDiscount: async (id: string) => {
    const response = await apiInstance.patch(`/discounts/lock/${id}`)
    return response.data
  },
}

export default apiInstance;