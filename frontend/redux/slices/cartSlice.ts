import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from '../../api/axios';
import { RootState } from '../rootReducer';

export type CartItem = {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  image: string;
  size?: string;
  toppings?: string[];
};

type CartState = {
  items: CartItem[];
  delivery: number;
  taxRate: number;
  loading: boolean;
  error: string | null;
};

const initialState: CartState = {
  items: [],
  delivery: 5000,
  taxRate: 0.01,
  loading: false,
  error: null,
};

// ✅ Load cart từ API
export const loadCartFromAPI = createAsyncThunk<CartItem[], void, { state: RootState; rejectValue: string }>(
  'cart/loadCartFromAPI',
  async (_, thunkAPI) => {
    const token = thunkAPI.getState().auth.accessToken;
    try {
      const res = await axios.get('/cart', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.items;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to load cart');
    }
  }
);

// ✅ Thêm item vào cart (API POST /cart)
export const addItemToCart = createAsyncThunk<CartItem[], CartItem, { state: RootState; rejectValue: string }>(
  'cart/addItemToCart',
  async (item, thunkAPI) => {
    const token = thunkAPI.getState().auth.accessToken;
    try {
      const res = await axios.post('/cart', item, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.updatedCart;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to add item');
    }
  }
);

// ✅ Xoá item khỏi cart (API DELETE /cart/item/:itemId)
export const removeItemFromCart = createAsyncThunk<CartItem[], string, { state: RootState; rejectValue: string }>(
  'cart/removeItemFromCart',
  async (itemId, thunkAPI) => {
    const token = thunkAPI.getState().auth.accessToken;
    try {
      const res = await axios.delete(`/cart/item/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.updatedCart;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to remove item');
    }
  }
);

// ✅ Clear cart (API DELETE /cart)
export const clearCart = createAsyncThunk<CartItem[], void, { state: RootState; rejectValue: string }>(
  'cart/clearCart',
  async (_, thunkAPI) => {
    const token = thunkAPI.getState().auth.accessToken;
    try {
      const res = await axios.delete('/cart', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.updatedCart;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to clear cart');
    }
  }
);

// ✅ Apply discount (API POST /cart/apply-discount)
export const applyDiscount = createAsyncThunk<CartItem[], { code: string }, { state: RootState; rejectValue: string }>(
  'cart/applyDiscount',
  async ({ code }, thunkAPI) => {
    const token = thunkAPI.getState().auth.accessToken;
    try {
      const res = await axios.post('/cart/apply-discount', { code }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.updatedCart;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to apply discount');
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCartItems(state, action: PayloadAction<CartItem[]>) {
      state.items = action.payload;
    },
    increaseQuantity(state, action: PayloadAction<string>) {
      const item = state.items.find(i => i.id === action.payload);
      if (item) item.quantity += 1;
    },
    decreaseQuantity(state, action: PayloadAction<string>) {
      const item = state.items.find(i => i.id === action.payload);
      if (item && item.quantity > 1) item.quantity -= 1;
    },
    clearLocalCart(state) {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadCartFromAPI.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loadCartFromAPI.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
      .addCase(loadCartFromAPI.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Failed to load cart'; })

      .addCase(addItemToCart.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(addItemToCart.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
      .addCase(addItemToCart.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Failed to add item'; })

      .addCase(removeItemFromCart.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(removeItemFromCart.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
      .addCase(removeItemFromCart.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Failed to remove item'; })

      .addCase(clearCart.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(clearCart.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
      .addCase(clearCart.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Failed to clear cart'; })

      .addCase(applyDiscount.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(applyDiscount.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
      .addCase(applyDiscount.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Failed to apply discount'; });
  },
});

export const { setCartItems, increaseQuantity, decreaseQuantity, clearLocalCart } = cartSlice.actions;

export default cartSlice.reducer;
