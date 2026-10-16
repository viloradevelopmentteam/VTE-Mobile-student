import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, type Href } from 'expo-router';
import {
  ArrowRight,
  BookOpen,
  Building2,
  CalendarX2,
  Hash,
  Repeat,
  MessageSquareWarning,
  User as UserIcon,
} from 'lucide-react-native';

import { useAuthStore } from '@/components/LoginScreen/store/useAuthStore';
import { useActiveCourse } from '@/components/StudentScreen/CourseScreen/hooks/useActiveCourse';
import { useCourseTimeline } from '@/components/StudentScreen/CourseScreen/api/studentCourse.api';
import { formatDate } from '@/utils/formater';
import CourseSwitcherSheet from '@/components/StudentScreen/CourseScreen/components/CourseSwitcherSheet';

const BRAND = '#bb1f2d'; // the single VILORA TECH red — matches AppHeader

function Stat({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <View className="flex-1 bg-white rounded-2xl border border-neutral-200 p-3.5">
      <Text className="text-[10px] uppercase tracking-wide text-neutral-400 font-medium">
        {label}
      </Text>
      <Text
        className={`mt-1 ${muted ? 'text-sm font-semibold text-neutral-400' : 'text-lg font-bold text-neutral-900'}`}
      >
        {value}
      </Text>
    </View>
  );
}


export default function StudentHomeScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const { courses, active, setActive, isLoading, isError, refetch, isRefetching } =
    useActiveCourse();
  const timeline = useCourseTimeline(active?.admissionId);
  const [sheetOpen, setSheetOpen] = useState(false);
const { attendancePct, recent, hasAnyAttendance } = useMemo(() => {
  const subjects = timeline.data ?? [];

  let total = 0;
  let present = 0;
  const sessionMap = new Map<number, any>();

  subjects.forEach((subject: any) => {
    total += subject.totalSessions ?? 0;
    present += subject.presentCount ?? 0;
    (subject.attendance ?? []).forEach((a: any) => {
      if (a.sessionId && !sessionMap.has(a.sessionId)) sessionMap.set(a.sessionId, a);
    });
  });

  const recentClasses = Array.from(sessionMap.values())
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5); 

  return {
    attendancePct: total ? `${Math.round((present / total) * 100)}%` : 'No data',
    recent: recentClasses,
    hasAnyAttendance: total > 0,
  };
}, [timeline.data]);
  const openCourse = () =>
    active &&
    router.push({
      pathname: '/student/course/[admissionId]',
      params: { admissionId: String(active.admissionId) },
    } as unknown as Href);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-50">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-neutral-50">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => {
              refetch();
              timeline.refetch();
            }}
          />
        }
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: insets.bottom + 24,
        }}
      >
        {isError || !active ? (
          <View className="bg-white rounded-2xl border border-neutral-200 p-6 items-center">
            <Text className="text-neutral-500 text-center">
              {isError ? "Couldn't load your courses." : 'No courses found for your number.'}
            </Text>
            <Pressable
              onPress={() => refetch()}
              className="mt-3 px-4 py-2 rounded-lg active:opacity-80"
              style={{ backgroundColor: BRAND }}
            >
              <Text className="text-white font-semibold text-sm">Retry</Text>
            </Pressable>
          </View>
        ) : (
          <>

            <View className="rounded-3xl p-5" style={{ backgroundColor: BRAND }}>
              <View className="flex-row items-start justify-between">
                <Text className="text-[10px] font-bold uppercase tracking-[2px] text-white/80 mt-1">
                  Current course
                </Text>
                {courses.length > 1 && (
                  <Pressable
                    onPress={() => setSheetOpen(true)}
                    hitSlop={8}
                    className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 active:opacity-70"
                  >
                    <Repeat size={13} color="#ffffff" />
                    <Text className="text-xs font-semibold text-white">Switch</Text>
                  </Pressable>
                )}
              </View>

              <Text className="text-xl font-bold text-white mt-2">{active.courseName}</Text>

              <View className="flex-row flex-wrap gap-x-4 gap-y-1.5 mt-3">
                <View className="flex-row items-center gap-1.5">
                  <Hash size={13} color="#ffffff" />
                  <Text className="text-xs text-white/80">{active.admissionNumber}</Text>
                </View>
                {active.branchName ? (
                  <View className="flex-row items-center gap-1.5">
                    <Building2 size={13} color="#ffffff" />
                    <Text className="text-xs text-white/80">{active.branchName}</Text>
                  </View>
                ) : null}
              </View>

              <Pressable
                onPress={openCourse}
                className="mt-4 flex-row items-center justify-center gap-2 py-3 rounded-xl bg-white active:opacity-90"
              >
                <Text className="text-sm font-bold text-neutral-900">View course timeline</Text>
                <ArrowRight size={16} color={BRAND} />
              </Pressable>
            </View>

            <View className="flex-row gap-3 mt-4">
              <Stat label="Subjects" value={String(active.subjects.length)} />
              <Stat
                label="Attendance"
                value={attendancePct}
                muted={attendancePct === 'No data'}
              />
              <Stat
                label="Duration"
                value={active.durationInMonths ? `${active.durationInMonths} mo` : '—'}
              />
            </View>

            <Text className="text-sm font-semibold text-neutral-700 mt-6 mb-2 ml-1">
              Quick actions
            </Text>
            <View className="flex-row flex-wrap gap-3">
        
        

            </View>


            {hasAnyAttendance && (
              <>
                <Text className="text-sm font-semibold text-neutral-700 mt-6 mb-2 ml-1">
                  Recent classes
                </Text>
                {timeline.isLoading ? (
                  <ActivityIndicator className="my-6" />
                ) : (
                  <View className="bg-white rounded-2xl border border-neutral-200 px-4">
                    {recent.map((r, i) => (
                      <View
                        key={r.sessionId ?? i}
                        className={`py-3.5 ${i < recent.length - 1 ? 'border-b border-neutral-100' : ''}`}
                      >
                        <View className="flex-row items-center justify-between">
                          <Text className="text-[13px] font-semibold text-neutral-900 flex-1 pr-2">
                            {r.topic}
                          </Text>
                          <Text
                            className={`text-[10px] font-semibold ${
                              r.status === 'PRESENT' ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                          >
                            {r.status}
                          </Text>
                        </View>
                        <Text className="text-[11px] text-neutral-400 mt-0.5">
                          {formatDate(r.date)}
                        </Text>
                        {r.description ? (
                          <Text numberOfLines={2} className="text-[11px] text-neutral-400 mt-1">
                            {r.description}
                          </Text>
                        ) : null}
                      </View>
                    ))}
                  </View>
                )}
              </>
            )}

            {!hasAnyAttendance && !timeline.isLoading && (
              <View className="mt-6 items-center py-10 rounded-2xl border border-dashed border-neutral-200 bg-white">
                <View className="w-11 h-11 rounded-full bg-neutral-100 items-center justify-center mb-2.5">
                  <CalendarX2 size={20} color="#9CA3AF" />
                </View>
                <Text className="text-sm font-medium text-neutral-600">
                  No attendance recorded yet
                </Text>
                <Text className="text-xs text-neutral-400 mt-1 px-8 text-center">
                  Your classes will show up here once attendance starts being taken.
                </Text>
              </View>
            )}

           
          </>
        )}
      </ScrollView>

      <CourseSwitcherSheet
        visible={sheetOpen}
        courses={courses}
        activeId={active?.admissionId}
        onSelect={setActive}
        onClose={() => setSheetOpen(false)}
      />
    </View>
  );
}
