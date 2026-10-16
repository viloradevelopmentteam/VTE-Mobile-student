import { create } from 'zustand';
import { MeResponse } from '../api/me.api';
import { roleAuthStore } from '@/components/LoginScreen/store/useRoleAuthStore';

type PermissionMap = Record<string, string[]>;

type PermissionState = {
  globalPermissions: PermissionMap;
  branchPermissions: PermissionMap;

  hydrated: boolean;

  setFromMe: (me: MeResponse) => void;
  reset: () => void;

  hasModule: (module: string) => boolean;
  can: (module: string, action: string) => boolean;
};

const initialState = {
  globalPermissions: {},
  branchPermissions: {},

  hydrated: false,
};

export const usePermissionStore = create<PermissionState>(
  (set, get) => ({
    ...initialState,

    setFromMe: (me) =>
      set({
        globalPermissions: me.permissions?.global ?? {},
        branchPermissions: me.permissions?.branchMode ?? {},
        hydrated: true,
      }),

    reset: () =>
      set({
        ...initialState,
      }),

    hasModule: (module) => {
      const {
        globalPermissions,
        branchPermissions,
      } = get();

      const isBranchScoped =
        roleAuthStore.getState().isBranchScoped;

      const map = isBranchScoped
        ? branchPermissions
        : globalPermissions;

      return Boolean(map[module]?.length);
    },

    can: (module, action) => {
      const {
        globalPermissions,
        branchPermissions,
      } = get();

      const isBranchScoped =
        roleAuthStore.getState().isBranchScoped;

      const map = isBranchScoped
        ? branchPermissions
        : globalPermissions;

      return Boolean(
        map[module]?.includes(action)
      );
    },
  })
);