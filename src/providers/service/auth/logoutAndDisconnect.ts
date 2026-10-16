import { router } from 'expo-router';

import { clearTokens } from './tokenStore';
import { useAuthStore } from '@/components/LoginScreen/store/useAuthStore';
import { roleAuthStore } from '@/components/LoginScreen/store/useRoleAuthStore';
import { useSessionStore } from '@/providers/store/useSessionStore';
import { usePermissionStore } from '@/providers/store/usePermissionStore';
import { socketService } from '@/providers/socket/socketClient';
import { queryClient } from '../querClient.helper';

export async function logoutAndDisconnect() {
  try {
    socketService.disconnect();
  } catch (error) {
    console.warn('Socket disconnect failed:', error);
  }

  try {
    useAuthStore.getState().clearUser();

    roleAuthStore.getState().setRole(null);
    roleAuthStore.getState().setBranchId(null);
    roleAuthStore.getState().setActiveBranch(null);
    roleAuthStore.getState().setIsBranchScoped(true);

    usePermissionStore.getState().reset();

    queryClient.removeQueries({
      queryKey: ['me'],
    });

    useSessionStore.getState().setHasToken(false);
  } catch (error) {
    console.warn('Store cleanup failed:', error);
  }

  try {
    await clearTokens();
  } catch (error) {
    console.warn('Token cleanup failed:', error);
  }

  router.replace('/login');
}
