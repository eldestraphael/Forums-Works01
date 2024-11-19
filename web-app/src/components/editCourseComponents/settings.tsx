'use client'
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { Button, Grid, TextField, Typography, CircularProgress } from "@mui/material";
import SnakBarAlert from "@/components/snakbaralert/snakbaralert";
import BackDropLoading from '@/components/loading/backDropLoading';
import { StaticMessage } from "@/app/util/StaticMessage";
import { TextareaAutosize } from '@mui/base/TextareaAutosize';
import PopperComponent from './PopperComponent';
import { setYesBtnLoading } from '@/redux/reducers/editCourse/addLessonSlice';


export default function EditCourseComponent({ setBreadCrumToggle, setToggle, Toggle, course_uuid, activeInactiveTheCourse }: any) {
    const [alertOpen, setAlertOpen] = useState(false);
    const [alert, setAlert] = useState("");
    const [alertSeverity, setAlertSeverity] = useState(false);
    const [isLoading, setisLoading] = useState(false);
    const [isUpdateLoading, setIsUpdateLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [activeDeactiveUpdate, setActiveDeactiveUpdate] = React.useState<boolean>(activeInactiveTheCourse);
    const [courseData, setCourseData] = useState({
        Course_Name: '',
        Description: ''
    });
    const [errors, setErrors] = useState<any>({
        Course_Name: '',
        Description: ''
    });

    const { push } = useRouter();
    const dispatch = useDispatch();

    const popperOpen = Boolean(anchorEl);
    const id = popperOpen ? 'simple-popper' : undefined;

    const handleClick = (event: any) => {
        setActiveDeactiveUpdate(!activeDeactiveUpdate);
        setAnchorEl(anchorEl ? null : event.currentTarget);
    };
    const courseInfo = useSelector((state: any) => state.editCourse.courseDetails);
    const userRoleAction = useSelector((state: any) => state.editCourse.editCourseAction);

    const handleChange = (e: any) => {
        e.preventDefault();
        setIsFocused(true);
        const { name, value } = e.target;
        let error = '';
        let maxLength = (name == 'Description') ? 2500 : 250;
        let truncatedValue = value.length > maxLength ? value.slice(0, maxLength) : value;
        setCourseData({ ...courseData, [name]: truncatedValue });
        if (value.length > maxLength) {
            const formattedName = name
                .replace(/_/g, ' ')        // Replace underscores with spaces
                .toLowerCase()             // Convert the entire string to lowercase
                .replace(/^\w/, (char: string) => char.toUpperCase());  // Capitalize the first letter
            error = `${formattedName} must be ${maxLength} characters or less`;
        }
        setErrors({ ...errors, [name]: error });
    };

    const handleBlur = (e: any) => {
        const { name, value } = e.target;
        if (name == 'Description') {
            courseData.Description.length ? null : e.target.style.borderColor = "#cf0c0c";
        }
        let error = '';
        const formattedName = name
            .replace(/_/g, ' ')        // Replace underscores with spaces
            .toLowerCase()             // Convert the entire string to lowercase
            .replace(/^\w/, (char: string) => char.toUpperCase());  // Capitalize the first letter
        error = value.trim() === '' ? `${formattedName} is required` : '';
        setErrors({ ...errors, [name]: error });
    };


    async function handleUpdateCourse() {
        setIsUpdateLoading(true);
        const requestBody: {
            name: string,
            description?: string,
        } = {
            name: courseData.Course_Name,
            description: courseData.Description,
        }

        if (!courseData.Course_Name.length) {
            AlertManager("Kindly fill course name", true);
        }
        else {
            try {
                const updateCourseAPI = await fetch(`/api/course?uuid=${course_uuid}`, {
                    method: 'PUT',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(requestBody)
                })
                const updateCourseAPIResponse = await updateCourseAPI.json();
                if (updateCourseAPI.status == 200) {
                    AlertManager(updateCourseAPIResponse?.message, false);
                    setCourseData({ Course_Name: '', Description: '' });
                    setErrors('');
                    setIsUpdateLoading(false);
                    push(`/courses/${course_uuid}?tab=curriculum`);
                    setBreadCrumToggle('Curriculum');
                    setToggle(!Toggle)
                } else {
                    AlertManager(updateCourseAPIResponse?.message, true);
                }
            }
            catch (error: any) {
                AlertManager(StaticMessage.ErrorMessage, true);
            }
        }
    }

    async function handleEnableOrDisableCourse() {
        dispatch(setYesBtnLoading(true));
        try {
            const enableDisableCourseAPI = await fetch(`/api/course?uuid=${course_uuid}`, {
                method: 'PATCH',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(
                    { is_active: activeDeactiveUpdate }
                )
            })
            const enableDisableCourseAPIResponse = await enableDisableCourseAPI.json();
            if (enableDisableCourseAPI.status == 200) {
                AlertManager(enableDisableCourseAPIResponse?.message, false);
                setAnchorEl(null);
                push('/courses');
            } else {
                AlertManager(enableDisableCourseAPIResponse?.message, true);
            }
        }
        catch (error: any) {
            AlertManager(StaticMessage.ErrorMessage, true);
        }
    }

    function AlertManager(message: string, severity: boolean) {
        setAlert(message)
        setAlertSeverity(severity)
        setAlertOpen(true)
        setisLoading(false);
        setIsUpdateLoading(false);
        dispatch(setYesBtnLoading(false));
    }

    useEffect(() => {
        if (courseInfo) {
            setCourseData({ Course_Name: courseInfo.CourseName, Description: courseInfo.Description })
        }
    }, [courseInfo]);

    return (
        <>
            {userRoleAction[1]?.read &&
                <Grid container item xs={12} justifyContent={'flex-start'} alignItems={'center'} sx={{ pl: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: '600', }}>Edit Course</Typography>
                    <Grid container item xs={11.5} alignItems={'center'} justifyContent={'center'} sx={{ backgroundColor: 'white', borderRadius: '2vh', p: 2 }} >
                        <Grid container item xs={12} justifyContent={'center'} alignItems={'flex-start'} sx={{ pt: 2 }}>
                            <Grid container item xs={11.7} sm={11} md={8} lg={7} justifyContent={'center'} sx={{ border: "1px solid #dedede", borderRadius: "2vh", p: 2, marginBottom: "3vh" }}>
                                <Grid item xs={12} sx={{ color: "#777", m: "1vh" }}>
                                    <Typography variant="caption">COURSE NAME</Typography>
                                    <TextareaAutosize
                                        name='Course_Name'
                                        maxLength={251}
                                        maxRows={4}
                                        minRows={1}
                                        placeholder="Enter a course name"
                                        value={courseData.Course_Name}
                                        onChange={handleChange}
                                        style={{
                                            width: "100%", border: errors?.Course_Name?.length ? "2px solid #cf0c0c" : courseData?.Course_Name?.length == 251 ? "2px solid #cf0c0c" : "1px solid #bdbdbd", borderRadius: "1vh",
                                            padding: "8px", outline: "none", resize: 'none', maxHeight: "198px", color: "black",
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.border = courseData?.Course_Name?.length == 251 ? "2px solid #cf0c0c" : "2px solid #3182ce"
                                        }}
                                        onBlur={(e) => {
                                            handleBlur(e);
                                            courseData?.Course_Name?.length ? null : e.target.style.borderColor = "#cf0c0c"
                                        }}
                                        onMouseLeave={(e) => {
                                            const target = e.target as HTMLTextAreaElement;
                                            target.style.border = courseData?.Course_Name?.length == 251 ? "2px solid #cf0c0c" : "1px solid #bdbdbd"
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && e.shiftKey === false) {
                                                e.preventDefault();
                                            }
                                        }}
                                    />
                                    <Grid container item xs={12} direction="row">
                                        <Grid item sm={10} md={8}>
                                            <Typography variant="caption" sx={{ color: "#cf0c0c", ml: "2vh", fontWeight: "500" }}>{courseData?.Course_Name?.length == 251 ? "Course name must be 250 characters or less" : errors.Course_Name}</Typography>
                                        </Grid>
                                        <Grid item sm={2} md={4} justifyContent={"flex-end"} alignItems={"center"}>
                                            <Typography variant="caption" sx={{ textAlign: "right", display: "block", marginTop: '4px' }}>
                                                {courseData?.Course_Name?.length} / 250
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Grid>
                                <Grid item xs={12} sx={{ color: "#777", m: "1vh" }}>
                                    <Typography variant="caption">DESCRIPTION (Optional)</Typography>
                                    <TextareaAutosize
                                        name='Description'
                                        maxLength={2501}
                                        minRows={8}
                                        maxRows={8}
                                        placeholder="Enter description about course"
                                        value={courseData.Description}
                                        onChange={handleChange}
                                        style={{
                                            width: "100%", border: errors?.Description?.length ? "2px solid #cf0c0c" : courseData?.Description?.length == 2501 ? "2px solid #cf0c0c" : "1px solid #bdbdbd", borderRadius: "1vh",
                                            padding: "8px", outline: "none", resize: 'none', maxHeight: "140px", color: "black", overflow: 'auto'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.border = courseData?.Description?.length == 2501 ? "2px solid #cf0c0c" : "2px solid #3182ce"
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
                                        <Grid item sm={10} md={8}>
                                            <Typography variant="caption" sx={{ color: "#cf0c0c", ml: "2vh", fontWeight: "500" }}>{courseData?.Description?.length == 2501 ? "Description must be 2500 characters or less" : errors.Description}</Typography>
                                        </Grid>
                                        <Grid item sm={2} md={4} justifyContent={"flex-end"} alignItems={"center"}>
                                            <Typography variant="caption" sx={{ textAlign: "right", display: "block", marginTop: '4px' }}>
                                                {courseData?.Description?.length} /2500
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Grid>
                                <Grid container item xs={12} justifyContent={'center'} alignItems={'center'} direction={'row'} sx={{ backgroundColor: 'transparent' }}>
                                    <Grid container item xs={12} justifyContent={'center'} sx={{ ml: 0.9 }}>
                                        <Grid item xs={9} sm={4} md={5} lg={4} sx={{ mx: "1vh", my: "1.5vh" }}>
                                            {userRoleAction[0]?.update &&
                                                <Button
                                                    fullWidth
                                                    variant="contained"
                                                    disabled={!courseData.Course_Name || !isFocused}
                                                    sx={{ backgroundColor: !courseData.Course_Name ? "white" : "#2A2F42", borderRadius: "1vh", border: "3px solid balck", color: "#F0F2FF", textTransform: "initial", fontWeight: "700", '&:hover': { backgroundColor: '#2A2F42' } }}
                                                    onClick={handleUpdateCourse}
                                                >
                                                    {isUpdateLoading ? <> &nbsp; <CircularProgress sx={{ color: "white" }} size={20} />
                                                    </> : "UPDATE COURSE"}
                                                </Button>
                                            }
                                        </Grid>
                                        <Grid item xs={9} sm={4} md={5} lg={4} sx={{ mx: "1vh", my: "1.5vh" }}>
                                            {userRoleAction[0]?.update &&
                                                <Button
                                                    fullWidth
                                                    variant="outlined"
                                                    sx={{ backgroundColor: "#2A2F42", borderRadius: "1vh", color: "#F0F2FF", textTransform: "initial", fontWeight: "700", '&:hover': { backgroundColor: '#2A2F42' } }}
                                                    aria-describedby={id} onClick={handleClick}
                                                >
                                                    {activeInactiveTheCourse ? "MARK AS DRAFT" : "PUBLISH COURSE"}
                                                </Button>
                                            }
                                            <PopperComponent
                                                id={id}
                                                open={popperOpen}
                                                anchorEl={anchorEl}
                                                setAnchorEl={setAnchorEl}
                                                publishCourseAPI={handleEnableOrDisableCourse}
                                                option={activeInactiveTheCourse ? "Disable Course" : "Enable Course"}
                                            />
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            }
            <SnakBarAlert alertOpen={alertOpen} setAlertOpen={setAlertOpen} alertSeverity={alertSeverity} alert={alert} />
            <BackDropLoading isLoading={isLoading} />
        </>
    )
}

