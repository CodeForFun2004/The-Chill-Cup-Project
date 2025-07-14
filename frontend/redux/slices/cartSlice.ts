import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from '../../api/axios';
import { RootState } from '../rootReducer';

// Kiểu dữ liệu ĐƯỢC LƯU TRONG REDUX STATE
export type CartItem = {
  id: string; // <-- Sẽ map từ _id của backend
  name: string;
  category: string;
  price: number; // <-- Sẽ map từ unitPrice của backend
  quantity: number;
  image: string;
  size?: string;
  toppings?: string[]; // <-- Mảng TÊN topping (ví dụ: ["Trân châu trắng", "Trân châu đen"])
};

// Định nghĩa kiểu dữ liệu cho payload khi thêm item vào giỏ hàng
export type AddItemPayload = {
  productId: string;
  size?: string;
  toppings?: string[]; // Mảng các ID của topping (khớp với backend của bạn)
  quantity: number;
};

// Kiểu dữ liệu NHẬN ĐƯỢC TỪ BACKEND API
type RawCartItem = {
  _id: string; // ID của sản phẩm trong giỏ hàng (từ backend, cần map thành 'id' ở frontend)
  name: string;
  image: string;
  size?: string;
  quantity: number;
  unitPrice: number; // Giá đơn vị từ backend (cần map thành 'price' ở frontend)
  category?: string; // Tên category (hoặc ID nếu backend trả về)
  toppings?: { _id: string; name: string; price: number; icon: string }[]; // Mảng đối tượng topping đầy đủ
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
export const loadCartFromAPI = createAsyncThunk<RawCartItem[], void, { state: RootState; rejectValue: string }>(
  'cart/loadCartFromAPI',
  async (_, thunkAPI) => {
    const token = thunkAPI.getState().auth.accessToken;
    console.log('[loadCartFromAPI] token:', token);
    try {
      const res = await axios.get('/cart', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.items; // Backend trả về mảng RawCartItem
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to load cart');
    }
  }
);

// ✅ Thêm item vào cart (API POST /cart)
export const addItemToCart = createAsyncThunk<RawCartItem[], AddItemPayload, { state: RootState; rejectValue: string }>(
  'cart/addItemToCart',
  async (itemPayload, thunkAPI) => {
    const token = thunkAPI.getState().auth.accessToken;
    console.log('[addItemToCart] Sending item payload to API:', itemPayload); // Thêm log này
    console.log('[addItemToCart] Token:', token);
    try {
      const res = await axios.post('/cart', itemPayload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('[addItemToCart] API response (raw):', res.data); // Thêm log này
      return res.data.items; // Backend trả về 'items' (là RawCartItem[])
    } catch (err: any) {
      console.error('[addItemToCart] API error:', err.response?.data || err.message || err);
      return thunkAPI.rejectWithValue(err.response?.data?.error || 'Failed to add item');
    }
  }
);

// ✅ Xoá item khỏi cart (API DELETE /cart/item/:itemId)
export const removeItemFromCart = createAsyncThunk<RawCartItem[], string, { state: RootState; rejectValue: string }>( // <-- Thay đổi kiểu trả về thành RawCartItem[]
  'cart/removeItemFromCart',
  async (itemId, thunkAPI) => {
    const token = thunkAPI.getState().auth.accessToken;
    try {
      const res = await axios.delete(`/cart/item/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.updatedCart; // Backend trả về updatedCart.items (nếu có)
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to remove item');
    }
  }
);

// ✅ Clear cart (API DELETE /cart)
export const clearCart = createAsyncThunk<RawCartItem[], void, { state: RootState; rejectValue: string }>( // <-- Thay đổi kiểu trả về thành RawCartItem[]
  'cart/clearCart',
  async (_, thunkAPI) => {
    const token = thunkAPI.getState().auth.accessToken;
    try {
      const res = await axios.delete('/cart', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.updatedCart; // Backend trả về updatedCart.items (nếu có)
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to clear cart');
    }
  }
);

// ✅ Apply discount (API POST /cart/apply-discount)
export const applyDiscount = createAsyncThunk<RawCartItem[], { code: string }, { state: RootState; rejectValue: string }>( // <-- Thay đổi kiểu trả về thành RawCartItem[]
  'cart/applyDiscount',
  async ({ code }, thunkAPI) => {
    const token = thunkAPI.getState().auth.accessToken;
    try {
      const res = await axios.post('/cart/apply-discount', { code }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.updatedCart; // Backend trả về updatedCart.items (nếu có)
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
      // Xử lý khi tải giỏ hàng từ API thành công
      .addCase(loadCartFromAPI.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loadCartFromAPI.fulfilled, (state, action: PayloadAction<RawCartItem[]>) => { // Explicitly define payload type here
        state.loading = false;
        console.log('[Reducer] Fetched RawCartItem[] from API:', action.payload);
        state.items = action.payload.map(item => ({
          id: item._id, // ✅ Map _id từ RawCartItem thành id cho CartItem
          name: item.name,
          category: item.category || '',
          price: item.unitPrice, // ✅ Map unitPrice từ RawCartItem thành price cho CartItem
          quantity: item.quantity,
          image: item.image,
          size: item.size,
          toppings: item.toppings ? item.toppings.map(t => t.name) : [], // Map topping objects thành mảng tên strings
        }));
        console.log('[Reducer] Mapped CartItem[] for state:', state.items);
      })
      .addCase(loadCartFromAPI.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Failed to load cart'; })

      // Xử lý khi thêm item vào giỏ hàng thành công
      .addCase(addItemToCart.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(addItemToCart.fulfilled, (state, action: PayloadAction<RawCartItem[]>) => { // Explicitly define payload type here
        state.loading = false;
        console.log('[Reducer] Added RawCartItem[] from API:', action.payload);
        // Tương tự loadCartFromAPI.fulfilled, bạn cần map RawCartItem[] -> CartItem[]
        state.items = action.payload.map(item => ({
          id: item._id, // ✅ Map _id từ RawCartItem thành id cho CartItem
          name: item.name,
          category: item.category || '',
          price: item.unitPrice, // ✅ Map unitPrice từ RawCartItem thành price cho CartItem
          quantity: item.quantity,
          image: item.image,
          size: item.size,
          toppings: item.toppings ? item.toppings.map(t => t.name) : [], // Map topping objects thành mảng tên strings
        }));
        console.log('[Reducer] Mapped CartItem[] for state after add:', state.items);
      })
      .addCase(addItemToCart.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Failed to add item'; })

      // Xử lý khi xóa item khỏi cart thành công
      .addCase(removeItemFromCart.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(removeItemFromCart.fulfilled, (state, action: PayloadAction<RawCartItem[]>) => { // <-- Thêm PayloadAction<RawCartItem[]>
        state.loading = false;
        state.items = action.payload.map(item => ({
          id: item._id,
          name: item.name,
          category: item.category || '',
          price: item.unitPrice,
          quantity: item.quantity,
          image: item.image,
          size: item.size,
          toppings: item.toppings ? item.toppings.map(t => t.name) : [],
        }));
      })
      .addCase(removeItemFromCart.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Failed to remove item'; })

      // Xử lý khi clear cart thành công
      .addCase(clearCart.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(clearCart.fulfilled, (state, action: PayloadAction<RawCartItem[]>) => { // <-- Thêm PayloadAction<RawCartItem[]>
        state.loading = false;
        state.items = action.payload.map(item => ({
          id: item._id,
          name: item.name,
          category: item.category || '',
          price: item.unitPrice,
          quantity: item.quantity,
          image: item.image,
          size: item.size,
          toppings: item.toppings ? item.toppings.map(t => t.name) : [],
        }));
      })
      .addCase(clearCart.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Failed to clear cart'; })

      // Xử lý khi apply discount thành công
      .addCase(applyDiscount.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(applyDiscount.fulfilled, (state, action: PayloadAction<RawCartItem[]>) => { // <-- Thêm PayloadAction<RawCartItem[]>
        state.loading = false;
        state.items = action.payload.map(item => ({
          id: item._id,
          name: item.name,
          category: item.category || '',
          price: item.unitPrice,
          quantity: item.quantity,
          image: item.image,
          size: item.size,
          toppings: item.toppings ? item.toppings.map(t => t.name) : [],
        }));
      })
      .addCase(applyDiscount.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Failed to apply discount'; });
  },
});

export const { setCartItems, increaseQuantity, decreaseQuantity, clearLocalCart } = cartSlice.actions;

export default cartSlice.reducer;