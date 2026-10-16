export type Surface = 'student' | 'staff';
export function getSurface(roleName: string | null): 'student' | 'staff' {
  return roleName?.toUpperCase() === 'STUDENT' ? 'student' : 'staff';
}