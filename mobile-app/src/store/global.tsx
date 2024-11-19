import { create } from 'zustand';
import { loginState, loginSlice } from './store';

type storeType = loginState;

export const useGlobalStore = create<storeType>((...a) => ({
  ...loginSlice(...a),
}));
