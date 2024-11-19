'use client'

import { Box, Button, Grid, Modal, Typography, CircularProgress, FormControl, RadioGroup, FormControlLabel, Radio, } from "@mui/material"
import { useEffect, useState } from "react";
import ClearIcon from '@mui/icons-material/Clear';
import React from "react";
import DateFormats from "./dateFormat";
import { useRouter } from "next/navigation";
import { StaticMessage } from "@/app/util/StaticMessage";


export default function EditMemberHealthCheck(props: any) {
    const [healthCheckForDay, setHealthCheckForDay] = useState<any>([]);
    const [healthCheckMcqInfo, setHealthCheckMcqInfo] = useState<any>([]);
    const [oldAnswers, setOldAnswers] = useState<any>([]);
    const [isloading, setisLoading] = useState<Boolean>(false);
    const [isPopUpLoading, setisPopUpLoading] = useState<Boolean>(false);
    const { push } = useRouter();
    const [membersMcqs, setMembersMcqs] = useState<any>([]);
    const [isChecked, setIsChecked] = useState();

    const editMemberHealthCheckAPI = async () => {
        setisPopUpLoading(true)
        try {
            const editMemberHealthCheckAPI = await fetch(`/api/admin/member/health-mcq?uuid=${props.health_uuid}`, {
                method: "GET",
                cache: 'no-store',
                headers: {
                    "Content-Type": "application/json",
                },
            })
            const apiResponse = await editMemberHealthCheckAPI.json();
            if (editMemberHealthCheckAPI.status == 200) {
                setHealthCheckForDay(apiResponse?.data?.health_info);
                setHealthCheckMcqInfo(apiResponse?.data?.mcq_info)

                const oldAnswers: any = [];
                apiResponse?.data?.mcq_info.forEach((mcq: any) => {
                    mcq.mcq_options.forEach((option: any) => {
                        if (option.selected_answer !== null) {
                            oldAnswers.push({ [mcq.mcq_title]: option.uuid });
                        }
                    });
                });
                setOldAnswers(oldAnswers);
                props.AlertManager(apiResponse?.message, false);
            }
            else {
                props.AlertManager(apiResponse?.message, true);
            }
        }
        catch {
            props.AlertManager(StaticMessage.ErrorMessage, true);
        }
        setisPopUpLoading(false)
    }

    const updateMcqOptionAPI = async () => {
        function findMatchingProperties(oldAnswer: any, newAnswer: any) {
            const newMcqs = newAnswer;
            return oldAnswer?.filter((oldObj: any) => {
                const propertyName = Object.keys(oldObj)[0];
                return newMcqs?.some((newObj: any) => Object.keys(newObj)[0] === propertyName);
            });
        }

        const matchingProperties = findMatchingProperties(oldAnswers, membersMcqs[0]?.mcqs);

        //Change property name into mcq_option_uuid
        function convertToNewFormat(answerArray: any) {
            return answerArray?.map((item: any) => {
                const key = Object.keys(item)[0];
                return { mcq_option_uuid: item[key] };
            });
        }
        const new_answers = convertToNewFormat(membersMcqs[0]?.mcqs);
        const old_answers = convertToNewFormat(matchingProperties);

        var requestBody = {
            old_answers: old_answers,
            new_answers: new_answers
        }

        try {
            setisLoading(true);
            const updateMcqOptionAPI = await fetch(`/api/admin/member/health-mcq?uuid=${props.health_uuid}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(
                    requestBody
                ),
            })
            const apiResponse = await updateMcqOptionAPI.json();
            if (updateMcqOptionAPI.status == 200) {
                props.handleClose();
                props.AlertManager(apiResponse?.message, false);
                push(`/users`)
            }
            else {
                props.AlertManager(apiResponse?.message, true);
            }
            setisLoading(false);
        }
        catch (error) {
            setisLoading(false);
            props.AlertManager(StaticMessage.ErrorMessage, true);
        }
    }

    useEffect(() => {
        editMemberHealthCheckAPI();
    }, [props.open])

    function handleRadioGroupValue(e: any, member_uuid: any, title: any, item: any) {
        setIsChecked(e.target.checked);
        const existingMemberIndex = membersMcqs.findIndex((member: any) => member.member_uuid === member_uuid);

        if (existingMemberIndex !== -1) {
            // Member already exists, update its options
            setMembersMcqs((prevState: any) => {
                const updatedMembers = [...prevState];
                const updatedMcqs = updatedMembers[existingMemberIndex].mcqs.map((mcq: any) => {
                    // Check if the current mcq object has the key already
                    if (mcq[e.target.name]) {
                        mcq[e.target.name] = e.target.value; // If yes, update the value
                    }
                    return mcq;
                });
                // If the key does not exist, add a new object to mcqs array with the key-value pair
                if (!updatedMcqs.find((mcq: any) => mcq.hasOwnProperty(e.target.name))) {
                    updatedMembers[existingMemberIndex].mcqs.push({
                        [e.target.name]: e.target.value
                    });
                }
                return updatedMembers;
            });
        } else {
            // Member doesn't exist, add it to the state
            setMembersMcqs((prevState: any) => [
                ...prevState,
                {
                    member_uuid: member_uuid,
                    mcqs: [
                        {
                            [e.target.name]: e.target.value
                        }
                    ]
                }
            ]);
        }
    }

    // Iterate through mcq_info array
    healthCheckMcqInfo.map((mcq: any) => {
        // Find the corresponding selected_mcq object for this mcq
        const selectedMcqObject = membersMcqs[0]?.mcqs.find((obj: any) => obj[mcq.mcq_title]);

        // If selected_mcq object is found, update selected_answer accordingly
        if (selectedMcqObject) {
            const selectedUuid = selectedMcqObject[mcq.mcq_title];
            mcq.mcq_options.forEach((option: any) => {
                if (option.uuid === selectedUuid) {
                    option.selected_answer = {
                        uuid: selectedUuid,
                        createdAt: new Date().toISOString() // Set to current timestamp or as needed
                    };
                } else {
                    option.selected_answer = null; // Set other selected_answer to null
                }
            });
        }
        return mcq;
    });

    return (
        <>
            <Modal
                open={props.open}
                onClose={props.handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Grid
                    container
                    item
                    xs={11} md={8} lg={6}
                    direction={'column'}
                    justifyContent={'center'}
                    alignItems={'center'}
                    sx={{
                        position: 'absolute' as 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        bgcolor: '#2A2F42',
                        border: 0,
                        boxShadow: 24,
                        borderRadius: '2vh'

                    }}>
                    <Grid container item xs={2} justifyContent={'space-between'} alignItems={'center'} sx={{ py: 2, px: 2, borderRadius: "2vh 2vh 0 0", backgroundColor: "#2A2F42" }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: '600', color: 'white' }}> {healthCheckForDay.date && DateFormats(healthCheckForDay.date, false)} </Typography>
                        <ClearIcon sx={{ cursor: 'pointer', color: 'white' }} onClick={props.handleClose} />
                    </Grid>
                    <Grid container item xs={8} sx={{ backgroundColor: 'white', py: 3, px: 2 }}>
                        {isPopUpLoading
                            ? <div className="h-[100%] w-[100%] flex justify-center items-center"><CircularProgress color="primary" size={25} /></div>
                            : <Grid container item >
                                {healthCheckMcqInfo.map((option: any, index: number) => {
                                    return (
                                        <Grid key={index} container item sm={4} direction={'column'} >
                                            <Grid item xs={2.5} sx={{ px: 4, mb: "1vh" }}>
                                                <Typography variant="subtitle2" sx={{ color: "#000000", fontWeight: "600" }}>{option?.mcq_title}</Typography>
                                                <Typography variant="caption" style={{ color: "#726F83", fontWeight: "400", }}>{option.mcq_description}</Typography>
                                            </Grid>
                                            <Grid item xs={4} sx={{ px: 4, pt: 0 }}>
                                                <FormControl>
                                                    <RadioGroup
                                                        aria-labelledby="demo-controlled-radio-buttons-group"
                                                        name="controlled-radio-buttons-group"
                                                    >
                                                        {
                                                            option?.mcq_options.map((item: any, index: number) => {
                                                                return (
                                                                    <FormControlLabel
                                                                        key={index}
                                                                        checked={item.selected_answer ? true : false}
                                                                        value={item?.uuid}
                                                                        name={option?.mcq_title}
                                                                        onChange={(e: any) => handleRadioGroupValue(e, props?.member_uuid, option, item)}
                                                                        control={
                                                                            <Radio
                                                                                size="small"
                                                                                defaultChecked
                                                                                sx={{ py: 0.3, pr: 0.3, '&:hover': { backgroundColor: "transparent" } }}

                                                                            />
                                                                        }
                                                                        label={<Typography variant="caption" sx={{ fontWeight: 500 }}>{item?.mcq_option} </Typography>} />
                                                                )
                                                            })
                                                        }
                                                    </RadioGroup>
                                                </FormControl>
                                            </Grid>
                                        </Grid>
                                    )
                                })}
                            </Grid>
                        }
                    </Grid>
                    <Grid container item xs={2} justifyContent={'space-evenly'} alignItems={'center'} sx={{ backgroundColor: 'white', py: 2, px: 2, borderRadius: "0 0 2vh 2vh " }}>
                        <Grid container item xs={12} sm={6} justifyContent={'space-between'}>
                            <Grid item xs={5.5}>
                                <Button fullWidth variant="contained" size="medium" sx={{ textTransform: "initial", backgroundColor: "#2A2F42", borderRadius: "0.5vh", color: "#F0F2FF", '&:hover': { backgroundColor: '#2A2F42' } }}
                                    onClick={updateMcqOptionAPI}>
                                    {isloading ? <CircularProgress sx={{ color: 'white' }} size={20} /> : 'Update'}</Button>
                            </Grid>
                            <Grid item xs={5.5}>
                                <Button fullWidth variant="contained" size="medium" sx={{ textTransform: "initial", backgroundColor: "#2A2F42", borderRadius: "0.5vh", color: "#F0F2FF", '&:hover': { backgroundColor: '#2A2F42' } }}
                                    onClick={props.handleClose}>
                                    Cancel
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Modal>
        </>
    )
}