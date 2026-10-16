import { ActivityIndicator, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';

import CourseDetailView from '@/components/StudentScreen/CourseScreen/components/CourseDetailView';

export default function StudentCourseDetailScreen() {
  const { admissionId } = useLocalSearchParams<{
    admissionId: string;
  }>();

  const id = Number(admissionId);

  if (!admissionId || Number.isNaN(id)) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-50">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Course Timeline',
        }}
      />

      <CourseDetailView admissionId={id} />
    </>
  );
}