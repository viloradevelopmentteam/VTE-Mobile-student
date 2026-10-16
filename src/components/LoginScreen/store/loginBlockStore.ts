import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoginBlockCode } from '../types/loginErrors';


const COOLDOWN_KEY = 'login_cooldown_until';
let intervalId: ReturnType<typeof setInterval> | null = null;

type LoginBlockState = {
  blockCode: LoginBlockCode | null;
  retryAfter: number;
  setBlock: (code: LoginBlockCode, retryAfter?: number) => void;
  clearBlock: () => void;
  startCoolDown: (seconds: number) => void;
  restoreCoolDown: () => Promise<void>;
};

export const useLoginBlockStore = create<LoginBlockState>((set, get) => ({
  blockCode: null,
  retryAfter: 0,

  setBlock: (code, retryAfter) => {
    set({ blockCode: code, retryAfter: retryAfter ?? 0 });
    if (code === 'RATE_LIMIT' && retryAfter) {
      get().startCoolDown(retryAfter);
    }
  },

  clearBlock: () => {
    if (intervalId) clearInterval(intervalId);
    AsyncStorage.removeItem(COOLDOWN_KEY).catch(() => {});
    set({ blockCode: null, retryAfter: 0 });
  },

  startCoolDown: (seconds) => {
    if (intervalId) clearInterval(intervalId);
    const until = Date.now() + seconds * 1000;
    AsyncStorage.setItem(COOLDOWN_KEY, String(until)).catch(() => {});

    intervalId = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((until - Date.now()) / 1000));
      if (remaining <= 0) {
        if (intervalId) clearInterval(intervalId);
        AsyncStorage.removeItem(COOLDOWN_KEY).catch(() => {});
        set({ blockCode: null, retryAfter: 0 });
      } else {
        set({ retryAfter: remaining });
      }
    }, 1000);
  },

  restoreCoolDown: async () => {
    const stored = await AsyncStorage.getItem(COOLDOWN_KEY);
    if (!stored) return;
    const until = Number(stored);
    const remaining = Math.max(0, Math.ceil((until - Date.now()) / 1000));
    if (remaining > 0) {
      set({ blockCode: 'RATE_LIMIT', retryAfter: remaining });
      get().startCoolDown(remaining);
    } else {
      AsyncStorage.removeItem(COOLDOWN_KEY).catch(() => {});
    }
  },
}));