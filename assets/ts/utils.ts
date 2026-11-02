const SECONDS_IN = {
  year: 31536000,
  week: 604800,
  day: 86400,
  hour: 3600,
  minute: 60,
  second: 1,
} as const;

// Inspired by https://stackoverflow.com/a/8212878/5288481
// Keeps the two largest parts
export function secondsToString(totalSeconds: number): string {
  if (totalSeconds === 0) {
    return '0 seconds';
  }
  const parts: string[] = [];
  let remainder = totalSeconds;
  for (const [unit, size] of Object.entries(SECONDS_IN)) {
    const count = Math.floor(remainder / size);
    remainder %= size;
    if (count) {
      parts.push(`${count} ${unit}${count > 1 ? 's' : ''}`);
    }
  }
  return parts.slice(0, 2).join(', ');
}

// Inspired by https://stackoverflow.com/a/11257124/5288481
export function objectArrayToCsv(rows: Record<string, unknown>[]): string {
  const first = rows[0];
  if (!first) {
    return '';
  }
  const lines = [Object.keys(first).join(',')];
  for (const row of rows) {
    lines.push(Object.values(row).map(csvField).join(','));
  }
  return lines.map((line) => line + '\r\n').join('');
}

function csvField(field: unknown): string {
  if (typeof field === 'string' && /[,"\r\n]/.test(field)) {
    // " becomes "", then surround in double quotes
    return `"${field.replaceAll('"', '""')}"`;
  }
  return String(field);
}
