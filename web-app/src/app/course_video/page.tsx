"use client"
import VideoPlayers from "@/components/video_player/videoComponent";
import { Grid, Typography } from '@mui/material';

export default function VideoPlayer() {
    const videoSrc = '02fqewCN02joMAkh2tkjyAmcHBgQkSoZwX';
    const videoType = 'video/mux';

    return (
        <div className="ml:0 lg:ml-[17.35vw]" style={{ backgroundColor: "#F6F5FB", paddingBottom: '5vh', minHeight: '100vh' }}>
            <Grid container item xs={12} justifyContent={'flex-start'} alignItems={'center'} sx={{ pt: 3, pb: 1, pl: 3, pr: 4 }}>
                <Grid container item xs={12} lg={6} alignItems={'center'}>
                    <Typography variant="h6" sx={{ fontWeight: '600' }} >Video Player </Typography>
                </Grid>
            </Grid>

            <Grid container item xs={12} justifyContent={'flex-start'} alignItems={'center'} sx={{ pl: 3 }}>
                <Grid container item xs={11.5} alignItems={'center'} justifyContent={'center'} sx={{ position: 'relative', backgroundColor: 'white', borderRadius: '2vh', p: 5, }} >
                    <VideoPlayers src={videoSrc} type={videoType} customText="George Clinton - Forums@Work - 21MAY24 : 10:30AM" />
                </Grid>
            </Grid>
        </div >
    )
}