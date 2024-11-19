'use client'
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'
import { Button, Grid, TextField, Typography, CircularProgress } from "@mui/material";
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import SnakBarAlert from "@/components/snakbaralert/snakbaralert";
import BackDropLoading from '@/components/loading/backDropLoading';
import { StaticMessage } from "@/app/util/StaticMessage";
import { TextareaAutosize } from '@mui/base/TextareaAutosize';


export default function AddCourse(props: any) {

    const [alertOpen, setAlertOpen] = useState(false);
    const [alert, setAlert] = useState("");
    const [alertSeverity, setAlertSeverity] = useState(false);
    const [isLoading, setisLoading] = useState(false);
    const [isCreateLoading, setIsCreateLoading] = useState(false);
    const [courseData, setCourseData] = useState({
        Course_Name: '',
        Description: ''
    });
    const [errors, setErrors] = useState({
        Course_Name: '',
        Description: ''
    });

    const { push } = useRouter();

    const handleChange = (e: any) => {
        e.preventDefault();
        const { name, value } = e.target;
        let maxLength = (name == 'Description') ? 2500 : 250;
        let truncatedValue = value.length > maxLength ? value.slice(0, maxLength) : value
        setCourseData({ ...courseData, [name]: truncatedValue });
        const formattedName = name
            .replace(/_/g, ' ')        // Replace underscores with spaces
            .toLowerCase()             // Convert the entire string to lowercase
            .replace(/^\w/, (char: string) => char.toUpperCase());  // Capitalize the first letter
        let error = '';
        if (value.length > maxLength) {
            error = `${formattedName} must be ${maxLength} characters or less`;
        }
        setErrors({ ...errors, [name]: error });
    };

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


    async function handleCreateCourse() {
        setIsCreateLoading(true);
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
                const createCourseAPI = await fetch(`/api/course`, {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(requestBody)
                })
                const createCourseAPIResponse = await createCourseAPI.json();
                if (createCourseAPI.status == 200) {
                    AlertManager(createCourseAPIResponse?.message, false);
                    push(`/courses/${createCourseAPIResponse?.data?.course_info?.uuid}?tab=curriculum`)
                    setIsCreateLoading(false);
                } else {
                    AlertManager(createCourseAPIResponse?.message, true);
                }
            }
            catch (error: any) {
                AlertManager(StaticMessage.ErrorMessage, true);
            }
        }
    }


    function AlertManager(message: string, severity: boolean) {
        setAlert(message)
        setAlertSeverity(severity)
        setAlertOpen(true)
        setisLoading(false);
        setIsCreateLoading(false);
    }

    return (
        <div className="ml:0 lg:ml-[17.35vw]" style={{ backgroundColor: "#F6F5FB", paddingBottom: '5vh', minHeight: '100vh' }}>
            <Grid container item xs={12} justifyContent={'flex-start'} alignItems={'center'} sx={{ pt: 3, pb: 1, pl: 3, pr: 10 }}>
                <Grid container item xs={12} alignItems={'center'}>
                    <BreadCrumComponent push={push} />
                </Grid>
            </Grid>
            {props?.createCourseAction[1]?.read &&
                <Grid container item xs={12} justifyContent={'flex-start'} alignItems={'center'} sx={{ pl: 3 }}>
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
                                        value={courseData?.Description}
                                        onChange={handleChange}
                                        style={{
                                            width: "100%", border: errors?.Description?.length ? "2px solid #cf0c0c" : courseData?.Description?.length == 2501 ? "2px solid #cf0c0c" : "1px solid #dedede", borderRadius: "1vh",
                                            padding: "8px", outline: "none", resize: 'none', maxHeight: "198px", color: "black", overflow: 'auto'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.border = "2px solid #3182ce"
                                        }}
                                        onMouseLeave={(e) => {
                                            const target = e.target as HTMLTextAreaElement;
                                            target.style.border = courseData?.Description?.length == 2501 ? "2px solid #cf0c0c" : "1px solid #e5e7eb"
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
                                            {props?.createCourseAction[0]?.create &&
                                                <Button
                                                    fullWidth
                                                    disabled={!courseData.Course_Name}
                                                    variant="contained"
                                                    sx={{ backgroundColor: !courseData.Course_Name ? "white" : "#2A2F42", borderRadius: "1vh", border: "3px solid balck", color: "#F0F2FF", textTransform: "initial", fontWeight: "700", '&:hover': { backgroundColor: '#2A2F42' } }}
                                                    onClick={handleCreateCourse}
                                                >
                                                    {isCreateLoading ? <> &nbsp; <CircularProgress sx={{ color: "white" }} size={20} />
                                                    </> : "ADD COURSE"}
                                                </Button>
                                            }
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
        </div >
    )
}

// Breadcrum component
const BreadCrumComponent = ({ push }: any) => {
    return (
        <>
            <Typography variant="h6" sx={{ fontWeight: '600', cursor: 'pointer' }} onClick={(() => push("/courses"))}>All Courses</Typography>
            <KeyboardArrowRightIcon />
            <Typography variant="subtitle1" sx={{ fontWeight: '500', }}>Add Course</Typography>
        </>
    )
}
