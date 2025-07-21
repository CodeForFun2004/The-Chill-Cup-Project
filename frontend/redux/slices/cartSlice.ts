import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from '../../api/axios';
import { RootState } from '../rootReducer';

// Hàm tiện ích để đảm bảo giá trị là số hợp lệ, nếu không sẽ dùng giá trị dự phòng
const ensureNumber = (value: any, fallback: number = 0): number => {
  const num = Number(value);
  return isNaN(num) ? fallback : num;
};

// Kiểu dữ liệu ĐƯỢC LƯU TRONG REDUX STATE (frontend friendly)
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

// Định nghĩa kiểu dữ liệu cho payload khi cập nhật số lượng item
export type UpdateItemQuantityPayload = {
    itemId: string; // ID của sản phẩm trong giỏ hàng (từ frontend CartItem.id)
    quantity: number;
};

// Kiểu dữ liệu NHẬN ĐƯỢC TỪ BACKEND API (Raw items)
// Đây là cấu trúc chung cho mọi phản hồi API liên quan đến giỏ hàng (load, add, remove, update, clear, apply-discount)
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

// **CẤU TRÚC DỮ LIỆU TRẢ VỀ TỪ BACKEND CHO TẤT CẢ CÁC API GIỎ HÀNG**
// (load, add, remove, clear, update quantity, apply-discount)
// API apply-discount của bạn đã trả về đầy đủ như thế này.
type CartApiResponse = {
  message?: string; // Một số API có thể trả thêm message
  items: RawCartItem[];
  subtotal: number;
  discount: number; // Tên trường là 'discount' (quan trọng!)
  total: number;
  deliveryFee: number;
  taxRate: number; // Đảm bảo trường này có trong API của bạn hoặc thêm default
  promoCode?: string | null; // Mã khuyến mãi đã áp dụng (nếu có)
  // Các trường khác như _id, userId, createdAt, updatedAt, __v (nếu có)
};


type CartState = {
  items: CartItem[];
  delivery: number;
  taxRate: number;
  subtotal: number;
  discountAmount: number; // Số tiền giảm giá (frontend representation)
  total: number; // Tổng cuối cùng
  appliedPromotionCode: string | null; // Mã khuyến mãi đã áp dụng thành công
  loading: boolean;
  error: string | null;
  // Thêm các trạng thái loading cụ thể cho từng hành động nếu cần UI chi tiết hơn
  // isUpdatingQuantity: boolean;
  // isApplyingDiscount: boolean;
  storeId: string | '686cbb78985742f661838493'; // ✅ Thêm storeId vào CartState
};

const initialState: CartState = {
  items: [],
  delivery: 10000, // Giá trị mặc định ban đầu, sẽ được cập nhật từ backend
  taxRate: 0.0, // Giá trị mặc định ban đầu, sẽ được cập nhật từ backend
  subtotal: 0,
  discountAmount: 0,
  total: 0,
  appliedPromotionCode: null,
  loading: false,
  error: null,
  storeId:  '686cbb78985742f661838493'// ✅ Thêm storeId vào CartState
  // isUpdatingQuantity: false,
  // isApplyingDiscount: false,
};

// Hàm tiện ích để map RawCartItem[] từ backend sang CartItem[] cho frontend state
const mapRawCartItemsToCartItems = (rawItems: RawCartItem[]): CartItem[] => {
  if (!rawItems || !Array.isArray(rawItems)) {
    console.warn('Invalid rawItems provided for mapping:', rawItems);
    return []; // Trả về mảng rỗng nếu không phải là mảng hợp lệ
  }
  return rawItems.map(item => ({
    id: item._id,
    name: item.name,
    category: item.category || 'Unknown', // Cung cấp giá trị mặc định nếu category có thể null/undefined
    price: ensureNumber(item.unitPrice),
    quantity: ensureNumber(item.quantity),
    image: item.image,
    size: item.size,
    toppings: item.toppings ? item.toppings.map(t => t.name) : [],
  }));
};

