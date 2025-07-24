import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../api/axios";

interface PointHistoryItem {
  orderId: {
    _id: string;
    total: number;
    createdAt: string;
  };
  pointsEarned: number;
}

interface VoucherItem {
  _id: string;
  title: string;
  description: string;
  promotionCode: string;
  discountPercent: number;
  requiredPoints: number;
  expiryDate: string;
  image: string;
}

interface LoyaltyState {
  totalPoints: number;
  pointHistory: PointHistoryItem[];
  vouchers: VoucherItem[];
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: LoyaltyState = {
  totalPoints: 0,
  pointHistory: [],
  vouchers: [],
  loading: false,
  error: null,
  successMessage: null,
};

// 👉 GET: /api/loyalty/me
export const fetchMyPoints = createAsyncThunk(
  "loyalty/fetchMyPoints",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get("/loyalty/me");
      return res.data.totalPoints;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Lỗi khi lấy điểm");
    }
  }
);

// 👉 GET: /api/loyalty/history
export const fetchPointHistory = createAsyncThunk(
  "loyalty/fetchPointHistory",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get("/loyalty/history");
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Lỗi khi lấy lịch sử điểm");
    }
  }
);

// 👉 GET: /api/loyalty/available-vouchers
export const fetchAvailableVouchers = createAsyncThunk(
  "loyalty/fetchAvailableVouchers",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get("/loyalty/available-vouchers");
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Lỗi khi lấy danh sách voucher");
    }
  }
);

// 👉 POST: /api/loyalty/redeem
export const redeemVoucher = createAsyncThunk(
  "loyalty/redeemVoucher",
  async (discountId: string, { rejectWithValue }) => {
    try {
      const res = await axios.post("/loyalty/redeem", { discountId });
      return res.data.message;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Lỗi khi đổi voucher");
    }
  }
);

const loyaltySlice = createSlice({
  name: "loyalty",
  initialState,
  reducers: {
    clearLoyaltyMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyPoints.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyPoints.fulfilled, (state, action) => {
        state.totalPoints = action.payload;
        state.loading = false;
      })
      .addCase(fetchMyPoints.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchPointHistory.fulfilled, (state, action) => {
        state.pointHistory = action.payload;
      })
      .addCase(fetchPointHistory.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      .addCase(fetchAvailableVouchers.fulfilled, (state, action) => {
        state.vouchers = action.payload.vouchers;
        state.totalPoints = action.payload.totalPoints; // update điểm hiện tại
      })
      .addCase(fetchAvailableVouchers.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      .addCase(redeemVoucher.fulfilled, (state, action) => {
        state.successMessage = action.payload;
      })
      .addCase(redeemVoucher.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearLoyaltyMessages } = loyaltySlice.actions;
export default loyaltySlice.reducer;
