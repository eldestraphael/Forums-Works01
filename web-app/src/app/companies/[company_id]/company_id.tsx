'use client'
import { Button, Grid, TextField, Typography, CircularProgress, InputAdornment, Checkbox, Stack, Pagination, Modal, Box, Paper, Select, MenuItem, Autocomplete, Dialog, Link, FormHelperText } from "@mui/material";
import React, { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Image from "next/image";
import dayjs from "dayjs";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "@/app/azure_service/authConfig";
import { StaticMessage } from "@/app/util/StaticMessage";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { renderTimeViewClock } from '@mui/x-date-pickers/timeViewRenderers';
import TimeZone from "@/app/util/timeZoneDisplay";
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import Microsoftlogo from '@/assets/MS 1.png';
import BackDropLoading from '@/components/loading/backDropLoading';
import UserDashboardComponents from "@/components/userDashboardComponents";
import SnakBarAlert from "@/components/snakbaralert/snakbaralert";
import HealthCheckTab from "@/components/healthCheckTabComponent";
import calender from "@/assets/mingcute_calendar-fill.svg"
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import GetTimeZoneOffset from "@/app/util/getTimeZoneOFFset";
import { GetDayTimeInTimezone } from "@/app/util/GetDayTimeInTimeZone";
import getUTCForDay from "@/app/util/getUTCdayfromLocalTimeZone";

export default function EditCompany(props: any) {
    const { push } = useRouter();
    const [alertOpen, setAlertOpen] = useState(false);
    const [alert, setAlert] = useState("");
    const [alertSeverity, setAlertSeverity] = useState(false);
    const [microsoftBtnLoader, setMicrosoftBtnLoader] = useState(false);
    const [saveBtnLoader, setSaveBtnLoader] = useState(false);
    const [isLoading, setisLoading] = useState(false);
    const [companyData, setCompanyData] = useState({ CompanyName: '' });
    const [errors, setErrors] = useState({ CompanyName: '' });
    const [profileToggle, setProfileToggle] = useState<string>(props?.page_props?.searchParams?.tab || "info");
    const [healthScoreForCompany, setHealthScoreForCompany] = useState<any>([]);
    const [consolidatedHealth, setConsolidatedHealth] = useState<number>();
    const [open, setOpen] = React.useState(false);
    const [healthuuid, sethealthuuid] = React.useState('');
    const [fromDateDashboard, setFromDateDashboard] = useState<any>(dayjs(new Date()).subtract(1, 'year').format('YYYY-MM-DD'));
    const [toDateDashboard, setToDateDashboard] = useState<any>(dayjs(new Date()));
    const [dashboardData, setDashboardData] = useState<any>([]);
    const [fromDateHealth, setFromDateHealth] = useState<any>(dayjs(new Date()).subtract(1, 'year').format('YYYY-MM-DD'));
    const [toDateHealth, setToDateHealth] = useState<any>(dayjs(new Date()));
    const [ms365Btn, setMs365Btn] = useState<boolean>();
    const [ms365BtnAfterAPI, setMs365BtnAfterAPI] = useState<boolean>(false);
    const [isFocused, setIsFocused] = useState(false);
    const initialRender = useRef(true);


    const handleChange = (e: any) => {
        setIsFocused(true);
        const { name, value } = e.target;
        let error = '';
        let maxLength = 50;
        const formattedName = name
            .replace(/([A-Z])/g, ' $1')
            .trim()
            .toLowerCase()
            .replace(/^./, (str: any) => str.toUpperCase());
        if (value.length <= maxLength) {
            setCompanyData({ ...companyData, [name]: value });
        } else {
            error = `${formattedName} must be ${maxLength} characters or less`;
        }
        setErrors({ ...errors, [name]: error });
    };

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

    //SAVE BUTTON API CALL
    const handleSave = async (e: any) => {
        const requestBody = {
            company_name: companyData.CompanyName,
        }

        if (!companyData.CompanyName.length) {
            AlertManager("Kindly fill all fields", true);
        }
        else {
            setSaveBtnLoader(true)

            try {
                const res = await fetch(`/api/company?uuid=${props.page_props.params.company_id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(requestBody),
                });
                const result = await res.json();
                if (res.status == 200) {
                    push("/companies");
                    setSaveBtnLoader(false)
                }
                else {
                    AlertManager(result?.message, true)
                }
            }
            catch (error: any) {
                AlertManager(StaticMessage.ErrorMessage, true);
            }
        }
    }

    function AlertManager(message: string, severity: boolean) {
        setAlert(message)
        setAlertSeverity(severity)
        setAlertOpen(true)
        setisLoading(false);
        setSaveBtnLoader(false)
    }

    async function viewCompanyProfile() {
        setisLoading(true);
        try {
            const requestCompanyDetailAPI = await fetch(`/api/company/${props.page_props.params.company_id}`, {
                method: "GET",
                cache: 'no-store',
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const apiResponse = await requestCompanyDetailAPI.json();
            if (requestCompanyDetailAPI.status == 200) {
                setMs365Btn(apiResponse.data?.company_info?.ms365);
                setCompanyData({ ...companyData, CompanyName: apiResponse?.data?.company_info?.company_name || '' })
                setisLoading(false);
            }
            else {
                AlertManager(apiResponse?.message, true);
            }
        }
        catch (error) {
            AlertManager(StaticMessage.ErrorMessage, true);
        }
        setisLoading(false);
    }

    //DASHBOARD API FUNCTION
    const companyDashboard = async () => {
        setisLoading(true);
        try {
            const apiResponse = await fetch(`/api/company/${props.page_props.params.company_id}/dashboard?from=${fromDateDashboard}&to=${dayjs(toDateDashboard).format('YYYY-MM-DD')}`, {
                method: "GET",
                cache: 'no-store',
                headers: {
                    "Content-Type": "application/json",
                },
            })
            const dashboardResponse = await apiResponse.json();
            if (apiResponse.status == 200) {
                setDashboardData(dashboardResponse?.data);
                AlertManager(dashboardResponse?.message, false);
            }
            else {
                AlertManager(dashboardResponse?.message, true);
                setisLoading(false);
            }
        }
        catch (error) {
            AlertManager(StaticMessage.ErrorMessage, true);
            setisLoading(false)
        }
        setisLoading(false);
    }

    const handleOpen = (uuid: any) => {
        sethealthuuid(uuid);
        setOpen(true);
    }
    const pathname = usePathname();


    //THIS USE EFFECT RUNS WITH DASHBOARD FROM/TO DATE CHANGES
    useEffect(() => {
        if (initialRender.current) {
            initialRender.current = false;
            // window.location.reload();
        } else {
            companyDashboard();
        }
    }, [fromDateDashboard, toDateDashboard]);

    useEffect(() => {
        if (props.viewCompanyAction[1].read) {
            viewCompanyProfile();
        }
    }, [])


    return (
        <div className="ml:0 lg:ml-[17.35vw]" style={{ backgroundColor: "#F6F5FB", paddingBottom: '5vh', minHeight: '100vh' }}>
            <Grid container item xs={12} justifyContent={'flex-start'} alignItems={'center'} sx={{ pt: 3, pb: 1, pl: 3, pr: 10 }}>
                <Grid container item xs={12} alignItems={'center'}>
                    <BreadCrumComponent push={push} companyData={companyData} profileToggle={profileToggle} company_name={companyData.CompanyName} companyid={props.page_props.params.company_id} setProfileToggle={setProfileToggle} />
                </Grid>
            </Grid>

            <Grid container item xs={12} justifyContent={'flex-start'} alignItems={'center'} sx={{ pl: 3 }}>
                <Grid container item xs={11.5} sm={11} md={11.7} alignItems={'center'} justifyContent={'center'} sx={{ backgroundColor: 'white', borderRadius: '2vh', py: 2, }} >
                    <Grid container item xs={12} sx={{ height: '100%' }} >
                        <Grid container item xs={12} justifyContent={'flex-start'} >
                            <Grid item xs={4} sm={3} md={2}>
                                <Button
                                    fullWidth
                                    sx={{ textTransform: "initial", fontWeight: profileToggle == 'info' ? "700" : "500", color: "#000000", borderBottom: profileToggle == 'info' ? "0.5vh solid #5F83ED" : "transparent" }}
                                    onClick={() => { setProfileToggle("info"); push(`/companies/${props.page_props.params.company_id}?tab=info`) }}
                                >
                                    Info
                                </Button>
                            </Grid>
                            <Grid item xs={4} sm={3} md={2} >
                                <Button
                                    disabled
                                    fullWidth
                                    sx={{ textTransform: "initial", color: "#000000", borderBottom: profileToggle == 'health score' ? "0.5vh solid #5F83ED" : "transparent", fontWeight: profileToggle == 'health score' ? "700" : "500" }}
                                >
                                    Health Score
                                </Button>
                            </Grid>
                            <Grid item xs={4} sm={3} md={2} >
                                <Button
                                    fullWidth
                                    sx={{ textTransform: "initial", color: "#000000", borderBottom: profileToggle == 'dashboard' ? "0.5vh solid #5F83ED" : "transparent", fontWeight: profileToggle == 'dashboard' ? "700" : "500" }}
                                    onClick={() => { setProfileToggle("dashboard"); push(`/companies/${props.page_props.params.company_id}?tab=dashboard`); companyDashboard(); `` }}
                                >
                                    Dashboard
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                    {props.viewCompanyAction[1]?.read &&
                        <Grid container item xs={12} justifyContent={'center'} alignItems={'flex-start'} sx={{ pt: 4, backgroundColor: "transperant" }}>
                            {profileToggle == 'info' ?
                                <ProfileComponent
                                    microsoftBtnLoader={microsoftBtnLoader}
                                    setMicrosoftBtnLoader={setMicrosoftBtnLoader}
                                    saveBtnLoader={saveBtnLoader}
                                    handleChange={handleChange}
                                    errors={errors}
                                    companyData={companyData}
                                    handleBlur={handleBlur}
                                    isFocused={isFocused}
                                    update={props.viewCompanyAction[0].update}
                                    handleSave={handleSave}
                                    AlertManager={AlertManager}
                                    page_props={props.page_props}
                                    ms365Btn={ms365Btn}
                                    setMs365BtnAfterAPI={setMs365BtnAfterAPI}
                                    ms365BtnAfterAPI={ms365BtnAfterAPI}
                                    push={push}
                                />
                                : null
                            }
                            {profileToggle == 'health score' &&
                                <Grid container item xs={12} justifyContent={'center'} alignItems={'flex-start'} sx={{ pt: 2 }}>
                                    <Grid container item xs={11.7} sm={11}  >
                                        <HealthCheckTab
                                            sethealthuuid={sethealthuuid}
                                            handleOpen={handleOpen}
                                            setOpen={setOpen}
                                            open={open}
                                            healthCheckForMember={healthScoreForCompany}
                                            consolidatedHealth={consolidatedHealth}
                                            AlertManager={AlertManager}
                                            setFromDateHealth={setFromDateHealth}
                                            setToDateHealth={setToDateHealth}
                                            fromDateHealth={fromDateHealth}
                                            toDateHealth={toDateHealth}
                                            viewCompanyAction={props.viewCompanyAction[0].update}
                                        />
                                    </Grid>
                                </Grid>
                            }
                            {profileToggle == "dashboard" &&
                                <Grid container item xs={12} justifyContent={'center'} alignItems={'flex-start'}>
                                    <Grid container item xs={11.7} sm={11}  >
                                        <UserDashboardComponents
                                            Page='company'
                                            dashboardData={dashboardData}
                                            setFromDateDashboard={setFromDateDashboard}
                                            setToDateDashboard={setToDateDashboard}
                                            fromDateDashboard={fromDateDashboard}
                                            toDateDashboard={toDateDashboard}
                                        />
                                    </Grid>
                                </Grid>
                            }
                        </Grid>
                    }
                </Grid>
            </Grid>
            <SnakBarAlert alertOpen={alertOpen} setAlertOpen={setAlertOpen} alertSeverity={alertSeverity} alert={alert} />
            <BackDropLoading isLoading={isLoading} />
        </div >
    )
}

//Breadcrum component
const BreadCrumComponent = ({ push, profileToggle, companyData, companyid, setProfileToggle }: any) => {
    return (
        <>
            <Typography variant="h6" sx={{ fontWeight: '600', cursor: 'pointer' }} onClick={(() => push("/companies"))}>All Companies</Typography>
            <KeyboardArrowRightIcon />
            <Typography variant="subtitle1" sx={{ fontWeight: '600', cursor: 'pointer' }} onClick={() => { setProfileToggle("info"); push(`/companies/${companyid}?tab=info`) }}>{companyData?.CompanyName}</Typography>
            <KeyboardArrowRightIcon />
            <Typography variant="subtitle1" sx={{ fontWeight: '500', textTransform: "capitalize" }} >{profileToggle}</Typography>

        </>
    )
}

const ProfileComponent = (props: any) => {
    const { push } = useRouter();
    const { instance } = useMsal();
    const searchParams = useSearchParams()
    const [OnboardUsersList, setOnboardUsersList] = useState<[]>([])
    const [OnboardUsersBtnLoader, setOnboardUsersBtnLoader] = useState<boolean>(false)
    const [toggleView, settoggleView] = useState<boolean>(false)
    const [OnboardUserssearch, setOnboardUsersSearch] = useState<any>('');
    const [currentPage, setCurrentPage] = useState(searchParams.get('page') || 1);
    const [totalPage, setTotalPage] = useState(Number);
    const [selectedItems, setSelectedItems] = useState([]);
    const [buttonState, setButtonState] = useState<boolean>(true)
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => { setOpen(true); setButtonState(true) };
    const handleClose = () => setOpen(false);
    const [isLinkLoading, setIsLinkLoading] = useState(false);

    //MICROSOFT LOGIN
    const handleLogin = async (instance: any) => {
        props.setMicrosoftBtnLoader(true)
        var ms365instance = await instance.loginPopup(loginRequest).then(async (response: any) => {
            return response
        });

        //MS365 API CALL
        try {
            const microSoftDataAPI = await fetch(`/api/company/${props.page_props.params.company_id}/ms365`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(
                    ms365instance
                ),
            });
            const apiResponse = await microSoftDataAPI.json();
            if (microSoftDataAPI.status == 200) {
                props.setMicrosoftBtnLoader(false);
                props.AlertManager(apiResponse?.message, false);
                props.setMs365BtnAfterAPI(true);

            }
        }
        catch (error) {
            props.setMicrosoftBtnLoader(false)
            props.AlertManager(StaticMessage.ErrorMessage, true);
        }
    };

    //GET ONBOARD USERS API
    const getOnboardUsersList = async () => {
        !toggleView && setOnboardUsersBtnLoader(true);
        try {
            const getOnboardUsersListAPI = await fetch(`/api/company/${props.page_props.params.company_id}/ms365/users?${OnboardUserssearch?.length ? `search=${OnboardUserssearch}&` : ''}&page=${currentPage}&limit=100`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                }
            });
            const apiResponse = await getOnboardUsersListAPI.json();
            if (getOnboardUsersListAPI.status == 200) {
                setOnboardUsersBtnLoader(false);
                props.AlertManager(apiResponse?.message, false);
                setOnboardUsersList(apiResponse?.data)
                settoggleView(true)
            }
        }
        catch (error) {
            setOnboardUsersBtnLoader(false)
            props.AlertManager(StaticMessage.ErrorMessage, true);
        }
    }

    //CHECKBOX CLICK
    const handleCheckboxClick = (item: any) => {
        setSelectedItems((prevSelectedItems: any) => {
            const itemIndex = prevSelectedItems.findIndex((selectedItem: any) => selectedItem.email === item.email);
            if (itemIndex === -1) {
                // Item is not in the array, add it
                return [...prevSelectedItems, item];
            } else {
                // Item is already in the array, remove it
                return prevSelectedItems.filter((selectedItem: any) => selectedItem.email !== item.email);
            }
        });
    }

    //USEEFFECT ALSO RUNS DURING SEARCH AND PAGE CHANGE
    useEffect(() => {
        if (toggleView) {
            getOnboardUsersList()
        }
    }, [OnboardUserssearch, currentPage])


    return (
        <Grid container item justifyContent={'center'} rowGap={5}>
            <Grid container item xs={11.7} sm={11} justifyContent={'center'} sx={{ border: "1px solid #dedede", borderRadius: "2vh", p: 2 }}>
                <Grid container item xs={12} md={9} lg={7}>
                    <Grid item xs={12} sx={{ color: "#777", m: "1vh" }}>
                        <Typography variant="body1" sx={{ textTransform: "uppercase" }}>Company Name</Typography>
                        <TextField
                            fullWidth
                            placeholder="Enter a company name"
                            name='CompanyName'
                            type='text'
                            size="small"
                            value={props.companyData.CompanyName}
                            onChange={props.handleChange}
                            onBlur={props.handleBlur}
                            error={!!props.errors.CompanyName}
                            helperText={props.errors.CompanyName}
                            InputProps={{
                                readOnly: props.update ? false : true,
                                sx: { borderRadius: "1vh", color: "#2A2F42", maxLength: 51 }
                            }}
                        />
                    </Grid>
                    <Grid container item xs={12} sx={{ color: "#777", m: "1vh", my: "2vh", backgroundColor: 'transparent' }} direction={'row'} justifyContent={"center"} alignItems={"center"}>
                        {props.update &&
                        <>
                            <Grid container item xs={12} sm={10.5} md={11} gap={1} justifyContent={props.ms365Btn == false && props.ms365BtnAfterAPI == false ? 'space-between' : 'center'} sx={{ backgroundColor: 'transparent' }}>
                                {!props.ms365Btn && !props.ms365BtnAfterAPI && !toggleView ?
                                    <Grid item xs={12} sm={7} md={8.5} lg={8.5} sx={{ m: "0.1vh", backgroundColor: 'transparent' }}>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            onClick={() => handleLogin(instance)}
                                            disabled={props?.companyData?.ms365}
                                            sx={{ backgroundColor: "#2A2F42", borderRadius: "1vh", color: "#F0F2FF", fontWeight: "700", '&:hover': { backgroundColor: '#2A2F42' } }}
                                        >
                                            {props.microsoftBtnLoader ? <> &nbsp; <CircularProgress sx={{ color: "white" }} size={20} />
                                            </> : <>

                                                <div style={{ cursor: 'pointer' }} >
                                                    <Image src={Microsoftlogo}
                                                        priority={true}
                                                        placeholder="empty"
                                                        alt="Connect your Microsoft 365 with Forums@Work"
                                                        style={{
                                                            objectFit: 'contain',
                                                            backgroundColor: "transparent",
                                                            width: '18px',
                                                            height: '20px',
                                                        }}
                                                        unoptimized
                                                    />
                                                </div>
                                                {/* <Microsoftlogo /> */}
                                                &nbsp;<Typography >Connect to Microsoft 365</Typography></>}
                                        </Button>
                                    </Grid>
                                    :
                                    <Grid item xs={12} sm={7} md={8.5} lg={8.5} sx={{ m: "0.1vh", backgroundColor: 'transparent' }}>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            onClick={() => getOnboardUsersList()}
                                            disabled={props?.companyData?.ms365}
                                            sx={{ backgroundColor: "#2A2F42", borderRadius: "1vh", color: "#F0F2FF", fontWeight: "700", '&:hover': { backgroundColor: '#2A2F42' } }}
                                        >
                                            {OnboardUsersBtnLoader
                                                ? <> &nbsp; <CircularProgress sx={{ color: "white" }} size={20} /></>
                                                : <Typography >Onboard Users to forums</Typography>}
                                        </Button>
                                    </Grid>
                                }
                                <Grid item xs={12} sm={4} md={3} sx={{ m: "0.1vh" }}>

                                    <Button
                                        fullWidth
                                        variant="contained"
                                        disabled={!props.companyData.CompanyName || !props.isFocused}
                                        sx={{ backgroundColor: !props.companyData.CompanyName ? "white" : "#2A2F42", borderRadius: "1vh", color: "#F0F2FF", fontWeight: "700", '&:hover': { backgroundColor: '#2A2F42' } }}
                                        onClick={props.handleSave}>
                                        {props.saveBtnLoader ? <> &nbsp; <CircularProgress sx={{ color: "white" }} size={20} />
                                        </> : <Typography >UPDATE</Typography>}
                                    </Button>
                                </Grid>
                            </Grid>
                            <Grid container item xs={12} sm={10.5} md={11} gap={1} justifyContent={'center'} sx={{ backgroundColor: 'transparent' }}>
                            <Link sx={{ ml: 1, mt:2 }} onClick={() => { setIsLinkLoading(true); push(`/users?company_filter=${props.page_props.params.company_id}`) }}>
                            <Typography variant="body1" color="primary" sx={{ fontWeight: "700", cursor: "pointer" }}>
                                {isLinkLoading ? <CircularProgress sx={{ color: "black" }} size={15} /> : 'View Company Member Info'}
                            </Typography>
                        </Link>
                        </Grid>
                        </>
                        }
                    </Grid>
                </Grid >
            </Grid >

            {toggleView
                ? <Grid container item xs={11.7} sm={11} justifyContent={'center'} rowGap={3} sx={{ borderRadius: "2vh", }}>

                    {/* TOP SECTTION */}
                    <Grid container item xs={12} rowGap={1}>
                        <Grid container item xs={12} md={6} alignItems={'center'} >
                            <Typography variant="subtitle1" sx={{ fontWeight: '600' }}>Import users and add them to the forum</Typography>
                        </Grid>
                        <Grid container item xs={12} md={6} alignItems={'center'} justifyContent={"space-between"}>
                            <Grid container item xs={12} sm={5.8}>
                                {/* {props?.allCompaniesAction[0]?.update ?*/}
                                <TextField
                                    fullWidth
                                    size='small'
                                    value={OnboardUserssearch}
                                    placeholder="SEARCH"
                                    onChange={(e: any) => setOnboardUsersSearch(e.target.value)}
                                    InputProps={{
                                        sx: {
                                            borderRadius: "1.5vh", color: "#5F83ED", maxLength: 51, backgroundColor: '#F0F2FF', border: 'none',
                                            "& input::placeholder": { fontSize: "14px", fontWeight: "700" },
                                            '&.MuiOutlinedInput-root': {
                                                '&:hover fieldset': {
                                                    borderColor: '#5F83ED'
                                                },
                                                '& fieldset': {
                                                    borderColor: 'transparent'
                                                }
                                            },
                                        },
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon color="action" sx={{ color: "#5F83ED" }} />
                                            </InputAdornment>
                                        )
                                    }}
                                />
                                {/* : null} */}
                            </Grid>

                            <Grid container item xs={12} sm={5.8}>
                                {/* {props.update && */}
                                <Button
                                    fullWidth
                                    variant="contained"
                                    disabled={!selectedItems?.length}
                                    sx={{ backgroundColor: "#2A2F42", borderRadius: "1vh", color: "#F0F2FF", fontWeight: "700", '&:hover': { backgroundColor: '#2A2F42' } }}
                                    onClick={handleOpen}
                                >
                                    {props.saveBtnLoader ? <> &nbsp; <CircularProgress sx={{ color: "white" }} size={20} />
                                    </> : "Add to a forum"}
                                </Button>
                                {/* } */}
                            </Grid>
                        </Grid>
                    </Grid>

                    {/*  CARD SECTTION */}
                    <Grid container item xs={12} rowGap={1.8} justifyContent={'center'} >
                        {OnboardUsersList.length === 0 ?
                            <>
                                <Grid container item xs={12} justifyContent={"center"} alignItems={"center"} sx={{ mt: 5 }}>
                                    <Grid item>
                                        <Typography variant='h6' sx={{ fontWeight: "600", color: '#5F83ED' }}>No Record Found</Typography>
                                    </Grid>
                                </Grid>
                            </>
                            : OnboardUsersList && OnboardUsersList?.map((user: any, i: number) => {
                                var checked = selectedItems?.filter((itm: any) => user?.email == itm?.email)
                                return (
                                    <Grid container item xs={12} key={i} justifyContent={'center'} gap={1} sx={{ border: "1px solid #dedede", borderRadius: "2vh", p: 1.3 }}>
                                        <Grid container item xs={12} md={3.8} alignItems={"center"}>
                                            {user?.first_name + " " + user?.last_name}
                                        </Grid>
                                        <Grid container item xs={12} md={3.8} alignItems={"center"}>
                                            {user?.email}
                                        </Grid>
                                        <Grid container item xs={12} md={3} alignItems={"center"}>
                                            {user?.job_title}
                                        </Grid>
                                        <Grid container item xs={12} md={0.5}>
                                            <Checkbox checked={checked?.length ? true : false} onClick={() => handleCheckboxClick(user)} />
                                        </Grid>
                                    </Grid>
                                )
                            })
                        }
                    </Grid>

                    {/* PAGINATION CARD SECTTION */}
                    <Grid container item xs={12} justifyContent={"center"} alignItems={"center"} sx={{ my: "2vh" }}>
                        <Grid item xs={12}>
                            <PaginationSection currentPage={currentPage} count={1} handlePagination={(event: any, value: number) => { setCurrentPage(value); props?.push(`/companies/${props.page_props.params.company_id}?page=${value}`); }} shape="rounded" />
                        </Grid>
                    </Grid>

                </Grid>
                : null
            }
            <ForumPopup
                open={open}
                handleClose={handleClose}
                selectedItems={selectedItems}
                setSelectedItems={setSelectedItems}
                AlertManager={props.AlertManager}
                setButtonState={setButtonState}
                buttonState={buttonState}
                page_props={props.page_props}
                company_uuid={props.page_props.params.company_id}
                searchParams={searchParams}
            />
        </Grid>
    )
}

//Pagnation Component
const PaginationSection = (props: any) => {
    return (
        <Stack spacing={1}>
            <Pagination
                sx={{
                    '& .MuiPaginationItem-root': {
                        fontWeight: "700",
                        borderRadius: "1.1vh"
                    },
                    '& ul': {
                        justifyContent: 'center',
                    },
                    '& .Mui-selected': {
                        backgroundColor: '#F6F5FB',
                        color: 'black',
                        fontWeight: "700"
                    },
                    '& .MuiPaginationItem-previousNext': {
                        mx: "3vh",
                        backgroundColor: '#F6F5FB',
                        borderRadius: "1.1vh"
                    },
                }}
                size='medium'
                shape="rounded"
                count={props.count} page={props.currentPage} onChange={props.handlePagination} />
        </Stack>
    )
}

//ADD TO FORUM POPUP
const ForumPopup = ({ open, handleClose, selectedItems, AlertManager, buttonState, setButtonState, page_props, setSelectedItems, searchParams }: any) => {

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

    const [formData, setFormData] = useState({ ForumName: '' })
    const [errors, setErrors] = useState({ ForumName: '' });
    const [defaultTime, setDefaultTime] = React.useState(adjustToNearestFiveMinutes(dayjs()));
    const [selectedDates, setSelectedDates] = useState<any>(LocalToUTC(adjustToNearestFiveMinutes(dayjs())));
    const [seletedDay, setSeletedDay] = useState<any>(new Date().toLocaleDateString('en-US', { weekday: 'long' }));
    const [selectedCourseError, setSelectedCourseError] = useState(false);
    const [selectedModuleError, setSelectedModuleError] = useState(false);
    const [courseValue, setCourseValue] = useState<any>(null);
    const [chapterValue, setChapterValue] = useState<any>(null)
    const [chapterOption, setChapterOption] = useState<any>([]);
    const [ForumValue, setForumValue] = useState<any>(null);
    const [selectedForumError, setSelectedForumError] = useState(false);
    const [popUpSubmitBtnLoader, setisPopUpSubmitBtnLoader] = useState(false);
    const [startDate, setStartDate] = useState<any>(addSevenDays(dayjs()));
    const [meetingTimeError, setMeetingTimeError] = useState(false);
    const [startingDateError, setStartingDateError] = useState(false);

    //STATE CLEAR FUNCITON
    const InputClear = () => {
        setFormData({ ForumName: '' })
        setCourseValue(null)
        setChapterValue(null)
        setForumValue(null)
        setErrors({ ForumName: '' })
        setSelectedCourseError(false)
        setSelectedModuleError(false)
        setSelectedForumError(false)
    }

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

    //HandleCourseClick
    function handleCourseClick(event: any, value: any) {
        setCourseValue(value);
        setChapterValue(null);
        setSelectedCourseError(false);
        if (value?.uuid) {
            handleChapter(value);
        }
    }

    //HANDLE FORUM DROPDOWN LIST
    // async function handleForum() {
    //     const ForumAPI = await fetch(`/api/forum?company=${page_props.params.company_id}&page=1&limit=100000`, {
    //         method: "GET",
    //         cache: 'no-store',
    //         headers: {
    //             "Content-Type": "application/json",
    //         },
    //     });

    //     const apiResponse = await ForumAPI.json();
    //     const ForumItem = apiResponse?.data?.map((item: any) => {
    //         return { label: item.forum_info?.forum_name, uuid: item.forum_info?.uuid };
    //     });
    //     setForumOption(ForumItem);
    // }

    //HANDLE CHAPTER
    async function handleChapter(value: any) {
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
        setChapterOption(chapterItem ?? []);
    }


    //FORUM POPUP SUBMIT
    const forumPopupSubmit = async () => {
        let localTime = new Date(defaultTime.$d);
        let time_part = localTime.toLocaleTimeString([], { hour12: false });
        let timeZone = GetTimeZoneOffset();
        let dayAndTime = GetDayTimeInTimezone(time_part, seletedDay, dayjs(startDate).format('YYYY-MM-DD'), timeZone, "GMT+0000"); // Pass the date part as an argument
        const utcDay = getUTCForDay(seletedDay, timeZone, time_part);

        let addForumReqBody = {
            forum_name: formData.ForumName,
            meeting_day: utcDay,
            meeting_time: LocalToUTC(defaultTime),
            course_uuid: courseValue?.uuid,
            chapter_uuid: chapterValue?.uuid,
            users: selectedItems,
            starting_date: dayAndTime?.UTCDate + ' ' + LocalToUTC(defaultTime),
        }
        let existingForumReqBody = {
            users: selectedItems
        }
        setisPopUpSubmitBtnLoader(true)
        try {
            const response = await fetch(`/api/company/${page_props.params.company_id}/forum${buttonState ? '' : `/${ForumValue?.uuid}`}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(buttonState ? addForumReqBody : existingForumReqBody),
            });
            const data = await response.json();
            if (response.status == 200) {
                AlertManager(data?.message, false);
                InputClear();
                handleClose();
                setSelectedItems([]);
            }
            else {
                AlertManager(StaticMessage.ErrorMessage, true);
            }
        }
        catch (error: any) {
            AlertManager(StaticMessage.ErrorMessage, true);
        }
        setisPopUpSubmitBtnLoader(false)
    }

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
    const handleStartingDateError = (date: any, seletedDayParams: any) => {
        const dayIndex = dayjs(date).day();
        if (seletedDayParams && dayIndex !== dayOfWeekMap[seletedDayParams]) {
            setStartingDateError(true);
        } else {
            setStartingDateError(false);
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} >
            <Grid container item xs={12} direction={'row'} justifyContent={'space-between'} alignItems={'center'} sx={{ backgroundColor: "#2A2F42", p: 1.5 }} >
                <Typography variant="subtitle1" sx={{ color: 'white' }}>{`Import ${selectedItems?.length} users and add them to a forum ( ${!buttonState ? 'Existing forum' : 'New forum'} )`}</Typography>
                <CloseIcon
                    fontSize='small'
                    onClick={() => { InputClear(); handleClose(); }}
                    sx={{ cursor: 'pointer', color: "white" }}
                />
            </Grid>
            <Grid container item xs={12} sx={{ mt: "2vh", px: 2 }}>
                {!buttonState
                    ? <AddExistingForumComponent
                        ForumValue={ForumValue}
                        selectedForumError={selectedForumError}
                        setSelectedForumError={setSelectedForumError}
                        setForumValue={setForumValue}
                        searchParams={searchParams}
                        company_uuid={page_props.params.company_id}
                        AlertManager={AlertManager}

                    />
                    : <AddForumComponent
                        formData={formData}
                        handleChange={handleChange}
                        handleBlur={handleBlur}
                        errors={errors}
                        seletedDay={seletedDay}
                        setSeletedDay={setSeletedDay}
                        defaultTime={defaultTime}
                        setDefaultTime={setDefaultTime}
                        setSelectedDates={setSelectedDates}
                        courseValue={courseValue}
                        selectedCourseError={selectedCourseError}
                        setSelectedCourseError={setSelectedCourseError}
                        handleCourseClick={handleCourseClick}
                        chapterOption={chapterOption}
                        chapterValue={chapterValue}
                        selectedModuleError={selectedModuleError}
                        setChapterValue={setChapterValue}
                        setSelectedModuleError={setSelectedModuleError}
                        startDate={startDate}
                        setStartDate={setStartDate}
                        handleStartingDateError={handleStartingDateError}
                        handleMeetingTimeError={handleMeetingTimeError}
                        meetingTimeError={meetingTimeError}
                        isDateDisabled={isDateDisabled}
                        startingDateError={startingDateError}
                    />}
            </Grid>
            <Grid container item xs={12} sx={{ my: "2vh" }} columnGap={2} justifyContent={'center'} alignItems={'center'} >
                <Grid item xs={11} sm={10} md={5.5} sx={{ pb: "2.2vh" }}>
                    {
                        buttonState
                            ? <Button
                                fullWidth
                                variant="contained"
                                disabled={!formData.ForumName.length || !seletedDay.length || selectedDates == undefined || !Object.keys(courseValue ?? {}).length || startingDateError || meetingTimeError}
                                sx={{ backgroundColor: "#2A2F42", borderRadius: "1vh", color: "#F0F2FF", fontWeight: "700", '&:hover': { backgroundColor: '#2A2F42' } }}
                                onClick={() => forumPopupSubmit()}
                            >
                                {
                                    popUpSubmitBtnLoader
                                        ? <CircularProgress sx={{ color: "white" }} size={20} />
                                        : `Create forum with ${selectedItems?.length} members`
                                }
                            </Button>
                            : <Button
                                fullWidth
                                variant="contained"
                                disabled={!Object.keys(ForumValue ?? {}).length}
                                sx={{ backgroundColor: "#2A2F42", borderRadius: "1vh", color: "#F0F2FF", fontWeight: "700", '&:hover': { backgroundColor: '#2A2F42' } }}
                                onClick={() => forumPopupSubmit()}
                            >
                                {
                                    popUpSubmitBtnLoader
                                        ? <CircularProgress sx={{ color: "white" }} size={20} />
                                        : `Add ${selectedItems?.length} users to existing forum`
                                }
                            </Button>
                    }
                </Grid>
                <Grid item xs={11} sm={10} md={5} sx={{ pb: "5.5vh" }}>
                    <Link sx={{ ml: 1, cursor: 'pointer' }} onClick={() => setButtonState(!buttonState)}>
                        <Typography color="primary" sx={{ fontWeight: 700 }}>
                            {buttonState ? 'Choose an existing forum' : 'Add members to a new forum'}
                        </Typography>
                    </Link>
                </Grid>
            </Grid>
        </Dialog>
    )
}

//ADD FORUM POPUP SECTION
const AddForumComponent = ({
    formData,
    handleChange,
    handleBlur,
    errors,
    seletedDay,
    setSeletedDay,
    selectedDate,
    setSelectedDates,
    courseValue,
    selectedCourseError,
    setSelectedCourseError,
    handleCourseClick,
    chapterOption,
    chapterValue,
    selectedModuleError,
    setChapterValue,
    setSelectedModuleError,
    startDate,
    setStartDate,
    handleStartingDateError,
    handleMeetingTimeError,
    meetingTimeError,
    isDateDisabled,
    startingDateError,
    defaultTime,
    setDefaultTime

}: any) => {
    const [courseOption, setCourseOption] = useState<any>([]);
    const [isCourseLoading, setIsCourseLoading] = useState<boolean>(false);

    function CustomCalendarIcon(props: any) {
        return (
            <Image src={calender} alt="calender" />
        );
    }

    // GETTING COURSE API
    async function handleCourse() {
        setIsCourseLoading(true);
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
            if (chapterOption) {
                setIsCourseLoading(false);
            }
        }
    }

    return (
        <Grid container item xs={12} justifyContent={'center'} alignItems={'flex-start'} sx={{ pt: 0 }}>
            <Grid container item xs={11.7} sm={12} justifyContent={'center'} sx={{ p: 2, marginBottom: "2vh" }}>
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
                                //  handleStartingDateError(dayjs(startDate), e.target.value); 
                                setSeletedDay(e.target.value)
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
                        <Typography variant="caption">COURSE NAME</Typography>
                        <Autocomplete
                            fullWidth
                            size="small"
                            disablePortal
                            id="combo-box-demo"
                            loading={isCourseLoading}
                            options={courseOption}
                            value={courseValue}
                            renderInput={(params) => <TextField {...params} placeholder="Choose a course name" error={selectedCourseError} helperText={selectedCourseError ? "Course name is required" : ''} sx={{ "& .MuiOutlinedInput-root": { borderRadius: "1vh" } }} />}
                            isOptionEqualToValue={(option, value) => option === value || option.label === value.label}
                            onBlur={() => setSelectedCourseError(courseValue == null)}
                            onChange={handleCourseClick}
                            onOpen={handleCourse}
                        />
                    </Grid>
                    <Grid container item xs={12} sm={5.7} direction={'column'} sx={{ backgroundColor: 'white', }}>
                        <Typography variant="caption">STARTING CHAPTER (Optional)</Typography>
                        <Autocomplete
                            fullWidth
                            size="small"
                            disablePortal
                            id="combo-box-demo"
                            options={chapterOption}
                            value={chapterValue}
                            renderInput={(params) => <TextField {...params} placeholder="Choose a starting chapter" error={selectedModuleError} sx={{ "& .MuiOutlinedInput-root": { borderRadius: "1vh" } }} />}
                            isOptionEqualToValue={(option, value) => option === value || option.label === value.label}
                            onChange={(event, value) => { setChapterValue(value); setSelectedModuleError(false) }}
                        />
                    </Grid>
                </Grid>
                <Grid container item md={12} sx={{ color: "#777", m: "1vh" }} justifyContent={'space-between'} alignItems={'flex-start'}>
                    <Grid container item xs={12} sm={12} direction={'column'} >
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
                                onChange={(newValue: any) => setStartDate(dayjs(newValue).format('YYYY-MM-DD'))}
                            />
                            {startingDateError && (
                                <FormHelperText error>
                                    Choose date that falls on the same day as {seletedDay}
                                </FormHelperText>
                            )}
                        </LocalizationProvider>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    )
}

