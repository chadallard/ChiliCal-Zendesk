export function formatDateTime(dateTime, timezone, type) {
  const options = {
    timeZone: timezone,
    hour: 'numeric',
    minute: 'numeric',
    hour12: true // Use 12-hour format
  };

  if (type === 'time') {
    return new Date(dateTime).toLocaleTimeString('en-US', options);
  } else if (type === 'date') {
    return new Date(dateTime).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  } else {
    return new Date(dateTime).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      timeZone: timezone
    });
  }
}