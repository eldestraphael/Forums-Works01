'use client'

import React from "react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import SnakBarAlert from "@/components/snakbaralert/snakbaralert";
import { Button, Grid, Tooltip, Typography } from "@mui/material";
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import AddChapterPopup from "@/components/editCourseComponents/popup/addEditChapterPopup";
import BackDropLoading from "@/components/loading/backDropLoading";
import { StaticMessage } from "@/app/util/StaticMessage";
import CurriculamComponent from "@/components/editCourseComponents/addLessonComponents/curriculum";
import { useDispatch, useSelector } from "react-redux";
import { setCourseInfo, setCouseDetails, setDragToggle, setEditCourseAction, setPublishLessonToggle, setSelectedIndexToggle, setYesBtnLoading } from "@/redux/reducers/editCourse/addLessonSlice";
import EditCourseComponent from "@/components/editCourseComponents/settings";
import PopperComponent from "@/components/editCourseComponents/PopperComponent";

export default function EditCourse(props: any) {
    const [breadCrumToggle, setBreadCrumToggle] = useState<String>(props?.page_props?.searchParams?.tab || 'curriculum');
    const [alert, setAlert] = useState("");
    const [alertSeverity, setAlertSeverity] = useState(false);
    const [isLoading, setisLoading] = useState(false);
    const [alertOpen, setAlertOpen] = useState(false);
    const [open, setOpen] = React.useState(false);
    const [courseName, setCourseName] = useState<string>('');
    const [chapterInfo, setChapterInfo] = React.useState([]);
    const [chapterType, setChapterType] = React.useState<string>('Add Chapter');
    const [Toggle, setToggle] = React.useState<boolean>(false);
    const [chapterToggle, setChapterToggle] = React.useState<boolean>(false);
    const [selectedComponent, setSelectedComponent] = useState<JSX.Element | null>(<CurriculamComponent />);
    const [viewAPICallToggle, setViewAPICallToggle] = useState<boolean>(false);
    const [chapterid, setChapterid] = useState('');
    const [activeInactiveTheCourse, setactiveInactiveTheCourse] = useState('');
    const editBtnArray = [
        { name: 'UPDATE CHAPTER' },
        { name: 'DELETE CHAPTER' },
        { name: 'MARK AS DRAFT' }
    ]
    const editTextfieldArray = [
        { title: "CHAPTER NAME", name: 'Chapter_Name', type: "text", placeholder: 'Enter a chapter name' },
    ]
    const btnArray = [{ name: 'ADD CHAPTER' }]
    const textAreaArray = [{ title: "DESCRIPTION", name: 'Description', type: "text", placeholder: 'Enter description about chapter' }]
    const [addPopup, setAddPopup] = useState([btnArray, editTextfieldArray, textAreaArray]);
    const [editPopup, setEditPopup] = useState([editBtnArray, editTextfieldArray, textAreaArray],)
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const dispatch = useDispatch();
    const { push } = useRouter();
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    dispatch(setEditCourseAction(props?.editCourseAction));
    const dragToggle = useSelector((state: any) => state.editCourse.dragToggle);

    const popperOpen = Boolean(anchorEl);
    const id = popperOpen ? 'simple-popper' : undefined;

    const handleClick = (event: any) => {
        setAnchorEl(anchorEl ? null : event.currentTarget);
    };

    const heading = [
        {
            name: 'curriculum',
            component: <CurriculamComponent
                handleOpen={handleOpen}
                setChapterType={setChapterType}
                setViewAPICallToggle={setViewAPICallToggle}
                setChapterid={setChapterid}
                chapterid={chapterid}
                setToggle={setToggle}
                Toggle={Toggle}
                setChapterToggle={setChapterToggle}
                chapterToggle={chapterToggle}
                course_uuid={props?.page_props?.params.course_uuid}
                setAnchorEl={setAnchorEl}
            />
        },
        {
            name: 'settings',
            component: <EditCourseComponent
                course_uuid={props?.page_props?.params.course_uuid}
                setToggle={setToggle}
                Toggle={Toggle}
                setBreadCrumToggle={setBreadCrumToggle}
                activeInactiveTheCourse={activeInactiveTheCourse}
            />
        },
    ]


    //TAB BUTTON CLICK FUNCTION
    const handleButtonClick = (name: string) => {
        setBreadCrumToggle(name);
        push(`/courses/${props?.page_props?.params.course_uuid}?tab=${name}`);
        const matching = heading.find(item => item?.name === name);
        if (matching) {
            setSelectedComponent(matching.component);
        }
    };

    //GET COURSE DETAILS BY ID API
    async function getCourseById() {
        setisLoading(true);
        try {
            const getCourseAPI = await fetch(`/api/course/${props?.page_props?.params.course_uuid}`, {
                method: 'GET',
                cache: 'no-store',
                headers: {
                    "Content-Type": "application/json"
                },
            })
            const getCourseAPIResponse = await getCourseAPI.json();
            if (getCourseAPI.status == 200) {
                AlertManager(getCourseAPIResponse?.message, false);
                dispatch(setCourseInfo(getCourseAPIResponse?.data?.course_info.chapter_info));
                setCourseName(getCourseAPIResponse?.data?.course_info?.name);
                setactiveInactiveTheCourse(getCourseAPIResponse?.data?.course_info?.is_active);
                dispatch(setCouseDetails({
                    CourseName: getCourseAPIResponse?.data?.course_info?.name,
                    Description: getCourseAPIResponse?.data?.course_info?.description
                }));
                if ((getCourseAPIResponse?.data?.course_info.chapter_info).length === 0) {
                    handleOpen();
                    setChapterType('Add Chapter');
                }
                dispatch(setDragToggle(false));
            } else {
                AlertManager(getCourseAPIResponse?.message, true);
            }
        }
        catch (error: any) {
            AlertManager(StaticMessage.ErrorMessage, true);
        }
    }

    //PUBLISH COURSE API
    async function publishCourseAPI() {
        setisLoading(true);
        dispatch(setYesBtnLoading(true));
        try {
            const publishCourseAPI = await fetch(`/api/course/${props?.page_props?.params.course_uuid}/publish`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    publish: true
                })
            })
            const publishCourseAPIResponse = await publishCourseAPI.json();
            if (publishCourseAPI.status == 200) {
                AlertManager(publishCourseAPIResponse?.message, false);
                setAnchorEl(null);
                setToggle(!Toggle);
                dispatch(setPublishLessonToggle(true));
            } else {
                AlertManager(publishCourseAPIResponse?.message, true);
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
        setisLoading(false);
        dispatch(setYesBtnLoading(false));
    }

    //LESSON CHANGES UPDATE IN CHAPTER
    useEffect(() => {
        getCourseById();
    }, [chapterInfo, Toggle, dragToggle])

    //CHANGE ROUTER CORRESPONDING TAB SELECTED
    useEffect(() => {
        const currentTab = props?.page_props?.searchParams?.tab;
        const matchingComponent = heading.find(item => item?.name === currentTab);
        if (matchingComponent) {
            setSelectedComponent(matchingComponent.component);
        }
    }, [props?.page_props?.searchParams?.tab]);

    return (
        <div className="ml:0 lg:ml-[17.35vw]" style={{ backgroundColor: "#F6F5FB", paddingBottom: '5vh', minHeight: '100vh' }}>
            {/* BREADCRUM SECTION */}
            <Grid container item xs={12} justifyContent={'flex-start'} alignItems={'center'} sx={{ pt: 3, pb: 1, pl: 3, pr: 10 }}>
                <Grid container item xs={12} alignItems={'center'}>
                    <BreadCrumComponent push={push} breadCrumToggle={breadCrumToggle} courseName={courseName} />
                </Grid>
            </Grid>

            {/* TAB SECTION */}
            <Grid container item xs={12} justifyContent={'flex-start'} alignItems={'flex-start'} sx={{ pl: 3, minHeight: "87vh" }}>
                <Grid container item xs={11.5} alignItems={'flex-start'} justifyContent={'space-between'} sx={{ backgroundColor: 'white', borderRadius: '2vh', p: 2, minHeight: "87vh" }} >
                    {props?.editCourseAction[1]?.read &&
                        <Grid container item xs={12} direction="row" alignItems={'center'} justifyContent={'space-between'}  >
                            <Grid container item xs={10} direction="row" alignItems={'center'} justifyContent={'flex-start'}  >
                                {heading.map((item, index) => (
                                    <Grid item key={index} xs={item?.name == 'drip' ? 1 : 1.8} md={item?.name == 'drip' ? 0.5 : 1.9} lg={item?.name == 'drip' ? 0.7 : 1.5}>
                                        <Button
                                            fullWidth
                                            sx={{
                                                textTransform: "capitalize", fontWeight: "600", color: (props?.page_props?.searchParams?.tab === item?.name) ? "black" : "#726F83", p: 0, m: 0,
                                                borderBottom: (props?.page_props?.searchParams?.tab === item?.name) ? "0.5vh solid #5F83ED" : "transparent"
                                            }}
                                            onClick={() => handleButtonClick(item?.name)}
                                        >
                                            {item?.name}
                                        </Button>
                                    </Grid>
                                ))}
                            </Grid>

                            <Grid container item xs={2} alignItems={'center'} justifyContent={'flex-end'} >
                                {!(breadCrumToggle == 'settings') &&
                                    <Grid item xs={7} sx={{ mr: "2vh" }}>
                                        {props?.editCourseAction[0]?.update &&
                                            <Button
                                                fullWidth
                                                variant="contained"
                                                sx={{
                                                    textTransform: "capitalize", borderRadius: "1vh", fontWeight: "600", p: 0.5, m: 0, backgroundColor: "#2A2F42", '&:hover': { backgroundColor: '#2A2F42' }
                                                }}
                                                aria-describedby={id} onClick={handleClick}
                                            >
                                                PUBLISH
                                            </Button>
                                        }
                                    </Grid>
                                }
                            </Grid>
                        </Grid>
                    }
                    <Grid container item xs={12} alignItems={'center'} justifyContent={'flex-start'} sx={{ border: "1px solid #F6F5FB", mt: "2vh" }} ></Grid>
                    {props?.editCourseAction[1]?.read &&
                        <Grid container item xs={12} direction="row" alignItems={'flex-start'} justifyContent={'space-between'} sx={{ minHeight: "73vh", }}>
                            {selectedComponent}
                        </Grid>
                    }
                </Grid>
            </Grid>
            {/* CHAPTER POPUP SECTION */}
            <AddChapterPopup
                open={open}
                handleClose={handleClose}
                course_uuid={props?.page_props?.params.course_uuid}
                chapterType={chapterType}
                setChapterInfo={setChapterInfo}
                data={chapterType == "Add Chapter" ? addPopup : editPopup}
                chapterid={chapterid}
                setToggle={setToggle}
                Toggle={Toggle}
                setViewAPICallToggle={setViewAPICallToggle}
                viewAPICallToggle={viewAPICallToggle}
            />
            <PopperComponent
                id={id}
                open={popperOpen}
                anchorEl={anchorEl}
                setAnchorEl={setAnchorEl}
                publishCourseAPI={publishCourseAPI} />
            <SnakBarAlert alertOpen={alertOpen} setAlertOpen={setAlertOpen} alertSeverity={alertSeverity} alert={alert} />
            <BackDropLoading isLoading={isLoading} />
        </div >
    )
}



// Breadcrum component
const BreadCrumComponent = ({ push, breadCrumToggle, courseName }: any) => {
    return (
        <>
            <Typography variant="h6" sx={{ fontWeight: '600', cursor: 'pointer' }} onClick={(() => push("/courses"))}>All Courses</Typography>
            <KeyboardArrowRightIcon />
            <Tooltip title={courseName?.length > 80 ? courseName : ""}placement="bottom">
                <Typography variant="subtitle1" sx={{ fontWeight: '600' }}>
                    {courseName?.length > 80 ? `${courseName.slice(0, 80)}...` : courseName}
                </Typography>
            </Tooltip>
            <KeyboardArrowRightIcon />
            <Typography variant="subtitle1" sx={{ fontWeight: '550', textTransform: "capitalize" }}>{breadCrumToggle == 'afterpurchase' ? "After Purchase" : breadCrumToggle == 'bulkimporter' ? "Bulki Importer" : breadCrumToggle}</Typography>
        </>
    )
}











