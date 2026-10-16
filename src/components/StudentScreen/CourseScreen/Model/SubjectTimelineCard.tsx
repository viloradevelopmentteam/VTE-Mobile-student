import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import {
  ArrowRightLeft,
  BookOpen,
  CalendarDays,
  ChevronRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  Clock3,
  LogIn,
  LogOut,
  User,
} from 'lucide-react-native';

import { formatDate, formatDateTime, statusMeta } from '../../../../utils/formater';

import { TimelineEvent, TimelineSubject } from '../api/studentCourse.api';
import AttendanceModal from './AttendanceModal';

const EVENT_META: Record<string, { Icon: any; color: string; bg: string }> = {
  ALLOCATED: { Icon: LogIn, color: '#4F46E5', bg: '#EEF2FF' },
  TRANSFERRED: { Icon: ArrowRightLeft, color: '#D97706', bg: '#FFFBEB' },
   JOINED: { Icon: LogIn, color: '#4F46E5', bg: '#EEF2FF' },
  REALLOCATED: { Icon: ArrowRightLeft, color: '#7C3AED', bg: '#F5F3FF' },
  REMOVED: { Icon: LogOut, color: '#E11D48', bg: '#FFF1F2' },
  COMPLETED: { Icon: CheckCircle2, color: '#059669', bg: '#ECFDF5' },
};

const FALLBACK_META = { Icon: Circle, color: '#64748B', bg: '#F1F5F9' };

function eventTitle(e: TimelineEvent): string {
  switch (e.type) {
    case 'ALLOCATED':
      return `Joined ${e.toBatchName ?? '—'}`;
         case 'JOINED':
      return `Joined ${e.toBatchName ?? '—'}`;

    case 'TRANSFERRED':
      return `${e.fromBatchName ?? '—'} → ${e.toBatchName ?? '—'}`;
    case 'REALLOCATED':
      return `Reallocated to ${e.toBatchName ?? '—'}`;
    case 'REMOVED':
      return `Removed from ${e.fromBatchName ?? '—'}`;
    case 'COMPLETED':
      return 'Subject completed';
    default:
      return e.type;
  }
}

type Row = {
  key: string;
  type: string;
  title: string;
  date?: string;
  remarks?: string | null;
  duration?: number | null;
};

