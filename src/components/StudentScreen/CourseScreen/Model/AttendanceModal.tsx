import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CalendarDays,
  Filter,
  Search,
  X,
} from 'lucide-react-native';
import DateTimePicker, {
  DateTimePickerAndroid,
} from '@react-native-community/datetimepicker';
import { formatDate } from '@/utils/formater';
import {
  useBatchAttendance,
  type AttendanceItem,
} from '../api/studentCourse.api';
import { formatDateISO } from '@/utils/FormattingDate';

type Props = {
  visible: boolean;
  onClose: () => void;
  subjectName: string;
  batchId: number;
};

type PickerTarget = 'from' | 'to' | null;

const PRESETS = [
  { label: 'All', days: 0 },
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
];

const toYMD = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;

function Row({ a }: { a: AttendanceItem }) {
  const isPresent = a.status === 'PRESENT';

  return (
    <View className="flex-row items-start justify-between gap-3 p-3 mb-1.5 rounded-xl bg-white border border-neutral-100">
      <View className="flex-1 flex-row items-start gap-2.5">
        <View
          className={`mt-1.5 w-1.5 h-1.5 rounded-full ${
            isPresent ? 'bg-emerald-400' : 'bg-rose-400'
          }`}
        />

        <View className="flex-1">
          <Text className="text-[12px] font-medium text-neutral-700">
            {formatDate(a.date)}
          </Text>

          <Text className="text-[12px] text-neutral-600 mt-0.5">
            {a.topic ?? 'No topic recorded'}
          </Text>

          {a.description ? (
            <Text className="text-[11px] text-neutral-400 mt-0.5 leading-4">
              {a.description}
            </Text>
          ) : null}
        </View>
      </View>

      <View
        className={`px-2 py-0.5 rounded-full ${
          isPresent ? 'bg-emerald-100' : 'bg-rose-100'
        }`}
      >
        <Text
          className={`text-[10px] font-semibold ${
            isPresent ? 'text-emerald-700' : 'text-rose-700'
          }`}
        >
          {a.status}
        </Text>
      </View>
    </View>
  );
}

export default function AttendanceModal({
  visible,
  onClose,
  subjectName,
  batchId,
}: Props) {
  const insets = useSafeAreaInsets();

  const [from, setFrom] = useState<Date | null>(null);
  const [to, setTo] = useState<Date | null>(null);

const [picker, setPicker] = useState<PickerTarget>(null);


  const [activePreset, setActivePreset] =
    useState<number>(0);

  const [searchText, setSearchText] =
    useState('');

  const [search, setSearch] =
    useState('');

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchText.trim());
    }, 400);

    return () => clearTimeout(t);
  }, [searchText]);

  const query = useBatchAttendance(
    batchId,
    {
      from: from ? toYMD(from) : undefined,
      to: to ? toYMD(to) : undefined,
      search: search || undefined,
    },
    visible
  );

  const pages = query.data?.pages ?? [];

  const sessions =
    pages.flatMap((p) => p.items);

  const summary = pages[0];

  const hasFilter =
    !!from ||
    !!to ||
    !!search;

  const loadMore = useCallback(() => {
    if (
      query.hasNextPage &&
      !query.isFetchingNextPage
    ) {
      query.fetchNextPage();
    }
  }, [
    query.hasNextPage,
    query.isFetchingNextPage,
    query.fetchNextPage,
  ]);

  const clearFilter = () => {
    setFrom(null);
    setTo(null);
    setSearchText('');
    setSearch('');
    setActivePreset(0);
  };

  const applyPreset = (days: number) => {
    setActivePreset(days);

    if (days === 0) {
      setFrom(null);
      setTo(null);
      return;
    }

    const end = new Date();
    const start = new Date();

    start.setDate(
      start.getDate() - days
    );

    setFrom(start);
    setTo(end);
  };
const today = () => {
  const d = new Date();

  return new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate()
  );
};

