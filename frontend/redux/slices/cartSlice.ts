import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from '../../api/axios';
import { RootState } from '../rootReducer';

export type CartItem = {
  id: number | string;   // backend có thể trả string id
  name: string;
  brand: string;
  price: number;         // giá đơn vị, chưa nhân quantity
  quantity: number;
  image: any;
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
export const loadCartFromAPI = createAsyncThunk<
  CartItem[],
  void,
  { state: RootState; rejectValue: string }
>('cart/loadCartFromAPI', async (_, thunkAPI) => {
  const token = thunkAPI.getState().auth.accessToken;
  try {
    const res = await axios.get('/cart', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.items;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to load cart');
  }
});

// ✅ Thêm item vào cart (API)
export const addItemToCart = createAsyncThunk<
  CartItem[],
  CartItem,
  { state: RootState; rejectValue: string }
>('cart/addItemToCart', async (item, thunkAPI) => {
  const token = thunkAPI.getState().auth.accessToken;
  try {
    const res = await axios.post('/cart/add', item, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.updatedCart;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to add item');
  }
});

// ✅ Xoá item khỏi cart (API)
export const removeItemFromCart = createAsyncThunk<
  CartItem[],
  number | string,
  { state: RootState; rejectValue: string }
>('cart/removeItemFromCart', async (itemId, thunkAPI) => {
  const token = thunkAPI.getState().auth.accessToken;
  try {
    const res = await axios.delete(`/cart/remove/${itemId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.updatedCart;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to remove item');
  }
});

// ✅ Cập nhật quantity (API)
export const updateItemQuantity = createAsyncThunk<
  CartItem[],
  { itemId: number | string; quantity: number },
  { state: RootState; rejectValue: string }
>('cart/updateItemQuantity', async ({ itemId, quantity }, thunkAPI) => {
  const token = thunkAPI.getState().auth.accessToken;
  try {
    const res = await axios.put(`/cart/update/${itemId}`, { quantity }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.updatedCart;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to update quantity');
  }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // ✅ UI-only logic
    setCartItems(state, action: PayloadAction<CartItem[]>) {
      state.items = action.payload;
    },
    increaseQuantity(state, action: PayloadAction<number | string>) {
      const item = state.items.find(i => i.id === action.payload);
      if (item) item.quantity += 1;
    },
    decreaseQuantity(state, action: PayloadAction<number | string>) {
      const item = state.items.find(i => i.id === action.payload);
      if (item && item.quantity > 1) item.quantity -= 1;
    },
    clearCart(state) {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Load cart
      .addCase(loadCartFromAPI.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadCartFromAPI.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(loadCartFromAPI.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load cart';
      })

      // Add item
      .addCase(addItemToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addItemToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(addItemToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to add item';
      })

      // Remove item
      .addCase(removeItemFromCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeItemFromCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(removeItemFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to remove item';
      })

      // Update quantity
      .addCase(updateItemQuantity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateItemQuantity.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(updateItemQuantity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update quantity';
      });
  },
});

export const {
  setCartItems,
  increaseQuantity,
  decreaseQuantity,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
