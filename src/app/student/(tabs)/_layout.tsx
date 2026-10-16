import { AppHeader } from '@/components/Header/AppHeader';
import { SurfaceGuard } from '@/components/SafeGuard';
import { StudentTabs } from '@/components/StudentScreen/Tab/StudentTabs';

export default function StudentTabsLayout() {
  return (
    <SurfaceGuard surface="student">
      <AppHeader />
      <StudentTabs />
    </SurfaceGuard>
  );
}
