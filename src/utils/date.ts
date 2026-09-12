export const formatDateTime = (value: string | Date) =>
  new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));

export const formatDate = (value: string | Date) =>
  new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));

export const formatTime = (value: string | Date) =>
  new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' }).format(new Date(value));

export const isDueAtLeastThirtyMinutesAway = (dueAt: Date) => dueAt.getTime() - Date.now() >= 30 * 60 * 1000;
