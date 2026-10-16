const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export function formatDate(value?: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return String(value); // already a display string (e.g. 12-03-2025)
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatDateTime(value?: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return String(value);
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${formatDate(value)}, ${h % 12 || 12}:${m} ${h >= 12 ? 'pm' : 'am'}`;
}

const STATUS: Record<string, { label: string; bg: string; text: string }> = {
  ACTIVE: { label: 'Active', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  ONGOING: { label: 'Ongoing', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  COMPLETED: { label: 'Completed', bg: 'bg-indigo-50', text: 'text-indigo-700' },
  TRANSFERRED: { label: 'Transferred', bg: 'bg-amber-50', text: 'text-amber-700' },
  REMOVED: { label: 'Removed', bg: 'bg-rose-50', text: 'text-rose-700' },
  PENDING: { label: 'Pending', bg: 'bg-neutral-100', text: 'text-neutral-600' },
};

export function statusMeta(status?: string | null) {
  const key = (status ?? '').toUpperCase();
  if (STATUS[key]) return STATUS[key];
  const label = key
    ? key.charAt(0) + key.slice(1).toLowerCase().replace(/_/g, ' ')
    : '—';
  return { label, bg: 'bg-neutral-100', text: 'text-neutral-600' };
}