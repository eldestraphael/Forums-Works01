import { Accordion, AccordionDetails, AccordionSummary, Avatar, CircularProgress, FormControl, FormControlLabel, Grid, Radio, RadioGroup, Typography } from "@mui/material";
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowDown';
import Brightness1Icon from '@mui/icons-material/Brightness1';
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { setFirstName, setLastName } from "@/redux/reducers/members/memberSlice";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { setCookie } from "cookies-next";

export default function MemberCard(props: any) {
    const [isCardLoader, setisCardLoader] = useState(false);
    const dispatch = useDispatch();
    const { push } = useRouter();

    return (
        <Accordion className="w-full" elevation={0} expanded={true} sx={{borderRadius:"10vh"}}>
            <AccordionSummary
                expandIcon={isCardLoader
                    ? <CircularProgress sx={{ color: 'black' }} size={20} />
                    : props.healthBtnToggle 
                    ? null 
                    :<KeyboardArrowRightIcon style={{ color: "#000000" }} />
                    
                }
                sx={{
                    "& .MuiAccordionSummary-expandIconWrapper": {
                        transition: "none",
                        "&.Mui-expanded": {
                            transform: "none",
                        },
                    },border:"1px solid #D8D8D8",borderTopLeftRadius: "20px",borderTopRightRadius:"20px"
                }}
                aria-controls="panel1-content"
                id="panel1-header"
                onClick={(e) => {
                    e.stopPropagation();
                    push(`/admin/forum/${props.forumUuid}/members/${props.members.uuid}`);
                    setisCardLoader(true);
                    setCookie("member_first_name",props.members.first_name);
                    setCookie("member_last_name",props.members.last_name);
                }}
            >
                <Grid container item xs={12}>
                    <Grid container item xs={12} sm={6} md={8} lg={9} >
                        <Grid container item xs={12} md={3.7} lg={3.3} direction={'column'} alignItems={'flex-start'} justifyContent={"center"} >
                            <Typography variant="subtitle2" sx={{ color: "#000000", fontWeight: "600", width: '100%', wordWrap: 'break-word' }}>{props.members.first_name}&nbsp;{props.members.last_name}</Typography>
                            <Typography variant="caption" style={{ color: "#726F83", fontWeight: "400", }}>{props.members.job_title}</Typography>
                        </Grid>
                        <Grid container item xs={12} md={5} lg={3.5} justifyContent={'flex-start'} alignItems={"flex-start"} >
                            <Typography variant="subtitle2" sx={{ color: "#000000", fontWeight: "600", width: '100%', wordWrap: 'break-word' }}> {props.members.email}</Typography>
                        </Grid>
                        <Grid container item xs={12} md={3} lg={2.5} justifyContent={'flex-start'} alignItems={"flex-start"} >
                            <Typography variant="subtitle2" sx={{ color: "#000000", fontWeight: "600" }}> {props.members.phone}</Typography>
                        </Grid>
                    </Grid>
                    <Grid container item xs={12} sm={6} md={4} lg={3} alignItems={"center"} >
                        <Typography variant="subtitle1" sx={{ color: "#676767 !important", fontWeight: '600' }}>
                            User Health&nbsp;&nbsp;</Typography>
                        <Brightness1Icon sx={{ color: Math.round(props.members.health) <= 3 ? "#fa8072 " : Math.round(props.members.health) >= 4 && Math.round(props.members.health) <= 6 ? "#EDD86D" : "#6EE3AB" }} />&nbsp;
                        <Typography sx={{ fontWeight: '700' }}>
                            {props.members.health > 0 ? Math.round(props.members.health) : 0}/10
                        </Typography>
                    </Grid>
                </Grid>
            </AccordionSummary>
            <AccordionDetails sx={{ mb: 2, border:"1px solid #D8D8D8",borderBottomLeftRadius: "20px",borderBottomRightRadius:"20px"}}>
                <Grid container item xs={12} md={7.5} sx={{ pt: 2 }}>
                    {!props?.members?.mcq_info?.length || props?.accordionCardLoadingOnDateChange
                        ? <div className="h-[100%] w-[100%] flex justify-center items-center"><CircularProgress color="primary" size={25} /></div>
                        : <Grid container item >
                            {props?.members?.mcq_info?.map((option: any, index: number) => {
                                return (
                                    <Grid key={index} container item sm={4} direction={'column'} alignItems={'flex-start'}>
                                        <Grid item xs={2.5} sx={{ px: 0,mb:"1vh" }}>
                                            <Typography variant="subtitle2" sx={{ color: "#000000", fontWeight: "600" }}>{option?.mcq_title}</Typography>
                                            <Typography variant="caption" style={{ color: "#726F83", fontWeight: "400", }}>{option.mcq_description}</Typography>
                                        </Grid>
                                        <Grid item xs={4} sx={{ px: 0, pt: 0,m:0 }}>
                                            <FormControl>
                                                <RadioGroup
                                                    aria-labelledby="demo-controlled-radio-buttons-group"
                                                    name="controlled-radio-buttons-group"
                                                    sx={{ '& .MuiFormControlLabel-root': { marginBottom: "0 !important" } }}
                                                >
                                                    {
                                                        option?.mcq_options.map((item: any, index: number) => {
                                                            return (
                                                                <FormControlLabel
                                                                    key={index}
                                                                    checked={item.selected_answer ? true : false}
                                                                    value={item?.uuid}
                                                                    name={option?.mcq_title}
                                                                    onChange={(e: any) => props.handleRadioGroupValue(e, props.members.uuid, option, item)}
                                                                    control={
                                                                        <Radio
                                                                            size="small"
                                                                            defaultChecked
                                                                            sx={{py: 0.3,pr: 0.3,'&:hover':{backgroundColor:"transparent"}}}
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
            </AccordionDetails>
        </Accordion>       
    )

}