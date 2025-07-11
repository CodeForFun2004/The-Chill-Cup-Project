import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type {  AppDispatch } from './store';
import type { RootState } from './rootReducer'
// Dùng cho dispatch (có type AppDispatch)
export const useAppDispatch = () => useDispatch<AppDispatch>();

// Dùng cho selector (có type RootState)
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
