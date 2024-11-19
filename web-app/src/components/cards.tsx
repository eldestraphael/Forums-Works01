"use client"
import { useRouter } from 'next/navigation';
import React, { useState } from "react";
import Brightness1Icon from '@mui/icons-material/Brightness1';
import { Grid, Typography, CircularProgress } from "@mui/material";
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { setCookie } from 'cookies-next';

export default function Cards(props: any) {
    const { push } = useRouter();
    const [isCardLoader, setisCardLoader] = useState(false);

    function moveToMember(e: any) {
        e.stopPropagation();
        setisCardLoader(true);
        push(`/admin/forum/${props?.item?.uuid}/members`);
        setCookie('forum_name',props?.item?.forum_name);
    }

    return (
        <Grid item xs={12} sm={5.6} md={2.8} xl={2.8} className='cursor-pointer hover:bg-[#F6F5FB] ' sx={{ border: '0.1vw solid #D8D8D8', borderRadius: '0.8vh', backgroundColor: "transperant", mb: "0.2vh" }} onClick={moveToMember}>
            <Grid container item xs={12} sx={{ backgroundColor: "transperant", px: "1.3vh", py: "1.8vh" }}>
                <Grid container item xs={10} justifyContent={"flex-start"} alignItems={"center"} sx={{ height: "2vh" }}>
                    <Typography variant="caption" sx={{ fontWeight: '600' }}>{props.item.forum_name}</Typography>
                </Grid>
                <Grid item xs={2} justifyContent={"flex-end"} alignItems={"center"} sx={{ backgroundColor: "transperant" }}>
                    {isCardLoader ? <> <CircularProgress sx={{ color: 'black' }} size={25} />
                    </> : <KeyboardArrowRightIcon fontSize="medium" sx={{ backgroundColor: 'white', color: 'black', p: 0.5, borderRadius: '0.5vh', cursor: 'pointer', border: '0.1vw solid #D8D8D8' }} />
                    }
                </Grid>
            </Grid>
            <Grid container item xs={12} sx={{ backgroundColor: "transperant", p: "0.1vh", borderTop: '1px solid #D8D8D8' }} justifyContent={"center"} alignItems={"center"}>
                <Grid item xs={10} sm={8} md={10} lg={9} xl={8} sx={{ backgroundColor: "transperant" }} justifyContent={"center"} alignItems={"center"}>
                    <Typography variant='caption' sx={{ fontWeight: '700', color: '#989898' }}> Forum Health &nbsp;  </Typography>
                    <Brightness1Icon fontSize="small" sx={{ fontSize: 15, color: props.item.health <= 3 ? "#fa8072 " : props.item.health > 3 && props.item.health <= 6 ? "#EDD86D" : "#6EE3AB" }} className=" text-[0.9vw]" />&nbsp;
                    <Typography variant='caption' sx={{ fontWeight: '700' }}>{Math.round(props.item.health)}/10</Typography>
                </Grid>
            </Grid>
        </Grid>
    )
}