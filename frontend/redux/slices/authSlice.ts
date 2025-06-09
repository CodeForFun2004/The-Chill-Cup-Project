import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type Role = 'guest' | 'customer' | 'staff' | 'shipper' | 'admin';

interface AuthState {
  isLoggedIn: boolean;
  role: Role;
  userInfo?: any;
}

const initialState: AuthState = {
  isLoggedIn: false,
  role: 'guest',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action: PayloadAction<{ role: Role; userInfo?: any }>) {
      state.isLoggedIn = true;
      state.role = action.payload.role;
      state.userInfo = action.payload.userInfo;
    },
    logout(state) {
      state.isLoggedIn = false;
      state.role = 'guest';
      state.userInfo = undefined;
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
