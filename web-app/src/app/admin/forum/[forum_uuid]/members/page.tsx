"use client"

import React, { useEffect, useState } from "react";
import { Avatar, Button, CircularProgress, Grid, Link, Typography } from "@mui/material";
import SnakBarAlert from "@/components/snakbaralert/snakbaralert";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import AddIcon from '@mui/icons-material/Add';
import MemberCard from "@/components/memberCard";
import BackDropLoading from "@/components/loading/backDropLoading";
import { useRouter } from 'next/navigation';
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from 'dayjs';
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import calender from "@/assets/mingcute_calendar-fill.svg"
import Image from "next/image";
import { usePathname } from 'next/navigation'
import { useDispatch } from "react-redux";
import { setForumName } from "@/redux/reducers/members/memberSlice";
import { StaticMessage } from "@/app/util/StaticMessage";

export default function Members(props: any) {

    const pathname = usePathname()
    const [alertOpen, setAlertOpen] = useState(false);
    const [alert, setAlert] = useState("");
    const [alertSeverity, setAlertSeverity] = useState(false);
    const [healthBtnToggle, setHealthBtnToggle] = useState(false);
    const [isloading, setisLoading] = useState<Boolean>(false);
    const [isBtnLoading, setIsBtnLoading] = useState<Boolean>(false);
    const [memberInfo, setMemberInfo] = useState<any>([]);
    const [forumInfo, setForumInfo] = useState<any>([]);
    const [mcqInfo, setMcqInfo] = useState<any>([]);
    const [membersMcqs, setMembersMcqs] = useState<any>([]);
    const [dateValue, setDateValue] = useState<any>(dayjs(new Date()));
    const [isLinkLoading, setIsLinkLoading] = useState(false);
    const [isSubmitLoading, setIsSubmitLoading] = useState(false);
    const [accordionCardLoadingOnDateChange, setAccordionCardLoadingOnDateChange] = useState(false);
    const [updatedMemberMcqs, setUpdatedMemberMcqs] = useState([]);
    const [isHealthCheckClicked, setIsHealthCheckClicked] = useState(false);
    const [dateDsiaable, setDateDisable] = useState(null);

    const dispatch = useDispatch();
    const { push } = useRouter();

    async function getALLMember() {
        try {
            const requestAllMemberAPI = await fetch(`/api/admin/forum?uuid=${props.params.forum_uuid}`, {
                method: "GET",
                cache: 'no-store',
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const apiResponse = await requestAllMemberAPI.json();
            if (requestAllMemberAPI.status == 200) {
                setMemberInfo(apiResponse?.data?.forum_info?.members);
                setForumInfo(apiResponse?.data?.forum_info);
                dispatch(setForumName(apiResponse?.data?.forum_info?.forum_name));
                AlertManager(apiResponse?.message, false);
            }
            else {
                AlertManager(apiResponse?.message, true);
            }
        }
        catch (error) {
            AlertManager(StaticMessage.ErrorMessage,true);
        }

    }

    async function getALLMemberMCQ(date: any) {
        try {
            const requestAllMemberMCQAPI = await fetch(`/api/admin/forum/health-mcq?uuid=${props.params.forum_uuid}&date=${date}`, {
                method: "GET",
                cache: 'no-store',
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const apiResponse = await requestAllMemberMCQAPI.json();
            if (requestAllMemberMCQAPI.status === 200) {
                setMemberInfo(apiResponse?.data?.member_info);
                setMcqInfo(apiResponse?.data?.mcq_info);
                AlertManager(apiResponse?.message, false);
                setAccordionCardLoadingOnDateChange(false)
            }
            else {
                AlertManager(apiResponse?.message, true);
            }
        }
        catch (error) {
            AlertManager(StaticMessage.ErrorMessage,true);
        }

    }

    function CustomCalendarIcon(props: any) {
        return (
            <Image src={calender} alt="calender" />
        );
    }

    function AlertManager(message: string, severity: boolean) {
        setAlert(message)
        setAlertSeverity(severity)
        setAlertOpen(true)
        setisLoading(false)
    }

    function handleRadioGroupValue(e: any, member_uuid: any, item: any, option: any) {

        const foundMember = memberInfo.find((member: any) => member.uuid === member_uuid);
        if (foundMember) {
            const mcq = foundMember.mcq_info.find((mcq: any) => mcq.mcq_title === item.mcq_title);
            if (mcq) {
                mcq?.mcq_options?.forEach((element: any) => {
                    if (element.uuid == option.uuid) {
                        return element.selected_answer = {
                            uuid: e.target.value,
                            createdAt: new Date().toISOString()
                        }
                    }
                    else {
                        return element.selected_answer = null;
                    }
                })
            }
        }

        const newArray = memberInfo.map((member: any) => {
            const mcqsArray: any[] = member?.mcq_info?.reduce((acc: any[], item: any) => {
                if (!item?.mcq_options || item.mcq_options.length === 0) {
                    return acc; // Return accumulator if mcq_options is empty
                } else {
                    const selectedOption = item.mcq_options.find((select: any) => select.selected_answer !== null);
                    if (selectedOption) {
                        acc.push({ [item.mcq_title]: selectedOption.uuid || null });
                    }
                }
                return acc;
            }, []);

            return {
                member_uuid: member.uuid,
                mcqs: mcqsArray
            };
        });

        const replaceDuplicates = () => {
            membersMcqs.forEach((member: any) => {
                const updatedArray: any = [...newArray]; // Create a new array to preserve original objects
                // Find the corresponding object in NewArray
                const target: any = newArray.find((obj: any) => obj.member_uuid === member.member_uuid);

                // If the object is found, update mcqs accordingly
                if (target) {
                    // Iterate through each mcq in member.mcqs
                    member.mcqs.forEach((newMcq: any) => {
                        // Get the key of the newMcq
                        const key = Object.keys(newMcq)[0];
                        // Find the corresponding mcq in target.mcqs
                        const existingMcqIndex = target.mcqs.findIndex((mcq: any) => mcq.hasOwnProperty(key));
                        // If mcq exists, replace it with newMcq
                        if (existingMcqIndex !== -1) {
                            target.mcqs[existingMcqIndex][key] = newMcq[key];
                        } else {
                            // If mcq does not exist, push newMcq to target.mcqs
                            target.mcqs.push(newMcq);
                        }
                    });
                }
            });
            setUpdatedMemberMcqs(newArray);

        };
        replaceDuplicates();

        const existingMemberIndex = membersMcqs.findIndex((member: any) => member.member_uuid === member_uuid);

        if (existingMemberIndex !== -1) {
            // Member already exists, update its options
            setMembersMcqs((prevState: any) => {
                const updatedMembers = [...prevState];
                const updatedMcqs = updatedMembers[existingMemberIndex].mcqs.map((mcq: any) => {
                    // Check if the current mcq object has the key already
                    if (mcq[e.target.name]) {
                        mcq[e.target.name] = e.target.value; // If yes, update the value
                    }
                    return mcq;
                });
                // If the key does not exist, add a new object to mcqs array with the key-value pair
                if (!updatedMcqs.find((mcq: any) => mcq.hasOwnProperty(e.target.name))) {
                    updatedMembers[existingMemberIndex].mcqs.push({
                        [e.target.name]: e.target.value
                    });
                }
                return updatedMembers;
            });
        } else {
            // Member doesn't exist, add it to the state
            setMembersMcqs((prevState: any) => [
                ...prevState,
                {
                    member_uuid: member_uuid,
                    mcqs: [
                        {
                            [e.target.name]: e.target.value
                        }
                    ]
                }
            ]);
        }
    }

    async function postAttedanceAPI() {

        var state: any = updatedMemberMcqs && updatedMemberMcqs?.map((item: any) => {
            item.mcqs = item.mcqs.map((mcq: any) => {
                let newMcq: { [key: string]: any; } = {};
                for (let key in mcq) {
                    newMcq['mcq_option_uuid'] = mcq[key];
                }
                return newMcq;
            });
            return item;
        });


        setIsSubmitLoading(true)
        if (membersMcqs.length === 0) {
            setIsSubmitLoading(false)
            return AlertManager("kindly make changes to the attendance before saving.", true);
        }
        else {
            try {
                const method = memberInfo[0].mcq_info[0].mcq_options.length === 0 ? "POST" : "PUT";

                const res = await fetch(`/api/admin/forum/attendance?uuid=${props.params.forum_uuid}&date=${props?.searchParams?.health_check_date}`, {
                    method: method,
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(
                        state
                    ),
                });
                const apiResponse = await res.json();
                if (res.status == 200) {
                    AlertManager(apiResponse?.message, false);
                    setUpdatedMemberMcqs([]);
                    setMembersMcqs([]);
                    window.location.href = `${pathname.replace(/\?.*/, '')}`
                }
                else {
                    AlertManager(apiResponse?.message, true);
                }
            }
            catch (error) {
                AlertManager(StaticMessage.ErrorMessage,true);
            }

        }
        setIsSubmitLoading(false)
    }

    useEffect(() => {
        setisLoading(true);
        getALLMember();
    }, [])

    useEffect(() => {
        setAccordionCardLoadingOnDateChange(true)
        if (props?.searchParams?.health_check_date) {
            const today = new Date();
            const selectedDate = props?.searchParams?.health_check_date ? new Date(props?.searchParams?.health_check_date) : null;

            // If selected date is greater than today, set it to today's date
            if (selectedDate && selectedDate > today) {
                setDateValue(dayjs(today))
            } else {
                setDateValue(dayjs(props?.searchParams?.health_check_date))
            }
            getALLMemberMCQ(props?.searchParams?.health_check_date);
            setHealthBtnToggle(true);

        } else {
            setHealthBtnToggle(false);
        }

    }, [props?.searchParams])
    return (
        <>
            <div className="ml:0 lg:ml-[17.35vw]" style={{ backgroundColor: "#F6F5FB", paddingBottom: '5vh', minHeight: '100vh' }}>
                <Grid container item xs={12} justifyContent={'flex-start'} alignItems={'center'} sx={{ pt: 3, pb: 1, pl: 3, pr: 4 }}>
                    <Grid container item xs={12} lg={6} alignItems={'center'}>
                        <BreadCrumComponent push={push} params={props?.params} forumInfo={forumInfo} healthBtnToggle={healthBtnToggle}/>
                    </Grid>
                    <Grid container item xs={12} lg={6} alignItems={'center'} justifyContent={'flex-end'}>
                        <Typography
                            variant="caption"
                            sx={{ color: "#2F2F2F", fontWeight: "600", cursor: "pointer", px: 3, py: 1, display: 'flex', alignItems: 'center' }}
                            onClick={() => { setIsLinkLoading(true); push(`/admin/forum/${props.params.forum_uuid}/settings`) }}
                        >
                            {
                                isLinkLoading
                                    ? <CircularProgress sx={{ color: "black" }} size={20} />
                                    : <SettingsIcon sx={{ cursor: "pointer" }} />
                            }
                            &nbsp;Settings
                        </Typography>
                    </Grid>
                </Grid>

                <Grid container item xs={12} justifyContent={'flex-start'} alignItems={'center'} sx={{ pl: 3 }}>
                    <Grid container item xs={11.5} alignItems={'center'} justifyContent={'center'} sx={{ backgroundColor: 'white', borderRadius: '1vh', p: 2, }} >
                        <Grid container item xs={12} justifyContent={'flex-end'} >
                            <Grid container item xs={12} sm={8} justifyContent={'flex-end'} gap={1}>
                                <Button
                                    variant="outlined"
                                    disabled={props?.searchParams?.settings=='true'}
                                    sx={{ borderRadius: "1vh", color: !healthBtnToggle ? "#14A1B4 !important" : "#F0F2FF !important", backgroundColor: !healthBtnToggle ? "white !important" : "#14A1B4 !important" }}
                                    onClick={() => { let formattedDate = new Date().toISOString().split('T')[0]; push(`${pathname}?health_check_date=${formattedDate}`);  setIsHealthCheckClicked(true);}}
                                >
                                    <MonitorHeartIcon fontSize="medium" sx={{ border: "1px solid #D8D8D8", color: !healthBtnToggle ? "#14A1B4" : "#F0F2FF", borderRadius: '0.5vh', cursor: 'pointer', mr: 1, fontWeight: '800'}} />
                                    <Typography variant="button" fontWeight={"700"}>Health Check</Typography>
                                </Button>
                                {/* {!healthBtnToggle ?  */}
                                <Button
                                    variant="contained"
                                    disabled={props?.searchParams?.settings=='true' || healthBtnToggle}
                                    sx={{ backgroundColor: "#2A2F42", borderRadius: "1vh", '&:hover': { backgroundColor: '#32374e' } }}
                                    onClick={() => { setIsBtnLoading(true); push(`/admin/forum/${props.params.forum_uuid}/members/create`) }}
                                >
                                    {isBtnLoading ? <CircularProgress sx={{ color: "white" }} size={20} /> : <AddIcon fontSize="medium" />}
                                    &nbsp;&nbsp; <Typography variant="button"  sx={{ fontWeight: "700" }}>Add a member</Typography> 
                                </Button>
                                {/* : null } */}
                            </Grid>
                        </Grid>


                        {healthBtnToggle &&
                            <Grid container item xs={12} direction={"row"} sx={{ my: 1 }}>
                                <Grid container item xs={12} sm={6} md={3} lg={2} direction={"column"} sx={{ backgroundColor: "transperant" }}>
                                    <Typography variant="caption" sx={{ fontWeight: "400" }}>DATE OF FORUM</Typography>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DatePicker
                                            disabled={props?.searchParams?.settings=='true'}
                                            slotProps={{ textField: { size: 'small'} }}
                                            slots={{
                                                openPickerIcon: CustomCalendarIcon
                                            }}
                                            sx={{
                                                border: "1px solid #D8D8D8", borderRadius: "0.5vh"
                                            }}
                                            disableFuture
                                            value={dateValue}
                                            onChange={(newValue) => {
                                                push(`${pathname}?health_check_date=${dayjs(newValue).format('YYYY-MM-DD')}`);
                                                // }
                                            }}
                                        />
                                    </LocalizationProvider>
                                </Grid>
                            </Grid>
                        }


                        <Grid item xs={12} justifyContent={"flex-start"} alignItems={"flex-start"} sx={{ backgroundColor: "transperant" }} >
                            {
                                memberInfo?.map((item: any, index: number) => {
                                    return (
                                        <Grid container item xs={12} key={index} justifyContent={"flex-start"} alignItems={"flex-start"} sx={{ mt: 2, }}>
                                            <MemberCard accordionCardLoadingOnDateChange={accordionCardLoadingOnDateChange} healthBtnToggle={healthBtnToggle} setHealthBtnToggle={setHealthBtnToggle} members={item} mcqInfo={mcqInfo} handleRadioGroupValue={handleRadioGroupValue} forumUuid={props.params.forum_uuid} />
                                        </Grid>
                                    )
                                })
                            }
                        </Grid>

                        {/* <Grid container direction="row" alignItems="left" justifyContent="left" xs={10} sm={4} md={4} lg={3} sx={{ backgroundColor: "transperant", my: 3 }}> */}

                        <Grid container direction="row" justifyContent="flex-start" alignItems="center" sx={{ my: 3 }}>
                            {healthBtnToggle
                                ?
                                <>
                                    <Grid item xs={8.8} sm={3.5} md={3} lg={2.5} xl={2} >
                                        <Button variant="contained" fullWidth sx={{ borderRadius: "1vh", backgroundColor: '#14A1B4', '&:hover': { backgroundColor: "#14A1B4" } }} onClick={() => { postAttedanceAPI() }}>
                                            {isSubmitLoading ? <CircularProgress sx={{ color: "white" }} size={20} /> :
                                                <Typography variant="caption" sx={{ fontWeight: "700" }}>Submit Health Check</Typography>
                                            }
                                        </Button>
                                    </Grid>
                                    <Grid item xs={2} sm={3.5} md={3} lg={2.3} xl={2}>
                                        <Button fullWidth variant="contained" color="error" sx={{ borderRadius: "1vh", mx: 2 }} onClick={() => push(`/admin/forum/${props.params.forum_uuid}/members`)}>
                                            <Typography variant="caption" sx={{ fontWeight: "700" }}>Cancel</Typography>
                                        </Button>
                                    </Grid>

                                </>
                                : null
                            }
                        </Grid>
                    </Grid>
                </Grid>
            </div >
            <SnakBarAlert alertOpen={alertOpen} setAlertOpen={setAlertOpen} alertSeverity={alertSeverity} alert={alert} />
            <BackDropLoading isLoading={isloading} />
        </>
    )
}


//Breadcrum component
const BreadCrumComponent = ({ push, params, forumInfo, lastName, healthBtnToggle }: any) => {
    return (
        <>
            <ArrowBackIcon fontSize="large" sx={{ border: "1px solid #D8D8D8", color: 'black', p: 1, borderRadius: '0.5vh', cursor: 'pointer', mr: 2, backgroundColor: 'white' }} onClick={() => push("/admin/dashboard")} />
            <Typography variant="h6" sx={{ fontWeight: '600', cursor: 'pointer' }} onClick={(() => push("/admin/dashboard"))}>{forumInfo?.forum_name}</Typography>
            <KeyboardArrowRightIcon />
            <Typography variant="subtitle1" sx={{ fontWeight: '600', cursor: healthBtnToggle ? 'pointer' : null }} onClick={() =>{healthBtnToggle ? push(`/admin/forum/${params.forum_uuid}/members`) : null}}  >Members</Typography>
            {healthBtnToggle ? <KeyboardArrowRightIcon /> : null }
            <Typography variant="subtitle1" sx={{ fontWeight: '500' }} > {healthBtnToggle ? 'Health Check' : null} </Typography>

        </>
    )
}



{/* <div style={{ backgroundColor: "#F6F5FB", minHeight: "100vh" }} >
                <Grid md={12} container item sx={{ backgroundColor: "#F6F5FB", width: "80vw", minHeight: "100vh", ml: "19vw", alignItems: "flex-start" }} >
                    <Grid md={11.3} container item direction={"column"} sx={{
                        backgroundColor: "#F6F5FB", width: "68.946vw", minHeight: "98vh", mt: "0.729vw"
                    }} >
                        <Grid md={12} container item direction={"row"} className="mt-0.5" style={{ height: "5vh", justifyContent: "space-between", backgroundColor: "transperant", marginTop: "1.2vh" }}>
                            <Grid item container md={11.1} className="justify-start items-center" >
                                <Avatar sx={{ bgcolor: "white", height: "2.19vw", width: "2.19vw", border: "1px solid #D8D8D8", cursor: 'pointer' }} variant="rounded" onClick={() => push("/admin/dashboard")}>
                                    <ArrowBackIcon style={{ color: "#000000", fontSize: "0.831vw" }} />
                                </Avatar>
                                <Link style={{ cursor: "pointer" }} color="inherit" underline="hover" variant="body2" href="/admin/dashboard">
                                    <Typography style={{ paddingLeft: "0.7vw", color: "#000000", fontSize: "1.354vw", fontWeight: "700" }}>
                                        {forumInfo?.forum_name}
                                    </Typography> </Link>
                                <Typography style={{ color: "#000000", fontSize: "1.vw", fontWeight: "700" }}>< KeyboardArrowRightIcon className="h-[0.781] w-[0.781]" />Members</Typography>
                            </Grid>
                            <Grid item container md={0.9} className=" flex justify-center items-center" onClick={() => { setIsLinkLoading(true); push(`/admin/forum/${props.params.forum_uuid}/settings`); }}>
                                {
                                    isLinkLoading
                                        ? <CircularProgress sx={{ color: "black" }} size={20} />
                                        : <Typography style={{ color: "#2F2F2F", fontSize: "0.833vw", fontWeight: "600", paddingRight: "0.3vw", cursor: "pointer", display: 'flex', alignItems: 'center' }}>
                                            <SettingsIcon style={{ fontSize: "1.042vw", cursor: "pointer" }} />&nbsp;Settings
                                        </Typography>
                                }
                            </Grid>
                        </Grid>
                        <Grid md={12} container item className="flex justify-start items-start" style={{ minHeight: "43.252vw", width: "100%", backgroundColor: "transperant", marginTop: "1vh" }}>
                            <Grid md={12} container item className=" bg-white rounded-xl flex  border-solid border-1 justify-center items-center" sx={{ minHeight: "43.252vw", width: "68.94vw", backgroundColor: "transperant" }}>
                                <Grid container item md={11.6} direction={"column"} sx={{ minHeight: "43.252vw", width: "68.94vw", backgroundColor: "transperant" }}>
                                    <Grid container item md={12} className="justify-end items-center" sx={{ height: "4vw", width: "100%", mt: "1.3vw", }}>

                                        <Button
                                            variant="outlined"
                                            className="flex w-[13vw] h-[5vh] text-[#F0F2FF] font-bold"
                                            sx={{ borderRadius: "1vh", color: !healthBtnToggle ? "#14A1B4 !important" : "#F0F2FF !important", backgroundColor: !healthBtnToggle ? "white !important" : "#14A1B4 !important", fontSize: "0.7vw" }}
                                            onClick={() => { let formattedDate = new Date().toISOString().split('T')[0]; push(`${pathname}?health_check_date=${formattedDate}`) }}
                                        >
                                            <MonitorHeartIcon className="flex w-[0.99vw] h-[0.98vh] m-0" sx={{ color: !healthBtnToggle ? "#14A1B4" : "#F0F2FF" }} />&nbsp;&nbsp;Health Check
                                        </Button>
                                        <Button
                                            variant="contained"
                                            className="flex w-[13vw] h-[5vh] text-[#F0F2FF] font-bold "
                                            sx={{ backgroundColor: "#2A2F42", borderRadius: "1vh", marginLeft: "2vh", fontSize: "0.7vw", '&:hover': { backgroundColor: '#32374e' } }}
                                            onClick={() => { setIsBtnLoading(true); push(`/admin/forum/${props.params.forum_uuid}/members/create`) }}
                                        >
                                            {isBtnLoading ? null : <AddIcon className=" flex w-[0.99vw] h-[0.98vh]  m-0" />}&nbsp;{isBtnLoading ? <CircularProgress sx={{ color: "white" }} size={20} /> : "ADD A MEMBER"}
                                        </Button>

                                    </Grid>
                                    {healthBtnToggle ?
                                        <Grid container item md={12} direction={"row"} className="justify-start items-center" sx={{ height: "3.66vh", width: "100%", backgroundColor: "transperant" }}>
                                            <Grid container item md={2} direction={"column"} sx={{ backgroundColor: "transperant" }}>
                                                <Typography style={{ fontSize: "0.729vw", fontWeight: "400" }}>DATE OF FORUM</Typography>
                                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                    <DatePicker
                                                        slotProps={{ textField: { size: 'small', } }}
                                                        slots={{
                                                            openPickerIcon: CustomCalendarIcon
                                                        }}
                                                        sx={{
                                                            "& .MuiInputBase-input": {
                                                                width: "7.938vw",
                                                                height: "2.5vh",
                                                            }, border: "1px solid #D8D8D8", borderRadius: "0.5vw"
                                                        }}
                                                        disableFuture
                                                        value={dateValue}
                                                        onChange={(newValue) => { push(`${pathname}?health_check_date=${dayjs(newValue).format('YYYY-MM-DD')}`); }}
                                                    />
                                                </LocalizationProvider>
                                            </Grid>
                                        </Grid> : null}

                                    <Grid item md={12} justifyContent={"flex-start"} alignItems={"flex-start"} style={{ minHeight: "37.55vw", width: "100%", backgroundColor: "transperant", paddingTop: "1vw" }} >
                                        {
                                            memberInfo?.map((item: any, index: number) => {
                                                return (
                                                    <Grid container item md={12} key={index} justifyContent={"flex-start"} alignItems={"flex-start"} sx={{ minHeight: "4.571vw", width: "100%", marginTop: "1vh" }}>
                                                        <MemberCard healthBtnToggle={healthBtnToggle} setHealthBtnToggle={setHealthBtnToggle} members={item} mcqInfo={mcqInfo} handleRadioGroupValue={handleRadioGroupValue} forumUuid={props.params.forum_uuid} />
                                                    </Grid>
                                                )
                                            })
                                        }
                                    </Grid>
                                    <Grid container item md={12} style={{ backgroundColor: "transperant", height: "5vw", width: "100%", marginTop: "2vh", marginBottom: "3vh" }}>
                                        {healthBtnToggle
                                            ? <>
                                                <Button variant="contained" className="flex w-[12vw] h-[5vh] text-[#F0F2FF] font-bold " sx={{ borderRadius: "1vh", padding: "0", margin: "0", fontSize: "0.73vw", backgroundColor: '#14A1B4', '&:hover': { backgroundColor: "#14A1B4" }, }} onClick={() => { postAttedanceAPI() }}>
                                                    {isSubmitLoading ? <CircularProgress sx={{ color: "white" }} size={20} /> : <> Submit Health Check</>}
                                                </Button>
                                                <Button variant="contained" color="error" className="flex w-[12vw] h-[5vh] text-[#F0F2FF] font-bold " sx={{ borderRadius: "1vh", padding: "0", margin: "0", marginLeft: '1vw', fontSize: "0.73vw" }} onClick={() => push(`/admin/forum/${props.params.forum_uuid}/members`)}>
                                                    Cancel
                                                </Button>
                                            </>
                                            : null
                                        }
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </div > */}
