import { create } from 'zustand';

type AvailableRole = {
  isPrimary: boolean;
  name: string;
  roleId: number;
};

type RoleState = {
  role: string | null;
  isBranchScoped: boolean;

  branchId: string | null;
  activeBranch: string | null;

  availableRoles: AvailableRole[];

  initializing: boolean;

  setRole: (role: string | null) => void;
  setIsBranchScoped: (value: boolean) => void;
  setBranchId: (id: string | null) => void;
  setActiveBranch: (id: string | null) => void;
  setAvailableRoles: (roles: AvailableRole[]) => void;
  setInitializing: (value: boolean) => void;

  reset: () => void;
};

export const roleAuthStore = create<RoleState>((set) => ({
  role: null,
  isBranchScoped: true,

  branchId: null,
  activeBranch: null,

  availableRoles: [],

  initializing: true,

  setRole: (role) => set({ role }),

  setIsBranchScoped: (value) =>
    set({ isBranchScoped: value }),

  setBranchId: (id) =>
    set({ branchId: id }),

  setActiveBranch: (id) =>
    set({ activeBranch: id }),

  setAvailableRoles: (roles) =>
    set({ availableRoles: roles }),

  setInitializing: (value) =>
    set({ initializing: value }),

  reset: () =>
    set({
      role: null,
      isBranchScoped: true,
      branchId: null,
      activeBranch: null,
      availableRoles: [],
      initializing: true,
    }),
}));
