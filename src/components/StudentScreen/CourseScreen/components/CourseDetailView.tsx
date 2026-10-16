import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Building2, CalendarDays, Hash } from 'lucide-react-native';
import SubjectTimelineCard from '../Model/SubjectTimelineCard';
import { useCourseTimeline, useMyCourses } from '../api/studentCourse.api';
import { formatDate } from '@/utils/formater';

export default function CourseDetailView({ admissionId }: { admissionId: number }) {
  const insets = useSafeAreaInsets();
  const courses = useMyCourses();
  const timeline = useCourseTimeline(admissionId);
  const course = courses.data?.find((c) => c.admissionId === admissionId);

  const refreshing = courses.isRefetching || timeline.isRefetching;
  const onRefresh = () => Promise.all([courses.refetch(), timeline.refetch()]);
  const subjects = timeline.data ?? [];

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24 }}
    >
      {course && (
        <View className="bg-primary rounded-3xl p-5 mb-5">
          <Text className="text-[10px] font-bold uppercase tracking-[2px] text-white">
            Course
          </Text>
          <Text className="text-xl font-bold text-white mt-1">{course.courseName}</Text>

          <View className="flex-row flex-wrap gap-x-4 gap-y-1.5 mt-3">
            <View className="flex-row items-center gap-1.5">
              <Hash size={13} color="#ffffff" />
              <Text className="text-xs text-white ">{course.admissionNumber}</Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <CalendarDays size={13} color="#ffffff" />
              <Text className="text-xs text-white ">
                Admitted {formatDate(course.dateOfAdmission)}
              </Text>
            </View>
            {course.branchName ? (
              <View className="flex-row items-center gap-1.5"> 
                <Building2 size={13} color="#ffffff" />
                <Text className="text-xs text-white">{course.branchName}</Text>
              </View>
            ) : null}
          </View>
        </View>
      )}

      <Text className="text-sm font-semibold text-neutral-700 mb-3 ml-1">
        Subjects{subjects.length ? ` (${subjects.length})` : ''}
      </Text>

      {timeline.isLoading ? (
        <View className="py-16 items-center">
          <ActivityIndicator />
        </View>
      ) : timeline.isError ? (
        <View className="py-12 items-center">
          <Text className="text-neutral-500 mb-3">Couldn't load the course timeline</Text>
          <Pressable
            onPress={() => timeline.refetch()}
            className="px-4 py-2 rounded-lg bg-indigo-600 active:opacity-80"
          >
            <Text className="text-white font-semibold text-sm">Retry</Text>
          </Pressable>
        </View>
      ) : subjects.length === 0 ? (
        <View className="py-12 items-center">
          <Text className="text-neutral-400">No subjects mapped for this course yet.</Text>
        </View>
      ) : (
        subjects.map((s) => <SubjectTimelineCard key={s.subjectId} subject={s} />)
      )}
    </ScrollView>
  );
}