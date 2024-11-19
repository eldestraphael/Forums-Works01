'use client'

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Button, Grid, Typography } from "@mui/material"
import AddIcon from '@mui/icons-material/Add';
import StorageIcon from '@mui/icons-material/Storage';
import AddLesson from "./addLesson";
import { ChapterCard } from "../chapterCard";

export default function CurriculamComponent({ setAnchorEl, course_uuid, setToggle, Toggle, courseInfo, chapterid, handleOpen, setChapterType, setChapterid, setChapterToggle, chapterToggle, setViewAPICallToggle }: any) {
    const [addLessonToggle, setAddLessonToggle] = useState<boolean>(false);
    const [lessonStatus, setLessonStatus] = useState<any>('');
    const [lessonToggle, setLessonToggle] = useState<boolean>(false);
    const [lessonUUID, setLessonUUID] = useState<any>('');
    const [lessonType, setLessonType] = useState<string>('');

    const userRoleAction = useSelector((state: any) => state.editCourse.editCourseAction);
    const publishrelatedUIDisplay = useSelector((state: any) => state.editCourse.publishLessonToggle);

    useEffect(() => {
        setAddLessonToggle(false);
    }, [publishrelatedUIDisplay])

    return (
        <>
            <Grid item container xs={12} sx={{ flexGrow: 1, }}>
                <Grid container item xs={3} direction={"column"} sx={{ minHeight: "100%", mt: "2vh", flex: 1, mr: 1 }} justifyContent={'space-between'}  >
                    <Grid container justifyContent={'flex-start'} alignItems={'flex-start'} sx={{ borderRadius: "1vh", minHeight: "5vh", }} >
                        {userRoleAction[1]?.read &&
                            <ChapterCard
                                setAddLessonToggle={setAddLessonToggle}
                                courseInfo={courseInfo}
                                handleOpen={handleOpen}
                                setChapterType={setChapterType}
                                setViewAPICallToggle={setViewAPICallToggle}
                                chapterid={chapterid}
                                setChapterid={setChapterid}
                                setToggle={setToggle}
                                Toggle={Toggle}
                                setChapterToggle={setChapterToggle}
                                chapterToggle={chapterToggle}
                                lessonToggle={lessonToggle}
                                setLessonToggle={setLessonToggle}
                                setLessonType={setLessonType}
                                setLessonStatus={setLessonStatus}
                                setLessonUUID={setLessonUUID}
                                course_uuid={course_uuid}
                            />
                        }
                    </Grid>
                    <Grid container alignItems={'flex-end'} justifyContent={'center'}  >
                        <Grid item xs={12} sx={{ my: "1.5vh" }}>
                            {userRoleAction[0]?.update &&
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    sx={{ backgroundColor: "#2A2F42", borderRadius: "1vh", border: "3px solid balck", color: "#F0F2FF", textTransform: "initial", fontWeight: "700", '&:hover': { backgroundColor: '#2A2F42' } }}
                                    onClick={() => { setChapterType('Add Chapter'); handleOpen() }}>
                                    <><AddIcon className="flex w-[0.99vw] h-[0.98vh] m-0" /><Typography sx={{ fontWeight: '400' }}>&nbsp;ADD CHAPTER</Typography></>
                                </Button>
                            }
                        </Grid>
                    </Grid>
                </Grid>

                {/* RIGHT SECTION */}
                <Grid container item xs={8.8} sx={{ minHeight: "73vh", dispaly: "flex", flex: 1, backgroundColor: "#F6F5FB", mt: "2vh", py: "2vh" }} justifyContent={'center'} alignItems={'flex-start'}>
                    {!addLessonToggle ? <InitialCurriculamCard /> :
                        <AddLesson
                            chapterid={chapterid}
                            setLessonToggle={setLessonToggle}
                            lessonToggle={lessonToggle}
                            setLessonStatus={setLessonStatus}
                            lessonStatus={lessonStatus}
                            lessonUUID={lessonUUID}
                            setAddLessonToggle={setAddLessonToggle}
                            setLessonUUID={setLessonUUID}
                            setAnchorEl={setAnchorEl}
                        />
                    }

                </Grid>
            </Grid>
        </>
    )
}


//FRONT CARD
const InitialCurriculamCard = () => {
    const userRoleAction = useSelector((state: any) => state.editCourse.editCourseAction);
    return (
        <>
            {userRoleAction[1]?.read &&
                <Grid container item xs={11.5} sx={{ backgroundColor: "#F6F5FB", mt: "2vh", py: "10vh" }} justifyContent={'center'} alignItems={'center'}  >
                    <Grid container item xs={12} justifyContent={'center'} alignItems={'center'}>
                        <Grid item xs={1} sx={{ py: "2vh" }} justifyContent={'center'} alignItems={'center'} >
                            <StorageIcon fontSize="large" />
                        </Grid>
                    </Grid>
                    <Grid container item xs={12} justifyContent={'center'} alignItems={'center'} sx={{ py: "2vh" }}>
                        <Grid item xs={12} justifyContent={'center'} alignItems={'center'} sx={{ p: 0, m: 0 }}>
                            <Typography variant="h5" sx={{ fontWeight: '600', textAlign: 'center', lineHeight: '1', p: 0, m: 0 }}>Choose a chapter or lesson </Typography>
                        </Grid>
                        <Grid item xs={12} justifyContent={'center'} alignItems={'center'} sx={{ p: 0, m: 0 }}>
                            <Typography variant="h5" sx={{ fontWeight: '600', textAlign: 'center', lineHeight: '1', p: 0, m: 0 }}> to get started</Typography>
                        </Grid>
                    </Grid>
                    <Grid container item direction='row' xs={12} justifyContent={'center'} alignItems={'center'} sx={{ py: "2vh" }}>
                        <Grid item xs={12} justifyContent={'center'} alignItems={'center'} sx={{ p: 0, m: 0 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: '600', textAlign: 'center', lineHeight: '1.2', p: 0, m: 0, color: "#726F83" }}>Preview your course as a student to make sure everything </Typography>
                        </Grid>
                        <Grid item xs={12} justifyContent={'center'} alignItems={'center'} sx={{ p: 0, m: 0 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: '600', textAlign: 'center', lineHeight: '1', color: "#726F83", p: 0, m: 0 }}> is looking sharp</Typography>
                        </Grid>
                    </Grid>
                </Grid>
            }
        </>
    )
}



