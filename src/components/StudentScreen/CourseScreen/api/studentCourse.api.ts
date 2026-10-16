  import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
  import { useAuthStore } from '@/components/LoginScreen/store/useAuthStore';
  import api from '@/providers/Interceptor.API';
  import { useAdminId } from '@/utils/getAdminId';
import axios from 'axios';

  // ───────── Types ─────────
  export type MyCourse = {
    admissionId: number;
    admissionNumber: string;
    certificateCollectedOrNot: number;
    studentName: string;
    courseId: number;
    courseName: string;
    courseCode: string | null;
    durationInMonths: string | null;
    dateOfAdmission: string | null;
    academicYear: number | null;
    branchName: string | null;
    batchId: number | null;
    subjects: { id: number; name: string }[];
  };

  export type TimelineEvent = {
    type: string; // ALLOCATED | TRANSFERRED | REALLOCATED | REMOVED | COMPLETED
    fromBatchName?: string | null;
    toBatchName?: string | null;
    eventAt?: string | null;
    remarks?: string | null;
    durationDays?: number | null;
  };

  export type AttendanceItem = {
    sessionId?: number | string;
    date: string;
    status: 'PRESENT' | 'ABSENT' | string;
    topic?: string | null;
    description?: string | null;
    staffName?: string | null;
  };

  export type TimelineSubject = {
    subjectId: number;
    subjectName: string;
    batchName?: string | null;
    batchStartDate?: string | null;
    batchEndDate?: string | null;
    batchTimings?: string | null;
    staffName?: string | null;
    status: string;
    firstJoinedAt?: string | null;
    batchId?:string,
    completedAt?: string | null;
    events?: TimelineEvent[];
      attendance?: AttendanceItem[]; // latest 6, newest first
  totalSessions?: number;
  presentCount?: number;
  absentCount?: number;
  attendancePercentage?: number;
  };

  const unwrap = <T,>(res: any): T => (res?.data?.data ?? res?.data ) as T;

export function useMyCourses() {
  console.log('CHECK COURSE DATA');

  const uid = useAdminId();

  console.log('UID:', uid);

  return useQuery({
    queryKey: ['student', 'courses', uid],
    enabled: !!uid,
    staleTime: 5 * 60_000,

    queryFn: async () => {
      try {
        const body = await api.get('student/courses/getMyCourses');

        console.log('FULL RESPONSE:', body);

        const res = body?.data?.data ?? body?.data;

        console.log('API DATA:', res);

        return res?.courses ?? [];
      } catch (error: any) {
        console.log('========== GET MY COURSES ERROR ==========');

        console.log('ERROR:', error);

        console.log('MESSAGE:', error?.message);

        console.log('STATUS:', error?.response?.status);

        console.log('RESPONSE DATA:', error?.response?.data);

        console.log('RESPONSE HEADERS:', error?.response?.headers);

        console.log('REQUEST URL:', error?.config?.url);

        console.log('REQUEST METHOD:', error?.config?.method);

        console.log('==========================================');

        // Let React Query know the request failed
        throw error;
      }
    },
  });
}

  export function useCourseTimeline(admissionId?: number | null) {
    const uid = useAdminId()
    return useQuery({
      queryKey: ['student', 'timeline', admissionId],
      enabled: !!admissionId,
      staleTime: 60_000,
      queryFn: async () => {
      console.log(admissionId)
        const body = unwrap<{ course: MyCourse; subjects: TimelineSubject[] }>(
          await api.get(`student/courses/getCourseDetail/${admissionId}`),
        );
        return body.subjects ?? [];
      },
    });
  }
export type AttendanceFilters = { from?: string; to?: string; search?: string };

export type BatchAttendancePage = {
  items: AttendanceItem[];
  page: number;
  hasMore: boolean;
  total: number;
  present: number;
  percentage: number;
};

const PAGE_SIZE = 20;

export const useBatchAttendance = (
  batchId: number | null | undefined,
  filters: AttendanceFilters,
  enabled = true
) =>
  useInfiniteQuery({
    queryKey: ['batchAttendance', batchId, filters],
    enabled: enabled && !!batchId,
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const res = await api.get(`student/courses/getBatchAttendance/${batchId}`, {
        params: { ...filters, page: pageParam, limit: PAGE_SIZE },
      });
      console.log(res)
      return unwrap<BatchAttendancePage>(res);
    },
    getNextPageParam: (last) => (last.hasMore ? last.page + 1 : undefined),
  });