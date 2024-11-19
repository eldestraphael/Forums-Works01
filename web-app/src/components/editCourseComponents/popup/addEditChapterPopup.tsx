'use client'
import { useEffect, useState } from "react";
import React from "react";
import { Button, CircularProgress, Grid, Modal, Paper, TextField, Typography } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import SnakBarAlert from "../../snakbaralert/snakbaralert";
import { StaticMessage } from "@/app/util/StaticMessage";
import { TextareaAutosize } from '@mui/base/TextareaAutosize';
import { useDispatch } from "react-redux";
import { setPublishLessonToggle, setSelectedIndexToggle, setYesBtnLoading } from "@/redux/reducers/editCourse/addLessonSlice";
import PopperComponent from "../PopperComponent";


export default function AddChapterPopup(props: any) {
    const [isAddChapterLoading, setIsAddChapterLoading] = useState(false);
    const [alert, setAlert] = useState("");
    const [alertSeverity, setAlertSeverity] = useState(false);
    const [alertOpen, setAlertOpen] = useState(false);
    const [isUpdateChapterLoading, setIsUpdateChapterLoading] = useState<boolean>(false);
    const [isViewChapterLoading, setIsViewChapterLoading] = useState<boolean>(false);
    const [isEnableDisableChapterStatus, setIsEnabelDisableChapterStatus] = useState<boolean>();
    const [popupOpenChapterName, setPopupOpenChapterName] = useState<string>("");
    const [isFocused, setIsFocused] = useState(false);
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [courseData, setCourseData] = useState<any>({
        Chapter_Name: '',
        Description: '',
        is_active: false
    });
    const [errors, setErrors] = useState<any>({
        Chapter_Name: '',
        Description: ''
    });

    const dispatch = useDispatch();
    const popperOpen = Boolean(anchorEl);
    const id = popperOpen ? 'simple-popper' : undefined;


    const handleClick = (event: any, btnName: string) => {
        console.log("##", btnName)
        setPopupOpenChapterName(btnName);
        btnName == 'DELETE CHAPTER' ? null : setIsEnabelDisableChapterStatus(!isEnableDisableChapterStatus);
        setAnchorEl(anchorEl ? null : event.currentTarget);
    };

    const handleChange = (e: any) => {
        setIsFocused(true);
        const { name, value } = e.target;
        let maxLength = (name == 'Description') ? 2500 : 250;
        let truncatedValue = value.length > maxLength ? value.slice(0, maxLength) : value;
        setCourseData({ ...courseData, [name]: truncatedValue });
        const formattedName = name
        .replace(/_/g, ' ')        // Replace underscores with spaces
        .toLowerCase()             // Convert the entire string to lowercase
        .replace(/^\w/, (char: string) => char.toUpperCase()); 
        let error='';
        if (value.length > maxLength) {
            error = `${formattedName} must be ${maxLength} characters or less`;
        }
        setErrors({ ...errors, [name]: error });    };

    const handleBlur = (e: any) => {
        const { name, value } = e.target;
        let error = '';
        const formattedName = name
            .replace(/_/g, ' ')        // Replace underscores with spaces
            .toLowerCase()             // Convert the entire string to lowercase
            .replace(/^\w/, (char: string) => char.toUpperCase());  // Capitalize the first letter
        error = value.trim() === '' ? `${formattedName} is required` : '';
        setErrors({ ...errors, [name]: error });
    };

    //ADD CHAPTER API
    async function addChapterAPI() {
        setIsAddChapterLoading(true);
        const requestBody: {
            course_uuid: string,
            name: string,
            description?: string
        } = {
            course_uuid: props.course_uuid,
            name: courseData.Chapter_Name,
            description: courseData.Description
        }
        if (!courseData.Chapter_Name.length) {
            AlertManager("Kindly fill all fields", true);
        }
        else {
            try {
                const addChapterAPI = await fetch(`/api/chapter`, {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(requestBody),
                })
                const addChapterAPIResponse = await addChapterAPI.json();
                if (addChapterAPI.status == 200) {
                    AlertManager(addChapterAPIResponse?.message, false);
                    props.setChapterInfo(addChapterAPIResponse?.data?.chapter_info);
                    setCourseData({ Chapter_Name: '', Description: '' });
                    setErrors('');
                    props.handleClose();
                    await props.setToggle(!props.Toggle);
                    dispatch(setSelectedIndexToggle(true));
                } else {
                    AlertManager(addChapterAPIResponse?.message, true);
                }
            }
            catch (error: any) {
                AlertManager(StaticMessage.ErrorMessage, true);
            }
        }
    }

    //VIEW CHAPTER API
    async function viewChapterInfoAPI() {
        setIsViewChapterLoading(true);
        try {
            const viewChapterAPI = await fetch(`/api/chapter/${props.chapterid}`, {
                method: 'GET',
                cache: 'no-store',
                headers: {
                    "Content-Type": "application/json"
                },
            })
            const viewChapterAPIResponse = await viewChapterAPI.json();
            if (viewChapterAPI.status == 200) {
                AlertManager(viewChapterAPIResponse?.message, false);
                setCourseData({
                    ...courseData, Chapter_Name: viewChapterAPIResponse?.data?.chapter_info?.name || '',
                    Description: viewChapterAPIResponse?.data?.chapter_info?.description || '',
                    is_active: viewChapterAPIResponse?.data?.chapter_info?.is_active
                });
                setIsEnabelDisableChapterStatus(viewChapterAPIResponse?.data?.chapter_info?.is_active);
                props.setViewAPICallToggle(false);
            } else {
                AlertManager(viewChapterAPIResponse?.message, true);
            }
        }
        catch (error: any) {
            AlertManager("Something went wrong", true);
        }

    }

    //DELETE CHAPTER API
    async function deleteChapterAPI(chapter_id: any) {
        dispatch(setYesBtnLoading(true));
        try {
            const deleteChapterAPI = await fetch(`/api/chapter?uuid=${chapter_id}`, {
                method: 'DELETE',
                headers: {
                    "Content-Type": "application/json"
                },
            })
            const deleteChapterAPIResponse = await deleteChapterAPI.json();
            if (deleteChapterAPI.status == 200) {
                AlertManager(deleteChapterAPIResponse?.message, false);
                setAnchorEl(null);
                props.handleClose();
                props.setToggle(!props.Toggle);
                dispatch(setSelectedIndexToggle(true));
                setCourseData({ Chapter_Name: '', Description: '' });
                setErrors('');
            } else {
                AlertManager(deleteChapterAPIResponse?.message, true);
            }
        }
        catch (error: any) {
            AlertManager(StaticMessage.ErrorMessage, true);
        }
    }

    //UPDATE CHAPTER API
    async function updateChapterAPI(chapter_id: any) {
        const requestBody: {
            name: string,
            description?: string
        } = {
            name: courseData.Chapter_Name,
            description: courseData.Description
        }

        if (!courseData.Chapter_Name.length) {
            AlertManager("Kindly fill all fields", true);
        }
        else {
            setIsUpdateChapterLoading(true);
            try {
                const updateChapterAPI = await fetch(`/api/chapter?uuid=${chapter_id}`, {
                    method: 'PUT',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(requestBody),
                })
                const updateChapterAPIResponse = await updateChapterAPI.json();
                if (updateChapterAPI.status == 200) {
                    AlertManager(updateChapterAPIResponse?.message, false);
                    setCourseData({ Chapter_Name: '', Description: '' });
                    setErrors('');
                    props.setToggle(!props.Toggle);
                    props.handleClose();
                    setIsUpdateChapterLoading(false);
                } else {
                    AlertManager(updateChapterAPIResponse?.message, true);
                }
            }
            catch (error: any) {
                AlertManager(StaticMessage.ErrorMessage, true);
            }
        }
    }


    //ENABLE OR DISABLE CHAPTER API
    async function enableDisableTheChapterAPI(chapter_id: any) {
        dispatch(setYesBtnLoading(true));
        try {
            const enableDisableChapterAPI = await fetch(`/api/chapter/${chapter_id}`, {
                method: 'PATCH',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ is_active: isEnableDisableChapterStatus }),
            })
            const enableDisableChapterAPIResponse = await enableDisableChapterAPI.json();
            if (enableDisableChapterAPI.status == 200) {
                props.setToggle(!props.Toggle);
                dispatch(setPublishLessonToggle(true));
                setAnchorEl(null);
                props.handleClose();
                AlertManager(enableDisableChapterAPIResponse?.message, false);
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
        setIsAddChapterLoading(false);
        setIsUpdateChapterLoading(false);
        setIsViewChapterLoading(false);
        dispatch(setYesBtnLoading(false));
    }

    const debouncedViewAPICallToggle = useDebounce(props.viewAPICallToggle, 300); // Adjust delay as needed

    useEffect(() => {
        if (props.chapterType === 'Edit Chapter' && debouncedViewAPICallToggle) {
            setIsFocused(false);
            viewChapterInfoAPI();
        }
    }, [debouncedViewAPICallToggle]);

    

    return (
        <>
            <Modal
                open={props.open}
                onClose={props.handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Paper elevation={2}
                    className="xs:min-w-[90vw] sm:min-w-[60vw] md:min-w-[45vw] lg:min-w-[31vw]"
                    sx={{
                        position: 'absolute' as 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        border: "none",
                        boxShadow: 24,
                        borderRadius: "1vh",
                        outline: "none",
                    }}>
                    <Grid container item xs={12} direction={'row'} sx={{ backgroundColor: "#2A2F42", p: 1.5, borderRadius: "1vh 1vh 0 0" }} >
                        <Grid container item xs={10} sm={10} md={11} justifyContent={'space-between'} alignItems={'center'} sx={{ px: 1.5 }}>
                            <Typography sx={{ fontWeight: '600', color: 'white', fontSize: "14px" }}>{props.chapterType}</Typography>
                        </Grid>
                        <Grid container item xs={2} sm={2} md={1} justifyContent={'flex-end'} alignItems={'center'} sx={{ px: 1.5 }}>
                            <CloseIcon fontSize='small' onClick={() => {
                                setCourseData({ Chapter_Name: '', Description: '' });
                                setErrors('');
                                props.handleClose();
                            }}
                                sx={{ cursor: 'pointer', color: "white" }} />
                        </Grid>
                    </Grid>
                    {isViewChapterLoading ? 
                    <Grid container item xs={12}
                        sx={{
                            height: "320px", width: "700px", mt: "2vh", px: 2, justifyContent: "center", alignItems: "center"
                        }}>
                        <CircularProgress size={25} sx={{ color: "#2A2F42" }} />
                    </Grid> :
                        <Grid container item xs={12} sx={{ mt: "2vh", px: 2 }}>
                            {props.data[1].map((input: any, i: number) => {
                                return (
                                    <Grid item key={i} xs={12} sx={{ color: "#777", m: "1vh" }}>
                                        <Typography variant="caption">{input.title}</Typography>
                                        <TextareaAutosize
                                            name={"Chapter_Name"}
                                            maxLength={251}
                                            minRows={1}
                                            maxRows={4}
                                            placeholder={input.placeholder}
                                            value={courseData?.Chapter_Name}
                                            onChange={handleChange}
                                            style={{
                                                width: "100%", border:errors?.Chapter_Name?.length ? "2px solid #cf0c0c": courseData?.Chapter_Name?.length == 251 ? "2px solid #cf0c0c" : "1px solid #bdbdbd", borderRadius: "1vh",
                                                padding: "8px", outline: "none", resize: 'none', maxHeight: "140px", color: "black"
                                            }}
                                            onFocus={(e) => {
                                                e.target.style.border = courseData?.Chapter_Name?.length == 251 ? "2px solid #cf0c0c" : "2px solid #3182ce"
                                            }}
                                            onBlur={(e) => {
                                                handleBlur(e);
                                                courseData?.Chapter_Name?.length  ? null : e.target.style.borderColor = "#cf0c0c"
                                            }}
                                            onMouseLeave={(e) => {
                                                const target = e.target as HTMLTextAreaElement;
                                                target.style.border = courseData?.Chapter_Name?.length == 251 ? "2px solid #cf0c0c" : "1px solid #e5e7eb"
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && e.shiftKey === false) {
                                                    e.preventDefault();
                                                }
                                            }}
                                        />
                                        <Grid container item xs={12} direction="row">
                                            <Grid item xs={8}>
                                                <Typography variant="caption" sx={{ color: "#cf0c0c", ml: "2vh", fontWeight: "500" }}>{courseData?.Chapter_Name?.length == 251 ? "Chapter name must be 250 characters or less" :errors?.Chapter_Name}</Typography>
                                            </Grid>
                                            <Grid item xs={4} justifyContent={"flex-end"} alignItems={"center"}>
                                                <Typography variant="caption" sx={{ textAlign: "right", display: "block", marginTop: '4px' }}>
                                                    {courseData?.Chapter_Name?.length} / 250
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                )
                            })}
                            {props.data[2].map((input: any, i: number) => {
                                return (
                                    <Grid item key={i} xs={12} sx={{ color: "#777", m: "1vh" }}>
                                        <Typography variant="caption">{input.title}  (Optional)</Typography>
                                        <TextareaAutosize
                                            name={input.name}
                                            maxLength={2501}
                                            minRows={8}
                                            maxRows={8}
                                            placeholder={input.placeholder}
                                            value={courseData?.Description}
                                            onChange={handleChange}
                                            style={{
                                                width: "100%", border:errors?.Description?.length ? "2px solid #cf0c0c " : courseData?.Description?.length == 2501 ? "2px solid #cf0c0c" : "1px solid #bdbdbd", borderRadius: "1vh",
                                                padding: "8px", outline: "none", resize: 'none', maxHeight: "140px", color: "black", overflow: 'auto !important'
                                            }}
                                            onFocus={(e) => {
                                                e.target.style.border = "2px solid #3182ce"
                                            }}
                                            onMouseLeave={(e) => {
                                                const target = e.target as HTMLTextAreaElement;
                                                target.style.border = courseData?.Description?.length == 2501 ? "2px solid #cf0c0c" : "1px solid #bdbdbd"
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && e.shiftKey === false) {
                                                    e.preventDefault();
                                                }
                                            }}
                                        />
                                        <Grid container item xs={12} direction="row">
                                            <Grid item xs={8}>
                                                <Typography variant="caption" sx={{ color: "#cf0c0c", ml: "2vh", fontWeight: "500" }}>{courseData?.Description?.length == 2501 ? "Description must be 2500 characters or less" : errors?.Description}</Typography>
                                            </Grid>
                                            <Grid item xs={4} justifyContent={"flex-end"} alignItems={"center"}>
                                                <Typography variant="caption" sx={{ textAlign: "right", display: "block", marginTop: '4px' }}>
                                                    {courseData?.Description?.length} / 2500
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                )
                            })}
                        </Grid>
                    }
                    <Grid container item xs={12} sx={{ mt: "2vh" }} justifyContent={'center'} alignItems={'center'} >
                        {props.data[0].map((btn: any, index: number) => {
                            if (btn.name == 'DELETE CHAPTER' || btn.name == 'MARK AS DRAFT') {
                                return (
                                    <Grid item key={index} xs={8} sm={5} md={4} lg={3} sx={{ mx: "1vh", pb: "2.2vh" }}>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            sx={{ backgroundColor: "#2A2F42", borderRadius: "1vh", color: "#F0F2FF", textTransform: "initial", fontWeight: "700", '&:hover': { backgroundColor: '#2A2F42' } }}
                                            aria-describedby={id} onClick={(e) => handleClick(e, btn.name)}
                                        >
                                            {btn.name == 'DELETE CHAPTER' ? "DELETE CHAPTER" : courseData?.is_active ? "MARK AS DRAFT" : "PUBLISH CHAPTER"}
                                        </Button>
                                    </Grid>
                                )
                            }
                            return (
                                <Grid item key={index} xs={btn.name == 'ADD CHAPTER' ? 9 : 8} sm={btn.name == 'ADD CHAPTER' ? 6 : 5} md={btn.name == 'ADD CHAPTER' ? 5 : 4} lg={btn.name == 'ADD CHAPTER' ? 4 : 3} sx={{ mx: "1vh", pb: "2.2vh" }}>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        disabled={!courseData.Chapter_Name || !isFocused}
                                        sx={{ backgroundColor: !courseData.Chapter_Name ? "white" : "#2A2F42", borderRadius: "1vh", color: "#F0F2FF", textTransform: "initial", fontWeight: "700", '&:hover': { backgroundColor: '#2A2F42' } }}
                                        onClick={() => { btn.name == 'ADD CHAPTER' ? addChapterAPI() : btn.name == 'UPDATE CHAPTER' ? updateChapterAPI(props.chapterid) : enableDisableTheChapterAPI(props.chapterid) }}
                                    >
                                        {isAddChapterLoading && btn.name == 'ADD CHAPTER' || isUpdateChapterLoading && btn.name == 'UPDATE CHAPTER' ? <> &nbsp; <CircularProgress sx={{ color: "white" }} size={20} />
                                        </> : btn.name}
                                    </Button>
                                </Grid>)
                        })}
                        {popperOpen ?
                            <PopperComponent
                                id={id}
                                open={popperOpen}
                                anchorEl={anchorEl}
                                setAnchorEl={setAnchorEl}
                                publishCourseAPI={() => { popupOpenChapterName == 'DELETE CHAPTER' ? deleteChapterAPI(props.chapterid) : enableDisableTheChapterAPI(props.chapterid) }}
                                option={popupOpenChapterName == 'DELETE CHAPTER' ? "Chapter" : courseData?.is_active ? "MARK AS DRAFT" : "PUBLISH CHAPTER"}
                            />
                            : null}
                    </Grid>
                </Paper>
            </Modal >
            <SnakBarAlert alertOpen={alertOpen} setAlertOpen={setAlertOpen} alertSeverity={alertSeverity} alert={alert} />
        </>
    )
}


const useDebounce = (value: any, delay: any) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};