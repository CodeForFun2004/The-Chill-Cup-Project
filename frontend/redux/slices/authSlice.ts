import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from '../../api/axios';

type Role = 'guest' | 'customer' | 'staff' | 'shipper' | 'admin';

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  [key: string]: any;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  error: string | null;
  role: Role;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  loading: false,
  error: null,
  role: 'guest',
};

// ✅ Đăng nhập user
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (
    { usernameOrEmail, password }: { usernameOrEmail: string; password: string },
    thunkAPI
  ) => {
    try {
      const response = await axios.post('/auth/login', { usernameOrEmail, password });

      // Lưu vào AsyncStorage
      await AsyncStorage.setItem('accessToken', response.data.accessToken);
      await AsyncStorage.setItem('refreshToken', response.data.refreshToken);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));

      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// ✅ Logout user (xử lý cả async)
export const logoutUser = createAsyncThunk('auth/logoutUser', async (_, thunkAPI) => {
  await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
  thunkAPI.dispatch(logout());
});

// ✅ Load user từ AsyncStorage khi mở app
export const loadUserFromStorage = createAsyncThunk('auth/loadUserFromStorage', async (_, thunkAPI) => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    const userStr = await AsyncStorage.getItem('user');
    if (token && userStr) {
      const user = JSON.parse(userStr) as User;
      return { user, accessToken: token, role: user.role };
    } else {
      throw new Error('No user data found');
    }
  } catch (error) {
    return thunkAPI.rejectWithValue('Failed to load user from storage');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.role = 'guest';
    },
    setCredentials: (state, action: PayloadAction<{ user: User; accessToken: string; role: Role }>) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.role = action.payload.role;
    },
    setAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.role = action.payload.user.role || 'customer';
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = typeof action.payload === 'string' ? action.payload : 'Login failed';
      })
      .addCase(loadUserFromStorage.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.role = action.payload.role;
      })
      .addCase(loadUserFromStorage.rejected, (state) => {
        state.user = null;
        state.accessToken = null;
        state.role = 'guest';
      });
  },
});

export const { logout, setCredentials, setAccessToken } = authSlice.actions;
export default authSlice.reducer;
