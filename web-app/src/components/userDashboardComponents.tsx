"use client"
import React, { useState } from 'react'
import Image from "next/image";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Grid, Tooltip, Typography } from '@mui/material'
import calender from "@/assets/mingcute_calendar-fill.svg"
import InfoIcon from '@mui/icons-material/Info';
import dayjs from 'dayjs';
import LineChartComponent from './charts/lineChart';
import DashbaordTable from './dashbaordTable';
import PieChartComponent from './charts/pieChart';
import StackedBarChartComponent from './charts/stackBarChart';

function UserDashboardComponents({ dashboardData, setFromDateDashboard, setToDateDashboard, fromDateDashboard, toDateDashboard, viewForumAction, Page }: any) {

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const id = open ? 'simple-popper' : undefined;

    const handleFilterClick = (event: any) => setAnchorEl(anchorEl ? null : event.currentTarget);  //FILTER BUTTON CLICK FUNC
    function CustomCalendarIcon(props: any) {
        return (
            <Image src={calender} alt="calender" />
        );
    }

    return (
        <Grid container item xs={12} gap={2} justifyContent={'center'}>
            <Grid container item xs={11.4} sm={11.7} md={11.8} gap={2} justifyContent={'space-between'} >
                <Grid container item xs={12} sm={8.6} md={9.2} gap={2}>
                    <Grid container item xs={11.8} sm={5.5} md={3} >
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <Typography variant="caption" sx={{ fontWeight: "400" }}>FROM DATE</Typography>
                            <DatePicker
                                slotProps={{ textField: { size: 'small', } }}
                                slots={{
                                    openPickerIcon: CustomCalendarIcon
                                }}
                                sx={{
                                    borderRadius: "0.5vh", width: '100%'
                                }}
                                maxDate={dayjs(toDateDashboard)}
                                value={dayjs(fromDateDashboard)}
                                defaultValue={dayjs('2022-04-17')}
                                onChange={(newValue) => setFromDateDashboard(dayjs(newValue).format('YYYY-MM-DD'))}
                            />
                        </LocalizationProvider>
                    </Grid>
                    <Grid container item xs={12} sm={5.5} md={3} sx={{ backgroundColor: "transperant" }}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <Typography variant="caption" sx={{ fontWeight: "400" }}>TO DATE</Typography>
                            <DatePicker
                                slotProps={{ textField: { size: 'small', } }}
                                slots={{
                                    openPickerIcon: CustomCalendarIcon
                                }}
                                sx={{
                                    borderRadius: "0.5vh", width: '100%'
                                }}
                                disableFuture
                                maxDate={dayjs(new Date())}
                                minDate={dayjs(fromDateDashboard)}
                                value={dayjs(toDateDashboard)}
                                defaultValue={dayjs('2022-04-17')}
                                onChange={(newValue) => setToDateDashboard(dayjs(newValue).format('YYYY-MM-DD'))}
                            />
                        </LocalizationProvider>
                    </Grid>
                </Grid>
                <Grid container item xs={12} sm={3} md={2.5} alignItems={'flex-end'}>

                </Grid>
            </Grid>
            {
                dashboardData && Object.keys(dashboardData)?.map((itms: any, i: number) => {
                    if (itms === 'metrics') {
                        return (
                            <Grid container item key={i} xs={12} rowGap={2}>
                                {
                                    dashboardData[itms]?.map((sub_itms: any, i: any) => <MetricsCard key={i} item={sub_itms} />)
                                }
                            </Grid>
                        )
                    }
                    if (itms === 'charts') {
                        return (
                            <Grid container item key={i} xs={12} rowGap={2}>
                                {
                                    dashboardData[itms]?.map((sub_itms: any, i: any) => <ChartsCard key={i} item={sub_itms} Page={Page} />)
                                }
                            </Grid>
                        )
                    }
                    if (itms === 'pivots') {
                        return (
                            <Grid container item key={i} xs={12} rowGap={0}>
                                {
                                    dashboardData[itms]?.map((sub_itms: any, i: any) => <PivotCard key={i} item={sub_itms} Page={Page} />)
                                }
                            </Grid>
                        )
                    }
                })
            }
        </Grid>
    )
}

