'use client'
import { Autocomplete, Button, Grid, TextField, Typography, CircularProgress, Link, FormHelperText } from "@mui/material";
import SnakBarAlert from "@/components/snakbaralert/snakbaralert";
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import React, { useEffect, useRef, useState } from 'react'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs from "dayjs";
import BackDropLoading from '@/components/loading/backDropLoading';
import { useRouter, useSearchParams } from 'next/navigation';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { renderTimeViewClock } from '@mui/x-date-pickers/timeViewRenderers';
import HealthCheckTab from "@/components/healthCheckTabComponent";
import UserDashboardComponents from "@/components/userDashboardComponents";
import EditMemberHealthCheck from "@/components/editMemberHealthCheck";
import HealthCheck from "@/components/healthCheck";
import TimeZone from "@/app/util/timeZoneDisplay";
import { StaticMessage } from "@/app/util/StaticMessage";
import Image from "next/image";
import calender from "@/assets/mingcute_calendar-fill.svg"
import GetTimeZoneOffset from "@/app/util/getTimeZoneOFFset";
import { GetDayTimeInTimezone } from "@/app/util/GetDayTimeInTimeZone";
import { start } from "repl";
import getLocalDayFromUTC from "@/app/util/getDayForTimeZone";
import getUTCForDay from "@/app/util/getUTCdayfromLocalTimeZone";
import ForumSurveyCard from "@/components/surveys/forumSurveys/forumSurveyCard";

