import { useMutation } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

import { useAuthStore } from '../store/useAuthStore';
import { roleAuthStore } from '../store/useRoleAuthStore';
import { useSessionStore } from '@/providers/store/useSessionStore';
import { loginRequest } from '../auth.api';

export function useLoginMutation() {
  const setUser = useAuthStore((s) => s.setUser);
  const setRole = roleAuthStore((s) => s.setRole);
  const setBranchId = roleAuthStore((s) => s.setBranchId);
  const setActiveBranch = roleAuthStore((s) => s.setActiveBranch);
  const setIsBranchScoped = roleAuthStore((s) => s.setIsBranchScoped);
  const setHasToken = useSessionStore((s) => s.setHasToken);

  return useMutation({
    mutationFn: loginRequest,

    onSuccess: async ({ me }) => {
      // Staff accounts are rejected inside loginRequest (wrong-app check),
      // so only student accounts reach this point in the student app.
      if (me.userType !== 'STUDENT') {
        console.error('[LOGIN] Unexpected account type for this app:', me.userType);
        return;
      }

      await AsyncStorage.setItem('userId', String(me.userId));

      setUser(me);
      setRole('STUDENT');
      setIsBranchScoped(false); // students can belong to several branches
      setBranchId(null);
      setActiveBranch(null);

      setHasToken(true);
      router.replace('/student');
    },

    onError: (error) => {
      console.log('[LOGIN] Login error:', error);
    },
  });
}