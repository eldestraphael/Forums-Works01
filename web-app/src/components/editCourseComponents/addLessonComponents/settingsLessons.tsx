'use client'
import { Checkbox, Grid, Typography } from "@mui/material";
import InfoIcon from '@mui/icons-material/Info';
import { useSelector } from "react-redux";
import PopperComponent from "../PopperComponent";
import React from "react";

export default function SettingsLessons({ assetInfo, deleteLesson }: any) {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
   
    const popperOpen = Boolean(anchorEl);
    const id = popperOpen ? 'simple-popper' : undefined;

    const handleClick = (event: any) => {
        setAnchorEl(anchorEl ? null : event.currentTarget);
    };

    const content = [
        { content: "Make this a free preview lesson", icon: <InfoIcon fontSize='small' sx={{ color: "#cccccc" }} /> },
        { content: "Make this a prerequisite", icon: <InfoIcon fontSize='small' sx={{ color: "#cccccc" }} /> },
        //FUTURE REFERENCE { content: "Enable discussions for this lesson ", icon: <Link>Apply to all lessons in this course</Link> },
        // { content: "Make this video downloadable ", icon: <Link>Apply to all lessons in this course</Link> }
    ]

    const userRoleAction = useSelector((state: any) => state.editCourse.editCourseAction);

    return (
        <>
            <Grid container item xs={11} justifyContent={"flex-start"} alignItems={"flex-start"} sx={{ display: 'flex', flexDirection: "column", py: 5 }}>
                {/* <Typography variant="body1" sx={{ fontWeight: "600" }}>Lesson settings</Typography>
                {content.map((content: any, i: number) => {
                    return (
                        <div key={i} style={{ display: "inline-flex", alignItems: 'center' }} >
                            <Checkbox /> <Typography variant="subtitle1">{content.content} {content.icon}</Typography>
                        </div>
                    )
                })
                } */}
                {/* //FUTURE REFERENCE
                <Grid container item xs={12} sx={{ color: "#777", mt: "3vh" }}>
                    <Typography variant="caption">LESSON ICON & LABEL</Typography>
                    <Grid container item xs={12} direction={'row'}>
                        <Grid container item xs={2}>
                            <Select
                                fullWidth
                                size="small"
                                id="demo-select-small"
                                sx={{ borderRadius: '1vh 0 0 1vh', }}
                                displayEmpty
                                value={""}
                            >
                                <MenuItem value="" disabled>
                                    {icon}
                                </MenuItem>

                            </Select>
                        </Grid>
                        <Grid container item xs={10}>
                            <TextField
                                fullWidth
                                name="Lesson"
                                type="text"
                                size="small"
                                InputProps={{
                                    sx: { borderRadius: '0 1vh  1vh 0  ', color: "#2A2F42", p: "0.3vh" },
                                }}
                            />
                        </Grid>
                    </Grid>
                    <Typography variant="caption">You can hide all lesson icons & labels in <Link>Settings.</Link> Max 16 characters.</Typography>
                </Grid> */}
                {assetInfo ?
                    <Grid container item xs={12} alignItems={'center'} >
                        {userRoleAction[0].update &&

                            <Typography variant="body1" sx={{ color: "red", py: 2, cursor: "pointer" }}
                            aria-describedby={id} onClick={handleClick}>
                                Delete Lesson
                            </Typography>

                        }
                    </Grid> : null
                }
                <PopperComponent
                    id={id}
                    open={popperOpen}
                    anchorEl={anchorEl}
                    setAnchorEl={setAnchorEl}
                    publishCourseAPI={deleteLesson}
                />
            </Grid>
        </>
    )
}