"use client"
import React, { useEffect, useRef, useState } from 'react'
import { Button, Chip, CircularProgress, Grid, Typography, Box, Avatar, Paper, Divider } from '@mui/material'
import { TextareaAutosize } from '@mui/base/TextareaAutosize';
import { styled } from '@mui/system';
import { StaticMessage } from '../util/StaticMessage';
import DateFormats from '@/components/dateFormat';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import SnakBarAlert from '@/components/snakbaralert/snakbaralert';


function Action_steps({ props, currentPageName, chapterUUID, setUpdateActionStepAPICall, updateActionStepAPICall }: any) {
    const [alert, setAlert] = useState("");
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertSeverity, setAlertSeverity] = useState(false);
    const [toggleComponents, setToggleComponents] = useState(false)
    const [componentName, setomponentName] = useState<any>(null)
    const [actionStepData, setActionStepData] = useState<any>({})
    const [messageData, setMessageData] = useState<any>([])
    const [apiToggle, setApiToggle] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [IsDataNull, setIsDataNull] = useState(false)
    const [showMoreChatCount, setShowMoreChatCount] = useState<number>(0)
    const [loadMoreLoader, setloadMoreLoader] = useState(false)

    function AlertManager(message: string, severity: boolean) {
        setAlert(message)
        setAlertSeverity(severity)
        setAlertOpen(true)
    }

    // LOADING COMP
    const LoadingComponent = () => (
        <Grid container item xs={12} sx={{ height: '40vh' }} justifyContent={'center'} alignItems={'center'}>
            <CircularProgress />
        </Grid>
    );

    // LOADING COMP
    const APIFailComponent = () => (
        <Grid container item xs={12} sx={{ height: '40vh' }} justifyContent={'center'} alignItems={'center'}>
            <Typography variant='h6' sx={{ fontWeight: "600", color: '#5F83ED' }}>No action steps found</Typography>
        </Grid>
    );

    //GET FORUM NAME 
    const actionStepsGET = async () => {

        try {
            const res = await fetch(`/api/forumexperience/${props?.page_props?.searchParams?.forum_uuid}/actionstep/${chapterUUID}?previous_chapter=${showMoreChatCount}`, {
                method: "GET",
                cache: 'no-store',
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const preworkGETData = await res.json();
            if (res.status == 200) {
                setActionStepData(preworkGETData?.data);
                setMessageData([...preworkGETData?.data?.message, (showMoreChatCount > 0 && preworkGETData?.data?.message?.length > 0) && true, ...messageData]);
                preworkGETData?.data?.message?.length == 0 && preworkGETData?.data?.is_current_chapter ? setomponentName("ComponentOne") : [setToggleComponents(true), setomponentName("ComponentTwo")];
                setIsLoading(false);
                setloadMoreLoader(false);
                showMoreChatCount > 0 && preworkGETData?.data?.message?.length == 0 ? AlertManager("No messages available to show", false) : null;
            } else {
                AlertManager(preworkGETData.message, true);
                setIsLoading(false);
                setloadMoreLoader(false);
                setIsDataNull(true);
            }
        }
        catch (error: any) {
            AlertManager(StaticMessage.ErrorMessage, true);
            setIsLoading(false);
            setloadMoreLoader(false);
            setIsDataNull(true);
        }
    }

    useEffect(() => {
        setIsLoading(true);
        setloadMoreLoader(true);
        actionStepsGET();
    }, [currentPageName === 'actionSteps', apiToggle])

    return (
        <>
            <Grid container item xs={12} alignItems={'center'} justifyContent={'center'} columnGap={2} rowGap={3} sx={{ backgroundColor: '#f2f1f3', borderRadius: '1vw', p: 2, py: 4, my: 3 }} >
                <Grid container item xs={12} md={8} justifyContent={'center'} rowGap={2} sx={{ backgroundColor: 'white', borderRadius: '1vw', p: 3 }}>

                    <Grid container item xs={12} md={9} justifyContent={'center'} direction={'column'} >
                        <Typography variant='subtitle1' align={'center'} sx={{ fontWeight: 600 }}>{actionStepData?.action_step_info?.name}</Typography>
                        {actionStepData?.action_step_info?.description?.length ? <Typography variant='subtitle1' align={'center'} sx={{ fontWeight: 600, color: '#a7a7a7' }}>{actionStepData?.action_step_info?.description}</Typography> : null}
                    </Grid>

                    {componentName == null && isLoading
                        ? <LoadingComponent />
                        : toggleComponents && componentName == 'ComponentTwo'
                            ? <ComponentTwo
                                actionStepData={actionStepData}
                                messageData={messageData}
                                setShowMoreChatCount={setShowMoreChatCount}
                                showMoreChatCount={showMoreChatCount}
                                setApiToggle={setApiToggle}
                                apiToggle={apiToggle}
                                loadMoreLoader={loadMoreLoader}
                            />
                            : componentName == 'ComponentOne'
                                ? <ComponentOne
                                    forum_uuid={props?.page_props?.searchParams?.forum_uuid}
                                    chapterUUID={chapterUUID}
                                    AlertManager={AlertManager}
                                    setApiToggle={setApiToggle}
                                    apiToggle={apiToggle}
                                    actionStepData={actionStepData}
                                    setUpdateActionStepAPICall={setUpdateActionStepAPICall}
                                    updateActionStepAPICall={updateActionStepAPICall}
                                />
                                : IsDataNull ? <APIFailComponent /> : null
                    }

                </Grid>
            </Grid>
            <SnakBarAlert alertOpen={alertOpen} setAlertOpen={setAlertOpen} alertSeverity={alertSeverity} alert={alert} />
        </>
    )
}

export default Action_steps


const ComponentOne = ({ forum_uuid, chapterUUID, AlertManager, setApiToggle, apiToggle, actionStepData, setUpdateActionStepAPICall, updateActionStepAPICall }: any) => {
    const [actionStepInput, SetActionStepInput] = useState("");
    const [errors, setErrors] = useState('');
    const [isCreateLoading, setIsCreateLoading] = useState(false);

    //POST API FOR MESSAGE (ACTION STEPS)
    const actionStepPOSTmessage = async () => {
        setIsCreateLoading(true)
        try {
            const response = await fetch(`/api/forumexperience/${forum_uuid}/actionstep/${chapterUUID}`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message: actionStepInput
                })
            });
            const actionStepPOSTmessagetAPIData = await response.json();
            if (response.status === 200) {
                AlertManager(actionStepPOSTmessagetAPIData.message, false);
                setApiToggle(!apiToggle)
                setUpdateActionStepAPICall(!updateActionStepAPICall)
            } else {
                AlertManager(actionStepPOSTmessagetAPIData.message, true);
            }
        } catch (error: any) {
            AlertManager(StaticMessage.ErrorMessage, true);
        }
    }


    //SETTING INPUT VALUE
    const handleChange = (e: any) => {
        e.preventDefault();
        const { name, value } = e.target;
        let error = '';
        let maxLength = (name == 'Description') ? 2501 : 50;
        if (value.length <= maxLength) {
            SetActionStepInput(value);
        } else {
            const formattedName = name
                .replace(/_/g, ' ')        // Replace underscores with spaces
                .toLowerCase()             // Convert the entire string to lowercase
                .replace(/^\w/, (char: string) => char.toUpperCase());  // Capitalize the first letter
            error = `${formattedName} must be ${maxLength} characters or less`;
        }
        setErrors(error);
    };


    //UI ARROW - CUSTOM STYLE
    const Arrow = styled(Box)({
        width: 0,
        height: 0,
        borderLeft: '10px solid transparent',
        borderRight: '10px solid transparent',
        borderTop: '10px solid #6183e7', // Match the Chip background color
        position: 'absolute',
        bottom: -9,
        left: '50%',
        transform: 'translateX(-50%)',
    });

    //UI CONTAINER WRAPPER
    const ChipContainer = styled(Box)({
        position: 'relative',
        display: 'inline-block',
    });

    return (
        <Grid container item xs={12} md={11} justifyContent={'center'} rowGap={2.5} >
            <Grid container item xs={11} md={6.5} justifyContent={'center'}>
                <ChipContainer>
                    <Chip
                        sx={{
                            px: 3,
                            py: 2,
                            height: 'auto',
                            backgroundColor: "#6183e7",
                            '& .MuiChip-label': {
                                display: 'block',
                                whiteSpace: 'normal',
                                textAlign: 'center',
                                fontSize: '15px',
                                fontWeight: '500',
                                color: 'white'
                            },
                        }}
                        label={actionStepData?.other_user_first_names?.length
                            ? actionStepData?.other_user_first_names?.length <= 2
                                ? `${actionStepData?.other_user_first_names.join(' and ')} have completed the task.`
                                : `${actionStepData?.other_user_first_names[0]} and ${actionStepData?.other_user_first_names.length - 1} others have completed the task.`
                            : 'Be the first to complete the action step'}
                    />
                    <Arrow />
                </ChipContainer>
            </Grid>
            <Grid container item xs={12} md={7} justifyContent={'center'} >
                <Typography align={'center'} sx={{ fontSize: '15px', fontWeight: 600, color: '#6183e7' }}>Submit your action step to see others</Typography>
            </Grid>

            <Grid container item xs={12} justifyContent={'flex-start'} sx={{ color: "#777" }}>
                <TextareaAutosize
                    name="Description"
                    maxLength={2501}
                    maxRows={8}
                    minRows={8}
                    placeholder="Type your stories here..."
                    value={actionStepInput}
                    onChange={handleChange}
                    style={{
                        width: "100%", border: actionStepInput.length == 2501 ? "2px solid #cf0c0c" : "1px solid #3182ce", borderRadius: "1vh",
                        padding: "8px", outline: "none", resize: 'none', maxHeight: "198px", color: "black", overflow: 'auto'
                    }}
                    onFocus={(e) => {
                        e.target.style.borderColor = actionStepInput.length == 2501 ? "#cf0c0c" : "#3182ce"
                    }}
                    onBlur={(e) => {
                        e.target.style.borderColor = "#dedede"
                    }}
                    // onMouseLeave={(e) => {
                    //     const target = e.target as HTMLTextAreaElement;
                    //     target.style.border = actionStepInput.length == 2501 ? "2px solid #cf0c0c" : "1px solid black"
                    // }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.shiftKey === false) {
                            e.preventDefault();
                        }
                    }}
                />
                <Grid container item xs={12} direction="row">
                    <Grid item xs={6}>
                        <Typography variant="caption" sx={{ color: "#cf0c0c", ml: "2vh", fontWeight: "500" }}>{actionStepInput.length == 2501 ? "Description must be 2500 characters or less" : errors}</Typography>
                    </Grid>
                    <Grid item xs={6} justifyContent={"flex-end"} alignItems={"center"}>
                        <Typography variant="caption" sx={{ textAlign: "right", display: "block", marginTop: '4px' }}>
                            {actionStepInput?.length} /2500
                        </Typography>
                    </Grid>
                </Grid>
            </Grid>
            <Grid container item xs={12} md={4} justifyContent={'center'} sx={{}}>
                <Button
                    fullWidth
                    disabled={actionStepInput?.length == 0 || actionStepInput?.length > 2500}
                    variant="contained"
                    sx={{ backgroundColor: "#2A2F42", borderRadius: "1vh", border: "3px solid balck", color: "#F0F2FF", textTransform: "initial", fontWeight: "700", '&:hover': { backgroundColor: '#2A2F42' } }}
                    onClick={() => actionStepPOSTmessage()}
                >
                    {
                        isCreateLoading
                            ? <> <CircularProgress sx={{ color: "white" }} size={20} /></>
                            : "SUBMIT"
                    }
                </Button>
            </Grid>
        </Grid>
    )
}

