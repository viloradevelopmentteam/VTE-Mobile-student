import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, type Href } from 'expo-router';
import { BookOpen, ChevronRight, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react-native';
import { useActiveCourse } from '@/components/StudentScreen/CourseScreen/hooks/useActiveCourse';
import CourseDetailView from '@/components/StudentScreen/CourseScreen/components/CourseDetailView';
import { formatDate } from '@/utils/formater';

const getSubjectStatusStyle = (status: string) => {
  switch (status) {
    case 'COMPLETED':
      return {
        bg: 'bg-emerald-50 border-emerald-200',
        text: 'text-emerald-700',
        icon: <CheckCircle2 size={12} color="#047857" />,
      };
    case 'IN_PROGRESS':
      return {
        bg: 'bg-amber-50 border-amber-200',
        text: 'text-amber-700',
        icon: <Clock size={12} color="#B45309" />,
      };
    case 'IN_COMPLETED':
    case 'DROPPED':
      return {
        bg: 'bg-rose-50 border-rose-200',
        text: 'text-rose-700',
        icon: <XCircle size={12} color="#BE123C" />,
      };
    case 'ALLOCATED':
    case 'NOT_ALLOCATED':
    default:
      return {
        bg: 'bg-slate-100 border-slate-200',
        text: 'text-slate-600',
        icon: <AlertCircle size={12} color="#475569" />,
      };
  }
};

export default function CoursesScreen() {
  const insets = useSafeAreaInsets();
  const { courses, active, isLoading, isError, refetch, isRefetching } = useActiveCourse();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator color="#4F46E5" size="large" />
      </View>
    );
  }

  if (isError || courses.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-6">
        <Text className="text-slate-500 text-center">
          {isError ? "Couldn't load your courses." : 'No courses found for your number.'}
        </Text>
        <Pressable
          onPress={() => refetch()}
          className="mt-3 px-5 py-2.5 rounded-xl bg-red-600 active:opacity-80"
        >
          <Text className="text-white font-semibold text-sm">Retry</Text>
        </Pressable>
      </View>
    );
  }

  if (courses.length === 1) {
    return (
      <View className="flex-1 bg-slate-50" style={{ paddingTop: insets.top }}>
        <CourseDetailView admissionId={courses[0].admissionId} />
      </View>
    );
  }

  const showNames = new Set(courses.map((c) => c.studentName)).size > 1;

  return (
    <View className="flex-1 bg-slate-50">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => refetch()}
            tintColor="#4F46E5"
          />
        }
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom + 24,
        }}
      >
        <Text className="text-2xl font-bold text-slate-900">My Courses</Text>
        <Text className="text-sm text-slate-500 mt-0.5 mb-4">
          You are enrolled in {courses.length} courses
        </Text>

        <View className="bg-white rounded-xl border border-slate-200/80 p-3 mb-5 shadow-sm shadow-slate-100">
          <Text className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Subject Status Guide
          </Text>
          <View className="flex-row flex-wrap gap-2">
            <View className="flex-row items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200">
              <CheckCircle2 size={10} color="#047857" />
              <Text className="text-[10px] font-medium text-emerald-700">Completed</Text>
            </View>
            <View className="flex-row items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200">
              <Clock size={10} color="#B45309" />
              <Text className="text-[10px] font-medium text-amber-700">In Progress</Text>
            </View>
            <View className="flex-row items-center gap-1.5 px-2 py-0.5 rounded-md bg-rose-50 border border-rose-200">
              <XCircle size={10} color="#BE123C" />
              <Text className="text-[10px] font-medium text-rose-700">Incomplete</Text>
            </View>
            <View className="flex-row items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200">
              <AlertCircle size={10} color="#475569" />
              <Text className="text-[10px] font-medium text-slate-600">Pending</Text>
            </View>
          </View>
        </View>

        {courses.map((c) => {
          const isActive = c.admissionId === active?.admissionId;
          const certificateCollected = Number(c.certificateCollectedOrNot) === 1;

     const hasSubjects = (c.subjects?.length ?? 0) > 0;

  const isOngoing =
    hasSubjects &&
    c.subjects.some((s: any) => s.trackingStatus === 'IN_PROGRESS');

          const allSubjectsCompleted =
            c.subjects?.length > 0 &&
            c.subjects.every((s: any) => s.trackingStatus === 'COMPLETED');

          return (
            <Pressable
              key={c.admissionId}
              onPress={() =>
                router.push({
                  pathname: '/student/course/[admissionId]',
                  params: {
                    admissionId: String(c.admissionId),
                  },
                } as unknown as Href)
              }
              className="bg-white rounded-2xl border border-slate-200/80 p-4 mb-4 shadow-sm shadow-slate-200/50 active:opacity-90"
            >
      
              <View className="flex-row items-center gap-3">
                <View className="w-11 h-11 rounded-xl bg-red-50 items-center justify-center">
                  <BookOpen size={20} color="#bb1f2d" />
                </View>

                <View className="flex-1">
                  <View className="flex-row items-center gap-2">
                    <Text
                      className="text-[15px] font-bold text-slate-900 flex-shrink"
                      numberOfLines={1}
                    >
                      {c.courseName}
                    </Text>

                   {isOngoing && (
  <View className="flex-row items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100">
    <View className="w-1.5 h-1.5 rounded-full bg-amber-600" />
    <Text className="text-[9px] font-bold text-amber-700">
      ONGOING
    </Text>
  </View>
)}
                  </View>

                  <Text
                    className="text-xs text-slate-500 mt-0.5"
                    numberOfLines={1}
                  >
                    {showNames ? `${c.studentName} · ` : ''}
                    #{c.admissionNumber} · {formatDate(c.dateOfAdmission)}
                  </Text>
                </View>

                <ChevronRight size={18} color="#94A3B8" />
              </View>

              {/* Certificate Status Badge (Renders ONLY if ALL subjects are COMPLETED) */}
              {allSubjectsCompleted && (
                <View className="mt-3">
                  <View
                    className={`self-start px-2.5 py-1 rounded-full border ${
                      certificateCollected
                        ? 'bg-emerald-50 border-emerald-200'
                        : 'bg-amber-50 border-amber-200'
                    }`}
                  >
                    <Text
                      className={`text-[11px] font-semibold ${
                        certificateCollected ? 'text-emerald-700' : 'text-amber-700'
                      }`}
                    >
                      {certificateCollected
                        ? 'Certificate Collected'
                        : 'Certificate Pending'}
                    </Text>
                  </View>
                </View>
              )}

              {/* Subject Tracking Chips */}
              <View className="mt-3.5 pt-3 border-t border-slate-100">
                <Text className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-2">
                  Subjects & Progress
                </Text>

                <View className="flex-row flex-wrap gap-1.5">
                  {c.subjects.slice(0, 4).map((s: any) => {
                    const statusConfig = getSubjectStatusStyle(s.trackingStatus);

                    return (
                      <View
                        key={s.id}
                        className={`flex-row items-center gap-1 px-2.5 py-1 rounded-lg border ${statusConfig.bg}`}
                      >
                        {statusConfig.icon}
                        <Text className={`text-[11px] font-medium ${statusConfig.text}`}>
                          {s.name}
                        </Text>
                      </View>
                    );
                  })}

                  {c.subjects.length > 4 && (
                    <View className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200">
                      <Text className="text-[11px] font-semibold text-slate-500">
                        +{c.subjects.length - 4} more
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
