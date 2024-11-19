export default function DateFormats(inputdate: any, dateFormatControl: Boolean) {


    const formattedTime = new Date(inputdate).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
    });

    const formattedTimeTwo = new Date(inputdate).toLocaleString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
    const parts : any [] = formattedTimeTwo.split(' ');
    const day = parts[1].replace(',', ''); 
    const month = parts[0];
    const year = parts[2];
    const formattedDateString = `${day} ${month} ${year}`;

    return dateFormatControl==false ? formattedTime : formattedDateString
}

