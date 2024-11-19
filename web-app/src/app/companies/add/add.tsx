'use client'
import { Button, Grid, TextField, Typography, CircularProgress } from "@mui/material";
import SnakBarAlert from "@/components/snakbaralert/snakbaralert";
import React, { useState } from 'react'
import BackDropLoading from '@/components/loading/backDropLoading';
import { useRouter } from 'next/navigation';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { StaticMessage } from "@/app/util/StaticMessage";

export default function AddCompany(props: any) {
    const [alertOpen, setAlertOpen] = useState(false);
    const [alert, setAlert] = useState("");
    const [alertSeverity, setAlertSeverity] = useState(false);
    const [Loader, setLoader] = useState(false);
    const [saveBtnLoader, setSaveBtnLoader] = useState(false);
    const [isLoading, setisLoading] = useState(false);
    const { push } = useRouter();
    const [formData, setFormData] = useState({ CompanyName: '' });
    const [errors, setErrors] = useState({ CompanyName: '' });

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        let error = '';
        let maxLength = 50;
        let truncatedValue = value.length > maxLength ? value.slice(0, maxLength) : value;
        setFormData({ ...formData, [name]: truncatedValue });
        if (value.length > maxLength) {
            const formattedName = name
                .replace(/([A-Z])/g, ' $1')
                .trim()
                .toLowerCase()
                .replace(/^./, (str: any) => str.toUpperCase());
            error = `${formattedName} must be ${maxLength} characters or less`;
        }
        setErrors({ ...errors, [name]: error });
    };

    const handleBlur = (e: any) => {
        const { name, value } = e.target;
        let error = '';
        const formattedName = name
            .replace(/([A-Z])/g, ' $1')
            .trim()
            .toLowerCase()
            .replace(/^./, (str: any) => str.toUpperCase());
        error = value.trim() === '' ? `${formattedName} is required` : '';
        setErrors({ ...errors, [name]: error });

    };

    //SAVE BUTTON API CALL
    const handleSave = async (e: any) => {
        const requestBody = {
            company_name: formData.CompanyName,
        }
        if (!formData.CompanyName.length) {
            AlertManager("Kindly fill all fields", true);
        }
        else {
            setSaveBtnLoader(true)
            try {
                const res = await fetch(`/api/company`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(requestBody),
                });
                const result = await res.json();
                if (res.status == 200) {
                    push("/companies");
                    setSaveBtnLoader(false);
                }
                else {
                    AlertManager(result?.message, true)
                    setSaveBtnLoader(false);
                }
            }
            catch (error: any) {
                AlertManager(StaticMessage.ErrorMessage, true);
            }
        }
    }

    function AlertManager(message: string, severity: boolean) {
        setAlert(message)
        setAlertSeverity(severity)
        setAlertOpen(true)
        setisLoading(false);
        setSaveBtnLoader(false);
    }

    return (
        <div className="ml:0 lg:ml-[17.35vw]" style={{ backgroundColor: "#F6F5FB", paddingBottom: '5vh', minHeight: '100vh' }}>
            <Grid container item xs={12} justifyContent={'flex-start'} alignItems={'center'} sx={{ pt: 3, pb: 1, pl: 3, pr: 10 }}>
                <Grid container item xs={12} lg={6} alignItems={'center'}>
                    <BreadCrumComponent push={push} formData={formData} />
                </Grid>
            </Grid>
            <Grid container item xs={12} justifyContent={'flex-start'} alignItems={'center'} sx={{ pl: 3 }}>
                {props.addCompanyAction[1].read &&
                    <Grid container item xs={11.5} alignItems={'center'} justifyContent={'center'} sx={{ backgroundColor: 'white', borderRadius: '2vh', p: 3, }} >
                        {/* <Grid container justifyContent={"flex-end"} alignItems={"center"}  >
                            <Grid item xs={12} sm={4} md={3.5} lg={2.8} sx={{ m: "1vh" }}>
                                {props.addCompanyAction[0].create &&
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        sx={{ backgroundColor: "#2A2F42", borderRadius: "1vh", color: "#F0F2FF", fontWeight: "700", '&:hover': { backgroundColor: '#2A2F42' } }}
                                    >
                                        {Loader ? <> &nbsp; <CircularProgress sx={{ color: "white" }} size={20} />
                                        </> : <><Typography sx={{ textTransform: "initial" }}>Import from THINKIFIC</Typography></>}
                                    </Button>
                                }
                            </Grid>
                        </Grid> */}

                        <Grid container item xs={12} justifyContent={'center'} alignItems={'flex-start'} sx={{ pt: 2, pb: 2 }}>
                            <Grid container item xs={11.7} sm={11} md={8} lg={7} justifyContent={'center'} sx={{ border: "1px solid #dedede", borderRadius: "2vh", p: 2 }}>
                                <Grid item xs={12} sx={{ color: "#777", m: "1vh" }}>
                                    <Typography variant="body1" sx={{ textTransform: "uppercase" }}>Company Name</Typography>
                                    <TextField
                                        fullWidth
                                        placeholder="Enter a company name"
                                        name='CompanyName'
                                        type='text'
                                        size="small"
                                        value={formData.CompanyName}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={!!errors.CompanyName}
                                        helperText={errors.CompanyName}
                                        InputProps={{ sx: { borderRadius: "1vh", color: "#2A2F42", maxLength: 51 } }}
                                    />
                                </Grid>
                                <Grid container item xs={12} sx={{ color: "#777", m: "1vh", backgroundColor: "transparent" }} direction={'row'} justifyContent={"center"} alignItems={"center"}>
                                    <Grid container item xs={12} sm={11} md={12} lg={11} justifyContent={'center'} >
                                        <Grid item xs={10} sm={4} sx={{ m: "1vh" }}>
                                            {props.addCompanyAction[0].create &&
                                                <Button
                                                    fullWidth
                                                    variant="contained"
                                                    disabled={!formData.CompanyName}
                                                    sx={{ backgroundColor: !formData.CompanyName ? "white" : "#2A2F42", borderRadius: "1vh", color: "#F0F2FF", fontWeight: "700", '&:hover': { backgroundColor: '#2A2F42' } }}
                                                    onClick={handleSave}
                                                >
                                                    {saveBtnLoader ? <> &nbsp; <CircularProgress sx={{ color: "white" }} size={20} />
                                                    </> : "Add Company"}
                                                </Button>
                                            }
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                }
            </Grid>
            <SnakBarAlert alertOpen={alertOpen} setAlertOpen={setAlertOpen} alertSeverity={alertSeverity} alert={alert} />
            <BackDropLoading isLoading={isLoading} />
        </div >
    )
}

//Breadcrum component
const BreadCrumComponent = ({ push }: any) => {
    return (
        <>
            <Typography variant="h6" sx={{ fontWeight: '600', cursor: 'pointer' }} onClick={(() => push("/companies"))}>All Companies</Typography>
            <KeyboardArrowRightIcon />
            <Typography variant="subtitle1" sx={{ fontWeight: '500', }} >Add Company</Typography>
        </>
    )
}