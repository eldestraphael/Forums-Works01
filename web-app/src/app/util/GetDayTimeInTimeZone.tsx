export const GetDayTimeInTimezone = (input_time: string, input_day: string, input_date: string, input_tz: string, output_tz: string) => {
    // Helper function to parse time in HH:MM:SS format
    const parseTime = (timeStr: string) => {
        const [hours, minutes, seconds] = timeStr.split(':').map(Number);
        return { hours, minutes, seconds };
    };

    // Helper function to convert timezone string to minutes offset
    const parseTimezoneOffset = (tzStr: string) => {
        const tzSign = tzStr[3] === '+' ? 1 : -1;
        const tzHours = parseInt(tzStr.slice(4, 6), 10);
        const tzMinutes = parseInt(tzStr.slice(6), 10);
        return tzSign * (tzHours * 60 + tzMinutes);
    };

    // Parse the input time and timezone offsets
    const { hours, minutes, seconds } = parseTime(input_time);
    const inputOffsetMinutes = parseTimezoneOffset(input_tz);
    const outputOffsetMinutes = parseTimezoneOffset(output_tz);

    // Parse the input date
    const [inputYear, inputMonth, inputDay] = input_date.split('-').map(Number);

    // Create a Date object for the input time and date
    const inputDate = new Date(Date.UTC(inputYear, inputMonth - 1, inputDay, hours, minutes, seconds));

    // Calculate the time difference between input and output timezones in milliseconds
    const timeDifferenceMs = (outputOffsetMinutes - inputOffsetMinutes) * 60 * 1000;

    // Adjust the input date by the time difference
    const outputDate = new Date(inputDate.getTime() + timeDifferenceMs);

    // Format the output time
    const utcTime = outputDate.toISOString().substr(11, 8); // Get time in HH:MM:SS format
    const utcDay = outputDate.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
    const utcDate = outputDate.toISOString().substr(0, 10); // Get date in YYYY-MM-DD format

    return { UTCday: utcDay, UTCTime: utcTime, UTCDate: utcDate };
};