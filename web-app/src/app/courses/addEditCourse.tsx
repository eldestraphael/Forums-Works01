'use client'
import { Button, Grid, TextField, Typography, CircularProgress } from "@mui/material";
import SnakBarAlert from "@/components/snakbaralert/snakbaralert";
import React, { useEffect, useState } from 'react'
import BackDropLoading from '@/components/loading/backDropLoading';
import { useRouter } from 'next/navigation';
import AddIcon from '@mui/icons-material/Add';
import EditCoursesCard from '@/components/course/editCourseCard';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { StaticMessage } from "../util/StaticMessage";


export default function AddCourse(props: any) {

    const [alertOpen, setAlertOpen] = useState(false);
    const [alert, setAlert] = useState("");
    const [alertSeverity, setAlertSeverity] = useState(false);
    const [Loader, setLoader] = useState(false);
    const [isLoading, setisLoading] = useState(false);
    const [isCreateLoading, setIsCreateLoading] = useState(false);
    const [allCourse, setAllCourse] = useState<any>([]);
    const [courseData, setCourseData] = useState({
        CourseName: '',
        Description: ''
    });
    const [errors, setErrors] = useState({
        CourseName: '',
        Description: ''
    });

    const { push } = useRouter();
    let typingTimer: ReturnType<typeof setTimeout>;

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        let error = '';
        if (name === 'CourseName' || 'description') {
            if (value.length <= 15) {
                setCourseData({ ...courseData, [name]: value });
                clearTimeout(typingTimer);
                typingTimer = setTimeout(() => {
                    handleBlur(e);
                }, 20000);
            }
            else {
                error = `${name} must be 15 charactre or less`;
            }
        }
        setErrors({ ...errors, [name]: error });
    };

    const handleBlur = (e: any) => {
        const { name, value } = e.target;
        let error = '';
        if (name === 'CourseName' || 'description') {
            if (value.trim() === '') {
                error = value.trim() === '' ? `${name} is required` : '';
            } else {
                error = value.trim() === '' ? `${name} is required` : '';
            }
        }
        setErrors({ ...errors, [name]: error });
    };

    function hadleAddModule() {
        setLoader(true)
        push("/courses/add-module")
    }

    async function handleCreateCourse() {
        setIsCreateLoading(true);
        const requestBody = {
            name: courseData.CourseName,
            description: courseData.Description,
        }
        try {
            const createCourseAPI = await fetch(`/api/course`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(requestBody)
            })
            const createCourseAPIResponse = await createCourseAPI.json();
            console.log("124", createCourseAPIResponse);
            if (createCourseAPI.status == 200) {
                AlertManager(createCourseAPIResponse?.message, false);
                push("/courses");
                setIsCreateLoading(false);
            } else {
                AlertManager(StaticMessage.ErrorMessage,true);
            }
        }
        catch (error: any) {
            AlertManager(StaticMessage.ErrorMessage,true);
        }
    }

    function AlertManager(message: string, severity: boolean) {
        setAlert(message)
        setAlertSeverity(severity)
        setAlertOpen(true)
        setisLoading(false);
        setLoader(false);
        setIsCreateLoading(false);
    }

    return (
        <div className="ml:0 lg:ml-[17.35vw]" style={{ backgroundColor: "#F6F5FB", paddingBottom: '5vh', minHeight: '100vh' }}>
            <Grid container item xs={12} justifyContent={'flex-start'} alignItems={'center'} sx={{ pt: 3, pb: 1, pl: 3, pr: 10 }}>
                <Grid container item xs={12} lg={6} alignItems={'center'}>
                    <BreadCrumComponent push={push} />
                </Grid>
            </Grid>
            {/* {props.createCoursemAction[1].read && */}
            <Grid container item xs={12} justifyContent={'flex-start'} alignItems={'center'} sx={{ pl: 3 }}>
                <Grid container item xs={11.5} alignItems={'center'} justifyContent={'center'} sx={{ backgroundColor: 'white', borderRadius: '2vh', p: 2 }} >
                    <Grid container item xs={12} justifyContent={'center'} alignItems={'flex-start'} sx={{ pt: 2 }}>
                        <Grid container item xs={11.7} sm={11} md={8} lg={7} justifyContent={'center'} sx={{ border: "1px solid #dedede", borderRadius: "2vh", p: 2, marginBottom: "3vh" }}>
                            <Grid item xs={12} sx={{ color: "#777", m: "1vh" }}>
                                <Typography variant="caption">COURSE NAME</Typography>
                                <TextField
                                    fullWidth
                                    placeholder="Enter a course name"
                                    name='CourseName'
                                    type='text'
                                    size="small"
                                    value={courseData.Description}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={!!errors.CourseName}
                                    helperText={errors.CourseName}
                                    InputProps={{ sx: { borderRadius: "1vh", color: "#2A2F42", maxLength: 51 } }}
                                />
                            </Grid>
                            <Grid item xs={12} sx={{ color: "#777", m: "1vh" }}>
                                <Typography variant="caption">DESCRIPTION</Typography>
                                <TextField
                                    fullWidth
                                    placeholder="Description about course"
                                    name='Description'
                                    type='text'
                                    size="small"
                                    value={courseData.Description}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={!!errors.Description}
                                    helperText={errors.Description}
                                    InputProps={{ sx: { borderRadius: "1vh", color: "#2A2F42", maxLength: 51 } }}
                                />
                            </Grid>
                            <Grid container item xs={12} sm={12} md={12} lg={12} spacing={1} justifyContent={'flex-start'} alignItems={'flex-start'} sx={{ backgroundColor: 'transparent', ml: 0.1 }}>
                                {
                                    allCourse.map((item: any, index: number) => {
                                        return (
                                            <Grid container item xs={12} sm={6} md={6} lg={6} key={index} justifyContent={"flex-start"} alignItems={"flex-start"} sx={{ mt: 2, backgroundColor: 'transparent' }}>
                                                <EditCoursesCard key={index} course={item} viewCoursesAction={props.viewCoursesAction} />
                                            </Grid>
                                        )
                                    })
                                }
                            </Grid>
                            <Grid container item xs={12} justifyContent={'center'} alignItems={'center'} direction={'row'} sx={{ backgroundColor: 'transparent' }}>
                                {/* <Grid item xs={12} sx={{ mx: "1vh", my: "3vh" }}>
                                    <Grid container item justifyContent={'center'} sx={{ backgroundColor: 'transparent', borderRadius: "1vh", border: "1px solid #dedede", cursor: 'pointer', p: 1, ml: 0.5 }} onClick={hadleAddModule}>
                                        {Loader ? <> &nbsp;
                                            <CircularProgress sx={{ color: "#2A2F42" }} size={20} />
                                        </> :
                                            <><AddIcon className="flex w-[0.99vw] h-[0.98vh] m-0" /><Typography sx={{ fontWeight: '500' }}>&nbsp; Add Module</Typography></>
                                        }
                                    </Grid>
                                    
                                </Grid> */}
                                <Grid container item xs={12} justifyContent={'center'} sx={{ ml: 0.9 }}>
                                    <Grid item xs={9} sm={4} md={5} lg={4} sx={{ mx: "1vh", my: "1.5vh" }}>
                                        {/* {props.createCoursemAction[0].create && */}
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            sx={{ backgroundColor: "#2A2F42", borderRadius: "1vh", border: "3px solid balck", color: "#F0F2FF", textTransform: "initial", fontWeight: "700", '&:hover': { backgroundColor: '#2A2F42' } }}
                                            onClick={handleCreateCourse}
                                        >
                                            {isCreateLoading ? <> &nbsp; <CircularProgress sx={{ color: "white" }} size={20} />
                                            </> : "Add Course"}
                                        </Button>
                                        {/* }  */}
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
            {/* } */}
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