const openDatePicker = (target: 'from' | 'to') => {
  const currentDate =
    target === 'from'
      ? from ?? today()
      : to ?? today();

  if (Platform.OS === 'android') {
    DateTimePickerAndroid.open({
      value: currentDate,
      mode: 'date',
      display: 'default',
      maximumDate: today(),
      minimumDate:
        target === 'to'
          ? from ?? undefined
          : undefined,

      onValueChange: (_event, selectedDate) => {
        if (!selectedDate) return;

        setActivePreset(-1);

        if (target === 'from') {
          setFrom(selectedDate);

          if (
            to &&
            selectedDate.getTime() > to.getTime()
          ) {
            setTo(null);
          }
        } else {
          setTo(selectedDate);
        }
      },

      onDismiss: () => {},
    });

    return;
  }

  setPicker(target);
};


  const Header = (
    <View>
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-neutral-200 bg-white">
        <View className="flex-1 pr-3">
          <Text
            className="text-[15px] font-semibold text-neutral-900"
            numberOfLines={1}
          >
            {subjectName}
          </Text>

          <Text className="text-[11px] text-neutral-400 mt-0.5">
            Classes & Topics
          </Text>
        </View>

        <Pressable
          onPress={onClose}
          hitSlop={8}
          className="w-10 h-10 rounded-full bg-neutral-100 items-center justify-center"
        >
          <X
            size={19}
            color="#4B5563"
          />
        </Pressable>
      </View>

      <View className="px-4 pt-3 pb-2 bg-white border-b border-neutral-200">

        <View className="flex-row items-center gap-2 px-3 rounded-xl bg-neutral-50 border border-neutral-200 mb-2">
          <Search
            size={17}
            color="#9CA3AF"
          />

          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search by topic"
            placeholderTextColor="#9CA3AF"
            className="flex-1 py-4 text-xs text-neutral-800 placeholder:text-[12px]"
            returnKeyType="search"
          />

          {searchText ? (
            <Pressable
              onPress={() =>
                setSearchText('')
              }
              hitSlop={8}
            >
              <X
                size={14}
                color="#9CA3AF"
              />
            </Pressable>
          ) : null}
        </View>

        <View className="flex-row gap-2">

          <Pressable
            onPress={() => {
              console.log('FROM CLICK');
              openDatePicker('from');
            }}
            className="flex-1 flex-row items-center gap-1.5 px-3 py-4 rounded-xl bg-neutral-50 border border-neutral-200"
          >
            <CalendarDays
              size={17}
              color="#6B7280"
            />

            <Text
              className="text-md text-neutral-600 flex-1"
              numberOfLines={1}
            >
              {from
                ? formatDate(
                    from.toISOString()
                  )
                : 'From'}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              openDatePicker('to');
            }}
            className="flex-1 flex-row items-center gap-1.5 px-3 py-4 rounded-xl bg-neutral-50 border border-neutral-200"
          >
            <CalendarDays
              size={17}
              color="#6B7280"
            />

            <Text
              className="text-md text-neutral-600 flex-1"
              numberOfLines={1}
            >
              {to
                ? formatDate(
                    to.toISOString()
                  )
                : 'To'}
            </Text>
          </Pressable>

          {hasFilter && (
            <Pressable
              onPress={clearFilter}
              hitSlop={8}
              className="px-3 py-2 rounded-xl bg-rose-50 items-center justify-center"
            >
              <Text className="text-xs font-semibold text-rose-600">
                Clear
              </Text>
            </Pressable>
          )}
        </View>

        <View className="flex-row flex-wrap gap-2 mt-2">
          {PRESETS.map((p) => {
            const active =
              activePreset === p.days;

            return (
              <Pressable
                key={p.days}
                onPress={() =>
                  applyPreset(p.days)
                }
                className={`px-3 py-1.5 rounded-full ${
                  active
                    ? 'bg-red-600'
                    : 'bg-red-50'
                }`}
              >
                <Text
                  className={`text-[11px] font-medium ${
                    active
                      ? 'text-white'
                      : 'text-red-600'
                  }`}
                >
                  {p.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* SUMMARY */}
      {summary &&
        summary.total > 0 && (
          <View className="px-4 py-3 bg-white border-b border-neutral-200 flex-row items-center justify-between">
            <Text className="text-[11px] text-neutral-500">
              {summary.total}{' '}
              {summary.total === 1
                ? 'class'
                : 'classes'}
              {hasFilter
                ? ' matched'
                : ' total'}
            </Text>

            <Text className="text-[11px] font-semibold text-neutral-700">
              {summary.present}/
              {summary.total} present ·{' '}
              {summary.percentage}%
            </Text>
          </View>
        )}
    </View>
  );

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        onRequestClose={onClose}
      >
        <View
          className="flex-1 bg-neutral-50"
          style={{
            paddingTop: insets.top,
          }}
        >
          {Header}

          <FlatList
            data={sessions}
            keyExtractor={(a, i) =>
              `${a.sessionId ?? 'x'}-${i}`
            }
            renderItem={({ item }) => (
              <Row a={item} />
            )}
            contentContainerStyle={{
              padding: 16,
              paddingBottom:
                insets.bottom + 24,
              flexGrow: 1,
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onEndReached={loadMore}
            onEndReachedThreshold={0.4}
            initialNumToRender={12}
            windowSize={7}
            ListEmptyComponent={
              query.isLoading ? (
                <ActivityIndicator className="my-10" />
              ) : (
                <View className="items-center py-16">
                  <Filter
                    size={22}
                    color="#D1D5DB"
                  />

                  <Text className="text-sm text-neutral-400 mt-2">
                    {hasFilter
                      ? 'No classes match your filters'
                      : 'No classes recorded yet'}
                  </Text>
                </View>
              )
            }
            ListFooterComponent={
              query.isFetchingNextPage ? (
                <ActivityIndicator className="my-4" />
              ) : null
            }
          />

      {Platform.OS === 'ios' && picker !== null && visible && (
        <View
          style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            justifyContent: 'flex-end', zIndex: 9999,
          }}
        >
          <Pressable style={{ flex: 1 }} onPress={() => setPicker(null)} />
          <View style={{
            backgroundColor: '#fff', borderTopLeftRadius: 22, borderTopRightRadius: 22,
            paddingBottom: insets.bottom + 12,
          }}>
            <View style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
              paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8,
            }}>
              <View>
                <Text style={{ fontSize: 11, fontWeight: '600', color: '#9CA3AF' }}>
                  {picker === 'from' ? 'START DATE' : 'END DATE'}
                </Text>
                <Text style={{ marginTop: 3, fontSize: 18, fontWeight: '700', color: '#111827' }}>
                  {picker === 'from'
                    ? from ? formatDateISO(from) : 'Select start date'
                    : to ? formatDateISO(to) : 'Select end date'}
                </Text>
              </View>
              <Pressable onPress={() => setPicker(null)} hitSlop={10} style={{
                paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: '#F3F4F6',
              }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827' }}>Done</Text>
              </Pressable>
            </View>

            <View style={{ alignItems: 'center', justifyContent: 'center', minHeight: 220, paddingVertical: 4 }}>
              <DateTimePicker
           value={
  picker === 'from'
    ? from ?? today()
    : to ?? today()
}
                mode="date"
                display="spinner"
                themeVariant={"light"}
                maximumDate={new Date()}
                minimumDate={picker === 'to' ? from ?? undefined : undefined}
                onValueChange={(_event, selectedDate) => {
                  if (!selectedDate) return;
                  console.log('IOS SELECTED:', selectedDate);
                  setActivePreset(-1);
                  if (picker === 'from') {
                    setFrom(selectedDate);
                    if (to && selectedDate.getTime() > to.getTime()) setTo(null);
                  } else {
                    if (from && selectedDate.getTime() < from.getTime()) return;
                    setTo(selectedDate);
                  }
                }}
              />
            </View>
          </View>
        </View>
      )}
        </View>
      </Modal>


    </>
  );
}