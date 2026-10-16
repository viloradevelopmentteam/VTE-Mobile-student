import { create } from 'zustand';
import {  StaffAuth, StudentAuth } from '../types/login.types';
import { MeResponse } from '@/providers/api/me.api';

export type AuthUser = {
  id: string;
  adminId: string | null;
  staffId: number | null;

  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;

  gender: string | null;
  designation: string | null;
  qualification: string | null;
  photoName: string | null;
  userName: string | null;
  staffCode: string | null;

  branchId: string | null;
  branchName: string | null;
  branchCode: string | null;
  branchAddress: string | null;
  branchPhoneNumber: string | null;
  branchIsActive: number | null;
  city: string | null;

  staffTimings: unknown;
};


type AuthState = {
  user: MeResponse | null;

  setUser: (user: MeResponse | null) => void;
  clearUser: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,

  setUser: (user) => set({ user }),

  clearUser: () => set({ user: null }),
}));


