import * as React from 'react';
import { Grid, Typography } from "@mui/material";
import { useState } from "react";
import SnakBarAlert from "@/components/snakbaralert/snakbaralert";

export default function CourseCard(props: any) {
    const [isCardLoader, setisCardLoader] = useState(false);
    const [alertOpen, setAlertOpen] = useState(false);
    const [alert, setAlert] = useState("");
    const [alertSeverity, setAlertSeverity] = useState(false);

    function AlertManager(message: string, severity: boolean) {
        setAlert(message)
        setAlertSeverity(severity)
        setAlertOpen(true)
    }

    return (
        <>
            <Grid
                container
                item
                xs={12}
                sx={{ minHeight: "7vh", border: "1px solid #D8D8D8", borderRadius: "2.5vh", p: 2 }}
                onClick={(e) => {
                    e.stopPropagation();
                    setisCardLoader(true)
                }}
            >
                <Grid container item xs={12} sm={12} justifyContent={'space-between'} sx={{ display: 'flex', backgroundColor: 'transparent' }} >
                    <Grid container item xs={10} sm={9.6} md={9.6} lg={10.5} justifyContent={'space-between'} sx={{ backgroundColor: 'transparent' }}>
                        <Grid container item xs={12} sm={1.5} md={1.4} lg={1} direction={'column'} alignItems={'flex-start'} justifyContent={"flex-start"} sx={{ backgroundColor: 'transperant' }} >
                            <Typography variant="subtitle2" sx={{ color: "#726F83", backgroundColor: "transperant", fontWeight: "600", width: '100%', wordWrap: 'break-word', }}>Course ID</Typography>
                            <Typography variant="subtitle2" sx={{ color: "#000000", backgroundColor: "transperant", fontWeight: "600", width: '100%', wordWrap: 'break-word', }}>{props.course.course_info.id}</Typography>
                        </Grid>
                        <Grid container item xs={12} sm={3} md={3} lg={3.3} direction={'column'} justifyContent={'flex-start'} alignItems={"flex-start"} sx={{ backgroundColor: 'transperant' }}>
                            <Typography variant="subtitle2" sx={{ color: "#726F83", fontWeight: "600", width: '100%' }}> Course Name</Typography>
                            <Typography variant="subtitle2" sx={{ color: "#000000", fontWeight: "600", width: '100%' }}> {props.course.course_info.name}</Typography>
                            <Grid container item xs={1} sm={0.5} sx={{ backgroundColor: 'transperant' }}>
                                <Typography variant="body2" sx={{ color: "#000000", backgroundColor: "transperant", fontWeight: "550", wordWrap: 'break-word',width:'100%' }}>{props.course.course_info.slug}&nbsp;&nbsp;</Typography><br></br>
                            </Grid>
                        </Grid>
                        <Grid container item xs={12} sm={5} md={4} lg={5} direction={'column'} justifyContent={'flex-start'} alignItems={"flex-start"} sx={{ backgroundColor: 'transparent' }}>
                            <Typography variant="subtitle2" sx={{ color: "#726F83", fontWeight: "600" }}>Description</Typography>
                            <Typography variant="subtitle2" sx={{ color: "#000000", fontWeight: "600" }}>{props.course.course_info.description}</Typography>
                        </Grid>
                    </Grid>
                    <Grid container item xs={11} sm={2} md={2} lg={1.2} alignItems={'flex-start'} justifyContent={'space-between'} sx={{ backgroundColor: 'transparent' }}>
                        <Grid container item xs={12} direction={'column'} justifyContent={'center'} sx={{ backgroundColor: 'transperant' }}>
                            <Typography variant="subtitle2" sx={{ color: "#726F83 !important", fontWeight: "600" }}>Instructor ID</Typography>
                            <Typography variant="subtitle2" sx={{ color: "#000000 !important", fontWeight: "600" }}>{props.course.course_info.instructor_id}&nbsp;</Typography>
                        </Grid>
                    </Grid>
                </Grid>

            </Grid >
            <SnakBarAlert alertOpen={alertOpen} setAlertOpen={setAlertOpen} alertSeverity={alertSeverity} alert={alert} />
        </>
    )
}