import { create } from 'zustand';
import { createMainSlice } from './slices/mainSlice';
import { createTransactionSlice } from './slices/transactionSlice';
import { createLedgerSlice } from './slices/ledgerSlice';
import type { mainSlice } from './slices/mainSlice';
import type { transactionSlice } from './slices/transactionSlice';
import type { ledgerSlice } from './slices/ledgerSlice';

interface AppState extends mainSlice, transactionSlice, ledgerSlice {}

/**
 * Global Zustand app store combining main, transaction, and ledger slices.
 */
export const useAppStore = create<AppState>()((...a) => ({
  ...createMainSlice(...a),
  ...createTransactionSlice(...a),
  ...createLedgerSlice(...a),
}));