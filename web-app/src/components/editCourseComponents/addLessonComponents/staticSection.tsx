'use client'

import { Grid, Typography } from "@mui/material";
import React from 'react';

export default function StaticSection({ headerAndActionStep }: any) {

    return (
        <><Grid container item xs={12} direction="column" justifyContent={"center"} alignItems={"center"}>
            <Grid container item xs={12} justifyContent={"flex-start"} alignItems={"center"} sx={{ flexGrow: 1 }}>
                <Typography variant="body2" sx={{ textTransform: "uppercase", mt: "2vh", fontWeight: "600" }}>{headerAndActionStep?.name}</Typography>
                <Grid container item xs={12} sx={{ color: "#777", flex: 1, mt: "2vh" }}>
                    <Typography variant="subtitle1">{headerAndActionStep?.description}
                    </Typography>
                </Grid>
            </Grid>
        </Grid></>
    )
}