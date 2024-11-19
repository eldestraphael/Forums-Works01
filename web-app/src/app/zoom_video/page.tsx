"use client";

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Button, CircularProgress, Grid, Typography } from '@mui/material';
import { usePathname, useRouter } from "next/navigation";
import ArrowBackIosNewOutlinedIcon from '@mui/icons-material/ArrowBackIosNewOutlined';
import { useSelector } from 'react-redux';
import ModeratorGuide from './moderatorGuide';
import PopperComponent from '@/components/editCourseComponents/PopperComponent';
import { getCookie } from 'cookies-next';


const ZoomComponent = dynamic(() => import('./zoomVideoComponent'), { ssr: false });

function Zoom(props: any) {
    const [moderatorGuideData, setModeratorGuideData] = useState<any>({});
    const [open, setOpen] = useState<boolean>(false);
    const [disableModeratorGuideBtn, setDisableModeratorGuideBtn] = useState(true);
    const [loading, setLoading] = useState<boolean>(false);
    const [sessionClosed, setSessionClosed] = useState<boolean>(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const popperOpen = Boolean(anchorEl);
    const id = popperOpen ? 'simple-popper' : undefined;
    const { push } = useRouter();


    const forum_name = useSelector((state: any) => state.forumExperience?.zoom_current_forum_name);
    const forum_uuid = useSelector((state: any) => state.forumExperience?.current_forum_uuid);
    const chapter_uuid = useSelector((state: any) => state.forumExperience?.zoom_current_chapter_uuid);
    const meeting_time = useSelector((state: any) => state.forumExperience?.zoom_current_meeting_time);
    const zoomData = useSelector((state: any) => state.forumExperience?.zoom_Data);

    const handleClick = (event: any) => {
        setAnchorEl(anchorEl ? null : event.currentTarget);
    };
    const handleClose = () => setOpen(false);
    const router = useRouter();

    //CONNECT ZOOM SESSION CALL
    useEffect(() => {
        if (zoomData) {
            getModeratorGuide()
        }
    }, [zoomData]);

    //CONNECT ZOOM SESSION CALL
    useEffect(() => {
        if ((!forum_name && !zoomData && !forum_uuid && !chapter_uuid && !meeting_time)) {
            var forumUUID: any = getCookie("current_forum_uuid")
            if (forumUUID) {
                push(`/forum_experience?forum_uuid=${forumUUID}`);
            } else {
                push(`/forums`)
            }
        }
    }, []);

    //GET MODERATOR GUIDE
    const getModeratorGuide = async () => {
        try {
            const res = await fetch(`/api/${chapter_uuid}/moderatorguide`, {
                method: "GET",
                cache: 'no-store',
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const data = await res.json();
            if (res.status == 200) {
                setModeratorGuideData(data?.data)
                setDisableModeratorGuideBtn(false)
            } else {
                setDisableModeratorGuideBtn(true)
            }
        }
        catch (error: any) {
            setDisableModeratorGuideBtn(true)
        }
    };

    return (

        <div className="ml:0 lg:ml-[17.35vw]" style={{ backgroundColor: "#F6F5FB", paddingBottom: '2vh',minHeight: '100vh'}}>
            <Grid container item xs={12} justifyContent={'flex-start'} alignItems={'center'} sx={{ pt: 1, pb: 1, pl: 3, pr: 4 }}>
                <Grid container item xs={12} lg={6} alignItems={'center'} columnGap={2}>
                    <Button
                        variant='outlined'
                        aria-describedby={id}
                        startIcon={<ArrowBackIosNewOutlinedIcon fontSize='small' />}
                        sx={{ textTransform: "initial", fontWeight: '600' }}
                        onClick={(e) => {
                            sessionClosed ? (handleClose(), router.back(), setLoading(true)) : handleClick(e);
                        }}                    >
                        Back
                    </Button>
                    <Typography variant="h6" sx={{ fontWeight: '600' }} >{loading ? <CircularProgress size='small' /> : `Forum meeting of ${forum_name}`}</Typography>
                </Grid>
                <Grid container item xs={12} lg={6} alignItems={'center'} justifyContent={"flex-end"} columnGap={2}>
                    <Button
                        variant='text'
                        sx={{ textTransform: "initial", textDecoration: 'underline', fontWeight: '600', fontSize: "16px", mr: "12px" }}
                        disabled={disableModeratorGuideBtn}
                        onClick={() => setOpen(true)}
                    >
                        Moderator Guide
                    </Button>
                </Grid>

            </Grid>

            <Grid container item xs={12} justifyContent={'center'} alignItems={'center'} sx={{ pl: 3 }}>
                <Grid container item xs={11.5} alignItems={'center'} justifyContent={'center'} sx={{ backgroundColor: 'white', minHeight: "655px", borderRadius: '2vh', p: 0, }} >
                    {/* <Grid container item xs={11.5} direction="row" alignItems={'center'} justifyContent={'flex-end'} sx={{ display: "inline-flex", mt: "2vh" }} >
                        <Grid container item xs={4} alignItems={'center'} justifyContent={'center'} sx={{ backgroundColor: "transperant" }} >
                            <Typography>{forum_name}</Typography>
                        </Grid>
                        <Grid container item xs={4} alignItems={'center'} justifyContent={'center'} sx={{ backgroundColor: "transperant" }}  >
                            <Typography>{meeting_time}</Typography>

                        </Grid>
                        <Grid container item xs={4} alignItems={'center'} justifyContent={'flex-end'} sx={{ backgroundColor: "transperant" }}  >
                            <Button sx={{ backgroundColor: "#6183e7", '&:hover': { backgroundColor: '#2A2F42' } }} variant='contained' disabled={disableModeratorGuideBtn} onClick={() => setOpen(true)}>Moderator Guide</Button>
                            <ModeratorGuide open={open} handleClose={handleClose} moderatorGuideData={moderatorGuideData} />
                        </Grid>

                    </Grid> */}
                    <Grid container className="justify-center items-center" sx={{ width: '100%', borderRadius: '1vw' }}>
                        {!forum_name && !zoomData && !forum_uuid && !chapter_uuid && !meeting_time ?
                            <Typography sx={{fontSize:"16px"}}>Redirecting...</Typography>
                            :
                            <ZoomComponent searchParams={props?.searchParams} handleClose={handleClose} sessisonClosed={sessionClosed} setSessionClosed={setSessionClosed} forum_name={forum_name} forum_uuid={forum_uuid} chapter_uuid={chapter_uuid} meeting_time={meeting_time} zoomData={zoomData} />
                        }
                    </Grid>
                </Grid>
            </Grid>
            <PopperComponent
                id={id}
                open={popperOpen}
                anchorEl={anchorEl}
                setAnchorEl={setAnchorEl}
                option="Zoom"
            />
            <ModeratorGuide open={open} handleClose={handleClose} moderatorGuideData={moderatorGuideData} />
        </div >

    );
}

export default Zoom;