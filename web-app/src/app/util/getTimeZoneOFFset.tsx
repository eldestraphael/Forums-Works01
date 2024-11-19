    'use client'

    export default function GetTimeZoneOffset() {
        const offset = new Date().getTimezoneOffset();
        const absoluteOffset = Math.abs(offset);
        const hours = Math.floor(absoluteOffset / 60);
        const minutes = absoluteOffset % 60;
        const sign = offset <= 0 ? '+' : '-';

        return `GMT${sign}${String(hours).padStart(2, '0')}${String(minutes).padStart(2, '0')}`;
    }