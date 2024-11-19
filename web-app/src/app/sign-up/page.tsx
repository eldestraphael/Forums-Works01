"use client"

import { styled } from '@mui/material/styles';
import { signIn } from "next-auth/react";
import React, { useRef, useState } from "react";
import { Button, Grid, Link, TextField, Typography, CircularProgress } from "@mui/material";
import SnakBarAlert from "@/components/snakbaralert/snakbaralert";
import BackDropLoading from '@/components/loading/backDropLoading';
import validateEmail from '../util/emailValidators';

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

export default function SignUp() {
    const firstname = useRef("");
    const lastname = useRef("");
    const email = useRef("");
    const pass = useRef("");
    const phone = useRef("");
    const jobTitle = useRef("");
    const companyName = useRef("");
    const [alertOpen, setAlertOpen] = useState(false);
    const [alert, setAlert] = useState("");
    const [alertSeverity, setAlertSeverity] = useState(false);
    const [isLoading, setisLoading] = useState(false);
    const [isBtnLoader, setisBtnLoader] = useState(false);
    const [isUploadLoader, setisUploadLoader] = useState(false);
    const [isLinkLoading, setIsLinkLoading] = useState(false);

    const handleFileUpload = async (e: any) => {
        setisUploadLoader(true)
        try {
            if (e.target.files[0]) {
                const formData = new FormData();
                formData.append("file", e.target.files[0]);

                const res = await fetch('api/auth/sign-up-with-csv', {
                    method: "POST",
                    body: formData,

                });
                const data = await res.json();
                e.target.value = null
                if (res.status == 200) {
                    AlertManager(`${data?.message}. redirecting..`, false);
                    setTimeout(function () {
                        window.location.replace("/sign-in");
                    }, 5000); // 5000 milliseconds = 5 seconds
                }
                else {
                    e.target.value = null
                    throw { res, data };
                }
                setisUploadLoader(false)
            }
        } catch (err: any) {
            if (err?.response?.status) {
                AlertManager(`Error : ${err?.data?.message}`, true);
            } else {
                AlertManager(`Unable to proccess the req now.`, true);
            }
        }
    };

    const onSubmit = async () => {
        setisBtnLoader(true)
        const res = await fetch(`/api/auth/sign-up`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                first_name: firstname.current,
                last_name: lastname.current,
                email: email.current,
                password: pass.current,
                phone: phone.current,
                job_title: jobTitle.current,
                company_name: companyName.current
            }),
        });

        const user = await res.json();
        if (res.status == 500 || res.status == 422) {
            AlertManager(user?.message, true);
        }
        else if (res.status == 200) {
            AlertManager("Successfully Registered User", false)
            const result = await signIn("credentials", {
                email: email.current,
                password: pass.current,
                redirect: false,  // Change this to false
                callbackUrl: "/home",
            });

            if (!result?.ok) {
                let errorMessage;
                switch (result?.error) {
                    case 'CredentialsSignin':
                        errorMessage = 'Invalid username or password.';
                        break;
                    // Add more cases as needed
                    default:
                        errorMessage = 'An unknown error occurred.';
                }
                AlertManager(errorMessage, true);
            } else {
                window.location.replace("/home");
            }
        }
        setisBtnLoader(false)

    };

    function AlertManager(message: string, severity: boolean) {
        setAlert(message)
        setAlertSeverity(severity)
        setAlertOpen(true)
    }

    return (
        <>
            <div className="ml:0 lg:ml-[17.35vw]" style={{ backgroundColor: "#F6F5FB", height: "100vh", }} >
                <Grid container item xs={12} sx={{ p: "2vh" }}>
                    <Grid container item xs={12}>
                        <Typography variant="h6" align="left" sx={{ fontWeight: 900 }}>
                            Sign Up
                        </Typography>
                    </Grid>
                    <Grid container item xs={12} sm={12} md={11} justifyContent={'center'} alignItems={'center'} sx={{ backgroundColor: 'white', borderRadius: "2vh", p: "1vh" }}>
                        <Grid container item xs={12} sm={11} md={8} sx={{ backgroundColor: 'white', border: "1px solid #dedede", borderRadius: '2vh', padding: "2vh" }}>
                            <Grid container item xs={12} direction={'column'} sx={{ backgroundColor: 'white', m: "1vh" }}>
                                <Typography variant="caption" sx={{ color: "#5F5F5F" }}>FIRST NAME</Typography>
                                <TextField
                                    fullWidth
                                    placeholder="Enter your first name"
                                    type='text'
                                    size="small"

                                    onChange={(e) => {
                                        if (e.target.value.length <= 50) {
                                            (firstname.current = e.target.value)
                                        } else {
                                            AlertManager('Please enter 50 characters', true)
                                        }
                                    }}
                                    InputProps={{ sx: { borderRadius: "1vh", color: "#2A2F42" } }}

                                />
                            </Grid>
                            <Grid container item xs={12} direction={'column'} sx={{ backgroundColor: 'white', m: "1vh" }}>
                                <Typography variant="caption" sx={{ color: "#5F5F5F" }}>LAST NAME</Typography>
                                <TextField
                                    placeholder="Enter your Last name"
                                    type='email'
                                    size="small"

                                    onChange={(e) => {
                                        if (e.target.value.length <= 50) {
                                            (lastname.current = e.target.value)
                                        } else {
                                            AlertManager('Please enter 50 characters', true)
                                        }
                                    }}
                                    InputProps={{ sx: { borderRadius: "1vh", color: "#2A2F42" } }}
                                />
                            </Grid>
                            <Grid container item xs={12} direction={'column'} sx={{ backgroundColor: 'white', m: "1vh" }}>
                                <Typography variant="caption" sx={{ color: "#5F5F5F" }}>EMAIL</Typography>
                                <TextField
                                    placeholder="Enter your email address"
                                    type='email'
                                    size="small"

                                    onChange={(e) => {
                                        const emailVal: boolean = validateEmail(e.target.value);
                                        if (emailVal) {
                                            if (e.target.value.length <= 50) {
                                                email.current = e.target.value;
                                            } else {
                                                AlertManager('Please enter 50 characters', true);
                                            }
                                        } else {
                                            AlertManager('Please enter a valid email', true);

                                        }
                                    }}
                                    InputProps={{ sx: { borderRadius: "1vh", color: "#2A2F42" } }}
                                />
                            </Grid>
                            <Grid container item xs={12} direction={'column'} sx={{ backgroundColor: 'white', m: "1vh" }}>
                                <Typography variant="caption" sx={{ color: "#5F5F5F" }}>PASSWORD</Typography>
                                <TextField
                                    placeholder="Enter your password"
                                    type='password'
                                    size="small"

                                    onChange={(e) => {
                                        if (e.target.value.length <= 50) {
                                            (pass.current = e.target.value)
                                        } else {
                                            AlertManager('Please enter 50 characters', true)
                                        }
                                    }}
                                    InputProps={{ sx: { borderRadius: "1vh", color: "#2A2F42" } }}
                                />
                            </Grid>
                            <Grid container item xs={12} direction={'column'} sx={{ backgroundColor: 'white', m: "1vh" }}>
                                <Typography variant="caption" sx={{ color: "#5F5F5F" }}>COMPANY NAME</Typography>
                                <TextField
                                    placeholder="Enter your company name"
                                    type='text'
                                    size="small"

                                    onChange={(e) => {
                                        if (e.target.value.length <= 50) {
                                            (companyName.current = e.target.value)
                                        } else {
                                            AlertManager('Please enter 50 characters', true)
                                        }
                                    }}
                                    InputProps={{ sx: { borderRadius: "1vh", color: "#2A2F42" } }}
                                />
                            </Grid>
                            <Grid container item xs={12} direction={'column'} sx={{ backgroundColor: 'white', m: "1vh" }}>
                                <Typography variant="caption" sx={{ color: "#5F5F5F" }}>JOB TITLE</Typography>
                                <TextField
                                    placeholder="Enter your job title"
                                    type='text'
                                    size="small"

                                    onChange={(e) => {
                                        if (e.target.value.length <= 50) {
                                            (jobTitle.current = e.target.value)
                                        } else {
                                            AlertManager('Please enter 50 characters', true)
                                        }
                                    }}
                                    InputProps={{ sx: { borderRadius: "1vh", color: "#2A2F42" } }}
                                />
                            </Grid>
                            <Grid container item xs={12} direction={'column'} sx={{ backgroundColor: 'white', m: "1vh" }}>
                                <Typography variant="caption" sx={{ color: "#5F5F5F" }}>PHONE</Typography>
                                <TextField
                                    placeholder="Enter your phone number"
                                    type='number'
                                    size="small"

                                    onChange={(e) => {
                                        if (e.target.value.length <= 10) {
                                            (phone.current = e.target.value)
                                        } else {
                                            AlertManager('Please enter 10 digit numbers', true)
                                        }
                                    }}
                                    InputProps={{ sx: { borderRadius: "1vh", color: "#2A2F42" } }}
                                />
                            </Grid>
                            <Grid container item xs={12} justifyContent={'center'} alignItems={'center'} direction={'row'} sx={{ backgroundColor: 'white', py: '2vh' }}>
                                <Grid container item xs={12} sm={6} md={7} justifyContent={'space-between'}>
                                    <Grid item xs={5.7}>
                                        <Button variant="contained" fullWidth disabled onClick={onSubmit} sx={{ textTransform: "initial", borderRadius: "1vh !important", color: "#F0F2FF !important" }}>
                                            {isBtnLoader ? <> <CircularProgress sx={{ color: 'white' }} size={20} />
                                            </> : "Sign Up"}
                                        </Button>
                                    </Grid>
                                    <Grid item xs={5.7} justifyContent={'flex-end'}>
                                        <Button variant="contained" fullWidth component="label" sx={{ textTransform: "initial", backgroundColor: "#2A2F42 !important", borderRadius: "1vh", color: "#F0F2FF !important" }}>
                                            <VisuallyHiddenInput type="file" accept="xlsx" onChange={handleFileUpload} />
                                            {isUploadLoader ? <> Uploading &nbsp;&nbsp; <CircularProgress sx={{ color: 'white' }} size={20} />
                                            </> : "Upload File"}
                                        </Button>
                                    </Grid>
                                </Grid>
                                <Grid container xs={12} justifyContent="center" alignItems="center" sx={{ color: "#777", mt: "2vh" }}>
                                    <Typography variant="body2">Already have an account?&nbsp;&nbsp;</Typography>
                                    <Link href="/sign-in" sx={{ ml: 1 }}  onClick={() => setIsLinkLoading(true)} >
                                        <Typography variant="body2" color="primary">
                                            {isLinkLoading ? <CircularProgress sx={{ color: "black" }} size={15} /> : 'Sign In'}
                                        </Typography>
                                    </Link>
                                </Grid>

                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </div>

            <SnakBarAlert alertOpen={alertOpen} setAlertOpen={setAlertOpen} alertSeverity={alertSeverity} alert={alert} />
            <BackDropLoading isLoading={isLoading} />
        </>
    )
}