export const DateRegex = [
    /^\d{1,2}\/\d{1,2}\/\d{2,4}$/,        // MM/DD/YY or MM/DD/YYYY
    /^\d{1,2}-\d{1,2}-\d{2,4}$/,        // MM-DD-YY or MM-DD-YYYY
    /^\d{2}\/\d{2}\/\d{2,4}$/,          // DD/MM/YY or DD/MM/YYYY
    /^\d{2}-\d{2}-\d{2,4}$/,            // DD-MM-YY or DD-MM-YYYY
    /^\w{3} \d{1,2}, \d{4}$/,           // MMM DD, YYYY (e.g., Sep 15, 2023)
    /^\d{1,2} \w{3} \d{4}$/,            // DD MMM YYYY (e.g., 15 Sep 2023)
    /^\d{4}-\d{2}-\d{2}$/,              // YYYY-MM-DD
    /^\d{4}\/\d{2}\/\d{2}$/,            // YYYY/MM/DD
    /^\d{1,2}-\w{3}-\d{2,4}$/,          // DD-MMM-YY or DD-MMM-YYYY (e.g., 15-Sep-23 or 15-Sep-2023)
    //  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/ // "2013-01-01T00:00:00.000Z"
    
];

export const TimestampRegex =[ 
/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/,  // "2013-01-01T00:00:00.000Z"
/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\+\d{2}:\d{2}$/,]  // "2016-11-11 00:00:00+05:30"
