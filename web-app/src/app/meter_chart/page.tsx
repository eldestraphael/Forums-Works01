"use client"
import ReactSpeedometer from "react-d3-speedometer"
import React from 'react'
import { colors } from "@mui/material"

function Meter({ momentum }: any) {
    return (
        <ReactSpeedometer
            ringWidth={15}
            width={180}
            height={130}
            value={momentum}
            maxValue={100}
            labelFontSize={"0"}
            needleHeightRatio={0.5}
            needleColor={"#2a3041"}
            segments={3}
            segmentColors={['#fa8072', '#EDD86D', '#6EE3AB']}

        />
    )
}

export default Meter