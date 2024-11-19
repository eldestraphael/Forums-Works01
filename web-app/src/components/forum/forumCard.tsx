import * as React from 'react';
import { CircularProgress, Grid, Typography, Switch, } from "@mui/material";
import Brightness1Icon from '@mui/icons-material/Brightness1';
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { setUserFirstName, setUserLastName } from "@/redux/reducers/users/userSlice";

export default function ForumCard(props: any) {
    const [isCardLoader, setisCardLoader] = useState(false);
    const { push } = useRouter();
    const dispatch = useDispatch();

    return (
        <>
            <Grid
                container
                item
                xs={12}
                sx={{ minHeight: "7vh", cursor: 'pointer', border: "1px solid #D8D8D8", borderRadius: "2.5vh", p: 2 }}
                onClick={(e) => {
                    e.stopPropagation();
                    setisCardLoader(true)
                    push(`forums/${props?.forum?.forum_info?.uuid}`);
                    dispatch(setUserFirstName(props?.forum?.forum_info?.first_name));
                    dispatch(setUserLastName(props?.forum?.forum_info?.last_name));
                }}
            >
                <Grid container item xs={10} sm={11.2} sx={{ display: 'flex' }} >
                    <Grid container item xs={6} sm={6} md={8.5} lg={9} justifyContent={'space-between'} sx={{ backgroundColor: 'transperant' }}>
                        <Grid container item xs={12} sm={12} md={5.5} lg={5} direction={'column'} alignItems={'flex-start'} justifyContent={"flex-start"} sx={{ backgroundColor: 'transperant' }} >
                            <Typography variant="subtitle2" sx={{ color: "#000000", backgroundColor: "transperant", fontWeight: "600", width: '100%', wordWrap: 'break-word', }}>{props.forum.forum_info.forum_name}</Typography>
                            <Typography variant="caption" sx={{ color: "#726F83", backgroundColor: "transperant", fontWeight: "400", }}>{props?.forum?.forum_info?.company_info?.company_name}</Typography>
                        </Grid>
                        <Grid container item xs={12} sm={12} md={5} lg={6} direction={'column'} justifyContent={'flex-start'} alignItems={"flex-start"} sx={{ backgroundColor: 'transperant' }}>
                            <Typography variant="subtitle2" sx={{ color: "#000000", fontWeight: "600", width: '100%', wordWrap: 'break-word' }}> {props?.forum?.forum_info.total_users}</Typography>
                            <Typography variant="caption" sx={{ color: "#726F83", backgroundColor: "transperant", fontWeight: "400", }}>Total Members</Typography>
                        </Grid>
                    </Grid>
                    <Grid container item xs={12} sm={6} md={3.5} lg={3} alignItems={"center"} >
                        <Grid container item xs={12} gap={0.5} alignItems={'center'}>
                            <Typography variant="subtitle2" sx={{ color: "#676767 !important", fontWeight: "600" }}>Forum Momentum&nbsp;</Typography>
                            <Brightness1Icon fontSize='small' sx={{ color: (((props?.forum?.forum_info.health || 0) / 10) * 100) <= 50.00 ? "#fa8072 " : (((props?.forum?.forum_info.health || 0) / 10) * 100) >= 51.00 && (((props?.forum?.forum_info.health || 0) / 10) * 100) <= 80.00 ? "#EDD86D" : "#6EE3AB" }} />
                            <Typography sx={{ fontWeight: '700' }}>
                                {props?.forum?.forum_info.health || 0 > 0 ? Math.round(props?.forum?.forum_info.health / 10 * 100) : 0}%
                            </Typography>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid container item xs={2} sm={0.8} justifyContent={'center'} alignItems={"center"} >

                    <Grid container item xs={12} justifyContent={'flex-start'} >
                        {isCardLoader
                            ? <CircularProgress size={25} />
                            :
                            props.viewForumsAction[0].update &&
                            <Switch
                                checked={props?.forum?.forum_info?.is_active}
                                onChange={(event) => {
                                    event.stopPropagation();
                                    props?.toggleApiCall(event, event.target.checked, props?.forum?.forum_info?.uuid);
                                }}
                                onClick={(event) => event.stopPropagation()}
                            />
                        }
                    </Grid>

                </Grid>
            </Grid >
        </>
    )
}