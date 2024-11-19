'use client'
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Autocomplete, Button, Checkbox, CircularProgress, Divider, Grid, InputAdornment, TextField, Tooltip, Typography, } from "@mui/material";
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import SnakBarAlert from "@/components/snakbaralert/snakbaralert";
import { StaticMessage } from "@/app/util/StaticMessage";
import VideoPlayers from "@/components/video_player/videoComponent";
import BackDropLoading from "@/components/loading/backDropLoading";
import PopperComponent from "../PopperComponent";
import { TextareaAutosize as BaseTextareaAutosize } from '@mui/base/TextareaAutosize';
import DeleteIcon from '@mui/icons-material/Delete';


export default function VideoComponent({
    setAddLessonToggle,
    enableDisableTheLessonAPI,
    draftInfo,
    assetInfo,
    updateLesson,
    deleteLesson,
    BtnLoader,
    lessonData,
    handleFileUpload,
}: any) {

    const [lessonFile, setLessonFile] = useState({
        Lesson: '',
    });
    const [errors, setErrors] = useState({
        Lesson: '',
        file: ''
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState('');
    const [discardChangesLoader, setDiscardChangeLoader] = useState<boolean>(false);
    const [alert, setAlert] = useState("");
    const [alertSeverity, setAlertSeverity] = useState(false);
    const [alertOpen, setAlertOpen] = useState(false);
    const [addEditDisplaytoggle, setAddEditDisplaytoggle] = useState<boolean>(false);
    const [videoOptions, setVideoOptions] = useState<any>([]);
    const [videoOptionSelectValue, setVideoOptionSelectValue] = useState<any>(null);
    const [fileChangeToggle, setfileChanetoggle] = useState<string | null>(assetInfo?.uuid);
    const [videoURL, setVideoURL] = useState('');
    const [videoMuxSrc, setVideoMuxSrc] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [isLibraryVideoLoading, setIsLibraryVideoLoading] = useState(false);
    const [durationForLMSVideoAndAudio, setDurationForLMSVideoAndAudio] = useState<number | undefined>(0);


    const saveLoader: boolean = useSelector((state: any) => state.editCourse.saveBtnLoader);
    const chapter_uuid: string = useSelector((state: any) => state.editCourse.chapterId);
    const discard: boolean = useSelector((state: any) => state.editCourse.discardBtnDisable);
    const userRoleAction = useSelector((state: any) => state.editCourse.editCourseAction);
    const isPageLoading = useSelector((state: any) => state.editCourse.isPageLoading);

    const requestBody: {
        name: string;
        chapter_uuid?: string;
        asset_type?: string;
        asset_uuid?: string,
        is_preview: boolean;
        is_prerequisite: boolean;
        is_discussion_enabled: boolean;
        is_downloadable: boolean;
        asset_content_size?: number
    } = {
        name: lessonFile.Lesson,
        is_preview: false,
        is_prerequisite: false,
        is_discussion_enabled: false,
        is_downloadable: false,
        asset_content_size: 0
    };

    const popperOpen = Boolean(anchorEl);
    const id = popperOpen ? 'simple-popper' : undefined;

    const handleClick = (event: any) => {
        setAnchorEl(anchorEl ? null : event.currentTarget);
    };

    const handleChange = (e: any) => {
        setIsFocused(true);
        const { name, value } = e.target;
        let maxLength = 250;
        let truncatedValue = value.length > maxLength ? value.slice(0, maxLength) : value;
        setLessonFile({ ...lessonFile, [name]: truncatedValue });
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
        if (name == 'file') {
            error = value.trim() === '' ? `Upload a video file required` : '';
        }
        else {
            error = value.trim() === '' ? `${formattedName} is required` : '';
            setErrors({ ...errors, [name]: error });
        }
    };

    //HANDLE VIDEO FILE CHANGE
    const handleFileChange = (event: any) => {
        const file = event.target.files[0];
        const fileExtension = file ? file.name.split('.').pop().toLowerCase() : '';
        const allowedExtensions = ['mp4', 'mov', 'avi', 'mkv', 'wmv', 'flv', 'webm', 'mpeg', 'mpg', '3gp', 'ogv', 'm4v', 'asf', 'vob', 'swf', 'f4v'];
        if (file && !allowedExtensions.includes(fileExtension)) {
            AlertManager('Only video files are allowed', true);
            setFileName('');
        }
        else if (file && allowedExtensions.includes(fileExtension)) {
            if (videoOptionSelectValue) {
                setVideoOptionSelectValue(null);
                setVideoMuxSrc('');
            }
            setSelectedFile(file);
            setFileName(event?.target?.files[0]?.name);
            setVideoURL(URL.createObjectURL(file));
        }
        event.target.value = null;
    };

    //GET ALL VIDEOS API
    async function getAllVideoLesson() {
        setIsLibraryVideoLoading(true);
        try {
            const getAllVideoAPI = await fetch(`/api/video`, {
                method: 'GET',
                cache: 'no-store',
                headers: {
                    "Content-Type": "application/json"
                },
            })
            const getAllVideoAPIResponse = await getAllVideoAPI.json();
            if (getAllVideoAPI.status == 200) {
                const updatedItems = getAllVideoAPIResponse?.data.map((item: any) => {
                    return { label: item.name, uuid: item.uuid, url: item.url };
                });
                setVideoOptions(updatedItems);
                AlertManager(getAllVideoAPIResponse?.message, false);
            } else {
                AlertManager(StaticMessage.ErrorMessage, true);
            }
        }
        catch (error) {
            AlertManager(StaticMessage.ErrorMessage, true);
        }
    }

    //SAVE BUTTON CLICK FUNCTION FOR API CALL
    function handleVideoFileCreateUpdateAndDelete() {
        requestBody.asset_content_size = durationForLMSVideoAndAudio
        if (assetInfo) {
            if (fileChangeToggle == null) {
                requestBody.asset_type = "video";
                if ((selectedFile || Object.keys(videoOptionSelectValue ?? '').length) && requestBody) {
                    if (videoOptionSelectValue) {
                        requestBody.asset_uuid = videoOptionSelectValue.uuid;
                        updateLesson(selectedFile, requestBody);
                    } else {
                        updateLesson(selectedFile, requestBody);
                        setSelectedFile(null);
                    }
                }
                else {
                    AlertManager("Kindly fill all fields.....", true);
                }
            }
            else {
                updateLesson(selectedFile, requestBody);
            }
        }
        else {
            if ((selectedFile || Object?.keys(videoOptionSelectValue ?? '').length) && requestBody) {
                requestBody.asset_type = "video";
                requestBody.chapter_uuid = chapter_uuid;
                if (videoOptionSelectValue) {
                    requestBody.asset_uuid = videoOptionSelectValue.uuid;
                    handleFileUpload(selectedFile, requestBody);
                }
                else {
                    requestBody.chapter_uuid = chapter_uuid;
                    handleFileUpload(selectedFile, requestBody);
                }
            }
            else {
                AlertManager("Kindly fill all fields", true);
            }
        }
    }

    const Videosetup = useCallback(() => {
        return (
            <VideoPlayers
                src={videoMuxSrc?.length ? videoMuxSrc : videoURL}
                type={videoMuxSrc?.length ? 'video/mux' : 'video/mp4'}
                showCustomText={false}
                setDurationForLMSVideoAndAudio={setDurationForLMSVideoAndAudio} />
        )
    }, [videoMuxSrc, videoURL]);

    const handleEnableDisableCheck = (e: any) => {
        enableDisableTheLessonAPI(!e.target.checked);
    }

    function AlertManager(message: string, severity: boolean) {
        setAlert(message);
        setAlertSeverity(severity);
        setAlertOpen(true);
        setIsLibraryVideoLoading(false);
    }

    //AFETR API CALL CLEAR INPUT FIELD
    useEffect(() => {
        setLessonFile({ ...lessonFile, Lesson: "" });
        setFileName('');
    }, [BtnLoader]);

    //VIEW API RESPONSE STORE IN STATE
    useEffect(() => {
        if (lessonData) {
            setLessonFile({ ...lessonFile, Lesson: lessonData });
        }
    }, [lessonData])

    //CALL API FOR EDIT LESSON  
    useEffect(() => {
        setAddEditDisplaytoggle(false);
        setVideoURL(assetInfo?.url);
    }, [assetInfo])


    return (
        <>
            {userRoleAction[1].read &&
                <Grid container item xs={11} direction='column' justifyContent={'center'} alignItems={'center'} >
                    <Grid container item xs={12}>
                        <Grid container item xs={12} justifyContent={"space-between"} alignItems={"center"} sx={{ backgroundColor: "transperant" }}>
                            <Grid item xs={10} sm={10} md={10} lg={10} xl={10.9} justifyContent={"flex-start"} >
                                <Button variant='contained'
                                    sx={{ backgroundColor: "#2A2F42", cursor: "auto", borderRadius: "5vh", border: "3px solid balck", m: 0, p: 0, color: "#F0F2FF", textTransform: "initial", fontWeight: "700", '&:hover': { backgroundColor: '#2A2F42' } }}
                                >
                                    Video</Button>
                            </Grid>
                            <Grid item xs={1.8} sm={1.8} md={1.6} lg={1.2} xl={1} justifyContent={"flex-end"} alignItems={'center'} sx={{ backgroundColor: "transperant", mb: "1.5vh" }} >
                                {assetInfo ?
                                    userRoleAction[0].update &&
                                    <Tooltip title={!draftInfo ? "Publish this lesson" : " Make this lesson draft"} placement="top">
                                        <div style={{ display: "inline-flex", alignItems: 'center', justifyContent: "flex-end" }} >
                                            <Typography >Draft</Typography>
                                            <Checkbox
                                                checked={!draftInfo}
                                                sx={{ p: 0, m: 0 }}
                                                onClick={handleEnableDisableCheck} />
                                        </div>
                                    </Tooltip>

                                    : null}
                            </Grid>
                        </Grid>
                        <Grid container item xs={12} direction='row' sx={{ mb: "1vh" }}>
                            <Grid container item xs={assetInfo ? 4 : 7} sm={assetInfo ? 4 : 6} md={assetInfo ? 4.5 : 6.5} lg={assetInfo ? 6.5 : 7.5} xl={assetInfo ? 7 : 8} alignItems={'center'} >
                                <Typography variant="body1" fontWeight={"600"}>{assetInfo? "Edit Lesson" : "New Lesson"}</Typography>
                            </Grid>
                            <Grid container item xs={assetInfo ? 8 : 5} sm={assetInfo ? 8 : 6} md={assetInfo ? 7.5 : 5.5} lg={assetInfo ? 5.5 : 4.5} xl={assetInfo ? 5 : 4} justifyContent={"space-between"} alignItems={'center'}  >
                                <Grid container item xs={12} justifyContent={"space-between"} alignItems={'center'} sx={{ display: 'flex', flexDirection: "row" }}>
                                    {assetInfo ?
                                        <Grid item xs={1} justifyContent={"center"} alignItems={'center'} >
                                            {userRoleAction[0].update &&
                                                <Tooltip title="Delete this lesson" placement="top">
                                                    <DeleteIcon aria-describedby={id} onClick={handleClick} sx={{ fontSize: "30px", color: "#cf0c0c", cursor: "pointer" }} />
                                                </Tooltip>
                                            }
                                        </Grid>
                                        : null
                                    }
                                    <Grid item xs={assetInfo ? 4 : 7} sm={assetInfo ? 6.9 : 8} md={assetInfo ? 6.5 : 8} lg={assetInfo ? 6.5 : 8} xl={assetInfo ? 6 : 7} justifyContent={"flex-end"} alignItems={'center'}>
                                        <Button variant='outlined' fullWidth
                                            disabled={discard}
                                            sx={{ backgroundColor: "white", height: "4vh", borderRadius: "1vh", border: "1px solid #2A2F42", px: 1, py: 0.5, m: 0, color: "black", textTransform: "initial", fontWeight: "600", }}
                                            onClick={() => { setDiscardChangeLoader(true); setAddLessonToggle(false); }}>
                                            {discardChangesLoader ? <CircularProgress sx={{ color: "white" }} size={20} /> : " Discard Changes"}
                                        </Button>
                                    </Grid>
                                    <Grid item xs={assetInfo ? 3 : 4} sm={assetInfo ? 2.5 : 3} md={assetInfo ? 3.5 : 3} xl={assetInfo ? 4 : 4} justifyContent={"flex-end"} alignItems={'center'} >
                                        {userRoleAction[0].update &&
                                            <Button variant='contained' fullWidth
                                                disabled={assetInfo ? !lessonFile.Lesson || !isFocused : !lessonFile.Lesson.length || !selectedFile && !Object?.keys(videoOptionSelectValue ?? {}).length}
                                                sx={{ backgroundColor: "#2A2F42", height: "4vh", borderRadius: "1vh", border: "3px solid balck", m: 0, p: 0.5, color: "#F0F2FF", textTransform: "initial", fontWeight: "600", '&:hover': { backgroundColor: '#2A2F42' } }}
                                                onClick={() => { handleVideoFileCreateUpdateAndDelete() }}>
                                                {saveLoader ? <CircularProgress sx={{ color: "white" }} size={20} /> : "SAVE"}
                                            </Button>
                                        }
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                        {/* TOP SECTION FOR ADD VIDEO LESSON */}
                        <Grid container item xs={12} justifyContent={"center"} alignItems={"center"} sx={{ backgroundColor: "white" }}>
                            <Grid container item xs={11} justifyContent={"center"} alignItems={"center"} sx={{ pt: 2, pb: 3 }}>
                                <Grid item xs={12} sx={{ color: "#777", m: "1vh" }}>
                                    <Typography variant="caption">LESSON</Typography>
                                    <BaseTextareaAutosize
                                        name='Lesson'
                                        maxLength={251}
                                        minRows={1}
                                        placeholder="Enter a lesson"
                                        value={lessonFile?.Lesson}
                                        onChange={handleChange}
                                        style={{
                                            width: "100%", border: errors?.Lesson?.length ? "2px solid #cf0c0c" : lessonFile?.Lesson?.length == 251 ? "2px solid #cf0c0c" : "1px solid #bdbdbd", borderRadius: "1vh",
                                            padding: "8px", outline: "none", resize: 'none', maxHeight: "198px", color: "black"
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.border = (lessonFile?.Lesson).length == 251 ? "2px solid #cf0c0c" : "2px solid #3182ce"
                                        }}
                                        onBlur={(e) => {
                                            handleBlur(e);
                                            (lessonFile?.Lesson).length ? null : e.target.style.borderColor = "#cf0c0c"
                                        }}
                                        onMouseLeave={(e) => {
                                            const target = e.target as HTMLTextAreaElement;
                                            target.style.border = (lessonFile?.Lesson).length == 251 ? "2px solid #cf0c0c" : "1px solid #bdbdbd"
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && e.shiftKey === false) {
                                                e.preventDefault();
                                            }
                                        }}
                                    />
                                    <Typography variant="caption" sx={{ color: "#cf0c0c", ml: "2vh", fontWeight: "500" }}>{lessonFile?.Lesson?.length == 251 ? "Lesson must be 250 characters or less" : errors?.Lesson}</Typography>
                                    <Typography variant="caption" sx={{ textAlign: 'right', display: 'block', marginTop: '4px' }}>
                                        {lessonFile?.Lesson?.length} / 250
                                    </Typography>
                                </Grid>
                                {assetInfo && !addEditDisplaytoggle ?
                                    <Grid container direction='row' item xs={12} sx={{ backgroundColor: "#F6F5FB", m: "1vh", borderRadius: "1vh", p: 2 }}>
                                        <Grid container item xs={10.8}>
                                            <Typography variant="body2" sx={{ fontWeight: "600" }}>{assetInfo.name}</Typography>
                                        </Grid>
                                        <Grid container item xs={1} justifyContent={'flex-end'} alignItems={'center'}>
                                            {userRoleAction[0].update &&
                                                <CloseOutlinedIcon fontSize="small" sx={{ cursor: "pointer" }}
                                                    onClick={() => { setAddEditDisplaytoggle(true); setfileChanetoggle(null); setIsFocused(true); setVideoURL(''); setVideoMuxSrc(''); }} />
                                            }
                                        </Grid>
                                    </Grid> :
                                    <>
                                        <Grid item xs={12} sx={{ color: "#777", m: "1vh" }}>
                                            <Typography variant="caption">VIDEOS FROM YOUR LIBRARY</Typography>
                                            <Autocomplete
                                                fullWidth
                                                size="small"
                                                disablePortal
                                                id="combo-box-demo"
                                                options={videoOptions}
                                                loading={isLibraryVideoLoading}
                                                value={videoOptionSelectValue}
                                                renderInput={(params) => <TextField {...params} placeholder="Choose a video" sx={{ "& .MuiOutlinedInput-root": { borderRadius: "1vh" } }} />}
                                                isOptionEqualToValue={(option, value) => option === value || option.label === value.label}
                                                onChange={(event, value) => {
                                                    if (selectedFile) {
                                                        setSelectedFile(null);
                                                        setFileName('');
                                                        setVideoURL('');
                                                    }
                                                    setVideoOptionSelectValue(value);
                                                    var url = value?.url;
                                                    var videoSrc = url?.substring(url?.lastIndexOf('/') + 1, url?.lastIndexOf('.'));
                                                    setVideoMuxSrc(videoSrc);
                                                }}
                                                onOpen={getAllVideoLesson}
                                            />
                                        </Grid>
                                        <Grid item xs={10} sx={{ color: "#777", }}>
                                            <Divider><Typography variant="h6">or</Typography></Divider>
                                        </Grid>
                                        <Grid item xs={12} sx={{ color: "#777", m: "1vh", mt: 0 }}>
                                            <Typography variant="caption">UPLOAD A VIDEO FILE</Typography>
                                            <Grid container item xs={12} justifyContent="flex-start" >
                                                <TextField
                                                    fullWidth
                                                    name="file"
                                                    variant="outlined"
                                                    placeholder="Choose a upload video file"
                                                    size="small"
                                                    autoComplete="off"
                                                    value={fileName}
                                                    error={fileName ? false : !!errors.file}
                                                    helperText={fileName ? null : errors.file}
                                                    onBlur={handleBlur}
                                                    InputProps={{
                                                        sx: { borderRadius: "1vh" },
                                                        endAdornment: (
                                                            <InputAdornment position="end">
                                                                <label htmlFor="upload-file">
                                                                    <Button
                                                                        variant="contained"
                                                                        component="span"
                                                                        disabled={discard ? true : false}
                                                                        size="small"
                                                                        sx={{
                                                                            backgroundColor: "#2A2F42",
                                                                            height: "4vh",
                                                                            borderRadius: "2vh",
                                                                            color: "#F0F2FF",
                                                                            textTransform: "initial",
                                                                            fontWeight: "600",
                                                                            '&:hover': { backgroundColor: '#2A2F42' },
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                        }}
                                                                    >
                                                                        Choose a file
                                                                        <input
                                                                            id="upload-file"
                                                                            type="file"
                                                                            accept=".mp4, .mov, .avi, .mkv, .wmv, .flv, .webm, .mpeg, .mpg, .3gp, .ogv, .m4v, .asf, .vob, .swf, .f4v"
                                                                            style={{ display: 'none' }}
                                                                            disabled={discard ? true : false}
                                                                            onChange={(e) => handleFileChange(e)}
                                                                        />
                                                                    </Button>
                                                                </label>
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                />
                                            </Grid>
                                            <Typography variant="caption" sx={{ lineHeight: '3' }}>Max size 2GB.</Typography>
                                            {/* //FUTURE REFERENCE
                                        <Typography variant="caption" sx={{ lineHeight: '3' }}>Max size 2GB. We suggest compressing your video using <Link color="inherit">HandBrake.</Link></Typography>
                                        <Grid container item xs={12} lg={9.4}>
                                            <Typography variant="caption" sx={{ lineHeight: '1', m: 0, p: 0 }}>It&apos;s all about the details.Pick your thumbnail image, add closed captions, update settings, and track your video performance analytics in the video library.</Typography>
                                        </Grid> */}
                                        </Grid>
                                    </>
                                }

                                {(videoURL?.length || videoMuxSrc?.length || assetInfo) ?
                                    <> {videoURL?.length || videoMuxSrc?.length ? <> <Videosetup /> </> : null}
                                    </> : null}
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            }
            <PopperComponent
                id={id}
                open={popperOpen}
                anchorEl={anchorEl}
                setAnchorEl={setAnchorEl}
                publishCourseAPI={deleteLesson}
                option="Lesson"
            />
            <SnakBarAlert alertOpen={alertOpen} setAlertOpen={setAlertOpen} alertSeverity={alertSeverity} alert={alert} />
            <BackDropLoading isLoading={isPageLoading} />
        </>
    )
}