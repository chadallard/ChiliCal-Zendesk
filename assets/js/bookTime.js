import { formatDateTime } from './utils.js';

export function buildTable(slots, duration, userSlug, attemptId, meetingTypeSlug, timezone) {
  const meetingDetails = `
    <div style="margin-bottom: 10px;">
      <div>Meeting length: ${duration} Minutes</div>
      <div>Time Zone: ${timezone}</div>
    </div>
  `;

  const dates = Array.from(new Set(slots.map(slot => formatDateTime(slot.start, timezone, 'date')))).sort();

  const timesMap = slots.reduce((acc, slot) => {
    const date = formatDateTime(slot.start, timezone, 'date');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(slot);
    return acc;
  }, {});

  const tableHeader = `
    <thead>
      <tr>
        ${dates.map(date => `<th style="border: 1px solid #b3b3b3; padding: 4px;">${date}</th>`).join('')}
      </tr>
    </thead>
  `;

  const maxTimeSlots = Math.max(...Object.values(timesMap).map(dateSlots => dateSlots.length));
  const tableBody = Array.from({ length: maxTimeSlots }).map((_, rowIndex) => `
    <tr>
      ${dates.map(date => {
    const slot = timesMap[date][rowIndex];
    if (slot) {
      const startTime = formatDateTime(slot.start, timezone, 'time');
      const suggestedTimesLink = `https://calendar.chilipiper.com/suggested-times/${attemptId}?slotStartsAt=${slot.start}`;
      return `<td style="border: 1px solid #b3b3b3; padding: 4px;"><a href="${suggestedTimesLink}" target="_blank">${startTime}</a></td>`;
    } else {
      return '<td style="border: 1px solid #b3b3b3; padding: 4px;"></td>';
    }
  }).join('')}
    </tr>
  `).join('');

  const table = `
    <div>
      <table style="border:none;border-collapse: collapse;">
        ${tableHeader}
        <tbody>
          ${tableBody}
        </tbody>
      </table>
    </div>
  `;

  const fullCalendarLink = `https://calendar.chilipiper.com/me/${userSlug}/${meetingTypeSlug}?attemptId=${attemptId}`;
  const fullCalendarButton = `
    <div style="margin-top: 10px;">
      Don't see a time that works? <a href="${fullCalendarLink}" target="_blank">View full calendar</a>
    </div>
  `;

  return `
    ${meetingDetails}
    ${table}
    ${fullCalendarButton}
  `;
}
