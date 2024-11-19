"use client"
import React, { useEffect, useState } from 'react'
import Image from 'next/image';
import { usePathname, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { Button, CircularProgress, Grid, Typography } from '@mui/material'
import { setCompletedPercent, setStatus, setTotalStatus, trackingPostAPI } from '@/redux/reducers/forumExperience/forumExperienceSlice';
import ArrowBackIosNewOutlinedIcon from '@mui/icons-material/ArrowBackIosNewOutlined';


function ImageViewer(props: any) {
    const dispatch = useAppDispatch();
    const pathname = usePathname();
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(false);
    const url = useAppSelector((state: any) => state.forumExperience?.image_url)
    const { status, total_status, completed_percent, current_lession_uuid, is_current_lesson_status } = useAppSelector((state) => state.forumExperience);
    const { current_forum_uuid } = useAppSelector(state => state.forumExperience);

    useEffect(() => {
        dispatch(setTotalStatus(1));
        dispatch(setStatus(1));
    }, []);

    useEffect(() => {
        pathname == '/image_viewer' && is_current_lesson_status ? dispatch(setCompletedPercent()) : null;
    }, [total_status, status]);


    //TRACKING REDUX ACTION
    const handleTrackLesson = () => {
        dispatch(trackingPostAPI({
            forum_uuid: current_forum_uuid,
            lesson_uuid: current_lession_uuid,
            status,
            status_percent: completed_percent,
            is_current_lesson: true
        }));
    };

    useEffect(() => {
        if (completed_percent > 0) {
            pathname == '/image_viewer' && is_current_lesson_status ? handleTrackLesson() : null;
        }
    }, [completed_percent]);


    return (
        <div className="ml:0 lg:ml-[17.35vw]" style={{ backgroundColor: "#F6F5FB", paddingBottom: '5vh', minHeight: '100vh' }}>
            <Grid container item xs={12} justifyContent={'flex-start'} alignItems={'center'} sx={{ pt: 3, pb: 1, pl: 3, pr: 4 }}>
                <Grid container item xs={12} lg={6} alignItems={'center'} columnGap={2}>
                    <Button
                        // fullWidth
                        variant='outlined'
                        startIcon={<ArrowBackIosNewOutlinedIcon fontSize='small' />}
                        sx={{ textTransform: "initial", fontWeight: '600' }}
                        onClick={() => { router.back(); setLoading(true); }}
                    >
                        Back
                    </Button>
                    <Typography variant="h6" sx={{ fontWeight: '600' }} >{loading ? <CircularProgress size='small' /> : "Image Viewer"}</Typography>
                </Grid>
            </Grid>

            <Grid container item xs={12} justifyContent={'flex-start'} alignItems={'center'} sx={{ pl: 3 }}>
                <Grid container item xs={11.5} alignItems={'center'} justifyContent={'center'} sx={{ position: 'relative', backgroundColor: 'white', borderRadius: '2vh', p: 5, }} >
                    <Grid className="justify-center items-center" sx={{ width: '90%', height: '80vh', borderRadius: '1vw' }}>
                        <Image
                            src={url}
                            priority={true}
                            placeholder="empty"
                            alt="Forum@forms"
                            layout="fill"
                            style={{
                                objectFit: 'contain',
                                backgroundColor: "transparent",
                            }}
                            unoptimized
                        />
                    </Grid>
                </Grid>
            </Grid>
        </div >


    )
}

export default ImageViewer