function TimelineRow({ row, last }: { row: Row; last: boolean }) {
  const meta = EVENT_META[row.type] ?? FALLBACK_META;
  const Icon = meta.Icon;

  return (
    <View className="flex-row">
      <View className="items-center mr-3">
        <View
          className="w-7 h-7 rounded-full items-center justify-center"
          style={{ backgroundColor: meta.bg }}
        >
          <Icon size={14} color={meta.color} strokeWidth={2.25} />
        </View>
        {!last && <View className="w-px flex-1 bg-neutral-200 mt-1" />}
      </View>

      <View className={`flex-1 ${last ? '' : 'pb-4'}`}>
        <Text className="text-[13px] font-medium text-neutral-800">{row.title}</Text>

        {row.date ? (
          <Text className="text-[11px] text-neutral-400 mt-0.5">{row.date}</Text>
        ) : null}

        {row.duration != null && (
          <Text className="text-[11px] text-neutral-400 mt-0.5">
            {row.duration} {row.duration === 1 ? 'day' : 'days'} in previous batch
          </Text>
        )}

        {row.remarks ? (
          <View className="mt-1.5 pl-2.5 border-l-2 border-neutral-200">
            <Text className="text-[12px] text-neutral-500 leading-4">{row.remarks}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

function Tile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View className="flex-1 min-w-[45%] flex-row items-center gap-2 p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
      {icon}
      <View className="flex-1">
        <Text className="text-[9px] uppercase tracking-wide text-neutral-400 font-medium">
          {label}
        </Text>
        <Text className="text-[12px] font-medium text-neutral-700" numberOfLines={1}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function SectionHeader({
  title,
  sub,
  open,
  onPress,
  right,
}: {
  title: string;
  sub?: string;
  open: boolean;
  onPress: () => void;
  right?: React.ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between px-4 py-3.5 border-t border-neutral-100 active:bg-neutral-50"
    >
      <View className="flex-1 pr-3">
        <Text className="text-[13px] font-semibold text-neutral-800">{title}</Text>
        {sub ? <Text className="text-[11px] text-neutral-400 mt-0.5">{sub}</Text> : null}
      </View>
      {right}
      {open ? (
        <ChevronUp size={16} color="#9CA3AF" />
      ) : (
        <ChevronDown size={16} color="#9CA3AF" />
      )}
    </Pressable>
  );
}

export default function SubjectTimelineCard({ subject }: { subject: TimelineSubject }) {
  const [showActivity, setShowActivity] = useState(true);
  const [attendanceOpen, setAttendanceOpen] = useState(false);

  const events = subject.events ?? [];
  const attendance = subject.attendance ?? [];
    const total = subject.totalSessions ?? 0;
  const present = subject.presentCount ?? 0;
  const pct = subject.attendancePercentage ?? 0;
 


const rows: Row[] = useMemo(() => {
  const list: Row[] = [];

  // Original normal/branch batch
  const branchRemovedEvent = events
    .filter(
      (event) =>
        event.source === 'BRANCH' &&
        event.type === 'REMOVED' &&
        event.fromBatchName
    )
    .sort((a, b) => {
      const aTime = a.eventAt
        ? new Date(a.eventAt).getTime()
        : 0;

      const bTime = b.eventAt
        ? new Date(b.eventAt).getTime()
        : 0;

      return aTime - bTime;
    })[0];

  if (branchRemovedEvent) {
    list.push({
      key: `branch-joined-${branchRemovedEvent.fromBatchId}`,
      type: 'ALLOCATED',
      title: `Joined ${branchRemovedEvent.fromBatchName}`,
      date: branchRemovedEvent.joinedAt
        ? formatDateTime(branchRemovedEvent.joinedAt)
        : undefined,
      timestamp: branchRemovedEvent.joinedAt,
    });
  }

  // Actual events from backend
  events.forEach((event, index) => {
    list.push({
      key: `${event.source}-${event.type}-${event.eventAt ?? index}`,
      type: event.type,
      title: eventTitle(event),
      date: event.eventAt
        ? formatDateTime(event.eventAt)
        : undefined,
      timestamp: event.eventAt,
      remarks: event.remarks,
      duration: event.durationDays,
    });
  });

  // Fallback
  if (list.length === 0 && subject.firstJoinedAt) {
    list.push({
      key: 'joined-fallback',
      type: 'ALLOCATED',
      title: `Joined ${subject.batchName ?? 'batch'}`,
      date: formatDateTime(subject.firstJoinedAt),
      timestamp: subject.firstJoinedAt,
    });
  }

  if (subject.completedAt) {
    list.push({
      key: 'completed',
      type: 'COMPLETED',
      title: 'Subject completed',
      date: formatDateTime(subject.completedAt),
      timestamp: subject.completedAt,
    });
  }

  list.sort((a, b) => {
    const aTime = a.timestamp
      ? new Date(a.timestamp).getTime()
      : 0;

    const bTime = b.timestamp
      ? new Date(b.timestamp).getTime()
      : 0;

    return aTime - bTime;
  });

  return list;
}, [
  subject.firstJoinedAt,
  subject.batchName,
  subject.completedAt,
  events,
]);

const status = statusMeta(subject.status);
const lastAttended = attendance[0] ?? null; 

  return (
    <View className="bg-white rounded-2xl border border-neutral-200 overflow-hidden mb-4">
      <View className="p-4">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 flex-row items-start gap-2.5 pr-2">
            <View className="w-9 h-9 rounded-xl bg-indigo-50 items-center justify-center">
              <BookOpen size={16} color="#4F46E5" strokeWidth={2.25} />
            </View>
            <View className="flex-1">
              <Text className="text-[15px] font-semibold text-neutral-900">
                {subject.subjectName}
              </Text>
              {subject.batchName ? (
                <Text className="text-[12px] text-neutral-400 mt-0.5" numberOfLines={1}>
                  {subject.batchName}
                </Text>
              ) : null}
            </View>
          </View>

          <View className={`px-2.5 py-1 rounded-full ${status.bg}`}>
            <Text className={`text-[10px] font-semibold ${status.text}`}>{status.label}</Text>
          </View>
        </View>

        <View className="flex-row flex-wrap gap-2 mt-3.5">
          <Tile
            icon={<CalendarDays size={14} color="#10B981" />}
            label="Start"
            value={formatDate(subject.batchStartDate)}
          />
          <Tile
            icon={<CalendarDays size={14} color="#FB7185" />}
            label="End"
            value={formatDate(subject.batchEndDate)}
          />
          {subject.batchTimings ? (
            <Tile
              icon={<Clock3 size={14} color="#818CF8" />}
              label="Schedule"
              value={subject.batchTimings}
            />
          ) : null}
          {subject.staffName ? (
            <Tile
              icon={<User size={14} color="#818CF8" />}
              label="Staff"
              value={subject.staffName}
            />
          ) : null}
        </View>

        {/* ================= ATTENDANCE SUMMARY ================= */}
        {attendance.length > 0 && (
          <View className="mt-3.5">
            <View className="flex-row justify-between mb-1.5">
              <Text className="text-[11px] text-neutral-500">Attendance</Text>
              <Text className="text-[11px] font-semibold text-neutral-700">
                {present}/{attendance.length} · {pct}%
              </Text>
            </View>
            <View className="h-1.5 rounded-full bg-neutral-200 overflow-hidden">
              <View className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
            </View>
          </View>
        )}
      </View>

      {/* ================= BATCH ACTIVITY ================= */}
      <SectionHeader
        title="Batch Activity"
        sub="Your batch history for this subject"
        open={showActivity}
        onPress={() => setShowActivity((value) => !value)}
        right={
          rows.length > 0 ? (
            <Text className="text-[10px] text-neutral-400 mr-2">
              {rows.length} {rows.length === 1 ? 'event' : 'events'}
            </Text>
          ) : null
        }
      />

      {showActivity && (
        <View className="px-4 pb-4 bg-neutral-50/60 pt-3">
          {rows.length === 0 ? (
            <View className="items-center py-6 rounded-xl border border-dashed border-neutral-200 bg-white">
              <Circle size={18} color="#D1D5DB" />
              <Text className="text-xs font-medium text-neutral-500 mt-2">
                No activity recorded
              </Text>
            </View>
          ) : (
            rows.map((row, index) => (
              <TimelineRow key={row.key} row={row} last={index === rows.length - 1} />
            ))
          )}
        </View>
      )}

      {attendance.length > 0 && (
        <Pressable
          onPress={() => setAttendanceOpen(true)}
          className="flex-row items-center justify-between px-4 py-3.5 border-t border-neutral-100 active:bg-neutral-50"
        >
          <View className="flex-1 pr-3">
            <Text className="text-[13px] font-semibold text-neutral-800">Classes & Topics</Text>
            <Text className="text-[11px] text-neutral-400 mt-0.5" numberOfLines={1}>
              {lastAttended
                ? `Last: ${formatDate(lastAttended.date)} · ${lastAttended.topic ?? 'No topic recorded'}`
                : 'Attendance, topics taught and staff'}
            </Text>
          </View>
          <Text className="text-[10px] text-neutral-400 mr-2">
            {attendance.length} {attendance.length === 1 ? 'class' : 'classes'}
          </Text>
          <ChevronRight size={16} color="#9CA3AF" />
        </Pressable>
      )}

{attendanceOpen && !!subject.batchId && (
  <AttendanceModal
    visible={attendanceOpen}
    onClose={() => setAttendanceOpen(false)}
    subjectName={subject.subjectName}
    batchId={Number(subject.batchId)}
  />
)}
    </View>
  );
}