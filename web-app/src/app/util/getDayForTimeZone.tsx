// export default function getLocalDayFromUTC(utcDay: string, utcTime: string, localTimeZone: string): string {
//     // Map of days to their index (0 for Sunday, 1 for Monday, etc.)
//     const daysOfWeek: string[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
//     // Find the index of the given UTC day
//     const utcDayIndex: number = daysOfWeek.indexOf(utcDay);
//     if (utcDayIndex === -1) {
//       throw new Error('Invalid UTC day provided');
//     }
  
//     // Parse the UTC time string (e.g., "23:30")
//     const [utcHours, utcMinutes]: [number, number] = utcTime.split(':').map(Number) as [number, number];
  
//     // Create a Date object corresponding to the given UTC day and time
//     const utcDate: Date = new Date();
//     utcDate.setUTCFullYear(utcDate.getUTCFullYear(), utcDate.getUTCMonth(), utcDate.getUTCDate());
//     utcDate.setUTCHours(utcHours, utcMinutes, 0, 0);
  
//     // Adjust to the correct UTC day by adding the necessary offset to get to the provided day
//     utcDate.setUTCDate(utcDate.getUTCDate() - utcDate.getUTCDay() + utcDayIndex);
  
//     // Extract hours and minutes from the local time zone string (e.g., GMT+0530)
//     const sign: number = localTimeZone.startsWith('GMT+') ? 1 : -1;
//     const timeZoneHours: number = parseInt(localTimeZone.slice(4, 6), 10);
//     const timeZoneMinutes: number = parseInt(localTimeZone.slice(6), 10);
  
//     // Convert hours and minutes to total offset in milliseconds
//     const offset: number = sign * (timeZoneHours * 60 * 60 * 1000 + timeZoneMinutes * 60 * 1000);
  
//     // Adjust the UTC date by the offset to get local time
//     const localTimestamp: number = utcDate.getTime() + offset;
//     const localDate: Date = new Date(localTimestamp);
  
//     // Get the day of the week in local time
//     const localDay: number = localDate.getDay();
  
//     // Return the corresponding local day name
//     return daysOfWeek[localDay];
//   }

export default function getLocalDayFromUTC(utcDayName: string, utcTime: string, timeZoneOffset: string): string {
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  
  // Parse the UTC time
  const [hours, minutes, seconds] = utcTime.split(':').map(Number);

  // Create a Date object for the given UTC time on the correct UTC day
  const utcDate = new Date();
  utcDate.setUTCHours(hours, minutes, seconds, 0); // Set time to UTC time

  // Calculate the difference in days between the given UTC day and the current day
  const currentDayIndex = utcDate.getUTCDay();
  const targetDayIndex = daysOfWeek.indexOf(utcDayName);
  const dayDifference = (targetDayIndex - currentDayIndex + 7) % 7;

  // Adjust the UTC date to the correct day
  utcDate.setUTCDate(utcDate.getUTCDate() + dayDifference);

  // Parse the time zone offset (e.g., "GMT+0530" -> +5 hours 30 minutes)
  const offsetMinutes = parseTimeZoneOffset(timeZoneOffset);
  
  // Calculate local time by adding the time zone offset
  const localDate = new Date(utcDate.getTime() + offsetMinutes * 60000);
  
  // Get the local day
  const localDayName = daysOfWeek[localDate.getUTCDay()];

  return localDayName;
}

function parseTimeZoneOffset(timeZone: string): number {
  const sign = timeZone[3] === '+' ? 1 : -1;
  const hoursOffset = parseInt(timeZone.substring(4, 6), 10);
  const minutesOffset = parseInt(timeZone.substring(6, 8) || '0', 10);
  return sign * (hoursOffset * 60 + minutesOffset);
}
