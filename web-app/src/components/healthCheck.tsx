import * as React from 'react';
import { CircularProgress, Grid, Typography, Button, } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import {  useState } from "react";
import { useDispatch } from "react-redux";
import SnakBarAlert from "@/components/snakbaralert/snakbaralert";
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import calender from "@/assets/mingcute_calendar-fill.svg"
import Image from "next/image";
import dayjs from 'dayjs';
import MemberCard from './memberCard';
import { StaticMessage } from '@/app/util/StaticMessage';

export default function HealthCheck(props: any) {
    const { push } = useRouter();
    const pathname = usePathname();
    const [alertOpen, setAlertOpen] = useState(false);
    const [alert, setAlert] = useState("");
    const [alertSeverity, setAlertSeverity] = useState(false);
    const [accordionCardLoadingOnDateChange, setAccordionCardLoadingOnDateChange] = useState(false);
    const [mcqInfo, setMcqInfo] = useState<any>([]);
    const [membersMcqs, setMembersMcqs] = useState<any>([]);
    const [isSubmitLoading, setIsSubmitLoading] = useState(false);
    const [isCancelLoading, setIsCancelLoading] = useState(false);
    const [updatedMemberMcqs, setUpdatedMemberMcqs] = useState([]);

    function AlertManager(message: string, severity: boolean) {
        setAlert(message)
        setAlertSeverity(severity)
        setAlertOpen(true)
    }

    function CustomCalendarIcon(props: any) {
        return (
            <Image src={calender} alt="calender" />
        );
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
                const method = props.memberInfo[0].mcq_info[0].mcq_options.length === 0 ? "POST" : "PUT";

                const res = await fetch(`/api/admin/forum/attendance?uuid=${props.forum_uuid}&date=${props?.health_check_date}`, {
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

    function handleRadioGroupValue(e: any, member_uuid: any, item: any, option: any) {

        const foundMember = props.memberInfo.find((member: any) => member.uuid === member_uuid);
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

        const newArray = props.memberInfo.map((member: any) => {
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

    return (
        <>
            <Grid container item xs={12} direction={"row"} sx={{ my: 1 }}>
                <Grid container item xs={12} sm={6} md={3} lg={2} direction={"column"} sx={{ backgroundColor: "transperant" }}>
                    <Typography variant="caption" sx={{ fontWeight: "400" }}>DATE OF FORUM</Typography>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            slotProps={{ textField: { size: 'small' } }}
                            slots={{
                                openPickerIcon: CustomCalendarIcon
                            }}
                            sx={{
                                border: "1px solid #D8D8D8", borderRadius: "0.5vh"
                            }}
                            disableFuture
                            value={props.dateValue}
                            onChange={(newValue) => {
                                push(`${pathname}?tab=healthcheck&health_check_date=${dayjs(newValue).format('YYYY-MM-DD')}`);
                            }}
                        />
                    </LocalizationProvider>
                </Grid>
            </Grid>
            {props.healthBtnToggle
                ?
                <Grid item xs={12} justifyContent={"flex-start"} alignItems={"flex-start"} sx={{ backgroundColor: "transperant", minHeight: "60vh" }} >
                    {
                        props.memberInfo?.map((item: any, index: number) => {
                            return (
                                <Grid container item xs={12} key={index} justifyContent={"flex-start"} alignItems={"flex-start"} sx={{ mt: 2, }}>
                                    <MemberCard accordionCardLoadingOnDateChange={accordionCardLoadingOnDateChange} healthBtnToggle={props.healthBtnToggle} setHealthBtnToggle={props.setHealthBtnToggle} members={item} mcqInfo={mcqInfo}
                                        handleRadioGroupValue={handleRadioGroupValue}
                                        forumUuid={props.forum_uuid} />
                                </Grid>
                            )
                        })
                    }
                </Grid>
                :
                <Grid container item xs={12} justifyContent={"center"} alignItems={"center"} sx={{ height: "60vh" }} >
                    <Grid item xs={1} justifyContent={"center"} alignItems={"center"} sx={{ height: "10vh" }}>
                        <CircularProgress size={30} />
                    </Grid>
                </Grid>
            }

            <Grid container direction="row" justifyContent="flex-start" alignItems="center" sx={{ my: 3 }}>
                {props.healthBtnToggle 
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
                            <Button fullWidth variant="contained" color="error" sx={{ borderRadius: "1vh", mx: 2 }} onClick={() => { setIsCancelLoading(true); props.setProfileToggle("info"); push(`/forums/${props.forum_uuid}?tab=info`) }}>
                                {isCancelLoading ? <CircularProgress sx={{ color: "white" }} size={20} /> :
                                    <Typography variant="caption" sx={{ fontWeight: "700" }}>Cancel</Typography>
                                }
                            </Button>
                        </Grid>
                    </> : null
                }
            </Grid>
            <SnakBarAlert alertOpen={alertOpen} setAlertOpen={setAlertOpen} alertSeverity={alertSeverity} alert={alert} />
        </>
    )
}