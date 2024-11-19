// export default function getUTCForDay(day: string, timeZone: string, time: string): string {
//     // Map of days to their index (0 for Sunday, 1 for Monday, etc.)
//     const daysOfWeek: string[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
//     // Find the index of the given day
//     const targetDayIndex: number = daysOfWeek.indexOf(day);
//     if (targetDayIndex === -1) {
//       throw new Error('Invalid day provided');
//     }
  
//     // Parse the time string (e.g., "14:30")
//     const [hours, minutes]: [number, number] = time.split(':').map(Number) as [number, number];
  
//     // Create a date object for the given day and time
//     const targetDate: Date = new Date();
//     targetDate.setDate(targetDate.getDate() + ((targetDayIndex + 7 - targetDate.getDay()) % 7));
//     targetDate.setHours(hours, minutes, 0, 0);
  
//     // Extract hours and minutes from the timeZone string (e.g., GMT+0530)
//     const sign: number = timeZone.startsWith('GMT+') ? 1 : -1;
//     const timeZoneHours: number = parseInt(timeZone.slice(4, 6), 10);
//     const timeZoneMinutes: number = parseInt(timeZone.slice(6), 10);
  
//     // Convert hours and minutes to total offset in milliseconds
//     const offset: number = sign * (timeZoneHours * 60 * 60 * 1000 + timeZoneMinutes * 60 * 1000);
  
//     // Adjust the target date by the offset to get UTC time
//     const utcTimestamp: number = targetDate.getTime() - offset;
//     const utcDate: Date = new Date(utcTimestamp);
  
//     // Get the day of the week in UTC
//     const utcDay: number = utcDate.getUTCDay();
  
//     // Return the corresponding UTC day name
//     return daysOfWeek[utcDay];
//   }

export default function getUTCForDay(selectedDay: string, timeZone: string, timePart: string): string {
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  
  // Parse the time part (24-hour format)
  const [hours, minutes, seconds] = timePart.split(':').map(Number);
  
  // Create a Date object with the selected day and local time
  const localDate = new Date();
  localDate.setUTCHours(hours);
  localDate.setUTCMinutes(minutes);
  localDate.setUTCSeconds(seconds);
  
  // Get the time zone offset in minutes
  const offsetMinutes = parseTimeZoneOffset(timeZone);
  
  // Calculate UTC time by subtracting the time zone offset
  const utcDate = new Date(localDate.getTime() - offsetMinutes * 60000);
  
  // Find the index of the selected day
  const localDayIndex = daysOfWeek.indexOf(selectedDay);
  
  // Determine the UTC day based on the UTC time
  const utcDayIndex = (localDayIndex + utcDate.getUTCDay() - localDate.getUTCDay() + 7) % 7;
  
  // Return the UTC day
  return daysOfWeek[utcDayIndex];
}

function parseTimeZoneOffset(timeZone: string): number {
  const sign = timeZone[3] === '+' ? 1 : -1;
  const hoursOffset = parseInt(timeZone.substring(4, 6), 10);
  const minutesOffset = parseInt(timeZone.substring(6, 8) || '0', 10);
  return sign * (hoursOffset * 60 + minutesOffset);
}