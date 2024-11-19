import * as React from 'react';
import { CircularProgress, Grid, Typography, Switch, } from "@mui/material";
import Brightness1Icon from '@mui/icons-material/Brightness1';
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDispatch } from "react-redux";
import CustomTooltip from "@/app/util/tooltip";
import SnakBarAlert from "@/components/snakbaralert/snakbaralert";
import { setCookie } from 'cookies-next';

export default function UserCard(props: any) {
    const [isCardLoader, setisCardLoader] = useState(false);
    const { push } = useRouter();
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
                sx={{ minHeight: "7vh", cursor: 'pointer', border: "1px solid #D8D8D8", borderRadius: "2.5vh", p: 2 }}
                onClick={(e) => {
                    e.stopPropagation();
                    setisCardLoader(true)
                    push(`users/${props.user?.user_info?.uuid}`);
                    setCookie("user_first_name", props?.user?.user_info?.first_name);
                    setCookie("user_last_name", props?.user?.user_info?.last_name);
                }}
            >
                <Grid container item xs={10} sm={11.2} sx={{ display: 'flex' }} >
                    <Grid container item xs={6} sm={6} md={8.5} lg={9} justifyContent={'space-between'} sx={{ backgroundColor: 'transperant' }}>
                        <Grid container item xs={12} sm={12} md={4} lg={4.3} direction={'column'} alignItems={'flex-start'} justifyContent={"flex-start"} sx={{ backgroundColor: 'transperant' }} >
                            <Typography variant="subtitle2" sx={{ color: "#000000", backgroundColor: "transperant", fontWeight: "600", width: '100%', wordWrap: 'break-word', }}>{props?.user?.user_info?.first_name}&nbsp;{props?.user?.user_info?.last_name}</Typography>
                            <Typography variant="caption" sx={{ color: "#726F83", backgroundColor: "transperant", fontWeight: "400", }}>{props?.user?.user_info?.company_info?.company_name}</Typography>
                        </Grid>
                        <Grid container item xs={12} sm={12} md={5.5} lg={4.3} direction={'column'} justifyContent={'flex-start'} alignItems={"flex-start"} sx={{ backgroundColor: 'transperant' }}>
                            <Typography variant="subtitle2" sx={{ color: "#000000", fontWeight: "600", width: '100%', wordWrap: 'break-word' }}> {props?.user?.user_info?.email}</Typography>
                            <Typography variant="caption" sx={{ color: "#726F83", backgroundColor: "transperant", fontWeight: "400", }}>{props?.user?.user_info?.job_title}</Typography>
                        </Grid>
                        <Grid container item xs={12} sm={12} md={2.3} lg={2.5} justifyContent={'flex-start'} alignItems={"flex-start"} sx={{ backgroundColor: 'transperant' }}>
                            <Typography variant="subtitle2" sx={{ color: "#000000", fontWeight: "600" }}> {props?.user?.user_info?.phone}</Typography>
                        </Grid>
                    </Grid>
                    <Grid container item xs={12} sm={6} md={3.5} lg={3} alignItems={"center"} >
                        <Grid container item xs={12} gap={0.5} alignItems={'center'}>
                            <Typography variant="subtitle2" sx={{ color: "#676767 !important", fontWeight: "600" }}>User Momentum&nbsp;</Typography>
                            <Brightness1Icon fontSize='small' sx={{ color: (((props?.user?.user_info?.health || 0) / 10) * 100) <= 50.00 ? "#fa8072 " : (((props?.user?.user_info?.health || 0) / 10) * 100) >= 51.00 && (((props?.user?.user_info?.health || 0) / 10) * 100) <= 80.00 ? "#EDD86D" : "#6EE3AB" }} />
                            <Typography sx={{ fontWeight: '700' }}>
                                {props?.user?.user_info?.health || 0 > 0 ? Math.round(props?.user?.user_info?.health / 10 * 100) : 0}%
                            </Typography>
                        </Grid>
                        <Grid container item xs={12} gap={1} alignItems={'center'} >
                            <Typography variant="caption" sx={{ color: "#726F83", fontWeight: "400", }}><CustomTooltip forums_info={props?.user?.user_info?.forums_info} sx={{ backgroundColor: "#2A2F42 !important", color: "white" }} /></Typography>
                        </Grid>

                    </Grid>
                </Grid>
                <Grid container item xs={2} sm={0.8} justifyContent={'center'} alignItems={"center"} >

                    <Grid container item xs={12} justifyContent={'flex-start'} >
                        {isCardLoader
                            ? <CircularProgress size={25} />
                            :
                            props.viewUsersAction[0].update &&
                            <Switch
                                checked={props?.user?.user_info?.is_active}
                                onChange={(event) => {
                                    event.stopPropagation();
                                    props?.toggleApiCall(event, event.target.checked, props.user.user_info.uuid);
                                }}
                                onClick={(event) => event.stopPropagation()}
                            />
                        }
                    </Grid>

                </Grid>
            </Grid >
            <SnakBarAlert alertOpen={alertOpen} setAlertOpen={setAlertOpen} alertSeverity={alertSeverity} alert={alert} />
        </>
    )
}