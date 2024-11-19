'use client'
import { PieChart, Pie, Legend, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Tooltip as MyCustomTooltip, Typography } from '@mui/material';
import unitCalculation from '@/app/util/unitCalculation';


export default function PieChartComponent(props: any) {
   
    var key: any;
    
    const updated_pie_data = props.data.map((item: any) => {
        key = Object.keys(item)[1]
        return { name: item[Object.keys(item)[0]], [Object.keys(item)[1]]: Number(item[Object.keys(item)[1]]) };
    });

    //TOOLTIP
    const CustomTooltip = (props: any) => {
        if (props.active && props.payload && props.payload.length) {
            const value = unitCalculation(props.payload[0].value, false)
            return (
                <div style={{  backgroundColor: '#2A2F42', height: '7vh', minWidth: '15vw', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '0.5vw 1vw' }}>
                    <Typography sx={{ fontSize: '1vw', fontWeight: '500', color: 'white' }}>{`${props.payload[0].name} : ${props.payload[0].value}`}</Typography>
                </div>
            );
        }
        return (<></>);
    }

    // LEGEND
    const renderColorfulLegendText = (value: string, entry: any) => {
        return (
            <span style={{ color: "#596579", fontWeight: 500, fontSize: '0.9vw',  }}>
                {value}
            </span>
        );
    };

    return (
        <>
            <ResponsiveContainer style={{ maxWidth: '70%' }}>
                <PieChart
                    style={{ fontSize: "1vw" }}
                    margin={{
                        top: 0,
                        right: 0,
                        left: 0,
                        bottom: 0
                    }}
                    onMouseEnter={() => null}>
                    <Pie
                        data={props.data}
                        outerRadius="85%"
                        fill="#8884d8"
                        paddingAngle={1}
                        dataKey={Object?.keys(props.data[0])[1]}
                    >
                        {props.data.map((entry: any, index: any) =>{ 
                            return (
                            
                            <Cell key={`cell-${index}`} fill={props.color[index]} />
                        )})}
                    </Pie>
                    <Legend
                        iconType="circle"
                        layout="vertical"  // Change layout to vertical
                        verticalAlign="middle"  // Change verticalAlign to middle
                        align="right"  // Cha
                        iconSize={10}
                        formatter={renderColorfulLegendText}
                    />
                    <Tooltip content={<CustomTooltip />} />
                </PieChart>
            </ResponsiveContainer>
        </>
    )
}