import _ from "lodash";
import React from "react";
import { useRef } from "react";
import { getTimeZone } from "react-native-localize";

export function secondsToDhmsLeft(seconds: number) {
  if (seconds < 0) {
    return ''
  }
  seconds = Number(seconds);
  var d = Math.floor(seconds / (3600 * 24));
  var h = Math.floor((seconds % (3600 * 24)) / 3600);
  var m = Math.floor((seconds % 3600) / 60);
  var dDisplay = d > 0 ? d + (d == 1 ? ' d' : 'd ') : '';
  var hDisplay = h > 0 ? h + (h == 1 ? ' h' : 'h ') : '';
  var mDisplay = m > 0 ? m + (m == 1 ? ' m' : 'm ') : '';
  return dDisplay + hDisplay + mDisplay + 'left';
}

export function secondsToMinutes(seconds: number) {
  if (seconds < 0) {
    return '';
  }

  if (seconds < 60) {
    return `${seconds} sec`;
  } else {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} mins`;
  }
}

export const utcToLocal = (utcDateString: string) => {
  if (utcDateString[utcDateString.length - 1] !== 'Z') {
    utcDateString += 'Z'
  }
  const formattedDate = new Date(utcDateString).toLocaleString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });
  const time = new Date(utcDateString).toLocaleString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });
  const daysOfWeek = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  const day = daysOfWeek[new Date(utcDateString).getDay()];
  const fiveMinutesLess = new Date(new Date(utcDateString).getTime() - 5 * 60 * 1000);
  const thirtyMinutesMore = new Date(new Date(utcDateString).getTime() + 30 * 60 * 1000);
  const currentDate = new Date();
  return {
    date: formattedDate,
    day,
    time,
    utcDateString
    // meetingDisabled  
  };
};

export function convertUTCToLocal(day: string, time: string) {
  const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

  // Get the current date in UTC
  const currentDate = new Date();

  // Find the index of the given day in the daysOfWeek array
  const dayIndex = daysOfWeek.indexOf(day.toLowerCase());

  if (dayIndex === -1) {
    throw new Error('Invalid day of the week');
  }

  // Calculate the difference in days between the current day and the given day
  const currentDayIndex = currentDate.getUTCDay();
  let dayDifference = dayIndex - currentDayIndex;

  // Adjust the date if the given day is in the past for the current week
  if (dayDifference < 0) {
    dayDifference += 7;
  }

  // Set the time components from the given time
  const [hours, minutes, seconds] = time.split(':').map(Number);

  // Create a new date for the given day and time in the current week in UTC
  const targetDateUTC = new Date(Date.UTC(
    currentDate.getUTCFullYear(),
    currentDate.getUTCMonth(),
    currentDate.getUTCDate() + dayDifference,
    hours,
    minutes,
    seconds
  ));

  // Convert the target date to the local time zone
  const localDateTime = new Date(targetDateUTC).toISOString();

  return utcToLocal(localDateTime);
}

export function getLocalTimezone() {
  return getTimeZone()
}

export function getLocalTimezoneOffset() {
  // Create a Date object from the UTC date string
  const date = new Date();

  // Get the timezone offset in minutes
  const offset = date.getTimezoneOffset();

  // Convert the offset to hours and minutes
  const offsetHours = Math.floor(Math.abs(offset) / 60);
  const offsetMinutes = Math.abs(offset) % 60;

  // Determine the sign of the offset
  const sign = offset > 0 ? '-' : '+';

  // Format the offset string as "GMT +HH:MM" or "GMT -HH:MM"
  const formattedOffset = `GMT ${sign}${String(offsetHours).padStart(2, '0')}:${String(offsetMinutes).padStart(2, '0')}`;

  return formattedOffset

}

export const getAgoDate = (month: number) => {
  var d = new Date();
  // Set it to one month ago
  d.setMonth(d.getMonth() - month);
  // Zero the time component
  d.setHours(0, 0, 0, 0);
  return d;
};
export const formatDate = (date: Date) => {
  var dateString = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .split('T')[0];

  return dateString;
};

export const useInterval = (callback: any, delay: number | null) => {
  const savedCallback: any = useRef();

  // Remember the latest function.
  React.useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  React.useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}


export const getProgressColor = (score: number) => {
  return score > 80
    ? '#66bb6a'
    : score > 50
      ? '#fdd830'
      : '#f44336';
}


export const round = (num: number | null | undefined) => {
  return Math.round((num || 0) * 100) / 100;
}

export const convertUtcTimeToLocalTime = (utcTime: string) => {

  // Create a Date object for the current date
  const currentDate = new Date();

  // Split the UTC time into hours, minutes, and seconds
  const [hours, minutes, seconds] = utcTime.split(':').map(Number);

  // Set the hours, minutes, and seconds of the current date to the UTC time
  currentDate.setUTCHours(hours);
  currentDate.setUTCMinutes(minutes);
  currentDate.setUTCSeconds(seconds);

  // Get the local time as a string with AM/PM
  const localTime = currentDate.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
  });
  return localTime
}

export function validateEmail(email: string): boolean {
  const emailExpression: RegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return emailExpression.test(email.toLowerCase());
}

export function isNestedObjectEmpty(obj: object): boolean {
  if (!_.isObject(obj)) {
    return true;
  }

  return _.every(obj, value => {
    if (_.isObject(value)) {
      return isNestedObjectEmpty(value);
    }
    return _.isEmpty(value);
  });
}

export function doesObjectContainsEmptyValues(obj: object): boolean {
  return _.some(obj, value => {
    return _.isEmpty(value);
  });
}

export const formatDuration = (duration: number) => {
  const minutes = Math.floor(duration / 60); // Get the whole minutes
  const seconds = Math.floor(duration % 60); // Get the remaining seconds

  // Format minutes and seconds with leading zeros if necessary
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(seconds).padStart(2, '0');

  return `${formattedMinutes}:${formattedSeconds}` || '20';
};


export function debounce(
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  this: any,
  fn: (...args: any) => any,
  time?: number
): (...args: any | undefined) => any {
  let timer: any;

  return (...args) => {
    return new Promise(resolve => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        resolve(fn.apply(this, args));
      }, time ?? 1000);
    });
  };
}