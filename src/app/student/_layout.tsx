import { SurfaceGuard } from '@/components/SafeGuard';
import { Stack } from 'expo-router';

export default function StudentLayout() {
  return (
    <SurfaceGuard surface="student">
      <Stack>
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="complaint"
          options={{
            title: 'Complaint',
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="course/[admissionId]"
          options={{
            title: 'Course',
            headerShown: true,
            headerBackTitle: 'Courses',
          }}
        />
      </Stack>
    </SurfaceGuard>
  );
}
