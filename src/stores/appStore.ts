import { create } from 'zustand';
import { createMainSlice } from './slices/mainSlice';
import { createTransactionSlice } from './slices/transactionSlice';
import type { mainSlice } from './slices/mainSlice';
import type { transactionSlice } from './slices/transactionSlice';

interface AppState extends mainSlice, transactionSlice {}

export const useAppStore = create<AppState>()((...a) => ({
  ...createMainSlice(...a),
  ...createTransactionSlice(...a),
}));