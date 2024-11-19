"use client"

import SurveyComponent from "@/components/surveys/surveyComponent/surveyComponent";
import { useEffect, useState } from "react";
import { StaticMessage } from "@/app/util/StaticMessage";
import SnakBarAlert from "@/components/snakbaralert/snakbaralert";
import { useParams } from 'next/navigation';
import { useAppDispatch } from "@/redux/hooks";
import { setCleanUpState, setCurrentLessionUUID, trackingPostAPI } from "@/redux/reducers/forumExperience/forumExperienceSlice";
import { useRouter } from "next/navigation";
import { Button, CircularProgress, Grid, Typography } from "@mui/material";
import { Model } from "survey-core";
import ArrowBackIosNewOutlinedIcon from '@mui/icons-material/ArrowBackIosNewOutlined';

const SurveyPage = () => {
    const { push,back } = useRouter();
    const params = useParams();
    const { lesson_uuid, forum_uuid } = params;
    const dispatch = useAppDispatch();
    const [alert, setAlert] = useState("");
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertSeverity, setAlertSeverity] = useState(false);
    const [loading, setLoading] = useState(false);
    const [surveyInput, setSurveyInput] = useState();
    const [surveyId, setSurveyId] = useState();
    const [preWorkDataLessons, setPreWorkDataLessons] = useState<any[]>([]);
    const [surveyAnswers, setSurveyAnswers] = useState();

    function AlertManager(message: string, severity: boolean) {
        setAlert(message)
        setAlertSeverity(severity)
        setAlertOpen(true)
    }

    const getSurveyData = async () => {
        try {
            const res = await fetch(`/api/lesson/${lesson_uuid}`, {
                method: "GET",
                cache: 'no-store',
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const data = await res.json();
            if (res.status == 200) {
                if (data.data?.lesson_info.asset_type == "survey" && data.data?.lesson_info?.asset_info?.survey_data) {
                    setSurveyId(data.data?.lesson_info?.asset_info.uuid);
                    setSurveyInput(data.data?.lesson_info?.asset_info?.survey_data);
                    await getSurveyAnswers(data.data?.lesson_info?.asset_info.uuid);
                } else {
                    AlertManager(StaticMessage.ErrorMessage, true);
                }
            } else {
                AlertManager(data?.message, true);
            }
        }
        catch (error: any) {
            AlertManager(StaticMessage.ErrorMessage, true);
        }
    }

    const getSurveyAnswers = async (survey_id: string) => {
        try {
            const res = await fetch(`/api/forum/${forum_uuid}/survey/${survey_id}/response`, {
                method: "GET",
                cache: 'no-store',
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const data = await res.json();
            if (res.status == 200) {
                if (data.data?.user_survey_answers) {
                    setSurveyAnswers(data.data?.user_survey_answers);
                }
            } else {
                AlertManager(data?.message, true);
            }
        }
        catch (error: any) {
            AlertManager(StaticMessage.ErrorMessage, true);
        }
    }

    const getPreWorkData = async () => {
        try {
            let response = await fetch(`/api/forumexperience/${forum_uuid}/prework`, {
                method: 'GET',
                cache: 'no-store',
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const GetPreWorkData = await response.json();
            if (response.status == 200) {
                setPreWorkDataLessons(GetPreWorkData?.data.lessons ?? [])
            }
            else {
                AlertManager("Kindly try again later", true);
            }
        }
        catch (error: any) {
            AlertManager("Kindly try again later", true);
        }
    }

    useEffect(() => {
        preloadData();
    }, [lesson_uuid, forum_uuid]);

    const preloadData = async () => {
        try {
            setLoading(true);
            await getSurveyData();
            await getPreWorkData();
        } catch (error: any) {
            AlertManager(StaticMessage.ErrorMessage, true);
        } finally {
            setLoading(false);
        }
    }

    const onSurveyComplete = async (sender: Model) => {
        const answers = sender.getPlainData();
        const formattedResponse = answers.map((m) => {
            return {
                answer: m.displayValue,
                question: m.title,
                questionKey: m.name,
            };
        });
        const questionsCount = sender.getAllQuestions().length;
        const payload = {
            surveyMetadata: sender.data,
            surveyAnswer: formattedResponse,
        };
        if (forum_uuid && lesson_uuid) {
            try {
                setLoading(true);
                const res = await fetch(`/api/forum/${forum_uuid}/survey/${surveyId}/response`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", },
                    body: JSON.stringify(payload),
                });
                if (res.status == 200) {
                    await dispatch(trackingPostAPI({
                        forum_uuid: forum_uuid,
                        lesson_uuid: lesson_uuid,
                        status: questionsCount,
                        status_percent: 100,
                        is_current_lesson: false
                    }));
                    const currentActiveLessonIndex = preWorkDataLessons.findIndex((x: any) => x.is_current_lesson == true);
                    if (currentActiveLessonIndex !== preWorkDataLessons?.length - 1) {
                        await dispatch(trackingPostAPI({
                            forum_uuid: forum_uuid,
                            lesson_uuid: preWorkDataLessons[currentActiveLessonIndex + 1]?.uuid,
                            status: 0,
                            status_percent: 0,
                            is_current_lesson: true
                        }))
                        await dispatch(setCurrentLessionUUID(preWorkDataLessons[currentActiveLessonIndex + 1]?.uuid))
                        await dispatch(setCleanUpState());
                    }
                    await push(`/forum_experience?forum_uuid=${forum_uuid}`)
                }
                else {
                    setLoading(false);
                }
            }
            catch (error: any) {
                AlertManager(StaticMessage.ErrorMessage, true);
            }
            finally {
                setLoading(false)
            }
        } else {
            AlertManager(StaticMessage.ErrorMessage, true);
        }
    };

    return (
        loading ? <Grid container item xs={12} sx={{ height: '70vh' }} justifyContent={'center'} alignItems={'center'}>
            <CircularProgress />
        </Grid> :
            <div className='lg:ml-[18vw] px-6 ' >
                <Grid container item xs={12} justifyContent={'flex-start'} alignItems={'center'} sx={{ pt: 3, pb: 1, pl: 3, pr: 4 }}>
                <Grid container item xs={12} lg={6} alignItems={'center'} columnGap={2}>
                    <Button
                        // fullWidth
                        variant='outlined'
                        startIcon={<ArrowBackIosNewOutlinedIcon fontSize='small' />}
                        sx={{ textTransform: "initial", fontWeight: '600' }}
                        onClick={() => { back(); setLoading(true); }}
                    >
                        Back
                    </Button>
                    <Typography variant="h6" sx={{ fontWeight: '600' }} >Survey</Typography>
                </Grid>
            </Grid>
                <SurveyComponent data={surveyInput} onComplete={onSurveyComplete} answers={surveyAnswers} />
                <SnakBarAlert alertOpen={alertOpen} setAlertOpen={setAlertOpen} alertSeverity={alertSeverity} alert={alert} />
            </div>

    );
};

export default SurveyPage;