//EXISTING FORUM POPUP SECTION

const AddExistingForumComponent = ({ ForumValue, setForumValue, setSelectedForumError, selectedForumError, searchParams, AlertManager, company_uuid }: any) => {

    const [isLoading, setisLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(searchParams?.get('page') || 1);
    const [filteredForumNames, setFilteredForumNames] = useState([]);
    const [isAutocompletLoading, setIsAutocompletLoading] = useState(false);
    const [isFreeSoloCondition, setIsFreeSoloCondition] = useState(true);

    //GET ALL FORUM API
    async function getAllForumAPI(company_uuid: any, newInputValue: any) {
        setIsFreeSoloCondition(false);
        setIsAutocompletLoading(true);
        try {
            const getAllUsers_API = await fetch(`/api/forum?${newInputValue.length ? `search=${newInputValue}` : ''}&company=${company_uuid}&page=${currentPage}&limit=1000&isDropdown=true`, {
                method: 'GET',
                cache: 'no-store',
                headers: {
                    "Content-Type": "application/json",
                },
            })
            const searchApiResponse = await getAllUsers_API.json();
            const updatedItems = searchApiResponse?.data.map((item: any) => {
                return { label: item.forum_info.forum_name, uuid: item.forum_info.uuid };
            });
            setFilteredForumNames(updatedItems);
            setCurrentPage(searchApiResponse?.page_meta?.current)
            setIsAutocompletLoading(false);

        }
        catch (error: any) {
            AlertManager(StaticMessage.ErrorMessage, true);
            setIsAutocompletLoading(false);
        }
    }

    // Initialize a flag to track whether the user has finished typing
    let userFinishedTyping = false;
    // Initialize a variable to store the timer ID
    let debounceTimer: NodeJS.Timeout | null = null;
    // Custom debounce function
    const customDebounce = (callback: () => void, delay: number) => {
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }
        debounceTimer = setTimeout(callback, delay);
    };

    return (
        <Grid container item xs={12} justifyContent={'center'} alignItems={'flex-start'} sx={{ pt: 0, width: '100vw' }}>
            <Grid container item xs={11.7} sm={12} justifyContent={'center'} sx={{ p: 2, marginBottom: "2vh" }}>
                <Grid container item md={12} sx={{ color: "#777", m: "1vh" }} justifyContent={'space-between'} alignItems={'flex-start'}>
                    <Grid container item xs={12} direction={'column'} sx={{ backgroundColor: 'transparent', }}>
                        <Typography variant="caption">SEARCH FORUM</Typography>
                        <Autocomplete
                            fullWidth
                            size="small"
                            // disablePortal
                            id="combo-box-demo"
                            options={filteredForumNames}
                            value={ForumValue}
                            loading={isAutocompletLoading}
                            freeSolo={filteredForumNames.length == 0 && isFreeSoloCondition}
                            renderInput={(params) => <TextField {...params} placeholder="Search for a forum" error={selectedForumError} helperText={selectedForumError ? "Forum name is required" : ''} sx={{ "& .MuiOutlinedInput-root": { borderRadius: "1vh" } }} />}
                            isOptionEqualToValue={(option, value) => option === value || option.label === value.label}
                            onBlur={() => {
                                setSelectedForumError(ForumValue == null)
                                setFilteredForumNames([]);
                                setIsFreeSoloCondition(true)
                            }}
                            onChange={(event, value) => {
                                setForumValue(value);
                                setFilteredForumNames([]);
                                setIsFreeSoloCondition(true);
                                setSelectedForumError(false)

                            }}
                            onInputChange={(event, newInputValue) => {
                                if (newInputValue.length == 0) {
                                    setIsFreeSoloCondition(true);
                                    setFilteredForumNames([]);
                                }
                                if (newInputValue && newInputValue.trim()) {
                                    userFinishedTyping = false; // Reset the flag when user starts typing
                                    customDebounce(() => {
                                        if (!userFinishedTyping) {
                                            getAllForumAPI(company_uuid, newInputValue);
                                            userFinishedTyping = true;
                                        }
                                    }, 1500); // Adjust the delay as needed
                                    setFilteredForumNames([]);
                                    setIsFreeSoloCondition(true);

                                } else {
                                    setFilteredForumNames([]);
                                    userFinishedTyping = true; // Mark the user as finished typing
                                }
                            }}
                        />
                    </Grid>
                </Grid>

            </Grid>
        </Grid>
    )
}

{/* <Button
                        fullWidth
                        variant="outlined"
                        // disabled={!selectedItems?.length}
                        sx={{ borderRadius: "1vh", color: "#2A2F42", fontWeight: "700" }}
                        onClick={() => { setButtonState(!buttonState) }}
                    >
                        {buttonState ? 'Choose an existing forum' : 'Add members to new forum'}
                    </Button> */}