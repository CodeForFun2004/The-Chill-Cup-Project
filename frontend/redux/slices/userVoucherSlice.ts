import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../api/axios";

// Kiểu dữ liệu cho một voucher của người dùng
export interface UserVoucher {
  _id: string; // ID của discount
  title: string;
  description: string;
  promotionCode: string;
  discountPercent: number;
  minOrder: number;
  expiryDate: string;
  image?: string;
  isUsed: boolean | null; // true: đã dùng, false: chưa dùng, null: chưa nhận
}

interface UserVoucherState {
  vouchers: UserVoucher[];
  loading: boolean;
  error: string | null;
}

const initialState: UserVoucherState = {
  vouchers: [],
  loading: false,
  error: null,
};

// Async Thunk để lấy danh sách voucher của người dùng
// GET: /api/user-discounts
// Bạn có thể truyền filter isUsed để backend lọc
export const fetchUserVouchers = createAsyncThunk<UserVoucher[], 'true' | 'false' | undefined, { rejectValue: string }>(
  "userVoucher/fetchUserVouchers",
  async (isUsed, { rejectWithValue }) => {
    try {
      const url = isUsed !== undefined ? `/user-discounts?isUsed=${isUsed}` : `/user-discounts`;
      const res = await axios.get(url);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Lỗi khi lấy danh sách voucher của bạn");
    }
  }
);

const userVoucherSlice = createSlice({
  name: "userVoucher",
  initialState,
  reducers: {
    clearUserVoucherError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserVouchers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserVouchers.fulfilled, (state, action) => {
        state.loading = false;
        state.vouchers = action.payload;
        state.error = null;
      })
      .addCase(fetchUserVouchers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearUserVoucherError } = userVoucherSlice.actions;
export default userVoucherSlice.reducer;