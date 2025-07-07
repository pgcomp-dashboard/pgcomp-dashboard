export function formatDateTime(date: Date): string {

  const sec   = String(date.getUTCSeconds()).padStart(2, '0');
  const min   = String(date.getUTCMinutes()).padStart(2, '0');
  const hour  = String(date.getUTCHours()).padStart(2, '0');
  const day   = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year  = date.getUTCFullYear();

  const formatted = `${hour}:${min}:${sec} ${day}/${month}/${year}`;

  return formatted;
}
