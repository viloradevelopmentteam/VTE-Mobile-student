const INDIA_TIMEZONE = 'Asia/Kolkata';

export const parseLocalDate = (date?: string | null): Date | null => {
  if (!date) return null;

  const [year, month, day] = date.split('-').map(Number);

  if (!year || !month || !day) return null;

  return new Date(year, month - 1, day);
};
export const formatDateISO = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const formatDateLocal = (date?: Date | null): string | null => {
  if (!date) return null;

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');

  return `${y}-${m}-${d}`;
};

/**
 * Current Indian date as YYYY-MM-DD
 */
export const getTodayLocalDate = (): string => {
  const now = new Date();

  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: INDIA_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);

  const year = parts.find(p => p.type === 'year')?.value;
  const month = parts.find(p => p.type === 'month')?.value;
  const day = parts.find(p => p.type === 'day')?.value;

  return `${year}-${month}-${day}`;
};

/**
 * Current Indian date as DD/MM/YYYY
 */
export const indianDate = new Date().toLocaleDateString('en-IN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: INDIA_TIMEZONE,
});

/**
 * Current Indian time
 */
export const indianTime = new Date().toLocaleTimeString('en-IN', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
  timeZone: INDIA_TIMEZONE,
});

/**
 * Format ISO datetime as Indian date + time
 */
export const formatIndianDateTime = (
  isoString?: string | null
): string => {
  if (!isoString) return '—';

  const date = new Date(isoString);

  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: INDIA_TIMEZONE,
  });
};

/**
 * Format ISO datetime as Indian date only
 */
export const formatIndianDate = (
  isoString?: string | null
): string => {
  if (!isoString) return '—';

  const date = new Date(
    isoString
      .replace(' ', 'T')
      .replace(/\.(\d{3})\d+$/, '.$1')
  );

  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: INDIA_TIMEZONE,
  });
};

/**
 * Get current Indian date and time
 */
export const getIndianDateTimeParts = (
  date = new Date()
) => {
  const formattedDate = date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: INDIA_TIMEZONE,
  });

  const formattedTime = date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: INDIA_TIMEZONE,
  });

  return {
    date: formattedDate,
    time: formattedTime,
  };
};
