"use client"
import React, { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { Button, Divider, Grid, Typography, LinearProgress, CardActionArea, CircularProgress, MobileStepper, styled, Box, Card, Tooltip, Link, } from '@mui/material';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import VideoPlayers from "@/components/video_player/videoComponent";
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import ImageIcon from '@mui/icons-material/Image';
import VolumeUpOutlinedIcon from '@mui/icons-material/VolumeUpOutlined';
import ArrowBackIosNewOutlinedIcon from '@mui/icons-material/ArrowBackIosNewOutlined';
import ArrowForwardIosOutlinedIcon from '@mui/icons-material/ArrowForwardIosOutlined';
import PdfViewer from '../pdf_viewer/PdfViewer';
import DateFormats from '../util/dateFormat';
import { setPdfUrl, setImageUrl, setCurrentLessionUUID, fetchMeUpcomingForumUUID, setCleanUpState, trackingPostAPI, setDirectCompletedPercentValue, setStatus, setCurrentLesonStatus, setCurrentForumUUID, setZoomCurrentForumName, setZoomCurrentChapterUUID, setZoomMeetingTime, setZoomDataFromRedux } from "@/redux/reducers/forumExperience/forumExperienceSlice";
import { StaticMessage } from '../util/StaticMessage';
import Meter from '../meter_chart/page';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SurveyLargeIcon from '../../assets/002-survey.png';
import SurveySmallIcon from '../../assets/001-survey.png';
import Action_steps from './action_steps';
import dynamic from 'next/dynamic';
import SnakBarAlert from '@/components/snakbaralert/snakbaralert';
import Brightness1Icon from '@mui/icons-material/Brightness1';
import ModeratorGuide from '../zoom_video/moderatorGuide';
import { setCookie } from 'cookies-next';
// import ZoomComponent from '@/components/ZoomComponent';

const ZoomComponent = dynamic(
    () => import('../zoom_video/zoomVideoComponent'));

export default function ForumExperience(props: any) {
    // let sessionContainer: HTMLElement | null; //FOR ZOOM UI
    const { push } = useRouter();
    const dispatch = useAppDispatch();
    const [alert, setAlert] = useState("");
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertSeverity, setAlertSeverity] = useState(false);
    const [initialStatusData, setInitialStatusData] = useState<any>({});
    const [preWorkData, setPreWorkData] = useState<any>({});
    const [zoomData, setZoomData] = useState<any>(null);
    const [count, setCount] = useState<any>(0);
    const [toggleApi, settoggleApi] = useState(false);
    const [preworkLoading, setPreworkLoading] = useState<boolean>(true);
    const [forumDetails, setForumDetails] = useState<any>([]);
    const [navigationBtnLoading, setNavigationBtnLoading] = useState<boolean>(true);
    const [currentPageName, setCurrentPageName] = useState<string>("prework");
    const [renderZoom, setRenderZoom] = useState(false);
    const [updateActionStepAPICall, setUpdateActionStepAPICall] = useState(false);
    const [moderatorGuideData, setModeratorGuideData] = useState<any>({});
    const [open, setOpen] = useState<boolean>(false);
    const handleClose = () => setOpen(false);
    const me_api_data: any = useAppSelector(state => state.forumExperience.me_api_data);
    var customText = `${me_api_data?.user_info?.email} - Forums@Work - ${DateFormats(new Date(), false)}`

    function AlertManager(message: string, severity: boolean) {
        setAlert(message)
        setAlertSeverity(severity)
        setAlertOpen(true)
    }

    //INITAL API LOAD FOR STATUS / TOP SECTION DETAILS
    const getInitialStatusAPI = async () => {
        try {
            const res = await fetch(`/api/forumexperience/${props?.page_props?.searchParams?.forum_uuid}/status`, {
                method: "GET",
                cache: 'no-store',
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const data = await res.json();
            if (res.status == 200) {
                if (!data.data?.status) {
                    push(`/forums/${props?.page_props?.searchParams?.forum_uuid}`)
                } else {
                    setInitialStatusData(data?.data);
                    dispatch(setZoomMeetingTime(data?.data?.forum_meeting?.next_meeting));
                }
            } else {
                AlertManager(data?.message, true);
                push(`/forums/${props?.page_props?.searchParams?.forum_uuid}`);
            }
        }
        catch (error: any) {
            AlertManager(StaticMessage.ErrorMessage, true);
        }
    }

    //GET MODERATOR GUIDE
    const getModeratorGuide = async (chapter_uuid: string) => {
        try {
            const res = await fetch(`/api/${chapter_uuid}/moderatorguide`, {
                method: "GET",
                cache: 'no-store',
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const data = await res.json();
            if (res.status == 200) {
                setModeratorGuideData(data?.data)
            } else {
                AlertManager(data?.message, true);
            }
        }
        catch (error: any) {
            AlertManager(StaticMessage.ErrorMessage, true);
        }
    };

    //PREWORK API GET
    const GetPreWorkAPI = async () => {
        try {
            let response = await fetch(`/api/forumexperience/${props?.page_props?.searchParams?.forum_uuid}/prework`, {
                method: 'GET',
                cache: 'no-store',
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const GetPreWorkData = await response.json();
            if (response.status == 200) {
                const activeIndex = GetPreWorkData?.data?.lessons?.findIndex((item: any) => item.is_current_lesson === true);
                const firstEmptyPageMetaIndex = GetPreWorkData?.data?.lessons?.findIndex((item: any) => Object.keys(item.prework_meta_data).length === 1);
                if (activeIndex === - 1 && firstEmptyPageMetaIndex !== -1) {
                    await dispatch(trackingPostAPI({
                        forum_uuid: props?.page_props?.searchParams?.forum_uuid,
                        lesson_uuid: GetPreWorkData?.data?.lessons[firstEmptyPageMetaIndex]?.uuid,
                        status: 0,
                        status_percent: 0,
                        is_current_lesson: true
                    }));
                    settoggleApi(true);
                    dispatch(setCurrentLessionUUID(preWorkData?.lessons[count + 1]?.uuid));
                    dispatch(setCleanUpState());
                    return;
                }
                setPreWorkData(GetPreWorkData?.data);
                dispatch(setZoomCurrentChapterUUID(GetPreWorkData?.data?.chapter_info?.uuid));
                setCount(activeIndex == -1 ? GetPreWorkData?.data?.lessons?.length - 1 : activeIndex);
                dispatch(setCurrentLesonStatus(GetPreWorkData?.data?.lessons[activeIndex]?.is_current_lesson));
                dispatch(setCurrentLessionUUID(GetPreWorkData?.data?.lessons[activeIndex]?.uuid));
                dispatch(setStatus(GetPreWorkData?.data?.lessons[activeIndex]?.prework_meta_data?.status || 0));
                dispatch(setDirectCompletedPercentValue(GetPreWorkData?.data?.lessons[activeIndex]?.prework_meta_data?.status_percent || 0));
                // getModeratorGuide(GetPreWorkData?.data?.chapter_info?.uuid);
                settoggleApi(false);
                setNavigationBtnLoading(false);
                setPreworkLoading(false);
            }
            else {
                AlertManager("Kindly try again later", true);
                setPreworkLoading(false);
            }
        }
        catch (error: any) {
            AlertManager("Kindly try again later", true);
            setPreworkLoading(false);
        }
    }

    //GET FORUM NAME 
    const getForumNameAPI = async () => {
        try {
            const res = await fetch(`/api/forum/${props?.page_props?.searchParams?.forum_uuid}`, {
                method: "GET",
                cache: 'no-store',
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const data = await res.json();
            if (res.status == 200) {
                setForumDetails(data?.data?.forum_info)
                dispatch(setZoomCurrentForumName(data?.data?.forum_info?.forum_name));
            } else {
                AlertManager(StaticMessage.ErrorMessage, true);
            }
        }
        catch (error: any) {
            AlertManager(StaticMessage.ErrorMessage, true);
        }
    }

    //ZOOM JOIN MEETING API CALL POST
    const getZoomJoinMeeting = async () => {
        const requestBody = { "type": "zoom" };
        try {
            const res = await fetch(`/api/forumexperience/${props?.page_props?.searchParams?.forum_uuid}/joinmeeting`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });
            const data = await res.json();
            if (res.status == 200) {
                setZoomData(data?.data);
                dispatch(setZoomDataFromRedux(data?.data));
                // setRenderZoom(true);
                // setCurrentPageName('zoom');
            } else {
                AlertManager(StaticMessage.ErrorMessage, true);
            }
        }
        catch (error: any) {
            AlertManager(StaticMessage.ErrorMessage, true);
        }
    }


    // LOADING COMP
    const LoadingComponent = () => (
        <Grid container item xs={12} sx={{ height: '70vh' }} justifyContent={'center'} alignItems={'center'}>
            <CircularProgress />
        </Grid>
    );


    //ME AND INITIAL API CALL USING DISPATCH 

    useEffect(() => {
        dispatch(fetchMeUpcomingForumUUID());
        getInitialStatusAPI();
    }, [updateActionStepAPICall, renderZoom, toggleApi])


    //FORUM API FOR GETTING BREADCRUM DETAILS
    useEffect(() => {
        if (props?.page_props?.searchParams?.forum_uuid && initialStatusData?.status) {
            getForumNameAPI();
            setCookie("current_forum_uuid", props?.page_props?.searchParams?.forum_uuid);
            dispatch(setCurrentForumUUID(props?.page_props?.searchParams?.forum_uuid))
        }
    }, [props?.page_props?.searchParams?.forum_uuid && initialStatusData]);


    //THIE USE EFFECT WILL RUN THE PRE WORK API
    useEffect(() => {
        if (props?.page_props?.searchParams?.forum_uuid && initialStatusData?.status) {
            GetPreWorkAPI();
        }
    }, [props?.page_props?.searchParams?.forum_uuid && initialStatusData, toggleApi]);


    return (
        <div className="ml:0 lg:ml-[17.35vw]" style={{ backgroundColor: "#F6F5FB", paddingBottom: '5vh', minHeight: '100vh' }}>
            <Grid container item xs={12} justifyContent={'flex-start'} alignItems={'center'} sx={{ pt: 3, pb: 1, pl: 3, pr: 6 }}>
                <Grid container item xs={12} md={9} alignItems={'center'}>
                    <BreadCrumComponent push={push} forumDetails={forumDetails} preWorkData={preWorkData} />
                </Grid>
                <Grid container item xs={12} md={3} alignItems={'center'} justifyContent={'flex-end'}>
                    <Button
                        variant='text'
                        sx={{ textTransform: "initial", textDecoration: 'underline', fontWeight: '600' }}
                        endIcon={<ArrowForwardIosOutlinedIcon fontSize='small' />}
                        onClick={() => push(`/forums/${props?.page_props?.searchParams?.forum_uuid}`)}
                    >
                        Forum Info
                    </Button>
                </Grid>
            </Grid>

            <Grid container item xs={12} justifyContent={'flex-start'} alignItems={'center'} sx={{ pl: 3 }}>
                <Grid container item xs={11.5} alignItems={'center'} justifyContent={'center'} sx={{ backgroundColor: 'white', borderRadius: '2vh', p: 2 }} >
                    <Grid container item xs={12} direction="row" justifyContent={"space-between"} alignItems={"center"}>
                        <Grid container item xs={10} justifyContent={"flex-start"} alignItems={"center"}>
                            <Typography sx={{ fontWeight: '600' }}>Tasks for this week</Typography>
                        </Grid>
                        <Grid container item xs={2} justifyContent={"flex-end"} alignItems={"center"}>
                            <Button
                                variant='text'
                                sx={{ textTransform: "initial", textDecoration: 'underline', fontWeight: '600', fontSize: "16px" }}
                                onClick={async () => {
                                    await getModeratorGuide(preWorkData?.chapter_info?.uuid);
                                    setOpen(true)
                                }}
                            >
                                Moderator Guide
                            </Button>
                            <ModeratorGuide open={open} handleClose={handleClose} moderatorGuideData={moderatorGuideData} />
                        </Grid>
                        <Divider sx={{ width: '100%', marginTop: 3, marginBottom: 3, color: 'gray' }} />
                    </Grid>
                    {/* TOP INFO SECTION */}
                    {
                        Object.keys(initialStatusData)?.length
                            ? <InfoComponent
                                push={push}
                                zoomData={zoomData}
                                forumDetails={forumDetails}
                                dispatch={dispatch}
                                // forum_uuid={props?.page_props?.searchParams?.forum_uuid}
                                setCurrentPageName={setCurrentPageName}
                                preWorkData={preWorkData}
                                initialStatusData={initialStatusData}
                                getZoomJoinMeeting={getZoomJoinMeeting}
                                setRenderZoom={setRenderZoom}
                                renderZoom={renderZoom}
                            />
                            : null
                    }
                    {
                        currentPageName === 'prework'
                            ? (
                                preworkLoading
                                    ? <LoadingComponent />
                                    : preWorkData?.lessons?.length > 0
                                        ?
                                        <Grid container item xs={12} alignItems={'flex-end'} justifyContent={'center'} columnGap={2} rowGap={3} sx={{ backgroundColor: '#f2f1f3', borderRadius: '1vw', p: 2, py: 4, my: 3, position: 'relative', overflow: 'hidden', }} >
                                            <MemoizedBottomComponent
                                                preWorkData={preWorkData}
                                                push={push}
                                                count={count}
                                                setCount={setCount}
                                                AlertManager={AlertManager}
                                                customText={customText}
                                                settoggleApi={settoggleApi}
                                                navigationBtnLoading={navigationBtnLoading}
                                                setNavigationBtnLoading={setNavigationBtnLoading}
                                            />
                                            <ButtonSection count={count} push={push} setCount={setCount} preWorkData={preWorkData} settoggleApi={settoggleApi} navigationBtnLoading={navigationBtnLoading} setNavigationBtnLoading={setNavigationBtnLoading} />
                                        </Grid>
                                        :
                                        <Grid container item xs={12} justifyContent={"center"} alignItems={"center"} sx={{ mt: 5, height: "53vh" }}>
                                            <Grid item>
                                                <Typography variant='h6' sx={{ fontWeight: "600", color: '#5F83ED' }}>No lessons found</Typography>
                                            </Grid>
                                        </Grid>
                            )

                            : currentPageName === 'actionSteps'
                                ? <Action_steps props={props} currentPageName={currentPageName} chapterUUID={preWorkData?.chapter_info?.uuid} setUpdateActionStepAPICall={setUpdateActionStepAPICall} updateActionStepAPICall={updateActionStepAPICall} />
                                : currentPageName === 'zoom'
                                    ?
                                    // zoomData != null
                                    //     ? <ZoomComponent
                                    //         zoomData={zoomData}
                                    //         forum_name={forumDetails?.forum_name}
                                    //         forum_uuid={props?.page_props?.searchParams?.forum_uuid}
                                    //         setRenderZoom={setRenderZoom}
                                    //         chapter_uuid={preWorkData?.chapter_info?.uuid}
                                    //         meeting_time={initialStatusData?.forum_meeting?.next_meeting}
                                    //         setCurrentPageName={setCurrentPageName}
                                    //     />
                                    //     : 
                                    <div className="min-h-[60vh] w-[50vw] mt-[5vh] flex justify-center items-center flex-col">
                                        <Typography variant='h6' sx={{ fontWeight: "600", color: '#5F83ED' }}>{`Click on the "Join Meeting" button to participate in your forum meeting`}</Typography>
                                    </div>
                                    : null
                    }
                </Grid>
            </Grid>
            <SnakBarAlert alertOpen={alertOpen} setAlertOpen={setAlertOpen} alertSeverity={alertSeverity} alert={alert} />
        </div>
    )
}

// BOTTOM COMPONENT
const BottomComponent = ({ preWorkData, push, count, setCount, AlertManager, customText, settoggleApi, navigationBtnLoading, setNavigationBtnLoading }: any) => {
    const { completed_percent, status, current_lession_uuid, current_forum_uuid } = useAppSelector(state => state.forumExperience);
    const dispatch = useAppDispatch();
    const cardContainerRef = useRef<HTMLDivElement>(null); // Correct type for useRef
    const cardWidth = 300; // Width of each card (adjust as per your design)
    const cardMargin = 10; // Margin between cards

    //CARD SCROLL FEATURE
    const centerSelectedCard = (index: number) => {
        if (cardContainerRef.current) {
            const containerWidth = cardContainerRef.current.offsetWidth;
            const scrollLeft = index * (cardWidth + cardMargin) - (containerWidth - cardWidth) / 2;
            cardContainerRef.current.scrollTo({ left: scrollLeft, behavior: 'smooth' });
        }
    };

    useEffect(() => {
        centerSelectedCard(count);
    }, [count]);


    //CLICK CARD FUNCTIONALITY
    const cardClick = (cardIndex: number) => {
        const lesson = preWorkData?.lessons[cardIndex];
        const isCurrentLesson = lesson?.is_current_lesson;
        const currentLesson = preWorkData?.lessons.find((x:any)=>x.is_current_lesson===true);
        const statusPercent = currentLesson?.prework_meta_data?.status_percent;
        if(!isCurrentLesson){
            if(statusPercent < 90){
                AlertManager("Kindly complete the previous task before unlocking this task", true);
            }else{
            setCount(cardIndex);
            }
        }else{
            setCount(cardIndex);
        }
    }

    const prevButtonFunc = async (selectedindex: number) => {
        if (count > 0) {
            setCount(selectedindex)
            dispatch(setCurrentLesonStatus(preWorkData?.lessons[count - 1]?.is_current_lesson));
        }
    }

    const nextButtonFunc = async (current_item: any, index: number) => {
        dispatch(setCurrentLesonStatus(preWorkData?.lessons[index]?.is_current_lesson))
        if (!current_item) {
            setCount(index);
        } else {
            setNavigationBtnLoading(true);

            //OLD COMPLETED LESSION TASK
            await dispatch(trackingPostAPI({
                forum_uuid: current_forum_uuid,
                lesson_uuid: current_lession_uuid,
                status,
                status_percent: completed_percent > 90 ? 100 : completed_percent,
                is_current_lesson: false
            }))

            // UPCOMING LESSION TASK (ONLY RUNS IF ITS NOT THE LAST LESSON)
            if (count !== preWorkData?.lessons?.length - 1) {
                await dispatch(trackingPostAPI({
                    forum_uuid: current_forum_uuid,
                    lesson_uuid: preWorkData?.lessons[count + 1]?.uuid,
                    status: 0,
                    status_percent: 0,
                    is_current_lesson: true
                }))
                await dispatch(setCurrentLessionUUID(preWorkData?.lessons[count + 1]?.uuid))
                await dispatch(setCleanUpState());
            }
            settoggleApi(true);
        }
    }

    const onCardClick = (index: number, selectedCardCount: number) => {
        if (index < selectedCardCount) {
            prevButtonFunc(index);
        } else if (count == preWorkData?.lessons?.length - 1 && !preWorkData?.lessons[count]?.is_current_lesson || completed_percent < 90 && preWorkData?.lessons[count]?.is_current_lesson) {
            cardClick(index);
        } else if (selectedCardCount !== index) {
            // allow only if the clicked card is not same as the active card 
            nextButtonFunc(preWorkData?.lessons[count]?.is_current_lesson, index);
        }
    }


    return (
        <>
            <Grid item xs={12} sm={10} md={11.5} sx={{ width: '70vw', backgroundColor: 'transparent', py: 5 }}>
                <div ref={cardContainerRef} style={{ overflowX: 'hidden', display: 'flex', alignItems: 'flex-end', transition: 'scroll 0.5s ease-in-out' }}>
                    {preWorkData?.lessons?.map((card: any, index: any) => {
                        let position = index - count;
                        if (position < 0) position += preWorkData?.lessons?.length;

                        const isSelected = index === count;

                        // backgroundColor: '#f2f1f3',
                        return (
                            <div
                                key={index}
                                style={{
                                    flex: `0 0 ${cardWidth}px`,
                                    marginRight: cardMargin,
                                    transition: 'transform 0.5s ease-in-out',
                                    transform: isSelected ? 'scale(0.95)' : 'scale(0.9)',
                                    cursor: 'pointer !important'
                                }}
                                onClick={() => onCardClick(index, count)}
                            >
                                {isSelected ? (
                                    // <LargeCard title={card.title} content={card.content} />
                                    <LargeCardComponent data={card} push={push} dispatch={dispatch} customText={customText} />
                                ) : (
                                    // <SmallCard title={card.title} content={card.content} />
                                    <Grid container item alignItems={'flex-end'} sx={{ backgroundColor: '#f2f1f3', borderRadius: '1vw', cursor: 'pointer !important' }}>
                                        {card?.prework_meta_data?.status_percent === 100
                                            ? null
                                            : preWorkData?.lessons[count + 1]?.prework_meta_data?.status_percent !== 100 && index == (count + 1)
                                                ? <Typography variant='h6' sx={{ fontWeight: '600', color: '#a7a7a7', pb: 2, backgroundColor: '#f2f1f3', height: '100%', width: '100%' }}>
                                                    Upcoming Tasks
                                                </Typography>
                                                : null
                                        }
                                        <MiniCardComponent data={card} />
                                    </Grid>
                                )}
                            </div>
                        );
                    })}
                </div>
            </Grid>
        </>
    )
}

//NAVIGATION BUTTON
const ButtonSection = ({ count, setCount, preWorkData, settoggleApi, navigationBtnLoading, push, setNavigationBtnLoading }: any) => {
    const { completed_percent, status, current_lession_uuid, current_forum_uuid } = useAppSelector(state => state.forumExperience);

    const dispatch = useAppDispatch();
    //PREV BUTTON FUNCTION
    const PrevtButtonFunt = async () => {
        if (count > 0) {
            // setCount(count - 1);
            setCount((prevIndex: any) => prevIndex - 1)
            dispatch(setCurrentLesonStatus(preWorkData?.lessons[count - 1]?.is_current_lesson))
        }
    }

    //NEXT BUTTON FUNCTION
    const nextButtonFunt = async (current_item: any) => {
        dispatch(setCurrentLesonStatus(preWorkData?.lessons[count + 1]?.is_current_lesson))
        if (!current_item) {
            // setCount(count + 1);
            setCount((prevIndex: any) => prevIndex + 1);
        } else {
            setNavigationBtnLoading(true);

            //OLD COMPLETED LESSION TASK
            await dispatch(trackingPostAPI({
                forum_uuid: current_forum_uuid,
                lesson_uuid: current_lession_uuid,
                status,
                status_percent: completed_percent > 90 ? 100 : completed_percent,
                is_current_lesson: false
            }))

            // UPCOMING LESSION TASK (ONLY RUNS IF ITS NOT THE LAST LESSON)
            if (count !== preWorkData?.lessons?.length - 1) {
                await dispatch(trackingPostAPI({
                    forum_uuid: current_forum_uuid,
                    lesson_uuid: preWorkData?.lessons[count + 1]?.uuid,
                    status: 0,
                    status_percent: 0,
                    is_current_lesson: true
                }))
                await dispatch(setCurrentLessionUUID(preWorkData?.lessons[count + 1]?.uuid))
                await dispatch(setCleanUpState());
            }
            settoggleApi(true);
        }
    }

    return (
        <Grid container item xs={12} md={8} justifyContent={'center'} columnGap={3} >
            <Grid container item xs={12} md={2}>
                <Button
                    fullWidth
                    variant='contained'
                    disabled={count == 0}
                    onClick={() => PrevtButtonFunt()}
                    startIcon={<ArrowBackIosNewOutlinedIcon fontSize='small' />}
                    sx={{ textTransform: "initial", fontWeight: '600', backgroundColor: "#2a3041", '&:hover': { backgroundColor: "#47516c" } }}
                >
                    Prev
                </Button>
            </Grid>
            <Grid container item xs={12} md={2}>
                <Button
                    fullWidth
                    variant='contained'
                    disabled={count == preWorkData?.lessons?.length - 1 && !preWorkData?.lessons[count]?.is_current_lesson || completed_percent < 90 && preWorkData?.lessons[count]?.is_current_lesson}
                    onClick={() => nextButtonFunt(preWorkData?.lessons[count]?.is_current_lesson)}
                    endIcon={count >= preWorkData?.lessons?.length - 1 || navigationBtnLoading ? null : <ArrowForwardIosOutlinedIcon fontSize='small' />}
                    sx={{ textTransform: "initial", fontWeight: '600', backgroundColor: "#2a3041", '&:hover': { backgroundColor: "#47516c" } }}
                >
                    {navigationBtnLoading ? <CircularProgress sx={{ color: "white" }} size={20} /> : count >= preWorkData?.lessons?.length - 1 ? `Complete` : `Next`}
                </Button>
            </Grid>
        </Grid>
    )
}

//CONDITION TO CHECK FOR HE MEMOIZDED COMP
const areEqual = (prevProps: any, nextProps: any) => {
    return JSON.stringify(prevProps.preWorkData) === JSON.stringify(nextProps.preWorkData) && prevProps.count === nextProps.count;
}

const MemoizedBottomComponent = React.memo(BottomComponent, areEqual); //------------ MEMOIZED COMPONENT DECLARATION -----------

//LARGE CARD COMPONENT
const LargeCardComponent = ({ data, push, dispatch, customText }: any) => {
    const searchParams = useSearchParams()
    const forum_uuid = searchParams.get('forum_uuid');
    // const me_api_data = useAppSelector(state => state.forumExperience.me_api_data);
    const [totalPageForLMSPdf, setTotalPageForLMSPdf] = useState<number | undefined>(0); //DUMMY STATE FOR PROPS USE
    const [durationForLMSVideoAndAudio, setDurationForLMSVideoAndAudio] = useState<number | undefined>(0);

    var videoType = 'video/mux';
    if (data?.asset_type === "video" || data?.asset_type === "audio") {
        var url = data?.asset_info?.url;
        var videoSrc = url.substring(url.lastIndexOf('/') + 1, url.lastIndexOf('.'));
    }

    //PDF REDIRECT
    async function pdf_redirect() {
        dispatch(setPdfUrl(data?.asset_info?.url));
        push(`/pdf_viewer`);
    }

    //IMAGE REDIRECT FUNC
    async function image_redirect() {
        dispatch(setImageUrl(data?.asset_info?.url));
        push(`/image_viewer`);
    }

    async function survey_redirect() {
        // dispatch(setPdfUrl(data?.asset_info?.url));
        push(`/forum_experience/${forum_uuid}/lesson/${data?.prework_meta_data?.lesson_uuid}/survey`);
    }

    return (
        <Card elevation={0} style={{ borderRadius: '1vw', width: 420, boxShadow: ' 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)' }}>
            <CardActionArea onClick={() => data?.asset_type === "pdf" ? pdf_redirect() : data?.asset_type === "image" ? image_redirect() : data?.asset_type === "survey" ? survey_redirect() : null}>
                <Grid container item xs={12} alignItems={'center'} justifyContent={'center'} sx={{ position: 'relative', borderRadius: '1vw' }} >
                    {data?.asset_type === "video"
                        ? <VideoPlayers src={videoSrc} type={videoType} customText={customText} showCustomText={true} setDurationForLMSVideoAndAudio={setDurationForLMSVideoAndAudio} />
                        : data?.asset_type === "pdf"
                            ? <Grid className="justify-center items-center" sx={{ width: 'auto', height: '235px', borderRadius: '1vw' }}>
                                <PdfViewer pdfUrl={data?.asset_info?.url} size={0.27} pageEnable={false} setTotalPageForLMSPdf={setTotalPageForLMSPdf} />
                            </Grid>
                            : data?.asset_type === "audio"
                                ? <VideoPlayers src={videoSrc} type={videoType} customText={customText} showCustomText={true} setDurationForLMSVideoAndAudio={setDurationForLMSVideoAndAudio} />
                                : data?.asset_type === "survey" ?
                                    <Grid container alignItems={'center'} justifyContent={'center'} sx={{ width: 'auto', height: '235px', borderRadius: '1vw' }}>
                                        <Image
                                            src={SurveyLargeIcon}
                                            placeholder="empty"
                                            alt="survey"
                                        />
                                    </Grid>
                                    : <Grid className="justify-center items-center" sx={{ width: 'auto', height: '235px', borderRadius: '1vw' }}>
                                        <Image
                                            src={data?.asset_info?.url}
                                            // priority={true}
                                            placeholder="empty"
                                            alt="Forums@work"
                                            layout="fill"
                                            objectFit="stretch"
                                            unoptimized
                                            style={{ borderRadius: '1vw 1vw 0 0', backgroundColor: 'transparent' }}
                                        />
                                    </Grid>
                    }
                </Grid>
            </CardActionArea >
            <Grid container item xs={12} alignItems={'center'} sx={{ px: 2, py: 1 }}>
                <Typography sx={{ fontWeight: '600' }}>
                    {data?.name.length > 85 ? (
                        <Tooltip title={data?.name} arrow>
                            <span>{`${data?.name.substring(0, 83)}...`}</span>
                        </Tooltip>
                    ) : (
                        <span>{data?.name}</span>
                    )}
                    {data?.prework_meta_data?.status_percent === 100 ? <CheckCircleIcon fontSize='small' sx={{ color: '#5ed477', pb: 0.3 }} /> : null}
                </Typography>
                <Grid container item xs={12}>
                    <Grid container item xs={6}>
                        <PeopleAltIcon sx={{ color: '#2a3041' }} />
                        <Typography sx={{ fontWeight: '600', color: '#2a3041' }}>{data?.prework_meta_data?.completion_count}</Typography>
                    </Grid>
                    <Grid container item xs={6} justifyContent={'flex-end'} alignItems={'center'}>
                        {data?.asset_type === "video"
                            ? <VideocamOutlinedIcon sx={{ fontSize: '1.5vw', color: '#b6b4bd' }} />
                            : data?.asset_type === "pdf"
                                ? <PictureAsPdfOutlinedIcon sx={{ fontSize: '1.5vw', color: '#b6b4bd' }} />
                                : data?.asset_type === "audio"
                                    ? <VolumeUpOutlinedIcon sx={{ fontSize: '1.5vw', color: '#b6b4bd' }} />
                                    : data?.asset_type === "survey"
                                        ? <Image
                                            src={SurveySmallIcon}
                                            alt="survey"
                                            style={{ width: '1em', height: '1em', fontSize: '1.2vw', display: 'inline-block' }}
                                        />
                                        : <ImageIcon sx={{ fontSize: '1.5vw', color: '#b6b4bd' }} />
                        }
                        <Typography sx={{ fontSize: '0.8vw', color: '#b6b4bd', fontWeight: 600 }}>
                            &nbsp;|&nbsp;
                            {data?.asset_type === "video" || data?.asset_type === "audio"
                                ? data?.asset_info?.asset_content_size == null
                                    ? 0
                                    : data?.asset_info?.asset_content_size <= 60
                                        ? `${data?.asset_info?.asset_content_size} sec`
                                        : `${Math.round(data?.asset_info?.asset_content_size / 60)} min`
                                : `${data?.asset_info?.asset_content_size == null ? 0 : data?.asset_info?.asset_content_size}`
                            }
                        </Typography>
                    </Grid>
                </Grid>
            </Grid>
        </Card >
    )
}

//MINI CARD COMPONENT
const MiniCardComponent = ({ data }: any) => {
    return (
        <Card elevation={1} style={{ width: 300, borderRadius: '1vw' }}>
            <Grid container item xs={12} alignItems={'center'} justifyContent={'center'} sx={{ height: '25vh', backgroundColor: '#2a3041', borderRadius: '1vw 1vw 0 0' }} >
                {data?.asset_type === "video"
                    ? <VideocamOutlinedIcon sx={{ fontSize: '5vw', color: '#6183e7' }} />
                    : data?.asset_type === "pdf"
                        ? <PictureAsPdfOutlinedIcon sx={{ fontSize: '5vw', color: '#6183e7' }} />
                        : data?.asset_type === "audio"
                            ? <VolumeUpOutlinedIcon sx={{ fontSize: '5vw', color: '#6183e7' }} />
                            : data?.asset_type === "survey"
                                ? <Image
                                    src={SurveyLargeIcon}
                                    alt="Survey"
                                    style={{ width: '1em', height: '1em', fontSize: '5vw' }}
                                />
                                : <ImageIcon sx={{ fontSize: '5vw', color: '#6183e7' }} />
                }
            </Grid>
            <Grid container item xs={12} alignItems={'center'} sx={{ px: 2, py: 1 }}>
                <Typography sx={{ fontWeight: '600' }}>
                    {data?.name.length > 30 ? (
                        <Tooltip title={data?.name} arrow>
                            <span>{`${data?.name.substring(0, 30)}...`}</span>
                        </Tooltip>
                    ) : (
                        <span>{data?.name}</span>
                    )}
                    {data?.prework_meta_data?.status_percent >= 90 ? <CheckCircleIcon fontSize='small' sx={{ color: '#5ed477', pb: 0.3 }} /> : null}
                </Typography>
                <Grid container item xs={12}>
                    <Grid container item xs={6}>
                        <PeopleAltIcon sx={{ color: '#2a3041' }} />
                        <Typography sx={{ fontWeight: '600', color: '#2a3041' }}>{data?.prework_meta_data?.completion_count}</Typography>
                    </Grid>
                    <Grid container item xs={6} justifyContent={'flex-end'} alignItems={'center'}>
                        {data?.asset_type === "video"
                            ? <VideocamOutlinedIcon sx={{ fontSize: '1.5vw', color: '#b6b4bd' }} />
                            : data?.asset_type === "pdf"
                                ? <PictureAsPdfOutlinedIcon sx={{ fontSize: '1.5vw', color: '#b6b4bd' }} />
                                : data?.asset_type === "audio"
                                    ? <VolumeUpOutlinedIcon sx={{ fontSize: '1.5vw', color: '#b6b4bd' }} />
                                    : data?.asset_type === "survey"
                                        ? <Image
                                            src={SurveySmallIcon}
                                            alt="survey"
                                            style={{ width: '1em', height: '1em', fontSize: '1.2vw', color: '#b6b4bd' }}
                                        />
                                        : <ImageIcon sx={{ fontSize: '1.5vw', color: '#b6b4bd' }} />
                        }
                        <Typography sx={{ fontSize: '0.8vw', color: '#b6b4bd', fontWeight: 600 }}>
                            &nbsp;|&nbsp;
                            {data?.asset_type === "video" || data?.asset_type === "audio"
                                ? data?.asset_info?.asset_content_size == null
                                    ? 0
                                    : data?.asset_info?.asset_content_size <= 60
                                        ? `${data?.asset_info?.asset_content_size} sec`
                                        : `${Math.round(data?.asset_info?.asset_content_size / 60)} min`
                                : `${data?.asset_info?.asset_content_size == null ? 0 : data?.asset_info?.asset_content_size}`
                            }
                        </Typography>
                    </Grid>
                </Grid>
            </Grid>
        </Card>
    )
}

//CUSTOM PROGRESS BAR FOR ACTION STEP
const Dot = styled('div')(({ theme }) => ({
    width: '15vw',
    height: '3px',
    borderRadius: '1vw',
    margin: '-4px 4px 0 0px',
}));

//ACTION STEP PROGRESS BAR
function CustomDot({ status }: any) {
    let backgroundColor;
    if (status === 1) {
        backgroundColor = '#5ed477';
    } else if (status === -1) {
        backgroundColor = 'red';
    } else {
        backgroundColor = '#a7a7a7';
    }
    return (
        <Dot
            sx={{
                backgroundColor: backgroundColor,
            }}
        />
    );
}

//PREWORK PROGRESS BAR
function CustomDotPrework({ status, totalCompletedPrework }: any) {
    let backgroundColor;
    if (status < totalCompletedPrework) {
        5
        backgroundColor = '#5ed477';
    } else {
        backgroundColor = '#a7a7a7';
    }
    return (
        <Dot
            sx={{
                backgroundColor: backgroundColor,
            }}
        />
    );
}

function CustomStepper({ steps, actionStep, totalCompletedPrework }: any) {
    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'space-between',
                width: '100%',
                padding: 0,
            }}
        >
            {steps.map((status: any, index: any) => {
                if (actionStep) {
                    return (
                        <CustomDot key={index} status={status} />
                    )
                } else {
                    return <CustomDotPrework key={index} status={status} totalCompletedPrework={totalCompletedPrework} />
                }
            })}
        </Box>
    );
}

// INFO TOP COMPONENT
const InfoComponent = ({ setCurrentPageName, forumDetails, dispatch, zoomData, preWorkData, initialStatusData, push, getZoomJoinMeeting, renderZoom, setRenderZoom }: any) => {
    const [isButtonEnabled, setIsButtonEnabled] = useState(false);
    const [joinBtnLoading, setJoinBtnLoading] = useState(false);
    const action_step_steps = initialStatusData?.action_step?.completion_status;
    var completed_action_steps = initialStatusData?.action_step?.completion_status?.filter((item: number) => item !== 0 && item !== -1); //FILTERING COMPLETED ACTIONS STEPS
    const meetingTimeUTC = initialStatusData?.forum_meeting?.next_meeting; // UTC TIME
    const meetingTimeLocal: any = new Date(meetingTimeUTC + 'Z'); // COVERT MEETING TIME FROM UTC TO LOCAL TIME (Appending 'Z' to indicate UTC time )

    const options: any = {
        timeZoneName: 'long'
    };

    //GET TIME ZONE NAME
    const timeZone = new Intl.DateTimeFormat('default', options).formatToParts(meetingTimeLocal).find(part => part.type === 'timeZoneName')?.value; // Optional chaining to handle undefined part


    // useEffect(() => {
    //     getZoomJoinMeeting();
    // }, []);
    //USE EFFECT TO MONITOR THE MEETING TIME
    useEffect(() => {
        const checkTime = () => {
            const currentTime: any = new Date();
            const timeDifference = meetingTimeLocal - currentTime;

            // ENABLE THE BUTTON 5 MIN BEFORE THE MEETING
            if (timeDifference <= 5 * 60 * 1000 && timeDifference >= -5400000) {
                setIsButtonEnabled(true);
                setRenderZoom(true);
                setCurrentPageName('zoom');
            } else {
                setIsButtonEnabled(false);
                setRenderZoom(false);
                // setCurrentPageName('prework');
            }
        };

        checkTime(); //CHECK THE INITLIAL TIME
        const intervalId = setInterval(checkTime, 1000);  // SET INTREVAL TO CHECK THE TIME EVERY SECOND
        return () => clearInterval(intervalId);   // CLEAN UP THE INTREVAL ON COMPONENT UNMOUT 
    }, [meetingTimeLocal]);

    //CALCULATE THE REMAILING TIME IN ACTION STEP
    function calculateRemainingTime(sessions: any) {
        const sessionLength = 5;
        const totalTime = sessions.length * sessionLength;
        const remainingSessions = sessions.filter((session: any) => session === 0).length;
        const remainingTime = remainingSessions * sessionLength;
        const completedTime = totalTime - remainingTime;
        if (completedTime == 0) {
            return totalTime
        } else {
            return completedTime;
        }
    }

    //ZOOM REDIRECT FUNC
    async function zoom_redirect() {
        setJoinBtnLoading(true);
        push(`/zoom_video`);
    }

    return (
        <Grid container item xs={12} rowGap={1} justifyContent={'space-between'} sx={{ backgroundColor: 'transparent' }}>
            {/* FIRST SECTION */}
            <Grid container item xs={12} md={3.2} justifyContent={'center'} alignItems={"center"} sx={{ backgroundColor: 'transparent' }}>
                <Grid container item xs={12} md={8}     >
                    <Meter momentum={initialStatusData?.momentum} />
                </Grid>
                <Grid container item xs={12} md={4}>
                    <Typography variant='subtitle2' sx={{ fontWeight: '600', color: '#a7a7a7' }}>Your forum momentum</Typography>
                    <br />
                    <Typography variant='subtitle1' sx={{ fontWeight: '600', color: 'black' }}>
                        <Brightness1Icon fontSize='small' sx={{ color: initialStatusData?.momentum <= 33 ? "#fa8072 " : initialStatusData?.momentum >= 33 && initialStatusData?.momentum <= 66 ? "#EDD86D" : "#6EE3AB" }} />
                        &nbsp;
                        {`${initialStatusData?.momentum}%`}
                    </Typography>
                </Grid>
            </Grid>

            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

            {/* SECOND SECTION */}
            <Grid container item xs={12} md={4.2} gap={"1"} rowGap={1} justifyContent={'space-between'} sx={{ backgroundColor: 'transparent' }}>
                <Grid container item xs={12} md={5.6}>
                    <Button
                        fullWidth
                        variant='contained'
                        disabled={renderZoom}
                        sx={{ fontSize: '1vw', textTransform: "initial", fontWeight: '600', height: '7vh', backgroundColor: "#6183e7", '&:hover': { backgroundColor: '#2A2F42' } }}
                        onClick={() => { setCurrentPageName('prework'); }}
                    >
                        Pre work
                    </Button>
                    <Grid item xs={12}>
                        <Box
                            sx={{
                                width: '100%',
                                flexGrow: 1,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                padding: '16px 0',
                            }}
                        >
                            <CustomStepper steps={Array.from({ length: initialStatusData?.prework?.total_tasks }, (_, index) => index)} actionStep={false} totalCompletedPrework={initialStatusData?.prework?.completed_tasks} />
                        </Box>
                    </Grid>
                    <Grid container item xs={12} justifyContent={'space-between'}>
                        <Typography variant='caption' sx={{ fontWeight: '600', color: '#a7a7a7' }}>{`${initialStatusData?.prework?.completed_tasks}/${initialStatusData?.prework?.total_tasks}`}</Typography>
                        {
                            initialStatusData?.prework?.completed_tasks < initialStatusData?.prework?.total_tasks && // no need to show the time left if all the tasks are completed
                            <Typography variant='caption' sx={{ fontWeight: '600', color: '#a7a7a7' }}>{`${Math.round((initialStatusData?.prework?.total_time - initialStatusData?.prework?.completed_time) / 60)} min left`}</Typography>
                        }
                    </Grid>
                </Grid>
                <Grid container item xs={12} md={5.6}>
                    <Button
                        fullWidth
                        variant='contained'
                        disabled={!preWorkData?.chapter_info?.uuid || renderZoom || initialStatusData?.action_step?.completion_status?.length == 0}
                        sx={{ fontSize: '1vw', textTransform: "initial", fontWeight: '600', height: '7vh', backgroundColor: "#6183e7", '&:hover': { backgroundColor: '#2A2F42' } }}
                        onClick={() => { setCurrentPageName('actionSteps'); }}
                    >
                        Action steps
                    </Button>
                    <Grid item xs={12}>
                        <Box
                            sx={{
                                width: '100%',
                                flexGrow: 1,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                padding: '16px 0',
                                fontSize: '1vw',
                            }}
                        >
                            <CustomStepper steps={action_step_steps} actionStep={true} />
                        </Box>
                    </Grid>
                    {
                        initialStatusData?.action_step?.completion_status?.length == 0
                            ? null
                            : <Grid container item xs={12} justifyContent={'space-between'}>
                                <Typography variant='caption' sx={{ fontWeight: '600', color: '#a7a7a7' }}>{`${completed_action_steps?.length}/${initialStatusData?.action_step?.completion_status?.length}`}</Typography>
                                <Typography variant='caption' sx={{ fontWeight: '600', color: '#a7a7a7' }}>{initialStatusData?.action_step?.completion_status.filter((session: any) => session === 0).length} days left</Typography>

                            </Grid>
                    }
                </Grid>
            </Grid>

            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />


            {/* THIRD SECTION */}
            <Grid container item xs={12} md={4} gap={"1"} rowGap={1} justifyContent={'space-between'} sx={{ backgroundColor: 'transparent', height: '7vh' }}>
                <Grid container item xs={12} md={5.8}>
                    <Button
                        fullWidth
                        variant='contained'
                        disabled={!isButtonEnabled}
                        sx={{ fontSize: '1vw', textTransform: "initial", fontWeight: '600', backgroundColor: "#6183e7", '&:hover': { backgroundColor: '#2A2F42' } }}
                        onClick={() => {
                            getZoomJoinMeeting();
                            zoom_redirect()
                        }}
                    >
                        {joinBtnLoading ? <CircularProgress sx={{ color: "white" }} size={20} /> : "Join Meeting"}
                    </Button>
                </Grid>
                <Grid container item xs={12} md={5.8}>
                    <Typography variant='caption' sx={{ fontWeight: '600', color: '#a7a7a7' }}>{`Next Meeting: ${DateFormats(meetingTimeLocal, false)} (${timeZone}) `}</Typography>
                </Grid>
            </Grid>
        </Grid >
    )
}

// Breadcrum component
const BreadCrumComponent = ({ forumDetails, preWorkData }: any) => {
    if (Object?.keys(forumDetails)?.length > 0) {
        return (
            <>
                <Typography variant="h6" sx={{ fontWeight: '600' }} >{`${forumDetails?.forum_name}`}</Typography>
                {!preWorkData ? null :
                    <>
                        <KeyboardArrowRightIcon />
                        <Typography variant="h6" sx={{ fontWeight: '600' }} >{preWorkData?.course_info?.name || ''}</Typography>
                        <KeyboardArrowRightIcon />
                        <Typography variant="subtitle1" sx={{ fontWeight: '500', }}>{preWorkData?.chapter_info?.name || ''}</Typography>
                    </>
                }
            </>
        )
    }
}