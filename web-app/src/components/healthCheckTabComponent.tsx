"use client"

import { Button, Grid, Tooltip, Typography } from "@mui/material";
import Brightness1Icon from '@mui/icons-material/Brightness1';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import DateFormats from "@/components/dateFormat";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import Image from "next/image";
import calender from "@/assets/mingcute_calendar-fill.svg"
import dayjs from "dayjs";
import { useState } from "react";

const HealthCheckTab = (props: any) => {

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
        <Grid container item xs={12} direction={"column"} className=" min-h-[34.927vw] b-[2.5vh] gap-3 pb-5">
            <Grid container item className="border-[0.1vw] border-solid border-[#D8D8D8] rounded-md p-5 sm:px-3" justifyContent={'center'} alignItems={'center'} >
                <Grid container item xs={12} className="gap-2" justifyContent={'center'}>
                    <Grid container item xs={12} sm={5.7} direction={'column'} justifyContent={'space-evenly'} alignItems={'center'}>
                        <Grid item sx={{ py: 2 }}>
                            <Typography variant="h5" sx={{ textAlign: 'center', fontWeight: '600' }}>Health Check</Typography>
                        </Grid>
                        <Grid item sx={{ py: 2 }}>
                            <Typography variant="subtitle2" sx={{ textAlign: 'center', fontWeight: '500' }}>
                                Complete daily forum tracking to ensure employees <br />
                                are getting the most of the forum experience
                            </Typography>
                        </Grid>
                        <Grid item justifyContent={'center'} sx={{ py: 1.5 }}>
                            <Button variant="contained" fullWidth sx={{ backgroundColor: '#2A2F42 !important', textTransform: "initial", color: "#F0F2FF" }}>Take Survey</Button>
                        </Grid>
                    </Grid>
                    <Grid container item xs={12} sm={5.85} className='border-[0.1vw] border-solid border-[#FFFFFF] bg-gray-100 rounded-md flex items-center justify-center py-12'>
                        <Grid container item xs={12} sm={10} md={12} justifyContent={'center'} alignItems={'center'}>
                            <Typography variant="h5" sx={{ color: "#676767", fontWeight: "600", textAlign: 'center' }}>
                                {props.Page == 'forum' ? "Forum Momentum" : "User Momentum"} &nbsp;
                                <Brightness1Icon fontSize="small" sx={{ color: (((props?.consolidatedHealth || 0) / 10) * 100) <= 50.00 ? "#fa8072 " : (((props?.consolidatedHealth || 0) / 10) * 100) >= 51.00 && (((props?.consolidatedHealth || 0) / 10) * 100) <= 80.00 ? "#EDD86D" : "#6EE3AB" }} />
                            </Typography>&nbsp;
                            <Typography variant="h5" sx={{ color: 'black', fontWeight: "700", mt: '0.2vh', textAlign: 'center' }}>
                                {props?.consolidatedHealth || 0 > 0 ? Math.round(props?.consolidatedHealth / 10 * 100) : 0}%
                            </Typography>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>

            <Grid container item gap={2} justifyContent={'space-between'} >
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
                                maxDate={dayjs(props?.toDateHealth)}
                                value={dayjs(props?.fromDateHealth)}
                                defaultValue={dayjs('2022-04-17')}
                                onChange={(newValue) => props?.setFromDateHealth(dayjs(newValue).format('YYYY-MM-DD'))}
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
                                minDate={dayjs(props?.fromDateHealth)}
                                value={dayjs(props?.toDateHealth)}
                                defaultValue={dayjs('2022-04-17')}
                                onChange={(newValue) => props?.setToDateHealth(dayjs(newValue).format('YYYY-MM-DD'))}
                            />
                        </LocalizationProvider>
                    </Grid>
                </Grid>
                <Grid container item xs={12} sm={3} md={2.5} alignItems={'flex-end'}>

                </Grid>
            </Grid>
            <Grid container item gap={2}>
                {
                    props?.healthCheckForMember.map((item: any, i: number) => {
                        console.log("healthCheckForMember", props?.healthCheckForMember)
                        return (
                            <>
                                <Grid key={i} container item className="border-[0.1vw] border-solid border-[#D8D8D8]  rounded-md " justifyContent={'center'} >
                                    <Grid container item xs={11.5} >
                                        <Grid container item xs={5} sm={5} md={4} lg={5} direction={'column'} justifyContent={'flex start'} alignItems={'center'} sx={{ py: 1 }}>
                                            <Grid container item xs={6} className="text-[0.9vw] font-bold" alignItems={'flex-end'}>
                                                <Typography variant="body1" sx={{ fontWeight: '600' }}>{DateFormats(item.date, false)}</Typography>
                                            </Grid>
                                            <Grid container item xs={5} className="text-[0.8vw] font-thin">
                                                <Typography variant="caption" sx={{ fontWeight: '500' }}>
                                                    {new Date(item.updatedAt).toLocaleString("en-US", { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' } )}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                        <Grid container item xs={5} sm={5} md={4} lg={3} justifyContent={'space-between'} alignItems={'center'} >
                                            <Grid container item xs={8}>
                                                {
                                                    item?.forum_info
                                                        ? item?.forum_info?.forum_name.length > 18 ? (
                                                            <Tooltip title={item?.forum_info?.forum_name} arrow>
                                                                <Typography variant="body1" sx={{ fontWeight: '600' }}>{`${item?.forum_info?.forum_name.substring(0, 18)}...`}</Typography>
                                                            </Tooltip>
                                                        ) : (
                                                            <Typography variant="body1" sx={{ fontWeight: '600' }} >{item?.forum_info?.forum_name}</Typography>
                                                        )
                                                        : null
                                                }
                                                <br />
                                                <Typography variant="caption" >
                                                    Health Score
                                                </Typography>
                                            </Grid>
                                            <Grid container item xs={4}>
                                                <Typography variant="body1" sx={{ color: "black", fontWeight: "600", display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                    <Brightness1Icon sx={{ fontSize: 15, color: (((item?.health || 0) / 10) * 100) <= 50 ? "#fa8072 " : (((item?.health || 0) / 10) * 100) >= 51 && (((item?.health || 0) / 10) * 100) <= 80 ? "#EDD86D" : "#6EE3AB" }} /> &nbsp; {(item.health || 0) > 0 ? Math.round(item.health / 10 * 100) : 0}%
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    {/*Below edit button will use in Future  */}
                                        <Grid container item xs={2} sm={2} md={4} lg={4} justifyContent={'flex-end'} alignItems={'center'}>
                                            {/* {props.viewForumAction || props.viewCompanyAction || props.viewUserAction ?
                                                <ModeEditIcon fontSize="large" sx={{ backgroundColor: '#5F83ED', color: 'white', p: 1, borderRadius: '0.5vw', cursor: 'pointer' }} onClick={() => { props.Page == 'forum' ? props?.handleOpen(dayjs(item?.date).format('YYYY-MM-DD')) : props?.handleOpenUser(item?.uuid) }} /> : null
                                            } */}
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </>
                        )
                    })
                }
            </Grid>
        </Grid>
    )
};

export default HealthCheckTab