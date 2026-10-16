import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BookOpen, Check } from 'lucide-react-native';
import type{ MyCourse } from '../api/studentCourse.api';

type Props = {
  visible: boolean;
  courses: MyCourse[];
  activeId?: number | null;
  onSelect: (admissionId: number) => void;
  onClose: () => void;
};

export default function CourseSwitcherSheet({ visible, courses, activeId, onSelect, onClose }: Props) {
  const insets = useSafeAreaInsets();
  console.log(courses)
  const showNames = new Set(courses.map((c) => c.studentName)).size > 1;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/40" onPress={onClose} />
      <View
        className="bg-white rounded-t-3xl px-4 pt-3"
        style={{ paddingBottom: insets.bottom + 16, maxHeight: '70%' }}
      >
        <View className="self-center w-10 h-1 rounded-full bg-neutral-200 mb-3" />
        <Text className="text-base font-semibold text-neutral-900 mb-1">Switch course</Text>
        <Text className="text-xs text-neutral-500 mb-3">
          Your number is registered for {courses.length} courses.
        </Text>

        <ScrollView showsVerticalScrollIndicator={false}>
          {courses.map((c) => {
            const selected = c.admissionId === activeId;
            return (
              <Pressable
                key={c.admissionId}
                onPress={() => {
                  onSelect(c.admissionId);
                  onClose();
                }}
                className={`flex-row items-center gap-3 p-3 mb-2 rounded-2xl border ${
                  selected ? 'border-primary ' : 'border-neutral-200 bg-white'
                } active:opacity-80`}
              >
                <View className="w-10 h-10 rounded-xl bg-[#bb1f2d]/10 items-center justify-center">
                  <BookOpen size={18} color="#bb1f2d" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-neutral-900" numberOfLines={1}>
                    {c.courseName}
                  </Text>
                <Text className="text-xs text-neutral-500 mt-0.5" numberOfLines={1}>
  {showNames ? `${c.studentName} · ` : ''}
  {c.admissionNumber}
</Text>

{c.branchName ? (
  <Text className="text-[11px] font-bold text-primary/80 mt-1" numberOfLines={1}>
    {c.branchName}
  </Text>
) : null}

                </View>
                {selected && <Check size={18} color="#bb1f2d" />}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </Modal>
  );
}