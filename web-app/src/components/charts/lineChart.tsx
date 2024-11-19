'use client'
import unitCalculation from '@/app/util/unitCalculation';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Tooltip as MyCustomTooltip, Typography } from '@mui/material';
import DateFormats from '../dateFormat';
import { TimestampRegex } from '@/app/util/dateRegex';
import dayjs from 'dayjs';


export default function LineChartComponent(props: any) {

    // Transforming props.data for the LineChart
    // const updated_line_data = props.data.map((item: any) => {
    //     if(props.title == 'Attendance'){
    //         return {
    //             name: item.date, // X-axis value
    //             Attendance_Status: item.attendance_status === "No" ? 0 : item.attendance_status === "Yes" ? 1 :  0.5// Y-axis value, 1 for "Yes", 0 for "No"
    //         };
    //     }
    //     if(props.title == 'Pre Work'){
    //         return {
    //             name: item.date, // X-axis value
    //             Pre_Work: item.attendance_status === "No" ? 0 : item.attendance_status === "Yes" ? 1 : 0.5// Y-axis value, 1 for "Yes", 0 for "No"
    //         };
    //     }
    //     if(props.title == 'Action Step'){
    //         return {
    //             name: item.date, // X-axis value
    //             Action_Step: item.attendance_status === "No" ? 0 : item.attendance_status === "Yes" ? 1 : 0.5// Y-axis value, 1 for "Yes", 0 for "No"
    //         };
    //     }       
    // });

    // Transform data based on its format
    const updated_line_data: any = Object.values(
        props.data.reduce((acc: any, { date, attendance_status, count }: any) => {
            const datePart = date.split('T')[0];
            if (!acc[datePart]) acc[datePart] = { name: datePart };
            acc[datePart][attendance_status] = (acc[datePart][attendance_status] || 0) + count;
            return acc;
        }, {})
    );

    const renderColorfulLegendText = (value: string, entry: any) => {
        if (value === "Attendance_Status") {
            return (
                <span style={{ color: "#596579", fontWeight: 500, fontSize: '10px' }}>
                    Attendance Status
                </span>
            );
        }
        if (value === "Pre_Work") {
            return (
                <span style={{ color: "#596579", fontWeight: 500, fontSize: '10px' }}>
                    Pre Work
                </span>
            );
        }
        if (value === "Action_Step") {
            return (
                <span style={{ color: "#596579", fontWeight: 500, fontSize: '10px' }}>
                    Action Step
                </span>
            );
        }
        return (
            <span style={{ color: "#596579", fontWeight: 500, fontSize: '10px', }}>
                {value}
            </span>
        );
    };

    const DataFormater = (value: any) => {
        return value
    };

    const DataFormaterX = (val: any, index: number) => {
        for (const regex of TimestampRegex) {
            var dates = DateFormats(val, false)
            return dates
        }
        return '';
    }

    // const tooltipRender = (val1: any, val2: any) => {
    //     return (
    //         <div style={{ backgroundColor: '#2A2F42', height: '7vh', minWidth: '15vw', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '0.5vw 1vw' }}>
    //             <Typography sx={{ fontSize: '10px', fontWeight: '500', color: 'white' }}>{`${String(val1)} : ${Math.round(val2)} `}</Typography>
    //         </div>
    //     );
    // }

    const tooltipRender = (val1: any) => {
        return (
            <div style={{ backgroundColor: '#2A2F42', minHeight: '15.5vh', minWidth: '15vw',maxWidth:"25vw", display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '0.5vw 1vw' }}>
                <Typography sx={{ fontSize: '1vw', fontWeight: '500', color: 'white', padding: "0.3vh" }}>{dayjs(val1.name).format('MMM DD , YYYY')}</Typography>
                {Object.keys(val1).filter(key => key !== 'name').map((key, idx) => (
                    <Typography key={idx} sx={{ fontSize: '1vw', fontWeight: '500', color: props.color[idx % props?.color?.length], padding: "0.3vh" }}>
                        {key}&nbsp;:&nbsp; {val1[key]}
                    </Typography>
                ))}
            </div>
        );
    };

    //TOOLTIP
    // const CustomTooltip = (props: any) => {

    //     if (props?.active && props?.payload && props?.payload?.length) {
    //         const value = unitCalculation(props?.payload[0]?.value, false)
    //         for (const regex of TimestampRegex) {
    //             if (regex.test(props?.label)) {
    //                 var dates = DateFormats(props?.label, false)
    //                 tooltipRender(dates, value)
    //             }
    //         }
    //         return tooltipRender(DateFormats(props?.label, false), value)
    //     }
    //     return (<></>);
    // }

    const CustomTooltip = (props: any) => {
        if (props?.active && props?.payload && props?.payload?.length) {
            return tooltipRender(props?.payload[0]?.payload);
        }
        return <></>;
    };


    return (
        <ResponsiveContainer>
            <LineChart
                data={updated_line_data}
                style={{ fontSize: "10px" }}
                margin={{
                    top: 40,
                    right: 40,
                    left: 0,
                    bottom: 5
                }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tickFormatter={DataFormaterX} style={{ fontSize: '10px', }} />
                <YAxis tickFormatter={DataFormater} style={{ fontSize: '10px', }}  />

                <Tooltip content={<CustomTooltip />} />
                <Legend
                    iconType="square"
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    iconSize={10}
                    formatter={renderColorfulLegendText}
                />
                {Object.keys(updated_line_data[0]).filter(key => key !== 'name').map((key, index) => (
                    <Line type="monotone" key={index} dataKey={key} stroke={'#36BCD0'} strokeWidth={2} />))}
                {/* {
                    Object.keys(updated_line_data[0]).map((key:any,index:number)=>{
                        if(key == 'name'){
                            return 
                        }
                        return <Line type="monotone" key={index} dataKey={key} stroke={'#FEAFBC'} strokeWidth={2} />
                    })
                } */}
            </LineChart>
        </ResponsiveContainer>
    )
}