const ComponentTwo = ({ actionStepData, messageData, setShowMoreChatCount, showMoreChatCount, setApiToggle, apiToggle, loadMoreLoader }: any) => {
    const me_api_data = useAppSelector(state => state.forumExperience.me_api_data);
    const bottomRef = useRef<any>(null);

    // Scroll to the bottom on initial load
    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, []);

    //CONVERT UTC TO LOCAL TIME
    function UTCtoLocalTime(utcTimeString: string): string {
        // Parse the UTC time string into a Date object
        const utcDate = new Date(utcTimeString);

        // Get the local date components
        const year = utcDate.getFullYear();
        const month = utcDate.toLocaleString('default', { month: 'short' });
        const day = utcDate.getDate().toString().padStart(2, '0');

        // Get the local time components
        let hours = utcDate.getHours();
        const minutes = utcDate.getMinutes().toString().padStart(2, '0');

        // Determine AM/PM
        const ampm = hours >= 12 ? 'PM' : 'AM';

        // Convert hours from 24-hour to 12-hour format
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'

        const localHours = hours.toString().padStart(2, '0');

        // Format the local time string
        const localTime = `${month} ${day}, ${year} ${localHours}:${minutes} ${ampm}`;
        return localTime;
    }

    return (
        <>
            <Grid container item xs={12} md={11} justifyContent={'center'} rowGap={2.5}
                sx={{
                    pr: 1,
                    maxHeight: '50vh',
                    overflowY: 'auto',
                    py: 3,

                    '&::-webkit-scrollbar': {
                        width: '2px',

                    },
                    '&::-webkit-scrollbar-track': {
                        background: '#f1f1f1',
                        borderRadius: '10vh'
                    },
                    '&::-webkit-scrollbar-thumb': {
                        background: "#888",
                        borderRadius: '10vh'
                    },
                    '&::-webkit-scrollbar-thumb:hover': {
                        background: "#555",
                    }
                }}
            >
                <Button
                    variant='contained'
                    disabled={actionStepData?.previous_chapter_count === showMoreChatCount}
                    sx={{ textTransform: "initial", fontWeight: '600', height: '4vh', width: '20vw', backgroundColor: "#6183e7", '&:hover': { backgroundColor: '#2A2F42' }, borderRadius: ' 1vw', cursor: 'pointer' }}
                    onClick={() => { setShowMoreChatCount(showMoreChatCount + 1); setApiToggle(!apiToggle); }}
                >
                    {loadMoreLoader ? <CircularProgress size='small' sx={{ color: 'white' }} /> : "Load previous action steps"}
                </Button>

                {
                    messageData?.map((msg: any, i: number) => {
                        if (typeof msg === 'boolean') {
                            return msg ? <Divider sx={{ width: '90%', marginTop: 3, marginBottom: 3, color: 'gray' }} /> : null
                        }
                        else if (msg?.action_step_message?.user_info?.uuid == me_api_data?.user_info?.uuid) {
                            return (
                                //RIGHT SIDE
                                <Grid key={i} container item xs={12} justifyContent={'flex-end'}>
                                    <Grid container item xs={11} md={11} justifyContent={'flex-end'} columnGap={0.5}>
                                        <Grid container item xs={10.5} justifyContent={'flex-end'}>
                                            <Grid container item xs={12} justifyContent={'flex-end'}>
                                                <Typography variant='caption' sx={{ color: '#a7a7a7' }}>{UTCtoLocalTime(msg?.action_step_message?.createdAt)}</Typography>&nbsp;
                                                <Typography variant='caption' sx={{ fontWeight: '600' }}>{msg?.action_step_message?.user_info?.first_name + ' ' + msg?.action_step_message?.user_info?.last_name}</Typography>
                                            </Grid>
                                            <Grid container item justifyContent={'flex-end'}>
                                                <Paper elevation={1} sx={{ backgroundColor: '#2A2F42', color: 'white', borderRadius: '1vw 0vw 1vw 1vw', p: 1, minWidth: '10vw' }}>
                                                    {msg?.action_step_message?.message}
                                                </Paper>
                                            </Grid>
                                        </Grid>
                                        <Avatar sx={{ backgroundColor: 'orange' }}>{msg?.action_step_message?.user_info?.first_name.charAt(0)}</Avatar>
                                    </Grid>
                                </Grid>
                            )
                        } else {
                            return (
                                // LEFT SIDE
                                <Grid key={i} container item xs={12} >
                                    <Grid container item xs={11} md={11} columnGap={0.5}>
                                        <Avatar sx={{ backgroundColor: 'orange' }}>{msg?.action_step_message?.user_info?.first_name.charAt(0)}</Avatar>
                                        <Grid container item xs={10.5}>
                                            <Grid container item xs={12}>
                                                <Typography variant='caption' sx={{ fontWeight: '600' }}>{msg?.action_step_message?.user_info?.first_name + ' ' + msg?.action_step_message?.user_info?.last_name}</Typography>&nbsp;
                                                <Typography variant='caption' sx={{ color: '#a7a7a7' }}>{UTCtoLocalTime(msg?.action_step_message?.createdAt)}</Typography>
                                            </Grid>
                                            <Grid container item >
                                                <Paper elevation={1} sx={{ backgroundColor: '#2A2F42', minWidth: '10vw', color: 'white', borderRadius: '0 1vw 1vw 1vw', p: 1 }}>
                                                    {msg?.action_step_message?.message}
                                                </Paper>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            )
                        }
                    })
                }
                <div ref={bottomRef} />
            </Grid>
            <Grid container item xs={11} justifyContent={'center'} >
                <Chip
                    sx={{
                        mt: 5,
                        px: 3,
                        py: 2,
                        height: 'auto',
                        width: '90%',
                        backgroundColor: "#c3efcc",
                        '& .MuiChip-label': {
                            display: 'block',
                            whiteSpace: 'normal',
                            textAlign: 'center',
                            fontSize: '15px',
                            fontWeight: '600',
                            color: '#36c956'
                        },
                    }}
                    label="You have completed the action step for today"
                />
            </Grid>
        </>
    )
}



{/* <Grid container item xs={12} md={12} justifyContent={'flex-start'} sx={{}}>
                <TextareaAutosize
                    name='Description'
                    maxLength={2500}
                    minRows={4.5}
                    placeholder="Type your stories here..."
                    value={actionStepInput}
                    onChange={handleChange}
                    style={{
                        width: "100%", border: actionStepInput.length == 2500 ? "2px solid #cf0c0c" : "1px solid #dedede", borderRadius: "1vh",
                        padding: "8px", outline: "none", resize: 'none', maxHeight: "140px", color: "black", overflow: 'auto'
                    }}
                    onFocus={(e) => {
                        e.target.style.borderColor = "#3182ce";
                    }}
                    onBlur={(e) => {
                        e.target.style.borderColor = "#dedede"
                    }}
                    onMouseLeave={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.border = actionStepInput.length == 2500 ? "2px solid #cf0c0c" : "1px solid black"
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.shiftKey === false) {
                            e.preventDefault();
                        }
                    }}
                />
                <Typography variant="caption" sx={{ color: "#cf0c0c", ml: "2vh", fontWeight: "500" }}>{actionStepInput.length == 2500 ? "Description must be 2500 characters or less" : errors}</Typography>
            </Grid> */}