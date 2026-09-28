export function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function pad(value: number): string {
  return String(value).padStart(2, '0');
}

export function toDateString(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function toTimeString(date: Date): string {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function parseLocalDate(dateString: string, timeString = '00:00'): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  const [hour, minute] = timeString.split(':').map(Number);
  return new Date(year, month - 1, day, hour || 0, minute || 0, 0, 0);
}

export function formatDate(dateString: string): string {
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
}

export function formatLongDate(dateString: string): string {
  const date = parseLocalDate(dateString);
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  }).format(date);
}

export function isToday(dateString: string): boolean {
  return dateString === toDateString(new Date());
}

export function clampProgress(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function daysUntil(dateString: string): number {
  const today = parseLocalDate(toDateString(new Date()));
  const target = parseLocalDate(dateString);
  const diff = target.getTime() - today.getTime();
  return Math.ceil(diff / 86400000);
}
