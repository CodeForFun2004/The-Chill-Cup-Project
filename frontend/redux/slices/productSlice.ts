import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from '../../api/axios';
import { RootState } from '../rootReducer';
import { Product, GroupedProduct } from '../../types/types';
import { groupProductsByCategory } from '../../utils/groupProducts';

interface ProductState {
  products: Product[];
  groupedProducts: GroupedProduct[];
  loading: boolean;
  error: string | null;
}

const initialState: ProductState = {
  products: [],
  groupedProducts: [],
  loading: false,
  error: null,
};

export const loadProducts = createAsyncThunk<Product[], void, { state: RootState }>(
  'product/loadProducts',
  async (_, thunkAPI) => {
    try {
      const response = await axios.get('/products');
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to load products');
    }
  }
);

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    // Không cần setGroupedProducts nữa nếu tự động group trong fulfilled
    // Nhưng nếu muốn để dùng ngoài UI thì có thể giữ lại:
    setGroupedProducts(state, action: PayloadAction<GroupedProduct[]>) {
      state.groupedProducts = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadProducts.fulfilled, (state, action: PayloadAction<Product[]>) => {
        state.loading = false;
        state.products = action.payload;
        console.log('💥 Products loaded:', action.payload);
        state.groupedProducts = groupProductsByCategory(action.payload);
        console.log('💥 Grouped products:', state.groupedProducts);
      })
      .addCase(loadProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to load products';
      });
  },
});

export const { setGroupedProducts } = productSlice.actions; // 💥 export action nếu muốn dispatch thủ công ngoài UI

export default productSlice.reducer;
