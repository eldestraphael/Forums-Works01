'use client'

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Checkbox, CircularProgress, Grid, Tooltip, Typography } from "@mui/material";
import SnakBarAlert from "../../snakbaralert/snakbaralert";
import PopperComponent from "../PopperComponent";
import { TextareaAutosize } from '@mui/base/TextareaAutosize';
import { StaticMessage } from "@/app/util/StaticMessage";
import { setDiscardBtnDisable, setIsPageLoading, setSaveBtnLoader, setYesBtnLoading } from "@/redux/reducers/editCourse/addLessonSlice";
import BackDropLoading from "@/components/loading/backDropLoading";

export default function ActionSteps({ lessonToggle, setLessonToggle, actionStepUUID,enableDisableTheActionStepAPI,draftInfo, setAddLessonToggle, assetInfo, }: any) {
    const [actionStepData, setActionStepData] = useState({
        Title: '',
        Description: ''
    });
    const [errors, setErrors] = useState({
        Title: '',
        Description: ''
    });
    const [discardChangesLoader, setDiscardChangeLoader] = useState<boolean>(false);
    const [alert, setAlert] = useState("");
    const [alertSeverity, setAlertSeverity] = useState<boolean>(false);
    const [alertOpen, setAlertOpen] = useState<boolean>(false);
    const [isFocused, setIsFocused] = useState<boolean>(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const saveLoader = useSelector((state: any) => state.editCourse.saveBtnLoader);
    const chapter_uuid = useSelector((state: any) => state.editCourse.chapterId);
    const discard: boolean = useSelector((state: any) => state.editCourse.discardBtnDisable);
    const userRoleAction = useSelector((state: any) => state.editCourse.editCourseAction);
    const isPageLoading = useSelector((state: any) => state.editCourse.isPageLoading);
    const actionStepDisplay = useSelector((state: any) => state.editCourse.chapterActionInfo);

    const dispatch = useDispatch();
    const popperOpen = Boolean(anchorEl);
    const id = popperOpen ? 'simple-popper' : undefined;

    const handleClick = (event: any) => {
        setAnchorEl(anchorEl ? null : event.currentTarget);
    };

    const handleChange = (e: any) => {
        setIsFocused(true);
        const { name, value } = e.target;
        let maxLength = (name === 'Description') ? 2500 : 250;
        let truncatedValue = value.length > (maxLength - 1) ? value.slice(0, maxLength) : value;
        setActionStepData({ ...actionStepData, [name]: truncatedValue });
        let error = '';
        if (value.length > maxLength) {
            error = `${name} must be ${maxLength} characters or less`;
        }
        setErrors({ ...errors, [name]: error });
    };

    const handleBlur = (e: any) => {
        const { name, value } = e.target;
        let error = '';
        const formattedName = name.replace(/_/g, ' ').replace(/\b\w/g, (char: any) => char.toUpperCase());
        error = value.trim() === '' ? `${formattedName} is required` : '';
        setErrors({ ...errors, [name]: error });
    };

    //CREATE ACTION STEP API
    const handleCreateActionSteps = async () => {
        dispatch(setSaveBtnLoader(true));
        dispatch(setIsPageLoading(true));
        dispatch(setDiscardBtnDisable(true));
        const requestBody = {
            chapter_uuid: chapter_uuid,
            name: actionStepData.Title,
            description: actionStepData.Description,
            times_per_year: 365
        }
        try {
            const createActionStepAPI = await fetch(`/api/actionsteps`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(requestBody)
            })
            const createActionStepsResponse = await createActionStepAPI.json();
            if (createActionStepAPI.status == 200) {
                AlertManager(createActionStepsResponse?.message, false);
                setLessonToggle(!lessonToggle);
                setAddLessonToggle(false);
            } else {
                AlertManager(createActionStepsResponse?.message, true);
            }
        }
        catch (error) {
            AlertManager(StaticMessage.ErrorMessage, true);
        }
    }

    //UPDATE ACTION STEPS
    async function handleUpdateActionSteps() {
        dispatch(setSaveBtnLoader(true));
        dispatch(setIsPageLoading(true));
        dispatch(setDiscardBtnDisable(true));
        const requestBody: {
            name?: string;
            description?: string;
            times_per_year?: number;
        } = {
            name: actionStepData.Title,
            description: actionStepData.Description,
        };
        try {
            const updateActionStepAPI = await fetch(`/api/actionsteps?uuid=${actionStepUUID}`, {
                method: 'PUT',
                body: JSON.stringify(requestBody),
            })
            const updateActionStepAPIResponse = await updateActionStepAPI.json();
            if (updateActionStepAPI.status == 200) {
                setLessonToggle(!lessonToggle);
                setAddLessonToggle(false);
                AlertManager(updateActionStepAPIResponse?.message, false);
            } else {
                AlertManager(updateActionStepAPIResponse?.message, true);
            }
        }
        catch (error) {
            AlertManager(StaticMessage.ErrorMessage, true);
        }
    }


    //DELETE ACTION API
    async function deleteActionStep() {
        dispatch(setYesBtnLoading(true));
        try {
            const deleteActionStepAPI = await fetch(`/api/actionsteps?uuid=${actionStepUUID}`, {
                method: 'DELETE',
                headers: {
                    "Content-Type": "application/json"
                },
            })
            const deleteActionStepAPIResponse = await deleteActionStepAPI.json();
            if (deleteActionStepAPI.status == 200) {
                setLessonToggle(!lessonToggle);
                setAddLessonToggle(false);
                setAnchorEl(null);
                AlertManager(deleteActionStepAPIResponse?.message, false);
            } else {
                AlertManager(deleteActionStepAPIResponse?.message, true);
            }
        }
        catch (error) {
            AlertManager(StaticMessage.ErrorMessage, true);
        }
    }

       //Draft checkbox function API call
       const handleEnableDisableCheck = (e: any) => {
        enableDisableTheActionStepAPI(!e.target.checked);
    }


    function AlertManager(message: string, severity: boolean) {
        setAlert(message);
        setAlertSeverity(severity);
        setAlertOpen(true);
        dispatch(setYesBtnLoading(false));
        dispatch(setSaveBtnLoader(false));
        dispatch(setIsPageLoading(false));
        dispatch(setDiscardBtnDisable(false));
    }

    //VIEW API RESPONSE STORE IN STATE
    useEffect(() => {
        if (assetInfo) {
            setActionStepData({ ...actionStepData, Title: assetInfo?.name, Description: assetInfo?.description });
        }
    }, [assetInfo])

    return (
        <>
            {userRoleAction[1].read &&
                <Grid container item xs={11} direction='column' justifyContent={'center'} alignItems={'center'} >
                    {Object.keys(actionStepDisplay).length && assetInfo == undefined ?
                        <Grid container item xs={12} justifyContent={"center"} alignItems={"center"} sx={{ mt: 5, height: "53vh" }}>
                            <Grid container justifyContent={"center"} alignItems={"center"} sx={{ height: "53vh" }}>
                                <Typography variant='h6' sx={{ fontWeight: "600", color: '#5F83ED' }}>Action Step already exist</Typography>
                            </Grid>
                        </Grid>
                        :
                        <Grid container item xs={12}>
                            <Grid container item xs={12} justifyContent={"space-between"} alignItems={"center"} sx={{ backgroundColor: "transperant" }}>
                            <Grid item xs={10} sm={10} md={10} lg={10} xl={10.9} justifyContent={"flex-start"} >
                                <Button variant='contained'
                                    sx={{ backgroundColor: "#2A2F42", cursor: "auto", borderRadius: "5vh", border: "3px solid balck", m: 0, p: 0,px:1, color: "#F0F2FF", textTransform: "initial", fontWeight: "700", '&:hover': { backgroundColor: '#2A2F42' } }}
                                >
                                    Action Step</Button>
                            </Grid>
                            <Grid item xs={1.8} sm={1.8} md={1.6} lg={1.2} xl={1} justifyContent={"flex-end"} alignItems={'center'} sx={{ backgroundColor: "transperant", mb: "1.5vh" }} >
                                {assetInfo ?
                                    userRoleAction[0].update &&
                                    <Tooltip title={!assetInfo?.is_active ? "Publish this lesson" : " Make this lesson draft"} placement="top">
                                        <div style={{ display: "inline-flex", alignItems: 'center', justifyContent: "flex-end" }} >
                                            <Typography >Draft</Typography>
                                            <Checkbox
                                                checked={!assetInfo?.is_active}
                                                sx={{ p: 0, m: 0 }}
                                                onClick={handleEnableDisableCheck} />
                                        </div>
                                    </Tooltip>
                                    : null}
                            </Grid>
                        </Grid>

                            {/* <Grid container item xs={12}>
                                <Button variant='contained'
                                    sx={{ backgroundColor: "#2A2F42", cursor: "auto", borderRadius: "5vh", border: "3px solid balck", m: 0, py: 0, px: 1.5, color: "#F0F2FF", textTransform: "initial", fontWeight: "700", '&:hover': { backgroundColor: '#2A2F42' } }}
                                >
                                    Action Step</Button>
                            </Grid> */}





                            <Grid container item xs={12} direction='row' sx={{ mb: "1vh" }}>
                                <Grid container item xs={assetInfo ? 4 : 7} sm={assetInfo ? 3 : 6} md={assetInfo ? 4.8 : 6.5} lg={assetInfo ? 4.7 : 7.5} xl={assetInfo ? 5 : 8} alignItems={'center'}>
                                    <Typography variant="body1" fontWeight={"600"}>{assetInfo? "Edit Action Step" : "New Action Step"}</Typography>
                                </Grid>
                                <Grid container item xs={assetInfo ? 8 : 5} sm={assetInfo ? 9 : 6} md={assetInfo ? 7.2 : 5.5} lg={assetInfo ? 7.3 : 4.5} xl={assetInfo ? 7 : 4} justifyContent={"space-between"} alignItems={'center'} >
                                    <Grid container item xs={12} justifyContent={"space-between"} alignItems={'center'} sx={{ display: 'flex', flexDirection: "row" }} >
                                        {assetInfo ?
                                            <Grid item xs={4} sm={4.9} xl={4} justifyContent={"flex-end"} alignItems={'center'} >
                                                {userRoleAction[0].update &&
                                                    <Button variant='contained' fullWidth
                                                        sx={{ backgroundColor: "#cf0c0c", height: "4vh", borderRadius: "1vh", border: "1px solid #cf0c0c", px: 1, py: 0.5, m: 0, color: "white", textTransform: "initial", fontWeight: "600", '&: hover': { backgroundColor: "#cf0c0c" } }}
                                                        aria-describedby={id} onClick={handleClick}>
                                                        DELETE ACTION
                                                    </Button>
                                                }
                                            </Grid>
                                            : null
                                        }
                                        <Grid item xs={assetInfo ? 4 : 7} sm={assetInfo ? 4.9 : 8} md={assetInfo ? 4.5 : 8} xl={assetInfo ? 4 : 7} justifyContent={"flex-end"} alignItems={'center'} >
                                            <Button variant='outlined' fullWidth
                                                disabled={discard}
                                                sx={{ backgroundColor: "white", height: "4vh", borderRadius: "1vh", border: "1px solid #2A2F42", px: 1, py: 0.5, m: 0, color: "black", textTransform: "initial", fontWeight: "600", }}
                                                onClick={() => { setDiscardChangeLoader(true); setAddLessonToggle(false) }}>
                                                {discardChangesLoader ? <CircularProgress sx={{ color: "white" }} size={20} /> : " Discard Changes"}
                                            </Button>
                                        </Grid>
                                        <Grid item xs={assetInfo ? 3 : 4} sm={assetInfo ? 2 : 3} md={assetInfo ? 2 : 3} xl={assetInfo ? 3 : 4} justifyContent={"flex-end"} alignItems={'center'}>
                                            {userRoleAction[0].update &&
                                                <Button variant='contained' fullWidth
                                                    disabled={assetInfo ? !actionStepData.Title || !actionStepData.Description || !isFocused : !actionStepData.Title || !actionStepData.Description}
                                                    sx={{ backgroundColor: "#2A2F42", height: "4vh", borderRadius: "1vh", border: "3px solid balck", m: 0, p: 0.5, color: "#F0F2FF", textTransform: "initial", fontWeight: "600", '&:hover': { backgroundColor: '#2A2F42' } }}
                                                    onClick={assetInfo ? handleUpdateActionSteps : handleCreateActionSteps}
                                                >
                                                    {saveLoader ? <CircularProgress sx={{ color: "white" }} size={20} /> : "SAVE"}
                                                </Button>
                                            }
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                            {/* TOP SECTION FOR ADD PDF LESSON */}
                            <Grid container item xs={12} justifyContent={"center"} alignItems={"center"} sx={{ backgroundColor: "white" }}>
                                <Grid container item xs={11} justifyContent={"center"} alignItems={"center"} sx={{ pt: 2, pb: 3 }}>
                                    <Grid item xs={12} sx={{ color: "#777", m: "1vh" }}>
                                        <Typography variant="caption">TITLE</Typography>
                                        <TextareaAutosize
                                            name='Title'
                                            maxLength={251}
                                            maxRows={4}
                                            minRows={1}
                                            placeholder="Enter an action step title"
                                            value={actionStepData?.Title}
                                            onChange={handleChange}
                                            style={{
                                                width: "100%", border:errors?.Title?.length ? "2px solid #cf0c0c" : actionStepData?.Title?.length === 251 ? "2px solid #cf0c0c" : "1px solid #bdbdbd", borderRadius: "1vh",
                                                padding: "8px", outline: "none", resize: 'none', maxHeight: "198px", color: "black"
                                            }}
                                            onFocus={(e) => {
                                                e.target.style.border = "2px solid #3182ce"
                                            }}
                                            onBlur={(e) => {
                                                handleBlur(e);
                                                actionStepData?.Title?.length ? null : e.target.style.borderColor = "#cf0c0c"
                                            }}
                                            onMouseLeave={(e) => {
                                                const target = e.target as HTMLTextAreaElement;
                                                target.style.border = actionStepData?.Title?.length === 251 ? "2px solid #cf0c0c" : "1px solid #bdbdbd"
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && e.shiftKey === false) {
                                                    e.preventDefault();
                                                }
                                            }}
                                        />
                                        <Typography variant="caption" sx={{ color: "#cf0c0c", ml: "2vh", fontWeight: "500" }}>{errors?.Title}</Typography>
                                        <Typography variant="caption" sx={{ textAlign: 'right', display: 'block', marginTop: '4px' }}>
                                            {actionStepData?.Title?.length} / 250
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sx={{ color: "#777", m: "1vh" }}>
                                        <Typography variant="caption">DESCRIPTION</Typography>
                                        <TextareaAutosize
                                            name='Description'
                                            maxLength={2501}
                                            maxRows={7}
                                            minRows={7}
                                            placeholder="Enter description about action step"
                                            value={actionStepData?.Description}
                                            onChange={handleChange}
                                            style={{
                                                width: "100%", border:errors?.Description?.length ? "2px solid #cf0c0c" :  actionStepData?.Description?.length == 2501 ? "2px solid #cf0c0c" : "1px solid #bdbdbd", borderRadius: "1vh",
                                                padding: "8px", outline: "none", resize: 'none', maxHeight: "198px", color: "black",
                                            }}
                                            onFocus={(e) => {
                                                e.target.style.border = "2px solid #3182ce"
                                            }}
                                            onBlur={(e) => {
                                                handleBlur(e);
                                                actionStepData?.Description?.length ? null : e.target.style.borderColor = "#cf0c0c"
                                            }}
                                            onMouseLeave={(e) => {
                                                const target = e.target as HTMLTextAreaElement;
                                                target.style.border = actionStepData?.Description?.length == 2501 ? "2px solid #cf0c0c" : "1px solid #bdbdbd"
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && e.shiftKey === false) {
                                                    e.preventDefault();
                                                }
                                            }}
                                        />
                                        <Typography variant="caption" sx={{ color: "#cf0c0c", ml: "2vh", fontWeight: "500" }}>{errors?.Description}</Typography>
                                        <Typography variant="caption" sx={{ textAlign: 'right', display: 'block', marginTop: '4px' }}>
                                            {actionStepData?.Description?.length} / 2500</Typography>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    }
                </Grid >
            }
            <PopperComponent
                id={id}
                open={popperOpen}
                anchorEl={anchorEl}
                setAnchorEl={setAnchorEl}
                publishCourseAPI={deleteActionStep}
                option="Action"
            />
            <SnakBarAlert alertOpen={alertOpen} setAlertOpen={setAlertOpen} alertSeverity={alertSeverity} alert={alert} />
            <BackDropLoading isLoading={isPageLoading} />
        </>
    )
}
