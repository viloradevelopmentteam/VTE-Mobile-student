import { create } from 'zustand';

type SessionState = {
  hasToken: boolean;
  splashFinished: boolean;
  setHasToken: (value: boolean) => void;
  setSplashFinished: (value: boolean) => void;
};
export const useSessionStore = create<SessionState>((set) => ({
  hasToken: false,
  splashFinished: false,

  setHasToken: (value) =>
    set({ hasToken: value }),

  setSplashFinished: (value) =>
    set({ splashFinished: value }),
}));
