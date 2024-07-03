import { formatDateTime } from './utils.js';

export function buildTable(slots, duration, userSlug, attemptId, meetingTypeSlug, timezone) {
  // Prepare meeting details information
  let meetingDetails = `
    <div style="margin-bottom: 10px;">
      <div>Meeting length: ${duration} Minutes</div>
      <div>Time Zone: ${timezone}</div>
    </div>
  `;

  // Initialize columns and rows
  let dates = new Set(slots.map(slot => formatDateTime(slot.start, timezone, 'date')));
  let columns = Array.from(dates).sort(); // Sort dates in ascending order

  let table = '<div><table style="border:none;border-collapse: collapse;">';
  
  // Build table header with dates as column headers
  table += '<thead><tr>';
  columns.forEach(date => {
    table += `<th style="border: 1px solid #b3b3b3; padding: 4px;">${date}</th>`;
  });
  table += '</tr></thead>';

  // Build table body with times as rows under each date column
  table += '<tbody>';
  let timesMap = new Map();
  slots.forEach(slot => {
    let date = formatDateTime(slot.start, timezone, 'date');
    if (!timesMap.has(date)) {
      timesMap.set(date, []);
    }
    timesMap.get(date).push(slot);
  });

  // Get array of times per date
  let timesPerDate = Array.from(timesMap.values());

  // Iterate over each time slot
  let maxTimeSlots = Math.max(...timesPerDate.map(dateSlots => dateSlots.length));
  for (let i = 0; i < maxTimeSlots; i++) {
    table += '<tr>';
    // First column with time slot
    timesPerDate.forEach((timeSlots, idx) => {
      if (timeSlots[i]) {
        let startTime = formatDateTime(timeSlots[i].start, timezone, 'time');
        let suggestedTimesLink = `https://calendar.chilipiper.com/suggested-times/${attemptId}?slotStartsAt=${timeSlots[i].start}`;
        table += `<td style="border: 1px solid #b3b3b3; padding: 4px;"><a href="${suggestedTimesLink}" target="_blank">${startTime}</a></td>`;
      } else {
        table += '<td style="border: 1px solid #b3b3b3; padding: 4px;"></td>';
      }
    });
    table += '</tr>';
  }

  table += '</tbody></table></div>';

  // Prepare full calendar link
  let fullCalendarLink = `https://calendar.chilipiper.com/me/${userSlug}/${meetingTypeSlug}?attemptId=${attemptId}`;
  let fullCalendarButton = `<div style="margin-top: 10px;">Don't see a time that works? <a href="${fullCalendarLink}" target="_blank">View full calendar</a></div>`;

  // Return the entire HTML structure
  return `
    ${meetingDetails}
    ${table}
    ${fullCalendarButton}
  `;
}
