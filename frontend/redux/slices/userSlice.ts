import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../api/axios'; // Đảm bảo 'api' là instance axios của bạn

interface UserProfile {
  _id: string;
  username: string;
  fullname: string;
  email?: string;
  phone?: string; // Có thể có hoặc không
  avatar?: string; // Nếu có trong model và được trả về
  address?: string; // Có thể có hoặc không
  role: 'customer' | 'admin' | 'staff' | 'shipper';
  staffId?: string | null;
  status?: 'available' | 'assigned';
  isBanned: boolean;
  googleId?: string;
  refreshToken?: string; // Mặc dù không nên dùng ở frontend, nhưng nếu API trả về thì vẫn cần khai báo để khớp kiểu
  storeId?: string | null;
  createdAt: string;
  updatedAt: string;
  __v: number; // Trường này thường có trong MongoDB
  [key: string]: any;
}

interface UserState {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  profile: null,
  loading: false,
  error: null,
};

export const fetchUserProfile = createAsyncThunk(
  'user/fetchUserProfile',
  async (_, thunkAPI) => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      console.log('Fetching user profile with token:', token ? 'Token available' : 'No token found');

      if (!token) {
        return thunkAPI.rejectWithValue('No access token found. Please log in.');
      }

      // ✅ CẬP NHẬT ĐƯỜNG DẪN API TẠI ĐÂY
      const response = await api.get('/users/me', { // Thay đổi '/user/profile' thành '/users/me'
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log('User profile fetched successfully:', response.data); // Log dữ liệu trả về
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch profile';
      console.error('Error fetching user profile:', error.response?.data || error.message || error);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUserProfile: (state) => {
      state.profile = null;
      state.error = null;
    },
    updateUserProfile: (state, action: PayloadAction<Partial<UserProfile>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearUserProfile, updateUserProfile } = userSlice.actions;
export default userSlice.reducer;