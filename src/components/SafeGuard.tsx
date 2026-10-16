// components/SurfaceGuard.tsx
import type { ReactNode } from 'react';
import { Href, Redirect } from 'expo-router';
import { usePermissionStore } from '@/providers/store/usePermissionStore';
import { roleAuthStore } from '@/components/LoginScreen/store/useRoleAuthStore';
import { getSurface } from '@/utils/getSurface';

type Props = {
  surface: 'student' | 'staff';
  children: ReactNode;
};

export function SurfaceGuard({ surface, children }: Props) {
  const role = roleAuthStore((s) => s.role);
  const initializing = roleAuthStore((s) => s.initializing);

  const hydrated = usePermissionStore((s) => s.hydrated);

  if (initializing || !hydrated) {
    return null;
  }

  const actual = getSurface(role);

  if (actual !== surface) {
    return <Redirect href={'/unauthorized' as Href} />;
  }

  return <>{children}</>;
}