import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMyCourses } from '../api/studentCourse.api';

type State = {
  activeAdmissionId: number | null;
  setActive: (id: number) => void;
};

export const useActiveCourseStore = create<State>()(
  persist(
    (set) => ({
      activeAdmissionId: null,
      setActive: (id) => set({ activeAdmissionId: id }),
    }),
    { name: 'active-course', storage: createJSONStorage(() => AsyncStorage) },
  ),
);


export function useActiveCourse() {
  const query = useMyCourses();
  const courses = query.data ?? [];
  const activeId = useActiveCourseStore((s) => s.activeAdmissionId);
  const setActive = useActiveCourseStore((s) => s.setActive);
  const active = courses.find((c) => c.admissionId === activeId) ?? courses[0] ?? null;
  return { ...query, courses, active, setActive };
}