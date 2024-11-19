"use client";

import React, { useEffect, useRef, useState } from "react";
import { signIn } from "next-auth/react";
import { Button, Checkbox, CircularProgress, Grid, Link, TextField, Typography } from "@mui/material";
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import SnakBarAlert from "@/components/snakbaralert/snakbaralert";
import { useRouter } from "next/navigation";
import { getSession } from "next-auth/react"
import { getCookie, setCookie } from "cookies-next";
import validateEmail from "../util/emailValidators";
import { fetchMeUpcomingForumUUID } from "@/redux/reducers/forumExperience/forumExperienceSlice";


export default function SignIn(props: any) {
    const dispatch = useAppDispatch();
    const { push } = useRouter();
    const [LogIn, setLogIn] = useState({
        Email: '',
        Password: '',
    });
    const [errors, setErrors] = useState({
        Email: '',
        Password: ''
    });
    const [alertOpen, setAlertOpen] = useState(false);
    const [alert, setAlert] = useState("");
    const [alertSeverity, setAlertSeverity] = useState(false);
    const [isloading, setisLoading] = useState<Boolean>(false);
    const [isLinkLoading, setIsLinkLoading] = useState(false);
    const [isLinkForgotLoading, setIsLinkForgotLoading] = useState(false);

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        let error = '';
        let maxLength = 50;
        if (value.length <= maxLength) {
            if (name === 'Email') {
                setLogIn({ ...LogIn, [name]: value });
                clearTimeout(typingTimer);
                typingTimer = setTimeout(() => {
                    handleBlur(e);
                }, 1000);
            }
            setLogIn({ ...LogIn, [name]: value });
        } else {
            error = `${name} must be ${maxLength} characters or less`;
        }
        setErrors({ ...errors, [name]: error });
    };

    const handleBlur = (e: any) => {
        const { name, value } = e.target;
        let error = '';
        if (name === 'Email') {
            if (value.trim() === '') {
                error = value.trim() === '' ? `${name} is required` : '';
            } else {
                const isValidEmail = validateEmail(value);
                error = !isValidEmail ? 'Please enter a valid email' : '';
            }
        } else {
            error = value.trim() === '' ? `${name} is required` : '';
        }
        setErrors({ ...errors, [name]: error });
    };

    let typingTimer: ReturnType<typeof setTimeout>;

    useEffect(() => {
        return () => clearTimeout(typingTimer);
    }, []);


    const onSubmit = async () => {
        setisLoading(true);
        if (!LogIn.Email.length || !LogIn.Password.length) {
            AlertManager("kindly fill all fields", true);
        }
        else {
            const result = await signIn("credentials", {
                email: LogIn.Email,
                password: LogIn.Password,
                redirect: false,  // Change this to false
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
                // Display the error message in an alert dialog
                AlertManager(errorMessage, true);
            } else {
                // If there's no error, redirect to the home page
                const session = await getSession();
                var auth_info: any = session?.user;
                setCookie("forum_access_token", auth_info?.data?.auth_info, {});
                await dispatch(fetchMeUpcomingForumUUID());

                if (props?.searchParams?.path_name?.length) {
                    return push(`${props?.searchParams?.path_name}${props?.searchParams?.params ? props?.searchParams?.params : ''}`);
                } else {
                    var upcoming_forum_uuid = getCookie("upcoming_forum_uuid")
                    if (upcoming_forum_uuid !== 'null') {
                        return push(`/forum_experience?forum_uuid=${upcoming_forum_uuid}`);
                    }
                    return push("/forums");
                }
            }
        };
    }

    const handleLinkClick = () => {
        setIsLinkForgotLoading(true);
        setTimeout(() => {
            setIsLinkForgotLoading(false);
        }, 500 * 1000); 
    };

    function AlertManager(message: string, severity: boolean) {
        setAlert(message)
        setAlertSeverity(severity)
        setAlertOpen(true)
        setisLoading(false)
        setIsLinkLoading(false)
        setIsLinkForgotLoading(false)
    }



    return (
        <div className="ml:0 lg:ml-[17.35vw]" style={{ backgroundColor: "#F6F5FB", height: "100vh" }}>
            <Grid container item xs={12} sx={{ p: "2vh" }}>
                <Grid container item xs={12}>
                    <Typography variant="h6" align="left" sx={{ fontWeight: 900 }}>
                        Log in to your account
                    </Typography>
                </Grid>
                <Grid container item xs={12} sm={12} md={11} justifyContent="center" alignItems="center" sx={{ backgroundColor: "white", borderRadius: "2vh", p: "2vh" }}>
                    <Grid container item xs={12} sm={10} md={8} lg={8} sx={{ borderRadius: '2vh', border: "1px solid #dedede", padding: "3vh" }}>
                        <Grid item xs={12} sx={{ color: "#777", m: "1vh" }}>
                            <Typography variant="caption">USERNAME/EMAIL</Typography>
                            <TextField
                                fullWidth
                                placeholder="Enter your email address"
                                name="Email"
                                type="email"
                                size="small"
                                value={LogIn.Email}
                                error={!!errors.Email}
                                helperText={errors.Email}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                sx={{ color: "#2A2F42" }}
                                InputProps={{ sx: { borderRadius: "1vh", color: "#2A2F42", maxLength: 51 } }}
                            />
                        </Grid>
                        <Grid item xs={12} sx={{ color: "#777", m: "1vh" }}>
                            <Typography variant="caption">PASSWORD</Typography>
                            <TextField
                                fullWidth
                                placeholder="Enter a password"
                                name="Password"
                                type="password"
                                size="small"
                                value={LogIn.Password}
                                error={!!errors.Password}
                                helperText={errors.Password}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                sx={{ color: "#2A2F42" }}
                                InputProps={{
                                    sx: { borderRadius: "1vh", color: "#2A2F42" },
                                    onKeyDown: (e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            onSubmit();
                                        }
                                    }
                                }}
                            />
                        </Grid>
                        <Grid container direction="row" justifyContent="flex-end" alignItems="center" >
                            <Link href="/reset-password" onClick={handleLinkClick} >
                                <Typography variant="caption" color="primary">
                                    {isLinkForgotLoading ? <CircularProgress sx={{ color: "black" }} size={15} /> : 'Reset Password?'}

                                    {/* Forgot Password? */}
                                </Typography>
                            </Link>
                        </Grid>
                        {/* <Grid container direction="row" justifyContent="flex-start" alignItems="center" sx={{ color: "#777" }}>
                            <Grid item>
                                <Checkbox color="primary" sx={{
                                    color: "#D8D8D8",
                                    '&.Mui-checked': {
                                        color: " #D8D8D8",
                                    },
                                    '& .MuiSvgIcon-root': { fontSize: "2.5vh" }
                                }} />
                            </Grid>
                            <Grid item xs={8} sm={6}>
                                <Typography variant="caption">Remember me</Typography>
                            </Grid>
                        </Grid> */}
                        <Grid container direction="row" justifyContent="center" alignItems="center" >
                            <Grid item xs={10} sm={4} md={4} lg={3}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    onClick={onSubmit}
                                    disabled={!LogIn.Email || !LogIn.Password}
                                    sx={{ backgroundColor: !LogIn.Email || !LogIn.Password ? "white" : "#2A2F42 !important", textTransform: "initial", borderRadius: "1vh" }}
                                >
                                    {isloading ? (
                                        <CircularProgress sx={{ color: 'white' }} size={20} />
                                    ) : (
                                        'Sign in'
                                    )}
                                </Button>
                            </Grid>
                        </Grid>
                        {/* <Grid container item xs={12} justifyContent="center" alignItems="center" sx={{ color: "#777", mt: "2vh" }}>
                            <Typography variant="caption">Don&apos;t have an account yet?</Typography>
                            <Link href="/sign-up" sx={{ ml: 1 }} onClick={() => setIsLinkLoading(true)}>
                                <Typography variant="caption" color="primary">
                                    {isLinkLoading ? <CircularProgress sx={{ color: "black" }} size={15} /> : 'Sign Up'}
                                </Typography>
                            </Link>
                        </Grid> */}
                    </Grid>
                </Grid>
            </Grid>
            <SnakBarAlert alertOpen={alertOpen} setAlertOpen={setAlertOpen} alertSeverity={alertSeverity} alert={alert} />
        </div>

    )
}