export default UserDashboardComponents



const MetricsCard = ({ item }: any) => {
    return (
        <Grid container item xs={12} sm={6} md={3} justifyContent={'center'}>
            <Grid container item xs={11.4} className='relative' direction={'column'} justifyContent={'center'} alignItems={'center'} sx={{ border: "0.2vh solid  #d9d9d9", borderRadius: "1vh" }}>
                <div className="absolute top-0 right-1 bg-lightblue cursor-pointer">
                    <Tooltip title={item?.description} placement='left' arrow>
                        <InfoIcon fontSize='small' sx={{ color: "#cccccc" }} />
                    </Tooltip>
                </div>
                <Typography variant='subtitle2' sx={{ fontWeight: 600, pt: 2, color: '#8c8c8c' }}>{item?.title}</Typography>
                <Typography variant='h5' sx={{ fontWeight: 600, pb: 2, color: '#2A2F42' }}>{item?.value}{item?.unit}</Typography>
            </Grid>
        </Grid>
    )
}

const ChartsCard = ({ item, Page }: any) => {
    const COLORS = [ '#36BCD0','#FEAFBC', '#E3F8FD', '#f6e386', '#d4e7a7', '#f87d8d', '#8fbof2', '#1bc2b0', '#3a73db'];
    return (
        <>
            {(item?.data).length > 0 ?
                <Grid container item xs={12} sm={6} justifyContent={'center'} sx={{ height: '30vh' }}>
                    <Grid container item xs={11.4} md={11.7} className='relative' direction={'column'} justifyContent={'center'} alignItems={'center'} sx={{ border: "0.2vh solid  #d9d9d9", borderRadius: "1vh" }}>
                        <div className="absolute top-0 right-1 bg-lightblue cursor-pointer">
                            <Tooltip title={item?.description} placement='left' arrow>
                                <InfoIcon fontSize='small' sx={{ color: "#cccccc" }} />
                            </Tooltip>
                        </div>
                        <div className="absolute top-0 left-1 bg-lightblue"><Typography variant='caption' sx={{ fontWeight: '600', color: '#2A2F42' }}>{item?.title}</Typography></div>
                        {/* {item?.type === 'pie_chart' && (item?.data).length > 0 ? <PieChartComponent data={item?.data} color={COLORS} /> : (Page == 'forum' || Page == 'company') && item?.type === 'stacked_bar' && (item?.data).length > 0 ? <StackedBarChartComponent data={item?.data} color={COLORS} title={item?.title} /> : (Page = 'user') && item?.type === 'stacked_bar' && (item?.data).length > 0 ? <LineChartComponent data={item?.data} color={COLORS} title={item?.title} /> : <span>{item?.type}</span>} */}
                        {item?.type === 'pie_chart' && (item?.data).length > 0 ? <PieChartComponent data={item?.data} color={COLORS} /> :  (item?.data).length > 0 ? <StackedBarChartComponent data={item?.data} color={COLORS} title={item?.title} />  : <span>{item?.type}</span>}
                    </Grid>
                </Grid>
                : null}
        </>
    )
}

const PivotCard = ({ item, Page }: any) => {
    return (
        <>
            {(item?.data).length > 0 &&
                <Grid container item xs={12} sm={6} justifyContent={'center'}>
                    <Grid container item xs={11.4} md={11.7} direction={'column'} minHeight={"30vh"}>
                        <Grid container item xs={1} justifyContent={"space-between"}>
                            <Typography variant='caption' sx={{ fontWeight: '600', color: '#2A2F42' }}>{item?.title}</Typography>
                            <div className="bg-lightblue cursor-pointer">
                                <Tooltip title={item?.description} placement='left' arrow>
                                    <InfoIcon fontSize='small' sx={{ color: "#cccccc" }} />
                                </Tooltip>
                            </div>
                        </Grid>
                        <Grid
                            container item xs={10}
                            justifyContent={'center'}
                            alignItems={'flex-start'}
                            sx={{
                                border: "0.2vh solid #d9d9d9",
                                borderRadius: "1vh",
                            }}
                        >
                            <DashbaordTable data={item?.data} Page={Page} />
                        </Grid>
                    </Grid>
                </Grid >
            }
        </>
    )
}