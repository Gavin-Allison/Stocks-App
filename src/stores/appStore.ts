import { create } from 'zustand';
import { createMainSlice } from './slices/mainSlice';
import type { mainSlice } from './slices/mainSlice';

interface AppState extends mainSlice {}

export const useAppStore = create<AppState>()((...a) => ({
  ...createMainSlice(...a),
}));