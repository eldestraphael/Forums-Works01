"use client"
import DateFormats from '@/app/util/dateFormat'
import { Typography } from '@mui/material'
import React from 'react'
import Brightness1Icon from '@mui/icons-material/Brightness1';


function DashbaordTable({ data, Page }: any) {
    return (

        <table className="w-full max-h-[30vh] ">
            <thead className="sticky top-0">
                <tr>
                    {Object.keys(data[0])?.map((key: any, i: any) => {
                        const formattedKey = key.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                        return <th key={i} className="px-4 py-2 bg-[#2A2F42] text-white text-center">{formattedKey}</th>;
                    })}
                </tr>
            </thead>
            <tbody>
                {data?.map((row: any, index: any) => (
                    <tr key={index} className="border-b">
                        {Object.values(row)?.map((content: any, i: any) => {
                            if (i == 2) {
                                return <td key={i} className="px- py-2 text-center"><Brightness1Icon fontSize="small" sx={{ color: Math.round(content) / 10 * 100 <= 50 ? "#fa8072 " : Math.round(content) / 10 * 100 >= 51 && Math.round(content) / 10 * 100 <= 80 ? "#EDD86D" : "#6EE3AB" }} />{content > 0 ? content / 10 * 100 : 0}%</td>
                            }
                            return <td key={i} className="px-4 py-2 text-center">{Page == 'user' && i == 1 ? DateFormats(content, true) : content}</td>
                        })}
                    </tr>
                ))}
            </tbody>
        </table>
    )
}

export default DashbaordTable