// Hàm tiện ích CHUNG để cập nhật state sau MỌI API call GIỎ HÀNG thành công
// (load, add, remove, update quantity, clear, apply-discount)
const updateCartStateFromApiResponse = (state: CartState, payload: CartApiResponse) => {
  state.loading = false;
  state.items = mapRawCartItemsToCartItems(payload.items);
  state.subtotal = ensureNumber(payload.subtotal);
  // ✅ Lấy discount từ payload.discount (đây là tên trường từ API của bạn)
  state.discountAmount = ensureNumber(payload.discount); 
  state.total = ensureNumber(payload.total);
  state.delivery = ensureNumber(payload.deliveryFee, initialState.delivery); 
  state.taxRate = ensureNumber(payload.taxRate, initialState.taxRate); 

  // ✅ Cập nhật mã khuyến mãi: Nếu có promoCode từ API, sử dụng nó.
  // Nếu discount là 0, tức là không có mã nào được áp dụng hoặc đã bị hủy, thì reset promoCode.
  if (payload.promoCode) {
      state.appliedPromotionCode = payload.promoCode;
  } else if (payload.discount === 0) {
      state.appliedPromotionCode = null;
  }
  
  state.error = null;
};


// Async Thunks
// ==============

// ✅ Load cart từ API
export const loadCartFromAPI = createAsyncThunk<CartApiResponse, void, { state: RootState; rejectValue: string }>(
  'cart/loadCartFromAPI',
  async (_, thunkAPI) => {
    const token = thunkAPI.getState().auth.accessToken;
    try {
      const res = await axios.get('/cart', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to load cart');
    }
  }
);

// ✅ Thêm item vào cart (API POST /cart)
export const addItemToCart = createAsyncThunk<CartApiResponse, AddItemPayload, { state: RootState; rejectValue: string }>(
  'cart/addItemToCart',
  async (itemPayload, thunkAPI) => {
    const token = thunkAPI.getState().auth.accessToken;
    try {
      const res = await axios.post('/cart', itemPayload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.error || 'Failed to add item');
    }
  }
);

// ✅ Xoá item khỏi cart (API DELETE /cart/item/:itemId)
export const removeItemFromCart = createAsyncThunk<CartApiResponse, string, { state: RootState; rejectValue: string }>(
  'cart/removeItemFromCart',
  async (itemId, thunkAPI) => {
    const token = thunkAPI.getState().auth.accessToken;
    try {
      const res = await axios.delete(`/cart/item/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to remove item');
    }
  }
);

// ✅ Cập nhật số lượng item trong giỏ hàng (API PUT/PATCH /cart/item/:itemId)
export const updateCartItemQuantity = createAsyncThunk<CartApiResponse, UpdateItemQuantityPayload, { state: RootState; rejectValue: string }>(
    'cart/updateCartItemQuantity',
    async ({ itemId, quantity }, thunkAPI) => {
        const token = thunkAPI.getState().auth.accessToken;
        try {
            const res = await axios.put(`/cart/item/${itemId}`, { quantity }, { // Hoặc .patch nếu backend của bạn dùng PATCH
                headers: { Authorization: `Bearer ${token}` },
            });
            return res.data; // Backend trả về toàn bộ đối tượng giỏ hàng đã cập nhật
        } catch (err: any) {
            return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to update item quantity');
        }
    }
);

// ✅ Clear cart (API DELETE /cart)
export const clearCart = createAsyncThunk<CartApiResponse, void, { state: RootState; rejectValue: string }>(
  'cart/clearCart',
  async (_, thunkAPI) => {
    const token = thunkAPI.getState().auth.accessToken;
    try {
      const res = await axios.delete('/cart', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data; // Backend trả về toàn bộ đối tượng giỏ hàng đã cập nhật (có thể là rỗng)
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to clear cart');
    }
  }
);

// ✅ Apply discount (API POST /cart/apply-discount)
// Do backend của bạn trả về toàn bộ CartApiResponse, chúng ta sẽ cập nhật kiểu trả về.
export const applyDiscount = createAsyncThunk<CartApiResponse, { promotionCode: string }, { state: RootState; rejectValue: string }>(
  'cart/applyDiscount',
  async ({ promotionCode }, thunkAPI) => {
    const token = thunkAPI.getState().auth.accessToken;
    try {
      const res = await axios.post('/cart/apply-discount', { promotionCode: promotionCode }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data; // Backend trả về CartApiResponse đầy đủ
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.error || 'Không thể áp dụng mã giảm giá');
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Reducer này chỉ dùng để xóa cart cục bộ (cho các trường hợp reset nhanh UI)
    // KHÔNG thay thế clearCart thunk để đồng bộ với backend.
    clearLocalCart(state) {
      state.items = [];
      state.subtotal = 0;
      state.discountAmount = 0;
      state.total = 0;
      state.appliedPromotionCode = null;
      state.delivery = initialState.delivery; 
      state.taxRate = initialState.taxRate;
    },
    // Reducer này chỉ để xóa mã khuyến mãi khỏi state cục bộ (UI).
    // Nếu có API để hủy mã giảm giá, bạn nên tạo một thunk riêng và gọi nó.
    removeAppliedPromotionCode(state) { 
      state.appliedPromotionCode = null;
      state.discountAmount = 0;
      // Tính lại total mà không có giảm giá.
      state.total = ensureNumber(state.subtotal) + ensureNumber(state.delivery) + (ensureNumber(state.subtotal) * ensureNumber(state.taxRate));
      // Lưu ý: Nếu backend có API để "unapply" discount, bạn nên gọi nó ở đây (tạo thunk).
      // Và sau đó cập nhật lại toàn bộ giỏ hàng từ phản hồi backend.
      // VD: dispatch(unapplyDiscountThunk());
    },
  },
  extraReducers: (builder) => {
    builder
      // Xử lý khi tải giỏ hàng từ API thành công
      .addCase(loadCartFromAPI.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loadCartFromAPI.fulfilled, (state, action: PayloadAction<CartApiResponse>) => {
        // ✅ Sử dụng hàm cập nhật chung
        updateCartStateFromApiResponse(state, action.payload);
      })
      .addCase(loadCartFromAPI.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Failed to load cart'; })

      // Xử lý khi thêm item vào giỏ hàng thành công
      .addCase(addItemToCart.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(addItemToCart.fulfilled, (state, action: PayloadAction<CartApiResponse>) => {
        // ✅ Sử dụng hàm cập nhật chung
        updateCartStateFromApiResponse(state, action.payload);
      })
      .addCase(addItemToCart.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Failed to add item'; })

      // Xử lý khi xóa item khỏi cart thành công
      .addCase(removeItemFromCart.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(removeItemFromCart.fulfilled, (state, action: PayloadAction<CartApiResponse>) => {
        // ✅ Sử dụng hàm cập nhật chung
        updateCartStateFromApiResponse(state, action.payload);
      })
      .addCase(removeItemFromCart.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Failed to remove item'; })

      // Xử lý khi cập nhật số lượng item thành công
      .addCase(updateCartItemQuantity.pending, (state) => { 
        state.loading = true; 
        state.error = null; 
      })
      .addCase(updateCartItemQuantity.fulfilled, (state, action: PayloadAction<CartApiResponse>) => {
        // ✅ Sử dụng hàm cập nhật chung
        updateCartStateFromApiResponse(state, action.payload);
      })
      .addCase(updateCartItemQuantity.rejected, (state, action) => { 
        state.loading = false; 
        state.error = action.payload || 'Failed to update item quantity'; 
      })

      // Xử lý khi clear cart thành công
      .addCase(clearCart.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(clearCart.fulfilled, (state, action: PayloadAction<CartApiResponse>) => {
        // ✅ Sử dụng hàm cập nhật chung. Mặc dù cart rỗng, hàm này vẫn xử lý đúng.
        updateCartStateFromApiResponse(state, action.payload);
      })
      .addCase(clearCart.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Failed to clear cart'; })

      // Xử lý khi apply discount thành công
      .addCase(applyDiscount.pending, (state) => { 
        state.loading = true; 
        state.error = null; 
      })
      .addCase(applyDiscount.fulfilled, (state, action: PayloadAction<CartApiResponse>) => {
        // ✅ SỬ DỤNG HÀM UPDATE CHUNG NÀY!
        // Vì API apply-discount của bạn TRẢ VỀ TOÀN BỘ cấu trúc giỏ hàng,
        // chúng ta có thể tái sử dụng logic cập nhật.
        updateCartStateFromApiResponse(state, action.payload);
      })
      .addCase(applyDiscount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        // Khi lỗi áp dụng mã giảm giá, reset discount và mã promo code trong UI
        state.discountAmount = 0;
        state.appliedPromotionCode = null;
        // Tính lại total mà không có giảm giá
        state.total = ensureNumber(state.subtotal) + ensureNumber(state.delivery) + (ensureNumber(state.subtotal) * ensureNumber(state.taxRate));
      });
  },
});

// Export các actions cục bộ (reducers) và thunks
export const { clearLocalCart, removeAppliedPromotionCode } = cartSlice.actions;

export default cartSlice.reducer;