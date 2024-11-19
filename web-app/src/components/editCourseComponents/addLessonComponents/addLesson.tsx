'use client'

import React from "react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Image from 'next/image';
import { Button, CircularProgress, Grid, Typography } from "@mui/material";
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import { StaticMessage } from "@/app/util/StaticMessage";
import SnakBarAlert from "../../snakbaralert/snakbaralert";
import { setDiscardBtnDisable, setIsPageLoading, setSaveBtnLoader, setYesBtnLoading } from "@/redux/reducers/editCourse/addLessonSlice";
import PDF from "./PDF";
import VideoComponent from "./videocomponent";
import AudioComponent from "./audio";
import ImageComponent from "./image";
import actionSteps from '../../../assets/chat.png';
import quiz from '../../../assets/002-ideas.png';
import moderator from '../../../assets/001-information.png';
import imageIcon from '../../../assets/003-image.png';
import pdfImage from '../../../assets/003-pdf-file.png';
import volume from '../../../assets/004-volume.png';
import videoImage from '../../../assets/002-video.png';
import survey from'../../../assets/003-survey.png';
import ActionSteps from "./actionStep";
import ModeratorGuide from "./moderatorGuide";
import ForumPrep from "./forumPrep";


export default function AddLesson({ setAnchorEl, setAddLessonToggle, setLessonUUID, lessonUUID, lessonStatus, setLessonStatus, chapterid, lessonToggle, setLessonToggle }: any) {
    const [selectedCardComponent, setSelectedCardComponent] = useState<JSX.Element | null>();
    const [alert, setAlert] = useState("");
    const [alertSeverity, setAlertSeverity] = useState(false);
    const [alertOpen, setAlertOpen] = useState(false);
    const [LessonDataLoader, setLessonDataLoader] = useState<boolean>(false);
    const [draftToggle, setDraftToggle] = useState<boolean>(false);


    const cardContent = [
        {
            name: "video",
            content: "Easily upload and display video content",
            icon: videoImage,
            component: <VideoComponent
                handleFileUpload={handleFileUpload}
                deleteLesson={deleteLesson}
                updateLesson={updateLesson}
                setAddLessonToggle={setAddLessonToggle}
                enableDisableTheLessonAPI={enableDisableTheLessonAPI} />
        },
        {
            name: "audio",
            content: "Perfect for learning on the go",
            icon: volume,
            component: <AudioComponent
                lessonUUID={lessonUUID}
                handleFileUpload={handleFileUpload}
                deleteLesson={deleteLesson}
                updateLesson={updateLesson}
                setAddLessonToggle={setAddLessonToggle}
                enableDisableTheLessonAPI={enableDisableTheLessonAPI}
            />
        },
        {
            name: "image",
            content: "Upload and display images to the students",
            icon: imageIcon,
            component: <ImageComponent
                setAddLessonToggle={setAddLessonToggle}
                handleFileUpload={handleFileUpload}
                deleteLesson={deleteLesson}
                updateLesson={updateLesson}
                enableDisableTheLessonAPI={enableDisableTheLessonAPI} />
        },
        {
            name: "pdf",
            content: "Easily upload PDF for students to view within the course player",
            icon: pdfImage,
            component: <PDF
                lessonUUID={lessonUUID}
                handleFileUpload={handleFileUpload}
                deleteLesson={deleteLesson}
                updateLesson={updateLesson}
                enableDisableTheLessonAPI={enableDisableTheLessonAPI}
                setAddLessonToggle={setAddLessonToggle} />
        },
        {
            name: "action step",
            content: "Implement tasks to apply learning",
            icon: actionSteps,
            component: <ActionSteps
                lessonUUID={lessonUUID}
                chapterid={chapterid}
                setAddLessonToggle={setAddLessonToggle}
                setLessonToggle={setLessonToggle}
                lessonToggle={lessonToggle}
                setLessonDataLoader={setLessonDataLoader} 
                enableDisableTheActionStepAPI={enableDisableTheActionStepAPI}
/>
        },
        {
            name: "forum_prep",
            content: "Test knowledge with interactive quizzes",
            icon: quiz,
            component: <ForumPrep
            lessonName={"Forum Prep"}
            lessonUUID={lessonUUID}
            chapterid={chapterid}
            setAddLessonToggle={setAddLessonToggle}
            handleFileUpload={handleFileUpload}
            enableDisableTheLessonAPI={enableDisableTheLessonAPI}
            deleteLesson={deleteLesson}
            updateLesson={updateLesson}
            setLessonToggle={setLessonToggle}
            lessonToggle={lessonToggle}
            setLessonDataLoader={setLessonDataLoader} />
        },
        {
            name: "moderator guide",
            content: "Equip moderators with essential resources",
            icon: moderator,
            component: <ModeratorGuide
                setLessonUUID={setLessonUUID}
                lessonUUID={lessonUUID}
                chapterid={chapterid}
                setAddLessonToggle={setAddLessonToggle}
                setLessonToggle={setLessonToggle}
                lessonToggle={lessonToggle}
                setLessonDataLoader={setLessonDataLoader} />
        },
        {
            name: "survey",
            content: "Surveys reveal diverse insights",
            icon: survey,
            component: <ForumPrep
            lessonName="Survey"
            lessonUUID={lessonUUID}
            chapterid={chapterid}
            setAddLessonToggle={setAddLessonToggle}
            handleFileUpload={handleFileUpload}
            enableDisableTheLessonAPI={enableDisableTheLessonAPI}
            deleteLesson={deleteLesson}
            updateLesson={updateLesson}
            setLessonToggle={setLessonToggle}
            lessonToggle={lessonToggle}
            setLessonDataLoader={setLessonDataLoader} />
        },
    ]

    const dispatch = useDispatch();
    const chapter_uuid = useSelector((state: any) => state.editCourse.chapterId);

    //HANDLE CARD CLICK FUNCTION
    const handleCardAPI = (cardName: any) => {
        setLessonStatus('Edit lesson');
        const matchingComponent = cardContent.find(item => item?.name === cardName);
        if (matchingComponent) {
            setSelectedCardComponent(matchingComponent.component);
        }
    }

    //ADD LESSON API
    async function handleFileUpload(selectedFile: File | any, requestBody: any) {
        console.log("seletecd file",selectedFile)
        dispatch(setSaveBtnLoader(true));
        dispatch(setIsPageLoading(true));
        dispatch(setDiscardBtnDisable(true));

        try {
            const formData = new FormData();
            if (selectedFile == null) {
                formData.append('body', JSON.stringify(requestBody));
            } else {
                // formData.append("file", JSON.stringify(selectedFile));
                formData.append("file", selectedFile?.elements ? JSON.stringify(selectedFile) : selectedFile );
                formData.append('body', JSON.stringify(requestBody));
            }
            const fileUplaodAPI = await fetch(`/api/lesson`, {
                method: 'POST',
                body: formData,
            })
            const APIResponse = await fileUplaodAPI.json();

            if (fileUplaodAPI.status == 200) {
                const matchingComponent = cardContent.find(item => item?.name === APIResponse?.data?.lesson_info?.asset_type);
                if (matchingComponent) {
                    setSelectedCardComponent(
                        React.cloneElement(matchingComponent?.component, { BtnLoader: true })
                    );
                }
                setLessonToggle(!lessonToggle);
                setAddLessonToggle(false);
                AlertManager(APIResponse?.message, false);
            }
            else {
                AlertManager(APIResponse?.message, true);
            }
        }
        catch (error: any) {
            AlertManager(StaticMessage.ErrorMessage, true);
        }
    };

    //GET LESSON DETAILS BY ID API
    async function getLessonDetailsByid() {
        setLessonDataLoader(true);
        try {
            const getLessonAPI = await fetch(`/api/lesson/${lessonUUID}`, {
                method: 'GET',
                cache: 'no-store',
                headers: {
                    "Content-Type": "application/json"
                },
            })
            const getLessonAPIResponse = await getLessonAPI.json();
            if (getLessonAPI.status == 200) {
                var data = getLessonAPIResponse?.data?.lesson_info?.name;
                var asset = getLessonAPIResponse?.data?.lesson_info?.asset_info;
                var draftInfo = getLessonAPIResponse?.data?.lesson_info?.is_active;
                const matchingComponent = cardContent.find(item => item?.name === getLessonAPIResponse?.data?.lesson_info?.asset_type);
                if (matchingComponent) {
                    setSelectedCardComponent(
                        React.cloneElement(matchingComponent?.component, { lessonData: data, assetInfo: asset , draftInfo: draftInfo })
                    );
                }
                // setLessonUUID('');
                AlertManager(getLessonAPIResponse?.message, false);
            } else {
                AlertManager(getLessonAPIResponse?.message, true);
            }
        }
        catch (error) {
            AlertManager(StaticMessage.ErrorMessage, true);
        }
    }


    //UPDATE LESSON API
    async function updateLesson(selectedFile: File | any, requestBody: any) {
        dispatch(setSaveBtnLoader(true));
        dispatch(setIsPageLoading(true));
        dispatch(setDiscardBtnDisable(true));
        try {
            const formData = new FormData();
            if (selectedFile == null) {
                formData.append('body', JSON.stringify(requestBody));
            } else {
                formData.append("file", selectedFile?.elements ? JSON.stringify(selectedFile) : selectedFile );
                formData.append('body', JSON.stringify(requestBody));
            }
            const updateLessonAPI = await fetch(`/api/lesson?uuid=${lessonUUID}`, {
                method: 'PUT',
                body: formData,
            })
            const updateLessonAPIResponse = await updateLessonAPI.json();
            if (updateLessonAPI.status == 200) {
                setLessonToggle(!lessonToggle);
                setAddLessonToggle(false);
                AlertManager(updateLessonAPIResponse?.message, false);
            } else {
                AlertManager(updateLessonAPIResponse?.message, true);
            }
        }
        catch (error) {
            AlertManager(StaticMessage.ErrorMessage, true);
        }
    }

    //DELETE LESSON API
    async function deleteLesson() {
        dispatch(setYesBtnLoading(true));
        try {
            const deleteLessonAPI = await fetch(`/api/lesson?uuid=${lessonUUID}`, {
                method: 'DELETE',
                headers: {
                    "Content-Type": "application/json"
                },
            })
            const deleteLessonAPIResponse = await deleteLessonAPI.json();
            if (deleteLessonAPI.status == 200) {
                setLessonToggle(!lessonToggle);
                setAddLessonToggle(false);
                setAnchorEl(null);
                AlertManager(deleteLessonAPIResponse?.message, false);
            } else {
                AlertManager(deleteLessonAPIResponse?.message, true);
            }
        }
        catch (error) {
            AlertManager(StaticMessage.ErrorMessage, true);
        }
    }

    //VIEW ACTION STEP API
    async function getActionStepDetailsById() {
        setLessonDataLoader(true);
        try {
            const getActionStepAPI = await fetch(`/api/actionsteps/${lessonUUID}`, {
                method: 'GET',
                cache: 'no-store',
                headers: {
                    "Content-Type": "application/json"
                },
            })
            const viewActionStepAPIResponse = await getActionStepAPI.json();
            if (getActionStepAPI.status == 200) {
                var asset = viewActionStepAPIResponse?.data?.action_steps_info;
                const matchingComponent = cardContent.find(item => item?.name === 'action step');
                if (matchingComponent) {
                    setSelectedCardComponent(
                        React.cloneElement(matchingComponent?.component, { assetInfo: asset, actionStepUUID: lessonUUID })
                    );
                }
                setLessonUUID('');
                setLessonStatus('');
                AlertManager(viewActionStepAPIResponse?.message, false);
            } else {
                AlertManager(viewActionStepAPIResponse?.message, true);
            }
        }
        catch (error) {
            AlertManager(StaticMessage.ErrorMessage, true);
        }
    }

    //ENABLE OR DISABLE LESSON API
    async function enableDisableTheLessonAPI(checked: boolean) {
        dispatch(setYesBtnLoading(true));
        try {
            const enableDisableChapterAPI = await fetch(`/api/lesson/${lessonUUID}`, {
                method: 'PATCH',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ is_active: checked }),
            })
            const enableDisableChapterAPIResponse = await enableDisableChapterAPI.json();
            if (enableDisableChapterAPI.status == 200) {
                AlertManager(enableDisableChapterAPIResponse?.message, false);
                setLessonUUID(lessonUUID);
                setLessonStatus('Edit lesson');
                setDraftToggle(!draftToggle);
                setLessonToggle(!lessonToggle);
            } else {
                AlertManager(enableDisableChapterAPIResponse?.message, true);
            }
        }
        catch (error: any) {
            AlertManager(StaticMessage.ErrorMessage, true);
        }
    }

    //ENABLE OR DISABLE ACTION STEP API
    async function enableDisableTheActionStepAPI(checked: boolean) {
        dispatch(setYesBtnLoading(true));
        try {
            const enableDisableChapterAPI = await fetch(`/api/actionsteps/${lessonUUID}`, {
                method: 'PATCH',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ is_active: checked }),
            })
            const enableDisableChapterAPIResponse = await enableDisableChapterAPI.json();
            if (enableDisableChapterAPI.status == 200) {
                AlertManager(enableDisableChapterAPIResponse?.message, false);
                setLessonUUID(lessonUUID);
                setLessonStatus('action_step');
                setDraftToggle(!draftToggle);
                setLessonToggle(!lessonToggle);
            } else {
                AlertManager(enableDisableChapterAPIResponse?.message, true);
            }
        }
        catch (error: any) {
            AlertManager(StaticMessage.ErrorMessage, true);
        }
    }

    function AlertManager(message: string, severity: boolean) {
        setAlert(message);
        setAlertSeverity(severity);
        setAlertOpen(true);
        setLessonDataLoader(false);
        dispatch(setSaveBtnLoader(false));
        dispatch(setDiscardBtnDisable(false));
        dispatch(setIsPageLoading(false));
        dispatch(setYesBtnLoading(false));
    }

    //WHEN LESSON CARD CLICK, CALL GET LESSON BY ID API
    useEffect(() => {
        if (lessonStatus == 'Edit lesson') {
            getLessonDetailsByid();
        } else if (lessonStatus == 'action_step') {
            getActionStepDetailsById();
        }
    }, [lessonUUID, draftToggle])

     //WHEN MODERATOR GUIDE CARD CLICK, CALL GET LESSON BY ID API
    useEffect(() => {
        if (lessonStatus == 'moderator_guide') {
            handleCardAPI('moderator guide');
            setLessonStatus('');
        }
    }, [lessonStatus])

    return (
        <>
            {LessonDataLoader ?
                <Grid container item xs={12} justifyContent={'center'} alignItems={'center'} sx={{ height: "70vh" }}>
                    <CircularProgress size={20} sx={{ mt: "2vh", color: "#2A2F42" }} />
                </Grid>
                :
                <>
                    {/* CARD DISPLAY */}
                    <Grid container item xs={11.5} >
                        {lessonStatus == 'Add lesson' ?
                            <>
                                <Grid container item xs={12} justifyContent={'space-between'} alignItems={'center'}>
                                    <Typography variant="h6" sx={{ fontWeight: '600' }}>Lessons</Typography>
                                    < CloseOutlinedIcon sx={{ cursor: "pointer" }} onClick={() => setAddLessonToggle(false)} />
                                </Grid>
                                <Grid container item xs={12} justifyContent={'space-between'} alignItems={'center'}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: '600', py: "2vh" }}>Deliver learning content</Typography>
                                </Grid>
                                <Grid container item direction='row' xs={12} justifyContent={'space-between'} alignItems={'center'}>
                                    {
                                        cardContent.map((card: any, index: number) => {
                                            return (
                                                <Grid container item direction='row' key={index} xs={12} md={5.9} sx={{ backgroundColor: "white", py: "3vh", mb: "2vh", borderRadius: "1vh", cursor: 'pointer' }}
                                                    onClick={() => handleCardAPI(card.name)}>
                                                    <Grid container item xs={2} md={1.5} xl={2} justifyContent={'center'} alignItems={'center'} >
                                                        <Grid container item xs={5} md={9} xl={5} className="justify-center items-center">
                                                            <Grid item xs={12} className="justify-center items-center" sx={{ width: '60%', height: "35px", position: "relative", display: "flex" }}>
                                                                <Image
                                                                    src={card.icon}
                                                                    priority={true}
                                                                    placeholder="empty"
                                                                    alt="Forums@work"
                                                                    unoptimized
                                                                    style={{ objectFit: 'contain', width: "100%" }}
                                                                    fill
                                                                />
                                                            </Grid>
                                                        </Grid>
                                                    </Grid>
                                                    <Grid container item xs={10} md={10.4} xl={10} sx={{ display: 'flex', flexDirection: 'column' }}  >
                                                        <Typography variant="subtitle1" sx={{ fontWeight: '700', textTransform: "capitalize" }}>{card?.name == 'pdf' ? 'PDF':card?.name == 'forum_prep' ? "Forum Prep" : card?.name}</Typography>
                                                        <Typography variant="subtitle2" sx={{ fontWeight: '400', lineHeight: "1", color: "#726F83", height: "4vh" }}>{card?.content}</Typography>
                                                    </Grid>
                                                </Grid>
                                            )
                                        })
                                    }
                                </Grid>
                            </>
                            :
                            // SELECTED COMPONENT DISPLAY
                            <Grid container item xs={12} justifyContent={"center"} alignItems={'center'}>
                                {selectedCardComponent}
                            </Grid>
                        }
                    </Grid>
                </>
            }
            <SnakBarAlert alertOpen={alertOpen} setAlertOpen={setAlertOpen} alertSeverity={alertSeverity} alert={alert} />
        </>
    )
}



//TEMPORARY COMPONENTS
const TextComponent = ({ setAddLessonToggle }: any) => (
    <div>
        Text Component
        <Button onClick={() => setAddLessonToggle(false)}>Go Back</Button>
    </div>
);