export default function EditForum(props: any) {

    const { push } = useRouter();
    const handleClose = () => setOpen(false);
    const searchParams = useSearchParams()
    const [open, setOpen] = useState(false);
    const [alertOpen, setAlertOpen] = useState(false);
    const [alert, setAlert] = useState("");
    const [alertSeverity, setAlertSeverity] = useState(false);
    const [Loader, setLoader] = useState(false);
    const [isLoading, setisLoading] = useState(false);
    const [isLinkLoading, setIsLinkLoading] = useState(false);
    const [profileToggle, setProfileToggle] = useState<String>(props?.page_props?.searchParams?.tab || "info");
    const [companyOption, setCompanyOption] = useState<any>([]);
    const [companyValue, setCompanyValue] = useState<any>(null);
    const [defaultDate, setDefaultDate] = React.useState<any>(dayjs());
    const [selectedDates, setSelectedDates] = useState<any>('');
    const [seletedDay, setSeletedDay] = useState<any>('');
    const [selectedCompanyError, setSelectedCompanyError] = useState(false);
    const [selectedCourseError, setSelectedCourseError] = useState(false);
    const [selectedModuleError, setSelectedModuleError] = useState(false);
    const [formData, setFormData] = useState({ ForumName: '' });
    const [errors, setErrors] = useState({ ForumName: '' });
    const [enableForumExp, setEnableForumExp] = useState(false);
    const [healthCheckForMember, setHealthCheckForMember] = useState<any>([]);
    const [consolidatedHealth, setConsolidatedHealth] = useState<number>();
    const [dashboardData, setDashboardData] = useState<any>([]);
    const [healthuuid, sethealthuuid] = useState('');
    const [fromDateDashboard, setFromDateDashboard] = useState<any>(dayjs(new Date()).subtract(1, 'year').format('YYYY-MM-DD'));
    const [toDateDashboard, setToDateDashboard] = useState<any>(dayjs(new Date()));
    const [fromDateHealth, setFromDateHealth] = useState<any>(dayjs(new Date()).subtract(1, 'year').format('YYYY-MM-DD'));
    const [toDateHealth, setToDateHealth] = useState<any>(dayjs(new Date()));
    const [dateValue, setDateValue] = useState<any>(dayjs(new Date()));
    const [memberInfo, setMemberInfo] = useState<any>([]);
    const [healthBtnToggle, setHealthBtnToggle] = useState(false);
    const [accordionCardLoadingOnDateChange, setAccordionCardLoadingOnDateChange] = useState(false);
    const [courseOption, setCourseOption] = useState<any>([]);
    const [courseValue, setCourseValue] = useState<any>(null);
    const [chapterValue, setChapterValue] = useState<any>(null)
    const [chapterOption, setChapterOption] = useState<any>([]);
    const [startDate, setStartDate] = useState<any>(dayjs(new Date()));
    const [allUserOption, setAllUserOption] = useState<any>([]);
    const [allUserValue, setAllUserValue] = useState<any>([]);
    const [allUserValueDuplicate, setAllUserValueDupliacte] = useState<any>([]);
    const [selecteduserError, setSelectedUserError] = useState(false);
    const [currentPage, setCurrentPage] = useState(searchParams.get('page') || 1);
    const [reqBodyData, setReqBodyData] = useState<any>({});
    const [isAutocompletLoading, setIsAutocompletLoading] = useState(false);
    const [isFreeSoloCondition, setIsFreeSoloCondition] = useState(true);
    const [isCompanySearchLoading, setIsCompanySearchLoading] = useState(false);
    const [isCourseSearchLoading, setIsCourseSearchLoading] = useState(false);
    const initialDashboardRender = useRef(true);
    const initialHealthCheckRender = useRef(true);
    const initialSurveyRender = useRef(true);
    const [meetingTimeError, setMeetingTimeError] = useState(false);
    const [startingDateError, setStartingDateError] = useState(false);
    const [forumExperianceBtnLoading, setForumExperianceBtnLoading] = useState(false);
    const [forumSurveys, setForumSurveys] = useState<{ uuid: string, name: string, created_at: string, completed_on: string }[]>([]);


    //HANDLE CHANGE
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
            setReqBodyData({ ...reqBodyData, forum_name: e.target.value })
        } else {
            error = `${formattedName} must be ${maxLength} characters or less`;
        }
        setErrors({ ...errors, [name]: error });
    };

    //HANDLE BLUR
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

    //GETTING COMPANY DROP DOWN VALUE
    async function handleSearch() {
        setIsCompanySearchLoading(true); try {
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

    //SAVE BUTTON API FUNCTION
    const handleEditForum = async () => {

        if (!formData.ForumName.length || !seletedDay.length || !companyValue || !courseValue) {
            AlertManager("Kindly fill all fields", true);
        }
        else {
            setLoader(true)
            try {
                const res = await fetch(`/api/forum/${props?.page_props?.params?.forum_uuid}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(reqBodyData),
                });
                const data = await res.json();
                if (res.status == 200) {
                    push("/forums");
                }
                else {
                    AlertManager(StaticMessage.ErrorMessage, true);
                }
            }
            catch (error: any) {
                AlertManager(StaticMessage.ErrorMessage, true);
            }
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
        }
        setIsCourseSearchLoading(false);

    }

    // HANDLECOMPANY CLICK
    function handlecompanyClick(event: any, value: any) {
        setCompanyValue(value);
        setReqBodyData({ ...reqBodyData, company_uuid: value?.uuid })
        setAllUserValue([]);
        setSelectedCompanyError(false);
    }

    //HANDLCOURSE CLICK
    function handleCourseClick(event: any, value: any) {
        setCourseValue(value);
        setReqBodyData({ ...reqBodyData, course_uuid: value?.uuid })
        setChapterValue(null);
        setSelectedCourseError(false)
        if (value?.uuid) {
            handleChapter(value?.uuid);
        }
    }

    //HANDLE CHAPTER
    async function handleChapter(uuid: any) {
        const chapterApi = await fetch(`/api/course/${uuid}?isDropdown=true`, {
            method: "GET",
            cache: 'no-store',
            headers: {
                "Content-Type": "application/json",
            },
        });
        const responseChapter = await chapterApi.json();
        const chapterItem = responseChapter?.data?.course_info?.chapter_info
            .map((item: any) => {
                return { label: item.name, uuid: item.uuid };

            });
        setChapterOption(chapterItem ?? []);
    }

    //CONVERT UTC TO LOCAL TIME
    function UTCtoLocalTime(utcTimeString: any) {
        // Split the UTC time string into hours, minutes, and seconds
        const [hours, minutes, seconds] = utcTimeString.split(':');

        // Create a new Date object and set UTC time
        const utcDate = new Date();
        utcDate.setUTCHours(parseInt(hours, 10));
        utcDate.setUTCMinutes(parseInt(minutes, 10));
        utcDate.setUTCSeconds(parseInt(seconds, 10));

        // Convert UTC time to local time
        const localHours = utcDate.getHours().toString().padStart(2, '0');
        const localMinutes = utcDate.getMinutes().toString().padStart(2, '0');
        const localSeconds = utcDate.getSeconds().toString().padStart(2, '0');

        return `${localHours}:${localMinutes}:${localSeconds}`;
    }


    //GETTING INITIAL VALUE
    async function handleView() {
        setisLoading(true);
        try {
            const res = await fetch(`/api/forum/${props?.page_props?.params?.forum_uuid}`, {
                method: "GET",
                cache: 'no-store',
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const data = await res.json();
            if (res.status == 200) {
                setFormData({ ...formData, ForumName: data?.data?.forum_info?.forum_name });
                setEnableForumExp(data?.data?.forum_info?.is_active ? true : false);
                let newTime = data?.data?.forum_info?.meeting_time == null ? dayjs().format('HH:mm:ss') : data?.data?.forum_info?.meeting_time;
                const localTime = UTCtoLocalTime(newTime); //CONVERT UTC TO LOCAL TIME
                setDefaultDate(dayjs(localTime, 'HH:mm:ss'));
                let newDay = data?.data?.forum_info?.meeting_day == null ? new Date().toLocaleDateString('en-US', { weekday: 'long' }) : data?.data?.forum_info?.meeting_day
                let timeZone = GetTimeZoneOffset();
                let localDay = getLocalDayFromUTC(newDay, newTime, timeZone);
                const UTCtoLocal = GetDayTimeInTimezone(newTime, newDay, dayjs(data?.data?.forum_info?.starting_date.split('T')[0]).format('YYYY-MM-DD'), "GMT+0000", timeZone);
                // setSeletedDay(UTCtoLocal.UTCday);
                setSeletedDay(localDay);
                setStartDate(UTCtoLocal.UTCDate);

                // setSeletedDay(data?.data?.forum_info?.meeting_day == null ? new Date().toLocaleDateString('en-US', { weekday: 'long' }) : data?.data?.forum_info?.meeting_day)
                setSelectedDates(localTime)
                const newCompanyValue = {
                    label: data?.data?.forum_info?.company_info?.company_name || 'Unknown Company',
                    uuid: data?.data?.forum_info?.company_info?.uuid || 'Unknown UUID'
                };
                setCompanyValue(newCompanyValue)

                //set course value 
                const newCourseValue = {
                    label: data?.data?.forum_info?.course_info?.name || 'Unknown Course',
                    uuid: data?.data?.forum_info?.course_info?.uuid || 'Unknown UUID'
                };
                setCourseValue(newCourseValue)
                if (data?.data?.forum_info?.course_info?.uuid) {
                    handleChapter(data?.data?.forum_info?.course_info?.uuid);
                }
                //set chapter value 
                const newChapterValue = {
                    label: data?.data?.forum_info?.chapter_info?.name || 'Unknown Chapter',
                    uuid: data?.data?.forum_info?.chapter_info?.uuid || 'Unknown UUID'
                };
                setChapterValue(newChapterValue)
                setisLoading(false);

                //set Alluservalue 
                const users = data?.data?.forum_info?.user_info.map((user: { first_name: any; last_name: any; uuid: any; }) => ({
                    label: `${user.first_name} ${user.last_name}`,
                    uuid: user.uuid
                }));

                setAllUserValue(users);
                setAllUserValueDupliacte(users);
            } else {
                AlertManager(StaticMessage.ErrorMessage, true);
                setisLoading(false);
            }
        }
        catch (error: any) {
            AlertManager(StaticMessage.ErrorMessage, true);
            setisLoading(false);
        }
    }

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

    let userFinishedTyping = false;  // Initialize a flag to track whether the user has finished typing
    let debounceTimer: NodeJS.Timeout | null = null;   // Initialize a variable to store the timer ID

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
        //     return date.isBefore(currentDate, 'day') || dayIndex !== dayOfWeekMap[seletedDay];
        // }
        return date.isBefore(currentDate, 'day') || date.isSame(currentDate, 'day') || dayIndex === 0 || dayIndex === 6; // Disable past dates and weekends
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

    //HEALTHCHECK TAB API
    const forumHealthCheck = async () => {
        try {
            const forumHealthCheckAPI = await fetch(`/api/forum/${props?.page_props?.params?.forum_uuid}/health?from=${fromDateHealth}&to=${dayjs(toDateHealth).format('YYYY-MM-DD')}`, {
                method: "GET",
                cache: 'no-store',
                headers: {
                    "Content-Type": "application/json",
                },
            })
            const apiResponse = await forumHealthCheckAPI.json();
            if (forumHealthCheckAPI.status == 200) {
                setHealthCheckForMember(apiResponse?.data?.historical_health);
                setConsolidatedHealth(apiResponse?.data?.consolidated_health)
                setisLoading(false);
            }
            else {
                AlertManager(apiResponse?.message, true);
                setisLoading(false);
            }
        }
        catch (error) {
            AlertManager(StaticMessage.ErrorMessage, true);
            setisLoading(false);
        }
        setisLoading(false);
    }

    useEffect(() => {
        if (initialHealthCheckRender.current) {
            initialHealthCheckRender.current = false;
        } else {
            forumHealthCheck();
        }
    }, [open, fromDateHealth, toDateHealth])

    //Get Forum Surveys
    const getForumSurveys = async () => {
        try {
            setisLoading(true);
            const res = await fetch(`/api/forum/${props?.page_props?.params?.forum_uuid}/surveys`, {
                method: "GET",
                cache: 'no-store',
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const data = await res.json();
            if (res.status == 200) {
                setForumSurveys(data.data);
            } else {
                AlertManager(data?.message, true);
            }
        }
        catch (error: any) {
            AlertManager(StaticMessage.ErrorMessage, true);
        }
        finally {
            setisLoading(false);
        }
    }

    useEffect(() => {
        if (props.viewForumAction[1].read) {
            handleView();
        }
    }, [])

    function handleOpen(item: any) {
        push(`/forums/${props?.page_props?.params?.forum_uuid}?tab=healthcheck&health_check_date=${item}`);
        setProfileToggle('healthcheck')
    }

    //VIEW ALL MEMBERS API
    async function getALLMemberMCQ(date: any) {
        try {
            const requestAllMemberMCQAPI = await fetch(`/api/admin/forum/health-mcq?uuid=${props?.page_props?.params?.forum_uuid}&date=${date}`, {
                method: "GET",
                cache: 'no-store',
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const apiResponse = await requestAllMemberMCQAPI.json();
            if (requestAllMemberMCQAPI.status === 200) {
                setMemberInfo(apiResponse?.data?.member_info);
                AlertManager(apiResponse?.message, false);
            }
            else {
                AlertManager(apiResponse?.message, true);
            }
        }
        catch (error) {
            AlertManager(StaticMessage.ErrorMessage, true);
        }
    }

    //DASHBOARD API FUNCTION
    const forumDashboard = async () => {
        setisLoading(true);
        try {
            const apiResponse = await fetch(`/api/forum/${props?.page_props?.params?.forum_uuid}/dashboard?from=${fromDateDashboard}&to=${dayjs(toDateDashboard).format('YYYY-MM-DD')}`, {
                method: "GET",
                cache: 'no-store',
                headers: {
                    "Content-Type": "application/json",
                },
            })
            const dashboardResponse = await apiResponse.json();
            if (apiResponse.status == 200) {
                setDashboardData(dashboardResponse?.data)
                AlertManager(dashboardResponse?.message, false);
            }
            else {
                AlertManager(dashboardResponse?.message, true);
                setisLoading(false);
            }
        }
        catch (error) {
            AlertManager(StaticMessage.ErrorMessage, true);
            setisLoading(false);
        }
        setisLoading(false);
    }

    //THIS USE EFFECT RUNS WITH DASHBOARD FROM/TO DATE CHANGES
    useEffect(() => {
        if (initialDashboardRender.current) {
            initialDashboardRender.current = false;
        } else {
            forumDashboard();
        }
    }, [fromDateDashboard, toDateDashboard])

    useEffect(() => {
        if (props?.page_props?.searchParams?.health_check_date) {
            const today = dayjs(new Date())
            const selectedDate = props?.page_props?.searchParams?.health_check_date ? dayjs(new Date(props?.page_props?.searchParams?.health_check_date)) : null;
            if (selectedDate && selectedDate > today) {
                setDateValue(dayjs(today));
            } else {
                setDateValue(dayjs(props?.page_props?.searchParams?.health_check_date));
            }
            getALLMemberMCQ(props?.page_props?.searchParams?.health_check_date);
            setHealthBtnToggle(true);
        } else {
            setHealthBtnToggle(false);
        }
    }, [props?.page_props?.searchParams])

    function CustomCalendarIcon(props: any) {
        return (
            <Image src={calender} alt="calender" />
        );
    }

    useEffect(() => {
        const newRemovedUsers = allUserValueDuplicate
            .filter((user: any) => !allUserValue.some((itm: any) => itm.uuid === user.uuid))
            .map((user: any) => user.uuid);

        const newAddedUsers = allUserValue
            .filter((user: any) => !allUserValueDuplicate.some((itm: any) => itm.uuid === user.uuid))
            .map((user: any) => user.uuid);

        setReqBodyData((prevState: any) => {
            const updatedReqBodyData = { ...prevState };

            if (newRemovedUsers.length > 0) {
                updatedReqBodyData.remove_users = newRemovedUsers;
            } else {
                delete updatedReqBodyData.remove_users;
            }

            if (newAddedUsers.length > 0) {
                updatedReqBodyData.add_users = newAddedUsers;
            } else {
                delete updatedReqBodyData.add_users;
            }

            return updatedReqBodyData;
        });
    }, [allUserValue, allUserValueDuplicate]);

    // If the profileToggle points to survey and the the user should have permission to update forum then get all forum surveys
    useEffect(() => {
        if (profileToggle === 'survey' && props.viewForumAction[0].update) {
            getForumSurveys();
        }
    }, [profileToggle])

    return (
        <>
            <div className="ml:0 lg:ml-[17.35vw]" style={{ backgroundColor: "#F6F5FB", paddingBottom: '5vh', minHeight: '100vh' }}>
                <Grid container item xs={12} justifyContent={'flex-start'} alignItems={'center'} sx={{ pt: 3, pb: 1, pl: 3 }}>
                    <Grid container item xs={11.5} alignItems={'center'}>
                        <BreadCrumComponent
                            push={push}
                            formData={formData}
                            profileToggle={profileToggle}
                            setProfileToggle={setProfileToggle}
                            forum_uuid={props?.page_props?.params?.forum_uuid}
                            forum_name={formData.ForumName} />
                    </Grid>
                </Grid>

                <Grid container item xs={12} justifyContent={'flex-start'} alignItems={'center'} sx={{ pl: 3 }}>
                    <Grid container item xs={11.5} sm={11} md={11.7} alignItems={'center'} justifyContent={'center'} direction={'column'} sx={{ backgroundColor: 'white', borderRadius: '2vh', py: 2 }} >
                        <Grid container item xs={11.5} sx={{ height: '100%', }}>
                            <Grid container item xs={12} sm={12} md={12} lg={12} xl={12} justifyContent={'flex-start'} >
                                <Grid item xs={4} sm={2} md={2} >
                                    {props.viewForumAction[1].read &&
                                        <Button
                                            fullWidth
                                            sx={{ textTransform: "initial", fontWeight: profileToggle == "info" ? "700" : "500", color: "#000000", borderBottom: profileToggle == "info" ? "0.5vh solid #5F83ED" : "transparent" }}
                                            onClick={() => { setProfileToggle("info"); push(`/forums/${props?.page_props?.params?.forum_uuid}?tab=info`); }}
                                        >
                                            Info
                                        </Button>
                                    }
                                </Grid>
                                {/* {props.viewForumAction[0].update &&
                                    <Grid item xs={4} sm={2} md={2} >
                                        <Button
                                            fullWidth
                                            sx={{ textTransform: "initial", color: "#000000", borderBottom: profileToggle == "healthcheck" ? "0.5vh solid #5F83ED" : "transparent", fontWeight: profileToggle == "healthcheck" ? "700" : "500" }}
                                            onClick={() => { setProfileToggle("healthcheck"); push(`/forums/${props?.page_props?.params?.forum_uuid}?tab=healthcheck&health_check_date=${dayjs(dateValue).format('YYYY-MM-DD')}`); }}
                                        >
                                            Health Check
                                        </Button>

                                    </Grid>
                                } */}
                                <Grid item xs={4} sm={2} md={2} >
                                    {props.viewForumAction[1].read &&
                                        <Button
                                            fullWidth
                                            sx={{ textTransform: "initial", color: "#000000", borderBottom: profileToggle == "healthscore" ? "0.5vh solid #5F83ED" : "transparent", fontWeight: profileToggle == "healthscore" ? "700" : "500" }}
                                            onClick={() => { setProfileToggle("healthscore"); push(`/forums/${props?.page_props?.params?.forum_uuid}?tab=healthscore`); forumHealthCheck(); }}
                                        >
                                            Health Score
                                        </Button>
                                    }
                                </Grid>
                                {props.viewForumAction[0].update &&
                                    <Grid item xs={4} sm={2} md={2} >
                                        <Button
                                            fullWidth
                                            sx={{ textTransform: "initial", color: "#000000", borderBottom: profileToggle == "survey" ? "0.5vh solid #5F83ED" : "transparent", fontWeight: profileToggle == "survey" ? "700" : "500" }}
                                            onClick={() => { setProfileToggle("survey"); push(`/forums/${props?.page_props?.params?.forum_uuid}?tab=survey`); }}
                                        >
                                            Survey
                                        </Button>

                                    </Grid>
                                }
                                <Grid item xs={4} sm={2} md={2} >
                                    {props.viewForumAction[1].read &&
                                        <Button
                                            fullWidth
                                            sx={{ textTransform: "initial", fontWeight: profileToggle == "dashboard" ? "700" : "500", color: "#000000", borderBottom: profileToggle == "dashboard" ? "0.5vh solid #5F83ED" : "transparent" }}
                                            onClick={() => { setProfileToggle("dashboard"); push(`/forums/${props?.page_props?.params?.forum_uuid}?tab=dashboard`); forumDashboard(); }}
                                        >
                                            Dashboard
                                        </Button>
                                    }
                                </Grid>
                                <Grid container item xs={4} sm={4} md={4} lg={4} justifyContent={'flex-end'} >
                                    <Grid container item xs={9} sm={9} md={9} lg={7} sx={{ mr: '5vh' }}>
                                        {
                                            <Button
                                                fullWidth
                                                variant="contained"
                                                sx={{ backgroundColor: "#2A2F42", borderRadius: "1vh", color: "#F0F2FF", fontWeight: "700", '&:hover': { backgroundColor: '#2A2F42' } }}
                                                disabled={!enableForumExp}
                                                // onClick={() => push(`/forum_experience?forum_uuid=${props?.page_props?.params?.forum_uuid}`)}
                                                onClick={() => { setForumExperianceBtnLoading(true); location.assign(`/forum_experience?forum_uuid=${props?.page_props?.params?.forum_uuid}`) }}
                                            >
                                                {forumExperianceBtnLoading ? <CircularProgress sx={{ color: "white" }} size={20} /> : "Forum experience"}
                                            </Button>
                                        }
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                        {
                            profileToggle == "info"
                            && <Grid container item xs={12} justifyContent={'center'} alignItems={'flex-start'} sx={{ pt: 2 }}>
                                {props.viewForumAction[1].read ?
                                    <Grid container item xs={11.7} sm={11} md={8} lg={7} justifyContent={'center'} sx={{ border: "1px solid #dedede", borderRadius: "2vh", p: 2 }}>
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
                                                InputProps={{ readOnly: props.viewForumAction[0].update ? false : true, sx: { borderRadius: "1vh", color: "#2A2F42", maxLength: 51 } }}
                                            />
                                        </Grid>

                                        <Grid container item md={12} sx={{ color: "#777", m: "1vh" }} justifyContent={'space-between'} alignItems={'flex-start'}>
                                            <Grid container item xs={12} sm={5.7} direction={'column'} sx={{ backgroundColor: 'white', }}>
                                                <Typography variant="caption" sx={{ color: "#5F5F5F" }}>MEETING DAY</Typography>
                                                <Select
                                                    fullWidth
                                                    readOnly={props.viewForumAction[0].update ? false : true}
                                                    size="small"
                                                    id="demo-select-small"
                                                    value={seletedDay}
                                                    name={seletedDay}
                                                    sx={{ borderRadius: '1vh' }}
                                                    onChange={(e: any) => {
                                                        setSeletedDay(e.target.value);
                                                        // handleStartingDateError(dayjs(startDate), e.target.value);
                                                        let localTime = new Date(defaultDate.$d);
                                                        let time_part = localTime.toLocaleTimeString([], { hour12: false });
                                                        let timeZone = GetTimeZoneOffset();
                                                        let dayAndTime = GetDayTimeInTimezone(time_part, e.target.value, dayjs(startDate).format('YYYY-MM-DD'), timeZone, "GMT+0000"); // Pass the date part as an argument
                                                        let utcDay = getUTCForDay(e.target.value, timeZone, time_part);
                                                        setReqBodyData({ ...reqBodyData, meeting_time: dayAndTime.UTCTime, meeting_day: utcDay, starting_date: startDate + ' ' + dayAndTime.UTCTime });
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
                                                        value={defaultDate}
                                                        onChange={(newValue: any) => {
                                                            let localTime = new Date(newValue?.$d);
                                                            let time_part = localTime.toLocaleTimeString([], { hour12: false });
                                                            setDefaultDate(dayjs(time_part, 'HH:mm:ss'));
                                                            let timeZone = GetTimeZoneOffset();
                                                            let dayAndTime = GetDayTimeInTimezone(time_part, seletedDay, dayjs(startDate).format('YYYY-MM-DD'), timeZone, "GMT+0000"); // Pass the date part as an argument
                                                            // setReqBodyData({ ...reqBodyData, meeting_time: dayAndTime.UTCTime, meeting_day: dayAndTime.UTCday, starting_date: dayAndTime.UTCDate + ' ' + dayAndTime.UTCTime });
                                                            const utcDay = getUTCForDay(seletedDay, timeZone, time_part);
                                                            setReqBodyData({ ...reqBodyData, meeting_time: dayAndTime.UTCTime, meeting_day: utcDay, starting_date: dayAndTime.UTCDate + ' ' + dayAndTime.UTCTime });
                                                        }}
                                                        readOnly={props.viewForumAction[0].update ? false : true}
                                                        sx={{
                                                            width: '100%',
                                                            '& .MuiInputBase-root': {
                                                                padding: 0.96,
                                                                borderRadius: '1vh'
                                                            },
                                                            '& .MuiOutlinedInput-input': {
                                                                padding: '0vw',
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
                                            <Grid container item xs={12} sm={5.7} direction={'column'} sx={{ backgroundColor: 'white' }}>
                                                <Typography variant="caption">COMPANY NAME</Typography>
                                                <Autocomplete
                                                    fullWidth
                                                    size="small"
                                                    disablePortal
                                                    readOnly={props.viewForumAction[0].update ? false : true}
                                                    loading={isCompanySearchLoading}
                                                    id="combo-box-demo"
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
                                                    readOnly={props.viewForumAction[0].update ? false : true}
                                                    loading={isCourseSearchLoading}
                                                    id="combo-box-demo1"
                                                    options={courseOption}
                                                    value={courseValue}
                                                    renderInput={(params) => <TextField {...params} placeholder="Choose a course name" error={selectedCourseError} helperText={selectedCourseError ? "Course name is required" : ''} sx={{ "& .MuiOutlinedInput-root": { borderRadius: "1vh" } }} />}
                                                    isOptionEqualToValue={(option, value) => option === value || option.label === value.label}
                                                    onBlur={() => setSelectedCourseError(companyValue == null)}
                                                    onChange={handleCourseClick}
                                                    onOpen={handleCourse}
                                                />
                                            </Grid>
                                        </Grid>

                                        <Grid container item md={12} sx={{ color: "#777", m: "1vh" }} justifyContent={'space-between'} alignItems={'flex-start'}>
                                            <Grid container item xs={12} sm={5.7} direction={'column'} sx={{ backgroundColor: 'white', }}>
                                                <Typography variant="caption">STARTING CHAPTER (Optional)</Typography>
                                                <Autocomplete
                                                    fullWidth
                                                    size="small"
                                                    disablePortal
                                                    id="combo-box-demo2"
                                                    readOnly={props.viewForumAction[0].update ? false : true}
                                                    options={chapterOption}
                                                    value={chapterValue}
                                                    renderInput={(params) => <TextField {...params} placeholder="Choose a starting chapter " error={selectedModuleError} sx={{ "& .MuiOutlinedInput-root": { borderRadius: "1vh" } }} />}
                                                    isOptionEqualToValue={(option, value) => option === value || option.label === value.label}
                                                    onChange={(event, value) => { setChapterValue(value); setSelectedModuleError(false); setReqBodyData({ ...reqBodyData, chapter_uuid: value?.uuid }) }}
                                                />
                                            </Grid>
                                            <Grid container item xs={12} sm={5.7} direction={'column'} >
                                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                    <Typography variant="caption">STARTING DATE</Typography>
                                                    <DatePicker
                                                        disablePast
                                                        shouldDisableDate={(date) => isDateDisabled(dayjs(date))}
                                                        value={dayjs(startDate)}
                                                        readOnly={dayjs(startDate).isSame(currentDate, 'day') || dayjs(startDate).isBefore(currentDate, 'day')}
                                                        slotProps={{ textField: { size: 'small', } }}
                                                        slots={{
                                                            openPickerIcon: CustomCalendarIcon
                                                        }}
                                                        sx={{
                                                            width: '100%',
                                                            "& .MuiOutlinedInput-root": {
                                                                borderRadius: "1vh",
                                                            },
                                                            "& .Mui-error": {
                                                                color: "inherit",
                                                                "& .MuiOutlinedInput-notchedOutline": {
                                                                    borderColor: "inherit"
                                                                }
                                                            }
                                                        }}
                                                        // onError={() => handleStartingDateError(dayjs(startDate), seletedDay)}
                                                        onChange={(newValue) => {
                                                            setStartDate(dayjs(newValue).format('YYYY-MM-DD'));
                                                            let timeZone = GetTimeZoneOffset();
                                                            let localTime = new Date(defaultDate?.$d);
                                                            let time_part = localTime.toLocaleTimeString([], { hour12: false });
                                                            let reqTime = time_part;
                                                            let dayAndTime = GetDayTimeInTimezone(time_part, seletedDay, dayjs(newValue).format('YYYY-MM-DD'), timeZone, "GMT+0000");
                                                            const utcDay = getUTCForDay(seletedDay, timeZone, time_part);
                                                            // setReqBodyData({ ...reqBodyData, meeting_time: dayAndTime.UTCTime, meeting_day: dayAndTime.UTCday, starting_date: dayAndTime.UTCDate + ' ' + dayAndTime.UTCTime });
                                                            setReqBodyData({ ...reqBodyData, starting_date: dayAndTime?.UTCDate + ' ' + dayAndTime.UTCTime, meeting_day: utcDay, meeting_time: dayAndTime.UTCTime });
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
                                                    readOnly={props.viewForumAction[0].update ? undefined : true}
                                                    id="tags-outlined"
                                                    options={allUserOption}
                                                    value={allUserValue}
                                                    loading={isAutocompletLoading}
                                                    freeSolo={allUserOption.length == 0 && isFreeSoloCondition}
                                                    isOptionEqualToValue={(option, value) => option === value || option.label === value.label}
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
                                            {props.viewForumAction[0].update &&
                                                <Button
                                                    fullWidth
                                                    variant="contained"
                                                    disabled={Object.keys(reqBodyData).length == 0 || !formData.ForumName || !seletedDay || !defaultDate || !companyValue || !courseValue || startingDateError || meetingTimeError}
                                                    sx={{ backgroundColor: "#2A2F42", borderRadius: "1vh", color: "#F0F2FF", fontWeight: "700", '&:hover': { backgroundColor: '#2A2F42' } }}
                                                    onClick={() => handleEditForum()}
                                                >
                                                    {Loader ? <> &nbsp; <CircularProgress sx={{ color: "white" }} size={20} />
                                                    </> : "update"}
                                                </Button>
                                            }
                                        </Grid>
                                        <Grid container item xs={12} justifyContent="center" alignItems="center" sx={{ color: "#777", }}>
                                            {props.viewForumAction[0].update &&
                                                <Link sx={{ ml: 1 }} onClick={() => { setIsLinkLoading(true); push(`/users?forum_filter=${props?.page_props?.params?.forum_uuid}`) }}>
                                                    <Typography variant="body1" color="primary" sx={{ fontWeight: "700", cursor: "pointer" }}>
                                                        {isLinkLoading ? <CircularProgress sx={{ color: "black" }} size={15} /> : 'View Forum Member Info'}
                                                    </Typography>
                                                </Link>
                                            }
                                        </Grid>
                                    </Grid>
                                    :
                                    <><Grid container item xs={11.7} sm={11} md={8} lg={7} justifyContent={'center'} sx={{ borderRadius: "2vh", p: 2, height: "75vh" }}></Grid></>
                                }
                            </Grid>
                        }
                        {profileToggle == "healthcheck" &&
                            <Grid container item xs={12} justifyContent={'center'} alignItems={'flex-start'} sx={{ pt: 2 }}>
                                <Grid container item xs={11.7} sm={11}  >
                                    <HealthCheck
                                        forum_uuid={props?.page_props?.params?.forum_uuid}
                                        health_check_date={props?.page_props?.searchParams?.health_check_date}
                                        setProfileToggle={setProfileToggle}
                                        healthBtnToggle={healthBtnToggle}
                                        setHealthBtnToggle={setHealthBtnToggle}
                                        dateValue={dateValue}
                                        setDateValue={setDateValue}
                                        memberInfo={memberInfo}
                                        accordionCardLoadingOnDateChange={accordionCardLoadingOnDateChange} />
                                </Grid>
                            </Grid>
                        }
                        {profileToggle == "healthscore" &&
                            <Grid container item xs={12} justifyContent={'center'} alignItems={'flex-start'} sx={{ pt: 2 }}>
                                <Grid container item xs={11.7} sm={11}  >
                                    <HealthCheckTab
                                        sethealthuuid={sethealthuuid}
                                        handleOpen={handleOpen}
                                        setOpen={setOpen}
                                        open={open}
                                        healthCheckForMember={healthCheckForMember}
                                        consolidatedHealth={consolidatedHealth}
                                        AlertManager={AlertManager}
                                        setFromDateHealth={setFromDateHealth}
                                        setToDateHealth={setToDateHealth}
                                        fromDateHealth={fromDateHealth}
                                        toDateHealth={toDateHealth}
                                        Page='forum'
                                        viewForumAction={props.viewForumAction[0].update}
                                    />
                                </Grid>
                            </Grid>
                        }
                        {profileToggle == "dashboard" &&
                            <Grid container item xs={12} justifyContent={'center'} alignItems={'flex-start'} sx={{ pt: 2 }}>
                                <Grid container item xs={11.7} sm={11}  >
                                    <UserDashboardComponents
                                        Page='forum'
                                        dashboardData={dashboardData}
                                        setFromDateDashboard={setFromDateDashboard}
                                        setToDateDashboard={setToDateDashboard}
                                        fromDateDashboard={fromDateDashboard}
                                        toDateDashboard={toDateDashboard}
                                        viewForumAction={props.viewForumAction[0].update}
                                    />
                                </Grid>
                            </Grid>
                        }
                        {profileToggle == 'survey' &&
                            <Grid container item xs={12} justifyContent={'flex-start'} alignItems={'flex-start'} sx={{ p: 2 }}>
                                {!forumSurveys.length && !isLoading ?
                                    <Grid container item xs={12} justifyContent={"center"} alignItems={"center"} sx={{ mt: 5, height: "53vh" }}>
                                        <Grid item>
                                            <Typography variant='h6' sx={{ fontWeight: "600", color: '#5F83ED' }}>No Record Found</Typography>
                                        </Grid>
                                    </Grid>
                                    :
                                    forumSurveys.map((survey: any, index: number) => {
                                        return (
                                            <Grid container item xs={12} sm={3} key={index} justifyContent={"flex-start"} alignItems={"flex-start"} sx={{ mt: 2 }}>
                                                <ForumSurveyCard survey={survey} forum_uuid={props?.page_props?.params?.forum_uuid} AlertManager={AlertManager} />
                                            </Grid>)
                                    })}
                            </Grid>}
                    </Grid>
                </Grid>
            </div >
            {open && <EditMemberHealthCheck handleClose={handleClose} open={open} health_uuid={healthuuid} AlertManager={AlertManager} member_uuid={props.page_props.params.user_id} />
            }
            <SnakBarAlert alertOpen={alertOpen} setAlertOpen={setAlertOpen} alertSeverity={alertSeverity} alert={alert} />
            <BackDropLoading isLoading={isLoading} />
        </>
    )
}

//Breadcrum component
const BreadCrumComponent = ({ push, formData, profileToggle, forum_uuid, setProfileToggle, forum_name }: any) => {
    return (
        <>
            <Typography variant="h6" sx={{ fontWeight: '600', cursor: 'pointer' }} onClick={(() => push("/forums"))}>All Forums</Typography>
            <KeyboardArrowRightIcon />
            <Typography variant="subtitle1" sx={{ fontWeight: '600', cursor: 'pointer' }} onClick={() => { setProfileToggle("info"); push(`/forums/${forum_uuid}?tab=info`) }}>{formData?.ForumName}</Typography>
            <KeyboardArrowRightIcon />
            <Typography variant="subtitle1" sx={{ fontWeight: '500', textTransform: "capitalize" }} > {profileToggle == "healthscore" ? "Health Score" : profileToggle == "healthcheck" ? "Health Check" : profileToggle} </Typography>
        </>
    )
}