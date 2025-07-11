import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../api/axios';

interface UserProfile {
  id: string;
  name: string;
  email: string;
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

// ✅ Thunk để fetch profile user
export const fetchUserProfile = createAsyncThunk(
  'user/fetchUserProfile',
  async (_, thunkAPI) => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const response = await api.get('/user/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch profile';
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

export const { clearUserProfile } = userSlice.actions;
export default userSlice.reducer;
