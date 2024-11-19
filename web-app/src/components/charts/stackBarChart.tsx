'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Tooltip as MyCustomTooltip, Typography } from '@mui/material';
import DateFormats from '../dateFormat';
import { TimestampRegex } from '@/app/util/dateRegex';
import dayjs from 'dayjs';

export default function StackedBarChartComponent(props: any) {
    // Transform data based on its format
    const updated_bar_data: any = Object.values(
        props?.data?.reduce((acc: any, { date, attendance_status, count }: any) => {
            const datePart = date?.split('T')[0];
            if (!acc[datePart]) acc[datePart] = { name: datePart };
            acc[datePart][attendance_status] = (acc[datePart][attendance_status] || 0) + count;
            return acc;
        }, {})
    );

    const renderColorfulLegendText = (value: string) => {
        return (
            <span style={{ color: "#596579", fontWeight: 500, fontSize: '0.85vw' }}>
                {value}
            </span>
        );
    };

    const tooltipRender = (val1: any) => {
        return (
            <div style={{ backgroundColor: '#2A2F42', minHeight: '15.5vh', minWidth: '15vw',maxWidth:"25vw", display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '0.5vw 1vw' }}>
                <Typography sx={{ fontSize: '1vw', fontWeight: '500', color: 'white', padding: "0.3vh" }}>{dayjs(val1?.name).format('MMM DD , YYYY')}</Typography>
                {Object.keys(val1).filter(key => key !== 'name').map((key, idx) => (
                    <Typography key={idx} sx={{ fontSize: '1vw', fontWeight: '500', color: props.color[idx % props?.color?.length], padding: "0.3vh" }}>
                        {key}&nbsp;:&nbsp; {val1[key]}
                    </Typography>
                ))}
            </div>
        );
    };

    const CustomTooltip = (props: any) => {
        if (props?.active && props?.payload && props?.payload?.length) {
            return tooltipRender(props?.payload[0]?.payload);
        }
        return <></>;
    };

    const DataFormaterX = (val: any) => {
        for (const regex of TimestampRegex) {
            const dates = DateFormats(val, false);
            return dates;
        }
        return '';
    };

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart
                width={500}
                height={300}
                data={updated_bar_data}
                margin={{
                    top: 28,
                    right: 30,
                    left: 20,
                    bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={true} tickFormatter={DataFormaterX} style={{ fontSize: '10px' }} />
                <YAxis  domain={[1, 'dataMax']}  allowDecimals={false}  interval={0} />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                    iconType="square"
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    iconSize={7}
                    formatter={renderColorfulLegendText}
                    wrapperStyle={{ backgroundColor: 'transparent', overflowY: 'auto', display: 'flex', justifyContent: 'center' }}
                />
                {Object.keys(updated_bar_data[0]).filter(key => key !== 'name').map((key, index) => (
                    <Bar key={index} dataKey={key} stackId="a" fill={props.color[index % props?.color?.length]} />
                ))}
            </BarChart>
        </ResponsiveContainer>
    );
}
