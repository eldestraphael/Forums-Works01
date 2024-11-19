'use client'
import { Autocomplete, Button, Grid, TextField, Typography, CircularProgress, FormHelperText } from "@mui/material";
import SnakBarAlert from "@/components/snakbaralert/snakbaralert";
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import React, { useEffect, useState } from 'react'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs from "dayjs";
import BackDropLoading from '@/components/loading/backDropLoading';
import { useRouter, useSearchParams } from 'next/navigation';
import { renderTimeViewClock } from '@mui/x-date-pickers/timeViewRenderers';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import TimeZone from "@/app/util/timeZoneDisplay";
import { StaticMessage } from "@/app/util/StaticMessage";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import Image from "next/image";
import calender from "@/assets/mingcute_calendar-fill.svg"
import GetTimeZoneOffset from "@/app/util/getTimeZoneOFFset";
import { GetDayTimeInTimezone } from "@/app/util/GetDayTimeInTimeZone";
import getUTCForDay from "@/app/util/getUTCdayfromLocalTimeZone";

export default function AddForum(props: any) {

    //CONVERTS LOCAL TIME TO UTC
    const LocalToUTC = (newValue: any) => {
        let localTime = new Date(newValue?.$d);
        let utcTime = localTime.toISOString();
        let timeOnly = utcTime.slice(11, 19);
        return timeOnly
    }

    //CONVERTS CURRENT TIME TO MULTIPLE OF 5
    const adjustToNearestFiveMinutes = (date: any) => {
        const minutes = date.minute();
        const adjustedMinutes = Math.ceil(minutes / 5) * 5;
        return date.minute(adjustedMinutes).second(0);
    };

    const addSevenDays = (date: any) => date.add(7, 'day'); //ADD 7 DAYS TO THE DEFAULT DATE

    const { push } = useRouter();
    const searchParams = useSearchParams()
    const [companyOption, setCompanyOption] = useState<any>([]);
    const [companyValue, setCompanyValue] = useState<any>(null);
    const [defaultTime, setDefaultTime] = React.useState(adjustToNearestFiveMinutes(dayjs()));
    const [selectedDates, setSelectedDates] = useState<any>(LocalToUTC(adjustToNearestFiveMinutes(dayjs())));
    const [seletedDay, setSeletedDay] = useState<any>(new Date().toLocaleDateString('en-US', { weekday: 'long' }));
    const [alertOpen, setAlertOpen] = useState(false);
    const [alert, setAlert] = useState("");
    const [alertSeverity, setAlertSeverity] = useState(false);
    const [Loader, setLoader] = useState(false);
    const [isLoading, setisLoading] = useState(false);
    const [selectedCompanyError, setSelectedCompanyError] = useState(false);
    const [formData, setFormData] = useState({ ForumName: '' });
    const [errors, setErrors] = useState({ ForumName: '' });
    const [selectedCourseError, setSelectedCourseError] = useState(false);
    const [selectedModuleError, setSelectedModuleError] = useState(false);
    const [courseOption, setCourseOption] = useState<any>([]);
    const [courseValue, setCourseValue] = useState<any>(null);
    const [chapterValue, setChapterValue] = useState<any>(null)
    const [chapterOption, setChapterOption] = useState<any>([]);
    const [startDate, setStartDate] = useState<any>(addSevenDays(dayjs()));
    const [currentPage, setCurrentPage] = useState(searchParams.get('page') || 1);
    const [allUserOption, setAllUserOption] = useState<any>([]);
    const [allUserValue, setAllUserValue] = useState<any>([]);
    const [selecteduserError, setSelectedUserError] = useState(false);
    const [isAutocompletLoading, setIsAutocompletLoading] = useState(false);
    const [isFreeSoloCondition, setIsFreeSoloCondition] = useState(true);
    const [isCompanySearchLoading, setIsCompanySearchLoading] = useState(false);
    const [isCourseSearchLoading, setIsCourseSearchLoading] = useState(false);
    const [isChapterSearchLoading, setIsChapterSearchLoading] = useState(false);
    const [meetingTimeError, setMeetingTimeError] = useState(false);
    const [startingDateError, setStartingDateError] = useState(false);
    // const [reqBodyMeetingTime, setReqBodyMeetingTime] = useState("");
    // const [reqBodyMeetingDay, setReqBodyMeetingDay] = useState("");
    // const [reqBodyStartingDate, setReqBodyStartingDate] = useState("");


    // HANDLE CHANGE
    const handleChange = (e: any) => {
        const { name, value } = e.target;
        let error = '';
        let maxLength = 50;
        const formattedName = name
            .replace(/([A-Z])/g, ' $1')
            .trim()
            .toLowerCase()
            .replace(/^./, (str: any) => str.toUpperCase());
        if (value.length <= maxLength) {
            setFormData({ ...formData, [name]: value });
        } else {
            error = `${formattedName} must be ${maxLength} characters or less`;
        }
        setErrors({ ...errors, [name]: error });
    };

    // HANDLE BLUR
    const handleBlur = (e: any) => {
        const { name, value } = e.target;
        let error = '';
        const formattedName = name
            .replace(/([A-Z])/g, ' $1')
            .trim()
            .toLowerCase()
            .replace(/^./, (str: any) => str.toUpperCase());
        error = value.trim() === '' ? `${formattedName} is required` : '';
        setErrors({ ...errors, [name]: error });

    };

    // GETTING COMPANY DROPDOWN DATA
    async function handleSearch() {
        setIsCompanySearchLoading(true)
        try {
            const response = await fetch(`/api/admin/company/search?q=`, {
                method: "GET",
                cache: 'no-store',
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const data = await response.json();
            if (response.status == 200) {
                const updatedItems = data?.data.map((item: any) => {
                    return { label: item.company_name, uuid: item.uuid };
                });
                setCompanyOption(updatedItems);
                setIsCompanySearchLoading(false);
            }
            else {
                AlertManager(StaticMessage.ErrorMessage, true);
            }
        }
        catch (error: any) {
            AlertManager(StaticMessage.ErrorMessage, true);
        }
    }

    // GETTING COURSE API
    async function handleCourse() {
        setIsCourseSearchLoading(true);
        const courseApi = await fetch(`/api/course?limit=100000&isDropdown=true`, {
            method: "GET",
            cache: 'no-store',
            headers: {
                "Content-Type": "application/json",
            },
        });
        const data = await courseApi.json();

        if (courseApi.status == 200) {
            const courseItem = data?.data.map((item: any) => {
                return { label: item.course_info.name, uuid: item.course_info.uuid };
            });
            setCourseOption(courseItem);
            setIsCourseSearchLoading(false);
        }
    }

    //SAVE BUTTON API CALL
    const handleSave = async (e: any) => {

        let localTime = new Date(defaultTime.$d);
        let time_part = localTime.toLocaleTimeString([], { hour12: false });
        // console.log("time_part",time_part)
        let timeZone = GetTimeZoneOffset();
        // console.log("timeZone",timeZone)
        // console.log(" seletedDay", seletedDay)
            
        let dayAndTime = GetDayTimeInTimezone(time_part, seletedDay, dayjs(startDate).format('YYYY-MM-DD'), timeZone, "GMT+0000"); // Pass the date part as an argument
        const utcDay = getUTCForDay(seletedDay, timeZone,time_part);

        const requestBody = {
            forum_name: formData.ForumName,
            meeting_day: utcDay,
            meeting_time: LocalToUTC(defaultTime),
            company_uuid: companyValue?.uuid,
            course_uuid: courseValue?.uuid,
            chapter_uuid: chapterValue?.uuid,
            starting_date: dayAndTime?.UTCDate + ' ' + LocalToUTC(defaultTime),
            user_uuids: allUserValue.map((item: any) => item.uuid)
        }
        if (!formData.ForumName.length || !seletedDay.length || selectedDates == undefined || !Object.keys(companyValue ?? {}).length || !Object.keys(courseValue ?? {}).length) {
            AlertManager("Kindly fill all fields", true);
        }
        else {
            setLoader(true)
            try {
                const res = await fetch(`/api/admin/forum`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(requestBody),
                });
                const data = await res.json();
                if (res.status == 200) {
                    push("/forums");
                }
                else {
                    AlertManager("Forum did not added", true)
                }
            }
            catch (error: any) {
                AlertManager(StaticMessage.ErrorMessage, true);
            }
        }
    }

    //HANDLECOURSE CLICK
    function handleCourseClick(event: any, value: any) {
        setCourseValue(value);
        setChapterValue(null);
        setSelectedCourseError(false);
        if (value?.uuid) {
            handleChapter(value);
        }
    }

    // HANDLECOMPANY CLICK
    function handlecompanyClick(event: any, value: any) {
        setCompanyValue(value);
        setAllUserValue([]);
        setSelectedCompanyError(false);
    }

    //HANDLE CHAPTER
    async function handleChapter(value: any) {
        setIsChapterSearchLoading(true);
        const chapterApi = await fetch(`/api/course/${value?.uuid}?isDropdown=true`, {
            method: "GET",
            cache: 'no-store',
            headers: {
                "Content-Type": "application/json",
            },
        });

        const responseChapter = await chapterApi.json();
        const chapterItem = responseChapter?.data?.course_info?.chapter_info.map((item: any) => {
            return { label: item.name, uuid: item.uuid };
        });
        setChapterOption(chapterItem??[]);
        setIsChapterSearchLoading(false);
    }

    // GETALLUSERAPI
    async function getAllUsersAPI(companyValue: any, newInputValue: any) {
        setIsFreeSoloCondition(false);
        setIsAutocompletLoading(true);
        try {
            const getAllUsers_API = await fetch(`/api/user?${newInputValue.length ? `search=${newInputValue}` : ''}&company=${companyValue?.uuid}&page=${currentPage}&limit=100000&isDropdown=true`, {
                method: 'GET',
                cache: 'no-store',
                headers: {
                    "Content-Type": "application/json",
                },
            })
            const getAllUsersAPI_Response = await getAllUsers_API.json();
            if (getAllUsers_API.status == 200) {

                AlertManager(getAllUsersAPI_Response?.message, false);
                const all_user = getAllUsersAPI_Response?.data?.map((item: any) => {
                    return { label: `${item.user_info.first_name} ${item.user_info.last_name}`, uuid: item.user_info.uuid };
                })
                setAllUserOption(all_user);
                setCurrentPage(getAllUsersAPI_Response?.page_meta?.current)
                setIsAutocompletLoading(false);
            }
            else {
                AlertManager(getAllUsersAPI_Response?.message, true);
                setIsAutocompletLoading(false);
            }
        }
        catch (error: any) {
            AlertManager(StaticMessage.ErrorMessage, true);
            setIsAutocompletLoading(false);
        }
    }

    function AlertManager(message: string, severity: boolean) {
        setAlert(message)
        setAlertSeverity(severity)
        setAlertOpen(true)
        setisLoading(false);
        setLoader(false);
        setIsCompanySearchLoading(false);
    }

    function CustomCalendarIcon(props: any) {
        return (
            <Image src={calender} alt="calender" />
        );
    }

    let userFinishedTyping = false; // Initialize a flag to track whether the user has finished typing   
    let debounceTimer: NodeJS.Timeout | null = null;  // Initialize a variable to store the timer ID

    // Custom debounce function
    const customDebounce = (callback: () => void, delay: number) => {
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }
        debounceTimer = setTimeout(callback, delay);
    };

    //DISABLE PREV DATES IN DATE PICKER
    const currentDate = new Date();
    // Map for days of the week
    const dayOfWeekMap: any = {
        'Sunday': 0,
        'Monday': 1,
        'Tuesday': 2,
        'Wednesday': 3,
        'Thursday': 4,
        'Friday': 5,
        'Saturday': 6
    };

    // Combine logic to disable past dates, weekends, and enable only specified day if 'day' is set
    const isDateDisabled = (date: any) => {
        const dayIndex = date.day();
        // if (seletedDay && dayOfWeekMap[seletedDay] !== undefined) {
        //     return date.isBefore(currentDate, 'day') || date.isSame(currentDate, 'day') || dayIndex !== dayOfWeekMap[seletedDay];
        // }
        return date.isBefore(currentDate, 'day') || date.isSame(currentDate, 'day') || dayIndex === 0 || dayIndex === 6; // Disable past dates, today, and weekends
    };

    //ERROR HANDLING FOR MEETING TIME
    const handleMeetingTimeError = (reason: any) => {
        if (reason === 'minutesStep') {
            setMeetingTimeError(true);
        } else {
            setMeetingTimeError(false);
        }
    };

    //ERROR HANDLING FOR STARTNIG DATE
    // const handleStartingDateError = (date: any, seletedDayParams: any) => {
    //     const dayIndex = dayjs(date).day();
    //     if (seletedDayParams && dayIndex !== dayOfWeekMap[seletedDayParams]) {
    //         setStartingDateError(true);
    //     } else {
    //         setStartingDateError(false);
    //     }
    // };

    return (
        <div className="ml:0 lg:ml-[17.35vw]" style={{ backgroundColor: "#F6F5FB", paddingBottom: '5vh', minHeight: '100vh' }}>
            <Grid container item xs={12} justifyContent={'flex-start'} alignItems={'center'} sx={{ pt: 3, pb: 1, pl: 3, pr: 10 }}>
                <Grid container item xs={12} lg={6} alignItems={'center'}>
                    <BreadCrumComponent push={push} formData={formData} />
                </Grid>
            </Grid>
            {props.addForumAction[1].read &&
                <Grid container item xs={12} justifyContent={'flex-start'} alignItems={'center'} sx={{ pl: 3 }}>
                    <Grid container item xs={11.5} alignItems={'center'} justifyContent={'center'} sx={{ backgroundColor: 'white', borderRadius: '2vh', p: 2 }} >
                        <Grid container item xs={12} justifyContent={'center'} alignItems={'flex-start'} sx={{ pt: 2 }}>
                            <Grid container item xs={11.7} sm={11} md={8} lg={7} justifyContent={'center'} sx={{ border: "1px solid #dedede", borderRadius: "2vh", p: 2, marginBottom: "3vh" }}>
                                <Grid item xs={12} sx={{ color: "#777", m: "1vh" }}>
                                    <Typography variant="caption">FORUM NAME</Typography>
                                    <TextField
                                        fullWidth
                                        placeholder="Enter a forum name"
                                        name='ForumName'
                                        type='text'
                                        size="small"
                                        value={formData.ForumName}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={!!errors.ForumName}
                                        helperText={errors.ForumName}
                                        InputProps={{ sx: { borderRadius: "1vh", color: "#2A2F42", maxLength: 51 } }}
                                    />
                                </Grid>

                                <Grid container item md={12} sx={{ color: "#777", m: "1vh" }} justifyContent={'space-between'} alignItems={'flex-start'}>
                                    <Grid container item xs={12} sm={5.7} direction={'column'} sx={{ backgroundColor: 'white', }}>
                                        <Typography variant="caption" sx={{ color: "#5F5F5F" }}>MEETING DAY</Typography>
                                        <Select
                                            fullWidth
                                            size="small"
                                            id="demo-select-small"
                                            sx={{ borderRadius: '1vh' }}
                                            value={seletedDay}
                                            name={seletedDay}
                                            onChange={(e: any) => {
                                                console.log("selectedday",e.target.value);
                                                setSeletedDay(e.target.value);
                                                // handleStartingDateError(dayjs(startDate), e.target.value);
                                            }}>
                                            {
                                                ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((itm: any, i: number) => {
                                                    return <MenuItem key={i} value={itm}> {itm} </MenuItem>
                                                })
                                            }
                                        </Select>
                                    </Grid>
                                    <Grid container item xs={12} sm={5.7} direction={'column'} justifyContent={'flex-end'} sx={{ backgroundColor: 'white', }}>
                                        <Typography variant="caption" sx={{ color: "#5F5F5F" }}>MEETING TIME &nbsp;{TimeZone()}</Typography>
                                        <LocalizationProvider dateAdapter={AdapterDayjs} >
                                            <TimePicker
                                                value={defaultTime}
                                                onChange={(newValue: any) => {
                                                    let localTime = new Date(newValue?.$d);
                                                    let time_part = localTime.toLocaleTimeString([], { hour12: false });
                                                    setDefaultTime(dayjs(time_part, 'HH:mm:ss'));
                                                }}
                                                sx={{
                                                    width: '100%', // Set full width
                                                    '& .MuiInputBase-root': {
                                                        padding: 0.96,
                                                        borderRadius: '1vh'
                                                    },
                                                    '& .MuiOutlinedInput-input': {
                                                        padding: '0vw', // Adjust padding as needed
                                                        backgroundColor: 'transparent'
                                                    },
                                                }}
                                                viewRenderers={{
                                                    hours: renderTimeViewClock,
                                                    minutes: renderTimeViewClock,
                                                    seconds: renderTimeViewClock,
                                                }}
                                                minutesStep={5}
                                                onError={handleMeetingTimeError}
                                            />
                                            {meetingTimeError && (
                                                <FormHelperText error>
                                                    Choose a meeting time in multiples of 5 mins
                                                </FormHelperText>
                                            )}
                                        </LocalizationProvider>
                                    </Grid>
                                </Grid>
                                <Grid container item md={12} sx={{ color: "#777", m: "1vh" }} justifyContent={'space-between'} alignItems={'flex-start'}>
                                    <Grid container item xs={12} sm={5.7} direction={'column'} sx={{ backgroundColor: 'white', }}>
                                        <Typography variant="caption">COMPANY NAME</Typography>
                                        <Autocomplete
                                            fullWidth
                                            size="small"
                                            disablePortal
                                            id="combo-box-demo"
                                            loading={isCompanySearchLoading}
                                            options={companyOption}
                                            value={companyValue}
                                            renderInput={(params) => <TextField {...params} placeholder="Choose a company name" error={selectedCompanyError} helperText={selectedCompanyError ? "Company name is required" : ''} sx={{ "& .MuiOutlinedInput-root": { borderRadius: "1vh" } }} />}
                                            isOptionEqualToValue={(option, value) => option === value || option.label === value.label}
                                            onBlur={() => setSelectedCompanyError(companyValue == null)}
                                            onChange={handlecompanyClick}
                                            onOpen={handleSearch}
                                        />
                                    </Grid>

                                    <Grid container item xs={12} sm={5.7} direction={'column'} sx={{ backgroundColor: 'white', }}>
                                        <Typography variant="caption">COURSE NAME</Typography>
                                        <Autocomplete
                                            fullWidth
                                            size="small"
                                            disablePortal
                                            id="combo-box-demo"
                                            loading={isCourseSearchLoading}
                                            options={courseOption}
                                            value={courseValue}
                                            renderInput={(params) => <TextField {...params} placeholder="Choose a course name" error={selectedCourseError} helperText={selectedCourseError ? "Course name is required" : ''} sx={{ "& .MuiOutlinedInput-root": { borderRadius: "1vh" } }} />}
                                            isOptionEqualToValue={(option, value) => option === value || option.label === value.label}
                                            onBlur={() => setSelectedCourseError(courseValue == null)}
                                            onChange={handleCourseClick}
                                            onOpen={handleCourse}
                                        />
                                    </Grid>
                                </Grid>
                                <Grid container item md={12} sx={{ color: "#777", m: "1vh" }} justifyContent={'space-between'} alignItems={'flex-start'}>
                                    <Grid container item xs={12} sm={5.7} direction={'column'} >
                                        <Typography variant="caption">STARTING CHAPTER (Optional)</Typography>
                                        <Autocomplete
                                            fullWidth
                                            size="small"
                                            disablePortal
                                            id="combo-box-demo"
                                            loading={isChapterSearchLoading}
                                            options={chapterOption}
                                            value={chapterValue}
                                            renderInput={(params) => <TextField {...params} placeholder="Choose a starting chapter" error={selectedModuleError} sx={{ "& .MuiOutlinedInput-root": { borderRadius: "1vh" } }} />}
                                            isOptionEqualToValue={(option, value) => option === value || option.label === value.label}
                                            onChange={(event, value) => { setChapterValue(value); setSelectedModuleError(false) }}
                                        />

                                    </Grid>
                                    <Grid container item xs={12} sm={5.7} direction={'column'} >
                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <Typography variant="caption">STARTING DATE</Typography>
                                            <DatePicker
                                                disablePast
                                                shouldDisableDate={(date) => isDateDisabled(dayjs(date))}
                                                slotProps={{ textField: { size: 'small', } }}
                                                slots={{
                                                    openPickerIcon: CustomCalendarIcon
                                                }}
                                                sx={{
                                                    width: '100%',
                                                    "& .MuiOutlinedInput-root": {
                                                        borderRadius: "1vh",
                                                    }
                                                }}
                                                value={dayjs(startDate)}
                                                // onError={() => handleStartingDateError(dayjs(startDate), seletedDay)}
                                                onChange={(newValue) => {
                                                    setStartDate(dayjs(newValue).format('YYYY-MM-DD'));
                                                }}
                                            />
                                            {startingDateError && (
                                                <FormHelperText error>
                                                    Choose date that falls on the same day as {seletedDay}
                                                </FormHelperText>
                                            )}
                                        </LocalizationProvider>
                                    </Grid>
                                    <Grid container item xs={12} direction={'column'} sx={{ mt: '1.5vh' }}>
                                        <Typography variant="caption">{`FORUM MEMBERS (Optional)`}</Typography>
                                        <Autocomplete
                                            fullWidth
                                            multiple
                                            size="small"
                                            id="tags-outlined"
                                            options={allUserOption}
                                            value={allUserValue}
                                            loading={isAutocompletLoading}
                                            freeSolo={allUserOption.length == 0 && isFreeSoloCondition}
                                            isOptionEqualToValue={(option, value) => option.label === value.label}
                                            renderInput={(params) => (<TextField{...params} placeholder="Search forum member's name" error={selecteduserError} helperText={selecteduserError ? "Forum members is required" : ''} sx={{ "& .MuiOutlinedInput-root": { borderRadius: "1vh" } }} />)}
                                            onBlur={() => {
                                                // setSelectedUserError(allUserValue.length === 0)
                                                setAllUserOption([]);
                                                setIsFreeSoloCondition(true);

                                            }}
                                            onChange={(event: any, newValue: any) => {
                                                setAllUserValue(newValue);
                                                setAllUserOption([]);
                                                setIsFreeSoloCondition(true);
                                                setSelectedUserError(false);
                                            }}
                                            onInputChange={(event, newInputValue) => {
                                                if (companyValue && event.type === 'change') {
                                                    if (newInputValue.length == 0) {
                                                        setIsFreeSoloCondition(true);
                                                    }
                                                    if (newInputValue && newInputValue.trim()) {
                                                        userFinishedTyping = false; // Reset the flag when user starts typing
                                                        customDebounce(() => {
                                                            if (!userFinishedTyping) {
                                                                getAllUsersAPI(companyValue, newInputValue);
                                                                userFinishedTyping = true; // Mark the user as finished typing
                                                            }
                                                        }, 1500); // Adjust the delay as needed
                                                    } else {
                                                        setAllUserOption([]);
                                                        userFinishedTyping = true; // Mark the user as finished typing
                                                    }
                                                }
                                            }}
                                        />
                                    </Grid>
                                </Grid>
                                <Grid item xs={10} sm={4} md={4} lg={3} sx={{ mx: "1vh", my: "3vh" }}>
                                    {props.addForumAction[0].create &&
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            disabled={!formData.ForumName || !companyValue || !courseValue || meetingTimeError}
                                            sx={{ backgroundColor: "#2A2F42", borderRadius: "1vh", color: "#F0F2FF", fontWeight: "700", '&:hover': { backgroundColor: '#2A2F42' } }}
                                            onClick={handleSave}
                                        >
                                            {Loader ? <> &nbsp; <CircularProgress sx={{ color: "white" }} size={20} />
                                            </> : "ADD FORUM"}
                                        </Button>
                                    }
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            }
            <SnakBarAlert alertOpen={alertOpen} setAlertOpen={setAlertOpen} alertSeverity={alertSeverity} alert={alert} />
            <BackDropLoading isLoading={isLoading} />
        </div >
    )
}

// Breadcrum component
const BreadCrumComponent = ({ push }: any) => {
    return (
        <>
            <Typography variant="h6" sx={{ fontWeight: '600', cursor: 'pointer' }} onClick={(() => push("/forums"))}>All Forums</Typography>
            <KeyboardArrowRightIcon />
            <Typography variant="subtitle1" sx={{ fontWeight: '500', }}>Add Forum</Typography>
        </>
    )
}
