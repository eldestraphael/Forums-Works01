'use client'

import { useState } from "react";
import { useSelector } from "react-redux";
import { Button, CircularProgress, Grid, Paper, Popper, Typography } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';



export default function PopperComponent(props: any) {
    const [noBtnLoading, setNoBtnLoading] = useState(false);
    const yesBtnLoading = useSelector((state: any) => state.editCourse.yesBtnLoading);

    const optionTextMap: any = {
        'Lesson': 'delete the lesson',
        'Disable Course': 'draft the course',
        'Enable Course': 'publish course',
        'Chapter': 'delete the chapter',
        'Action': 'delete the action step',
        'MARK AS DRAFT': 'draft the chapter',
        'PUBLISH CHAPTER': 'publish the chapter',
        'Forum Prep': 'delete the forum prep',
        "Survey": "delete the survey",
        'default': 'publish the course'
    };

    const optionText = optionTextMap[props?.option] || optionTextMap['default'];

    return (
        <>
            <Popper id={props.id} open={props.open} anchorEl={props.anchorEl} placement="top-start" sx={{ pt: "2vh", pb: "2vh" }} className='w-[80vw] sm:w-[70vw] md:w-[50vw] lg:w-[40vw] clg:w-[30vw] xl:w-[25vw] ' style={{ zIndex: props.option == 'Chapter' || props.option == 'MARK AS DRAFT' || props.option == 'PUBLISH CHAPTER' ? 1300 : 0 }} >
                    <Paper elevation={2} sx={{ borderRadius: '2vh', p: 2 }}>
                        <Grid container item xs={12} justifyContent={'flex-end'} alignItems={'center'}  >
                            <CloseIcon fontSize='small' onClick={() => props.setAnchorEl(null)} sx={{ cursor: 'pointer' }} />
                        </Grid>
                        <Grid container item xs={12} justifyContent={'center'} alignItems={'center'} sx={{ p: "2vh" }}>
                            {!(props.option == 'Zoom') ?
                                <Typography sx={{ fontWeight: '600', color: 'black', fontSize: "18px", textAlign: "center" }}>
                                    Do you want to {optionText}
                                </Typography>
                                : null}
                            {props.option == 'Zoom' ? <Typography sx={{ fontWeight: '600', color: 'black', fontSize: "18px", textAlign: "center" }}>Kindly leave the call in order to go back</Typography> : null}
                        </Grid>
                        {!(props.option == 'Zoom') ?
                            <Grid container item xs={12} direction={'row'} sx={{ py: "1vh" }} justifyContent={"space-between"} alignItems={"center"}>
                                <Grid container item xs={5.7} justifyContent={'flex-end'} alignItems={'center'}>
                                    <Grid item xs={12} sm={6} lg={4.2}>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            onClick={props.publishCourseAPI}
                                            sx={{
                                                backgroundColor: "#2A2F42",
                                                '&:hover': { backgroundColor: " #2A2F42 !important" }, batextTransform: "initial"
                                            }}>
                                            {yesBtnLoading ? <CircularProgress sx={{ color: "white" }} size={20} /> : 'YES'}
                                        </Button>
                                    </Grid>
                                </Grid>
                                <Grid container item xs={5.7} justifyContent={'flex-start'} alignItems={'center'}>
                                    <Grid item xs={12} sm={6} lg={4.2}>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            onClick={() => { setNoBtnLoading(true); props.setAnchorEl(null); setNoBtnLoading(false); }}
                                            sx={{
                                                backgroundColor: "#2A2F42 !important",
                                                '&:hover': { backgroundColor: "#2A2F42 !important" }, textTransform: "initial"
                                            }}>
                                            {noBtnLoading ? <CircularProgress sx={{ color: "white" }} size={20} /> : 'NO'}
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Grid>
                            : null}
                    </Paper>
                </Popper>
            </>
            )
}