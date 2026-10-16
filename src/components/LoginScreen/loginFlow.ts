import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

import { useAuthStore } from './store/useAuthStore';
import { roleAuthStore } from './store/useRoleAuthStore';
import { useSessionStore } from '@/providers/store/useSessionStore';
import { loginRequest, type LoginPayload } from './auth.api';

export async function signInStudent(payload: LoginPayload) {
  const { me } = await loginRequest(payload);

  if (me.userType !== 'STUDENT') {
    throw new Error('This account is not a student account.');
  }

  await AsyncStorage.setItem('userId', String(me.userId));

  useAuthStore.getState().setUser(me);

  const role = roleAuthStore.getState();
  role.setRole('STUDENT');
  role.setIsBranchScoped(false);
  role.setBranchId(null);
  role.setActiveBranch(null);

  useSessionStore.getState().setHasToken(true);
  router.replace('/student');
}