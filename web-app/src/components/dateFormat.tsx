export default function DateFormats(inputdate: any, dateFormatControl: Boolean) {

    // Create a Date object directly from the inputdate
    const dateObject = new Date(inputdate);

    // Extract the hours and minutes in UTC
    const hours = dateObject.getUTCHours();
    const minutes = dateObject.getUTCMinutes();

    // Format the date and time
    const formattedTime = dateObject.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC'
    });

    const timeString = dateObject.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });

    return dateFormatControl == false ? formattedTime : timeString;
}


