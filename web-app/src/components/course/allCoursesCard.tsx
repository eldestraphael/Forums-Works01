import * as React from 'react';
import { useState } from "react";
import { Grid, Typography, Tooltip, CircularProgress } from "@mui/material";
import SnakBarAlert from "@/components/snakbaralert/snakbaralert";
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import { useRouter } from 'next/navigation';

export default function AllCoursesCard(props: any) {
    const { push } = useRouter();
    const [isCardLoader, setisCardLoader] = useState(false);

    const maxTooltipLength = 34;
    const courseName = props.course.course_info.name;
    return (
        <>
            <Grid container item xs={11.2} sm={11.2} md={11.5} lg={11.5} sx={{ minHeight: "10vh", border: "1px solid #D8D8D8", borderRadius: "1vh", }}
                onClick={(e) => {
                    e.stopPropagation();
                }}>
                <Grid container item xs={12} sm={12} md={12} sx={{ backgroundColor: 'transparent' }}>
                    <Grid container item xs={12} sm={12} md={12} lg={12} direction={'row'} sx={{ backgroundColor: 'transparent', height: '8.7vh' }}>
                        <Grid container item xs={10.2} sm={8.8} md={10} lg={9.3} sx={{ backgroundColor: 'transparent', p: 1, height: "100%", wordWrap: 'break-word', overFlow: "hidden", width: '80%' }}>
                            <Typography variant="caption" sx={{ wordWrap: "break-word" }}>
                                {courseName.length > maxTooltipLength ? (
                                    <Tooltip title={courseName} arrow >
                                        <Typography variant='subtitle2'
                                            sx={{
                                                fontWeight: 600,
                                                wordWrap: 'break-word'
                                            }}>{`${courseName.substring(0, 34)}...`}</Typography>
                                    </Tooltip>
                                ) : (
                                    <Typography variant='subtitle2' sx={{ fontWeight: 600, wordWrap: "break-word", }}>{courseName}</Typography>
                                )}
                            </Typography>
                        </Grid>
                        <Grid container item xs={1.8} sm={3.2} md={2} lg={2.7} justifyContent={'center'} alignItems={'center'} sx={{ backgroundColor: 'transparent', p: 1 }}>
                            {isCardLoader ? <CircularProgress size={25} />
                                :
                                props?.viewCoursesAction[1]?.read && props?.viewCoursesAction[0]?.update ?
                                <ModeEditIcon fontSize="large"
                                    onClick={() => { setisCardLoader(true); push(`/courses/${props.course.course_info.uuid}?tab=curriculum`) }}
                                    sx={{ backgroundColor: '#5F83ED', color: 'white', p: 1, borderRadius: '0.5vw', cursor: 'pointer' }} />: null
                            }
                        </Grid>
                    </Grid>
                    <Grid container item sx={{ borderTop: '1px solid #D8D8D8' }} >
                        <Grid container item xs={9} sm={7} md={9} lg={8} xl={9} sx={{ backgroundColor: 'transparent', p: 1 }} alignItems={"center"}>
                            <Typography variant="caption" sx={{ fontWeight: 500, color: '#989898' }}>Total chapters: {props.course.course_info.no_of_chapters}</Typography>
                        </Grid>
                        <Grid container item xs={3} sm={5} md={3} lg={4} xl={3} sx={{ backgroundColor: 'transparent', p: 1 }} justifyContent={"center"} alignItems={"center"}>
                            <Typography variant="caption" sx={{ fontWeight: 600, color: props.course.course_info.is_active == true ? '#989898' : "#cf0c0c" }}>{props.course.course_info.is_active == true ? "Published" : "Draft"}</Typography>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid >
        </>
    )
}