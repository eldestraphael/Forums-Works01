'use client'
import { useEffect, useRef, useState } from "react";
import { Button, Chip, CircularProgress, Grid, Tooltip, Typography } from "@mui/material";
import Image from 'next/image';
import KeyboardArrowUpOutlinedIcon from '@mui/icons-material/KeyboardArrowUpOutlined';
import AddIcon from '@mui/icons-material/Add';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useDispatch, useSelector } from "react-redux";
import { setChapterActionInfo, setChapterId, setDragToggle, setPublishLessonToggle, setSelectedIndexToggle } from "@/redux/reducers/editCourse/addLessonSlice";
import SnakBarAlert from "../snakbaralert/snakbaralert";
import { StaticMessage } from "@/app/util/StaticMessage";
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import actionSteps from '../../assets/chat.png';
import quiz from '../../assets/002-ideas.png';
import moderator from '../../assets/001-information.png';
import imageIcon from '../../assets/003-image.png';
import pdfImage from '../../assets/003-pdf-file.png';
import volume from '../../assets/004-volume.png';
import videoImage from '../../assets/002-video.png';
import survey from'../../assets/003-survey.png';


export const ChapterCard = ({ course_uuid, setAddLessonToggle, setLessonToggle, setLessonUUID, setLessonType, setLessonStatus, handleOpen, setChapterType, setChapterid, lessonToggle, setChapterToggle, chapterToggle, setViewAPICallToggle, setToggle, Toggle }: any) => {

    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [lessonInfo, setLessonInfo] = useState<any>([]);
    const [LessonsLoader, setLessonLoader] = useState<boolean>(false);
    const [alert, setAlert] = useState("");
    const [alertSeverity, setAlertSeverity] = useState(false);
    const [alertOpen, setAlertOpen] = useState(false);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [initalIndex, setInitalIndex] = useState<number | null>(null);
    const [lessonInitalIndex, setLessonInitalIndex] = useState<number | null>(null);
    const [dragIconView, setDragIconView] = useState<boolean>(false);
    const [dragLessonIconView, setDragLessonIconView] = useState<boolean>(false);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [hoveredLessonIndex, setHoveredLessonIndex] = useState<number | null>(null);
    const [actionInfo, setActionInfo] = useState<null | undefined | any>({});
    const [moderatorGuideInfo, setModeratorGuideInfo] = useState<null | undefined | any>({});
    const [draggedLessonIndex, setDraggedLessonIndex] = useState<null | number>(null);
    const [lessonUuidDrag, setLessonUuidDrag] = useState<string>("");

    const initialRender = useRef(true);
    const dispatch = useDispatch();

    const chapter_uuid: string = useSelector((state: any) => state.editCourse.chapterId);
    const course_info = useSelector((state: any) => state.editCourse.courseInfo);
    const cardIndex: boolean = useSelector((state: any) => state.editCourse.selectedIndexToggle);
    const userRoleAction = useSelector((state: any) => state.editCourse.editCourseAction);
    const PublishToggle = useSelector((state: any) => state.editCourse.publishLessonToggle);

    //CHAPTER CARD ARROW CLICK FUNCTION
    const handleArrowClick = (index: any) => {
        setSelectedIndex(selectedIndex === index ? -1 : index);
        setChapterToggle(!chapterToggle);
    };

    //GET LESSONS BY CHAPTER ID API
    async function getLessonAPI(chapter_id: string) {
        setLessonLoader(true);
        try {
            const getLessonAPI = await fetch(`/api/chapter/${chapter_id}`, {
                method: 'GET',
                cache: 'no-store',
                headers: {
                    "Content-Type": "application/json"
                },
            })
            const APIResponse = await getLessonAPI.json();
            if (getLessonAPI.status == 200) {
                setLessonInfo(APIResponse?.data?.chapter_info?.lesson_info);
                setActionInfo(APIResponse?.data?.chapter_info?.action_steps_info || {});
                setModeratorGuideInfo(APIResponse?.data?.chapter_info?.moderator_guide_info || {});
                dispatch(setChapterActionInfo(APIResponse?.data?.chapter_info?.action_steps_info || {}))
                setLessonLoader(false);
                dispatch(setPublishLessonToggle(false));
            }
            else {
                AlertManager(APIResponse?.message, true)
            }
        }
        catch (error: any) {
            AlertManager(StaticMessage.ErrorMessage, true);
        }
    }

    const assetTypeToImageMap:any = {
        pdf: pdfImage,
        video: videoImage,
        audio: volume,
        image: imageIcon,
        forum_prep:quiz,
        survey: survey
      };
      
    function AlertManager(message: string, severity: boolean) {
        setAlert(message);
        setAlertSeverity(severity);
        setAlertOpen(true);
        dispatch(setPublishLessonToggle(false));
    }

    const handleDragStart = (index: number, chapter_id: string) => {
        setDragIconView(true);
        setInitalIndex(index);
        setDraggedIndex(index);
        dispatch(setChapterId(chapter_id));
    };

    const handleDragOver = (index: number) => {
        if (draggedIndex === null || draggedIndex === index) return;
        setDragIconView(true);
        setDraggedIndex(index);

    };

    const handleDragEnd = async (i: number) => {
        let reqBody;
        if (draggedIndex !== null && initalIndex !== null) {
            reqBody = {
                new_order: course_info[initalIndex].order < course_info[draggedIndex].order ? course_info[draggedIndex].order + 1 : course_info[draggedIndex].order
            }
            try {
                const chapterOrderChangeAPI = await fetch(`/api/chapter?courseuuid=${course_uuid}&chapteruuid=${chapter_uuid}`, {
                    method: 'PATCH',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(reqBody)
                })
                const APIResponse = await chapterOrderChangeAPI.json();
                if (chapterOrderChangeAPI.status == 200) {
                    AlertManager(APIResponse?.message, false);
                    dispatch(setDragToggle(true));
                    setDraggedIndex(null);
                    setSelectedIndex(draggedIndex);
                    setLessonToggle(!lessonToggle);
                }
                else {
                    AlertManager(APIResponse?.message, true)
                }
            }
            catch {
                AlertManager(StaticMessage.ErrorMessage, true);
            }
        }
        setDragIconView(false);

    };

    const handleMouseEnter = async (e: any, index: number) => {
        e.preventDefault();
        setHoveredIndex(index);
    };

    const handleMouseLeave = async () => {
        setHoveredIndex(null);
    };

    const handleLessonDragStart = (e: any, index: number, lesson_uuid: string) => {
        e.stopPropagation();
        setDragLessonIconView(true);
        setLessonInitalIndex(index);
        setDraggedLessonIndex(index);
        setLessonUuidDrag(lesson_uuid);

    };

    const handleLessonDragOver = (e: any, index: number) => {
        e.stopPropagation(); // Prevent event propagation
        if (draggedLessonIndex === null || draggedLessonIndex === index) return;
        setDragLessonIconView(true);
        setDraggedLessonIndex(index);
    }

    const handleLessonDragEnd = async (e: any, index: number) => {
        e.stopPropagation();
        let reqBody;
        if (draggedLessonIndex !== null && lessonInitalIndex !== null) {
            reqBody = {
                new_order: lessonInfo[lessonInitalIndex].order < lessonInfo[draggedLessonIndex].order ? lessonInfo[draggedLessonIndex].order + 1 : lessonInfo[draggedLessonIndex].order
            }
            try {
                const lessonOrderChangeAPI = await fetch(`/api/lesson?chapteruuid=${chapter_uuid}&lessonuuid=${lessonUuidDrag}`, {
                    method: 'PATCH',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(reqBody)
                })
                const APIResponse = await lessonOrderChangeAPI.json();
                if (lessonOrderChangeAPI.status == 200) {
                    AlertManager(APIResponse?.message, false);
                    setDraggedLessonIndex(null);
                    setLessonToggle(!lessonToggle);
                }
                else {
                    AlertManager(APIResponse?.message, true)
                }
            }
            catch {
                AlertManager(StaticMessage.ErrorMessage, true);
            }
        }
        setDragLessonIconView(false);
    };

    const handleLessonMouseEnter = async (e: any, index: number) => {
        e.preventDefault();
        setHoveredLessonIndex(index);
    };

    const handleLessonMouseLeave = async () => {
        setHoveredLessonIndex(null);
    };

    useEffect(() => {
        if (initialRender.current) {
            initialRender.current = false;
        } else {
            getLessonAPI(chapter_uuid);
        }
    }, [lessonToggle, !PublishToggle])

    useEffect(() => {
        if (course_info.length && cardIndex == true) {
            setSelectedIndex(null);
            dispatch(setSelectedIndexToggle(false));
        }
    }, [!cardIndex])

    // useEffect(() => {
    //         if (course_info.length && cardIndex == true) {
    //             setSelectedIndex(course_info.length);
    //             dispatch(setChapterId(course_info[course_info?.length].uuid));
    //             setAddLessonToggle(false);
    //             setLessonToggle(!lessonToggle);
    //             dispatch(setSelectedIndexToggle(false));
    //         }
    // }, [!cardIndex])


    return (
        <>
            {course_info?.map((chapter: any, i: number) => {
                return (
                    <Grid container key={i} item xs={12} direction="row" justifyContent={"space-between"} alignItems={"flex-start"}
                        onMouseEnter={(e: any) => handleMouseEnter(e, i)}
                        onMouseLeave={handleMouseLeave}
                        draggable
                        onDragStart={() => handleDragStart(i, chapter?.uuid)}
                        onDragOver={(e) => {
                            e.preventDefault();
                            handleDragOver(i);
                        }}
                        onDragEnd={() => handleDragEnd(i)}
                    >
                        {hoveredIndex === i ? (
                            <Grid container
                                item xs={0.5}
                                justifyContent={"center"} alignItems={"center"}
                                sx={{ cursor: "move", pt: 1 }}>
                                <Tooltip title={dragIconView ? null : "Reorder the chapter"} placement="top">
                                    <DragIndicatorIcon fontSize="small" /></Tooltip>
                            </Grid>
                        ) :
                            <Grid container
                                item xs={0.5}
                                justifyContent={"center"} alignItems={"center"}
                                sx={{ cursor: "move", pt: 1 }}>
                                <Typography variant="body1" sx={{ color: "white" }}>a</Typography>
                            </Grid>
                        }

                        <Grid container
                            item
                            xs={11.35}
                            justifyContent={'center'}
                            alignItems={'center'}
                            sx={{ mb: "2vh" }}
                        >
                            <Grid container item xs={12} direction={'row'}
                                sx={{ backgroundColor: "#2A2F42", p: 1, borderRadius: selectedIndex == i ? "1vh  1vh 0  0" : "1vh", }} justifyContent={'space-between'} alignItems={'center'}
                            >
                                <Grid container item xs={chapter?.is_active === false ? 6 : 10} lg={chapter?.is_active === false ? 8 : 10.5} xl={chapter?.is_active === false ? 8.5 : 11} alignItems={'center'} >
                                    <Tooltip
                                        title={
                                            chapter?.name?.length > 99 ?
                                            <>
                                                Edit the chapter
                                                <br />
                                                <br />
                                                {chapter?.name}
                                            </> : "Edit the chapter"
                                        }
                                        placement="top">
                                        <Typography variant="body1" onClick={() => { setChapterType('Edit Chapter'); setViewAPICallToggle(true); setChapterid(chapter?.uuid); handleOpen() }}
                                            sx={{ fontWeight: '595', cursor: 'pointer', color: 'white', wordWrap: 'break-word', whiteSpace: 'normal', overflowWrap: 'break-word', width: "100%" }} >{chapter?.name.length > 99 ? `${chapter.name.slice(0, 99)}...` : chapter.name}
                                        </Typography>
                                    </Tooltip>
                                </Grid>
                                {chapter?.is_active === false &&
                                    <Grid container item xs={4} md={3.5} lg={3} xl={2.5} alignItems={'center'}>
                                        <Tooltip title="Edit the chapter" placement="top">
                                            <Typography variant="caption" onClick={() => { setChapterType('Edit Chapter'); setViewAPICallToggle(true); setChapterid(chapter?.uuid); handleOpen() }}
                                                sx={{ fontWeight: '595', cursor: 'pointer', color: 'white', wordWrap: 'break-word', whiteSpace: 'normal', overflowWrap: 'break-word', width: "100%" }} >
                                                {chapter?.is_active === false ? <Chip label="Draft" size="small" sx={{ fontSize: "11px", ml: "1vh", backgroundColor: "#FFC55C", color: "black", height: "20px" }} /> : null}
                                            </Typography>
                                        </Tooltip>
                                    </Grid>
                                }
                                <Grid container item xs={2} md={1} justifyContent={'flex-end'} alignItems={'center'}  >
                                    {!(selectedIndex == i) ?
                                        <Tooltip title="View the lessons" placement="top" ><KeyboardArrowDownIcon fontSize='small' sx={{ color: "white", cursor: "pointer" }} onClick={() => {
                                            setSelectedIndex(i); setChapterid(chapter?.uuid);
                                            dispatch(setChapterId(chapter?.uuid)); handleArrowClick(i); getLessonAPI(chapter?.uuid)
                                        }} /></Tooltip>
                                        :
                                        <KeyboardArrowUpOutlinedIcon fontSize='small' sx={{ color: "white", cursor: "pointer" }} onClick={() => { setSelectedIndex(i); handleArrowClick(i) }} />}
                                </Grid>
                            </Grid>
                            {selectedIndex == i ?
                                <Grid container item xs={12} sx={{ backgroundColor: "#F6F5FB", pb: "3vh", borderRadius: "0  0 1vh 1vh" }} justifyContent={'center'} alignItems={'center'} >
                                    <Grid container item xs={11.1}>
                                        <Grid container item xs={12} sx={{ minWidth: "5vh", }} justifyContent={'center'} alignItems={'center'}>
                                            {LessonsLoader ? <CircularProgress size={20} sx={{ mt: "2vh", color: "#2A2F42" }} /> :
                                                lessonInfo?.map((item: any, index: number) => {
                                                    return (
                                                        <>
                                                        <Tooltip title={dragLessonIconView ? null : (item?.name?.length > 99 ? item?.name : "")} placement="top">
                                                            <Grid container key={i} item xs={12} direction="row" justifyContent={"space-between"} alignItems={"flex-start"}
                                                                onMouseEnter={(e: any) => handleLessonMouseEnter(e, index)}
                                                                onMouseLeave={handleLessonMouseLeave}
                                                                draggable
                                                                onDragStart={(e) => handleLessonDragStart(e, index, item?.uuid)}
                                                                onDragOver={(e) => {
                                                                    e.preventDefault();
                                                                    handleLessonDragOver(e, index);
                                                                }}
                                                                onDragEnd={(e) => handleLessonDragEnd(e, index)}>
                                                                {hoveredLessonIndex === index ? (
                                                                    <Grid container
                                                                        item xs={0.1}
                                                                        justifyContent={"center"} alignItems={"center"}
                                                                        sx={{ cursor: "move", pt: 1.5, pr: "1px", zIndex: 1300 }}>
                                                                        <Tooltip title={dragLessonIconView ? null : "Reorder the lesson"} placement="top">
                                                                            <DragIndicatorIcon fontSize="small" /></Tooltip>
                                                                    </Grid>
                                                                ) :
                                                                    <Grid container
                                                                        item xs={0.1}
                                                                        justifyContent={"center"} alignItems={"center"}
                                                                        sx={{ cursor: "move", pt: 2, pr: "1px" }}>
                                                                        <Typography variant="body1" sx={{ color: "#F6F5FB" }}>a</Typography>
                                                                    </Grid>
                                                                }
                                                                <Grid container key={index} item xs={11.9} sx={{ width: "2vh", backgroundColor: "white", mt: "1vh", p: 0.7, px: 1, borderRadius: "1.5vh" }} justifyContent={'space-between'}
                                                                    onClick={() => { setAddLessonToggle(true); setLessonType(item?.asset_type); setLessonStatus('Edit lesson'); setLessonUUID(item.uuid) }}>

                                                                    <Grid container item xs={item?.is_active === false ? 6 : 10} sm={item?.is_active === false ? 4 : 10} md={item?.is_active === false ? 4.6 : 10} lg={item?.is_active === false ? 7.5 : 10.5} xl={item?.is_active === false ? 8 : 11} alignItems={'center'} >
                                                                        <Typography variant="body2" sx={{ fontWeight: '800', cursor: 'pointer', color: "#726F83", wordWrap: 'break-word', whiteSpace: 'normal', overflowWrap: 'break-word', width: "100%" }} >{item?.name?.length > 99 ? `${item?.name.slice(0,99)}...` : item?.name}</Typography>
                                                                    </Grid>
                                                                    {item?.is_active === false &&
                                                                        <Grid container item xs={4} sm={6} md={5.6} lg={3.5} xl={3} justifyContent={"center"} alignItems={'center'}>
                                                                            <Chip label="Draft" size="small" sx={{ fontSize: "11px", backgroundColor: "#FFC55C", color: "black", border: "1px solid #ffff99", height: "22px" }} />
                                                                        </Grid>
                                                                    }
                                                                    <Grid container item xs={2} md={1} justifyContent={'flex-end'} alignItems={'center'} >
                                                                        <Grid item xs={12} className="justify-center items-center" sx={{ width: '60%', height: "20px", position: "relative", display: "flex" }}>
                                                                            <Image
                                                                                src={assetTypeToImageMap[item?.asset_type]}
                                                                                priority={true}
                                                                                placeholder="empty"
                                                                                alt="Forums@work"
                                                                                objectFit="contain"
                                                                                unoptimized
                                                                                style={{ width: "100%", color: "#726F83" }}
                                                                                layout="fill"
                                                                            />
                                                                        </Grid>
                                                                    </Grid>
                                                                </Grid>
                                                            </Grid>
                                                            </Tooltip>
                                                        </>
                                                    )
                                                })
                                            }
                                            {LessonsLoader ? null :
                                                Object.keys(actionInfo)?.length ?
                                                <Tooltip title={dragLessonIconView ? null : (actionInfo?.name?.length > 99 ? actionInfo?.name : "")} placement="top">
                                                    <Grid container item xs={12} sx={{ width: "2vh", backgroundColor: "white", mt: "1vh", p: 0.5, px: 1, borderRadius: "1.5vh" }} justifyContent={'space-between'}
                                                        onClick={() => { setAddLessonToggle(true); setLessonType('action_step'); setLessonStatus('action_step'); setLessonUUID(actionInfo?.uuid) }}>
                                                        <Grid container item xs={actionInfo?.is_active === false ? 6 : 10} sm={actionInfo?.is_active === false ? 4 : 10} md={actionInfo?.is_active === false ? 4.6 : 10} lg={actionInfo?.is_active === false ? 7.5 : 10.5} xl={actionInfo?.is_active === false ? 8 : 11} alignItems={'center'} >
                                                            <Typography variant="body2" sx={{ fontWeight: '800', cursor: 'pointer', color: "#726F83", wordWrap: 'break-word', whiteSpace: 'normal', overflowWrap: 'break-word', width: "100%" }} >{actionInfo?.name?.length > 100 ? `${actionInfo?.name?.slice(0,100)}...` : actionInfo?.name}</Typography>
                                                        </Grid>
                                                        {actionInfo?.is_active === false &&
                                                            <Grid container item xs={4} sm={6} md={5.6} lg={3.5} xl={3} justifyContent={"center"} alignItems={'center'}>
                                                                <Chip label="Draft" size="small" sx={{ fontSize: "11px", backgroundColor: "#FFC55C", color: "black", border: "1px solid #ffff99", height: "22px" }} />
                                                            </Grid>
                                                        }
                                                        <Grid container item xs={2} md={1} justifyContent={'flex-end'} alignItems={'center'} >
                                                            <Grid item xs={12} className="justify-center items-center" sx={{ width: '60%', height: "20px", position: "relative", display: "flex" }}>
                                                                <Image
                                                                    src={actionSteps}
                                                                    priority={true}
                                                                    placeholder="empty"
                                                                    alt="Forums@work"
                                                                    objectFit="contain"
                                                                    unoptimized
                                                                    style={{ width: "100%", color: "#726F83" }}
                                                                    layout="fill"
                                                                />
                                                            </Grid>
                                                        </Grid>
                                                    </Grid>
                                                    </Tooltip>
                                                    : null}
                                            {LessonsLoader ? null :
                                                Object.keys(moderatorGuideInfo).length ?
                                                    <Grid container item xs={12} sx={{ width: "2vh", backgroundColor: "white", mt: "1vh", p: 0.5, px: 1, borderRadius: "1.5vh" }} justifyContent={'space-between'}
                                                        onClick={() => { setAddLessonToggle(true); setLessonType('moderator_guide'); setLessonStatus('moderator_guide'); }}>
                                                        <Grid container item xs={10} sm={10} md={10} lg={10.5} xl={11} alignItems={'center'} >
                                                            <Typography variant="body2" sx={{ fontWeight: '800', cursor: 'pointer', color: "#726F83", wordWrap: 'break-word', whiteSpace: 'normal', overflowWrap: 'break-word', width: "100%" }} >Moderator Guide</Typography>
                                                        </Grid>
                                                        <Grid container item xs={2} md={1} justifyContent={'flex-end'} alignItems={'center'} >
                                                            <Grid item xs={12} className="justify-center items-center" sx={{ width: '60%', height: "20px", position: "relative", display: "flex" }}>
                                                                <Image
                                                                    src={moderator}
                                                                    priority={true}
                                                                    placeholder="empty"
                                                                    alt="Forums@work"
                                                                    objectFit="contain"
                                                                    unoptimized
                                                                    style={{ width: "100%", color: "#726F83" }}
                                                                    layout="fill"
                                                                />
                                                            </Grid>
                                                        </Grid>
                                                    </Grid>
                                                    : null}
                                        </Grid>
                                        <Grid container item xs={12} justifyContent={'center'} alignItems={'center'} sx={{ mt: "2vh", }}>
                                            {userRoleAction[0]?.update &&
                                                <Button
                                                    fullWidth
                                                    sx={{ textTransform: "initial", fontWeight: "600", color: "#000000", py: "0.7vh", backgroundColor: "white", borderRadius: "1.5vh" }}
                                                    onClick={() => { setAddLessonToggle(true); setLessonStatus('Add lesson'); }}>
                                                    <><AddIcon fontSize="small" className="flex w-[0.99vw] h-[0.98vh] m-0" /><Typography variant='body2' sx={{ fontWeight: '600' }}>&nbsp; Add Lesson</Typography></>
                                                </Button>
                                            }
                                        </Grid>
                                    </Grid>
                                </Grid> : null}
                        </Grid >
                    </Grid>
                )
            })
            }
            <SnakBarAlert alertOpen={alertOpen} setAlertOpen={setAlertOpen} alertSeverity={alertSeverity} alert={alert} />
        </>
    )
}