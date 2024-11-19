"use client"

import { Button, CircularProgress, Grid, Link, TextField, Typography } from "@mui/material"
import { useEffect, useRef, useState } from "react"
import SnakBarAlert from "@/components/snakbaralert/snakbaralert";
import { useRouter } from "next/navigation";
import validateEmail from "../util/emailValidators";
import { StaticMessage } from "../util/StaticMessage";

export default function RequestAndResetPassword() {
    const [LogIn, setLogIn] = useState({
        Email: '',
        otp: '',
        Password: '',
        ConfirmPassword: ''

    });
    const [errors, setErrors] = useState({
        Email: '',
        otp: '',
        Password: '',
        ConfirmPassword: ''
    });
    const uuid = useRef('');
    const [Toggle, setToggle] = useState<Boolean>(true);
    const [alertOpen, setAlertOpen] = useState(false);
    const [alert, setAlert] = useState("");
    const [alertSeverity, setAlertSeverity] = useState(false);
    const [isloading, setisLoading] = useState<Boolean>(false);
    const { push } = useRouter();

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        let error = '';
        let maxLength = 51;

        if (name === 'otp') {
            if (value.length <= 6) {
                setLogIn({ ...LogIn, [name]: value });
            }
            if (value.length > 6) {
                error = 'Please enter a valid 6-digit OTP';
            }
        } else if (value.length <= maxLength) {
            if (name === 'Email') {
                setLogIn({ ...LogIn, [name]: value });
                clearTimeout(typingTimer);
                typingTimer = setTimeout(() => {
                    handleBlur(e);
                }, 2000);
            } else {
                setLogIn({ ...LogIn, [name]: value });
            }
        } else {
            error = `${name} must be ${maxLength} characters or less`;
        }
        setErrors({ ...errors, [name]: error });
    };

    const handleBlur = (e: any) => {
        const { name, value } = e.target;
        let error = '';

        if (name === 'otp') {
            if (value.trim() === '') {
                error = 'OTP is required';
            } else if (value.length < 6) {
                error = 'Please enter a valid 6-digit OTP';
            }
        } else if (name === 'Email') {
            if (value.trim() === '') {
                error = 'Email is required';
            } else {
                const isValidEmail = validateEmail(value);
                error = !isValidEmail ? 'Please enter a valid email' : '';
            }
        } else {
            const formattedName = name
                .replace(/([A-Z])/g, ' $1')
                .trim()
                .toLowerCase()
                .replace(/^./, (str: any) => str.toUpperCase());
            error = value.trim() === '' ? `${formattedName} is required` : '';
        }
        setErrors({ ...errors, [name]: error });
    };

    let typingTimer: ReturnType<typeof setTimeout>;

    useEffect(() => {
        return () => clearTimeout(typingTimer);
    }, []);

    async function handleRequestOTP() {
        setisLoading(true);
        if (!LogIn.Email.length) {
            AlertManager("Kindly fill the field", true);
        }
        else {
            try {
                const requestAPI = await fetch(`/api/auth/request-reset-password`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: LogIn.Email,
                    }),
                });

                const apiResponse = await requestAPI.json();
                if (requestAPI.status == 200) {
                    uuid.current = apiResponse?.data?.reset_info?.uuid;
                    AlertManager(apiResponse?.message, false);
                    setToggle(false);
                }
                else {
                    AlertManager(apiResponse.message, true);
                }
            }
            catch (error) {
                AlertManager(StaticMessage.ErrorMessage, true);
            }
        }
    }

    async function setNewPassword() {
        setisLoading(true);
        if ((LogIn.Password.length && LogIn.ConfirmPassword.length) && (LogIn.Password !== LogIn.ConfirmPassword)) {
            AlertManager('Password Not Matching', true);
        }
        else if (LogIn.Email.length && LogIn.otp.length && LogIn.Password.length && LogIn.ConfirmPassword.length) {
            const requestBody: any = {
                uuid: uuid.current,
                email: LogIn.Email,
                otp: Number(LogIn.otp),
                password: LogIn.Password
            }
            try {
                const resetPwdAPI = await fetch(`/api/auth/set-new-password`, {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(requestBody),
                })
                const responseResetAPI = await resetPwdAPI.json();
                if (resetPwdAPI.status == 200) {
                    AlertManager(responseResetAPI?.message, false);
                    push('/sign-in')
                } else {
                    AlertManager(responseResetAPI?.message, true);
                }
            } catch (error) {
                AlertManager(StaticMessage.ErrorMessage, true);
            }
        }
        else {
            AlertManager('Kindly Fill All Fields', true);
        }
    }

    function AlertManager(message: string, severity: boolean) {
        setAlert(message)
        setAlertSeverity(severity)
        setAlertOpen(true)
        setisLoading(false)
    }

    return (
        <div className="ml:0 lg:ml-[17.35vw]" style={{ backgroundColor: "#F6F5FB", height: "100vh" }}>
            <Grid container item xs={12} sx={{ p: "2vh" }}>
                <Grid container item xs={12}>
                    <Typography variant="h6" align="left" sx={{ color: "#000000", fontWeight: "700" }}>
                        {Toggle ? "Request Password Reset" : "Reset Password"}
                    </Typography>
                </Grid>
                <Grid container item xs={12} sm={12} md={11} justifyContent="center" alignItems="center" sx={{ backgroundColor: "white", borderRadius: "2vh", p: "2vh" }}>
                    {Toggle ?
                        <RequestResetPassword email={LogIn.Email} handleRequestOTP={handleRequestOTP} isloading={isloading} AlertManager={AlertManager}
                            handleChange={handleChange} handleBlur={handleBlur} LogIn={LogIn} errors={errors} />
                        :
                        <ResetPassword email={LogIn.Email} OTP={LogIn.otp} password={LogIn.Password} confirmPassword={LogIn.ConfirmPassword} setNewPassword={setNewPassword} isloading={isloading} AlertManager={AlertManager}
                            handleChange={handleChange} handleBlur={handleBlur} LogIn={LogIn} errors={errors} />
                     } 
                </Grid>
            </Grid>
            <SnakBarAlert alertOpen={alertOpen} setAlertOpen={setAlertOpen} alertSeverity={alertSeverity} alert={alert} />
        </div>
    )
}


function RequestResetPassword(props: any) {
    const [alertOpen, setAlertOpen] = useState(false);
    const [alert, setAlert] = useState("");
    const [alertSeverity, setAlertSeverity] = useState(false);
    const [isLinkLoading, setIsLinkLoading] = useState(false);

    return (

        <Grid container item xs={12} sm={12} md={8} sx={{ justifyContent: "center", alignItems: "center", border: "1px solid #dedede ", borderRadius: "2vh" }} >
            <Grid item xs={11.5} sx={{ backgroundColor: "transperant", p: "0.5vh", mt: "1vh" }} >
            <Typography variant="body2" sx={{ fontWeight: "400", color: "#000000" }}>Please enter your email address below and we&apos;ll send you instructions to reset your password.</Typography>
            </Grid>
            <Grid item xs={11.5} sx={{ backgroundColor: "transperant", p: "0.5vh" }} >
                <Typography variant="caption" sx={{ fontWeight: "400", color: "#5F5F5F" }}>USERNAME/EMAIL</Typography>
                <TextField
                    fullWidth
                    sx={{ fontSize: "0.5vw" }}
                    name='Email'
                    placeholder="Enter your email address"
                    type='email'
                    size="small"
                    value={props.LogIn.Email}
                    onChange={props.handleChange}
                    onBlur={props.handleBlur}
                    error={!!props.errors.Email}
                    helperText={props.errors.Email}
                    InputProps={{
                        sx:{borderRadius: "1vh"},
                        onKeyDown: (e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                props.handleRequestOTP();
                            }
                        }
                    }}
                />
            </Grid>
            <Grid container item xs={12} justifyContent={"center"} alignItems={"center"} sx={{ backgroundColor: "transperant", p: "2vh" }}>
                <Grid item xs={10} sm={4} md={4} lg={3} sx={{ backgroundColor: "transperant" }}>
                    <Button
                        fullWidth
                        variant="contained"
                        disabled={!props.LogIn.Email}
                        sx={{ textTransform: "initial", backgroundColor: !props.LogIn.Email ? "white" : "#2A2F42 !important", borderRadius: "0.5vw", color: "#F0F2FF", fontWeight: "700" }}
                        onClick={props.handleRequestOTP}>
                        {props.isloading ?
                            <CircularProgress sx={{ color: "white" }} size={20} /> : "Send Request"}
                    </Button>
                </Grid>
            </Grid>
            <Grid container item xs={12} direction="row" justifyContent={"center"} alignItems={"center"} sx={{ p: "1vh" }} >
                <Typography variant="body2" sx={{ color: "#777777", fontWeight: "400" }} >Back to &nbsp; </Typography>
                <Link variant="body2" sx={{ fontWeight: "700", cursor: "pointer" }}
                    href={'/sign-in'} onClick={() => setIsLinkLoading(true)}>
                    <Typography variant="caption" color="primary">
                        {isLinkLoading ? <CircularProgress sx={{ color: "black" }} size={15} /> : 'Sign in'}
                    </Typography>
                    {/* Sign in */}
                </Link>
            </Grid>
        </Grid>
    )
}

function ResetPassword(props: any) {
    const [alertOpen, setAlertOpen] = useState(false);
    const [alert, setAlert] = useState("");
    const [alertSeverity, setAlertSeverity] = useState(false);

    return (
        <>
            <Grid container item xs={12} sm={12} md={8} className='drop-shadow-2xl'
                sx={{ justifyContent: "center", alignItems: "center", border: "1px solid #dedede ", borderRadius: "2vh" }} >
                <Grid item xs={11.5} sx={{ backgroundColor: "transperant", p: "0.5vh", mt: "1vh" }} >
                    <Typography variant="caption" sx={{ fontWeight: "400", color: "#5F5F5F" }}>USERNAME/EMAIL</Typography>
                    <TextField
                        fullWidth
                        placeholder="Enter your email address"
                        name="Email"
                        type='email'
                        size="small"
                        disabled
                        value={props.LogIn.Email}
                        // sx={{borderRadius:'1vh'}}
                        InputProps={{ sx: { borderRadius: "1vh"} }}
                    />
                </Grid>

                <Grid item xs={11.5} sx={{ backgroundColor: "transperant", p: "0.5vh" }} >
                    <Typography variant="caption" sx={{ fontWeight: "400", color: "#5F5F5F" }}>OTP</Typography>
                    <TextField
                        fullWidth
                        name='otp'
                        placeholder="Enter your OTP"
                        type='number'
                        size="small"
                        helperText={props.errors.otp}
                        value={props.LogIn.otp}
                        onChange={props.handleChange}
                        onBlur={props.handleBlur}
                        error={!!props.errors.otp}
                        InputProps={{ sx: { borderRadius: "1vh"} }}
                    />
                </Grid>
                <Grid item xs={11.5} sx={{ backgroundColor: "transperant", p: "0.5vh" }} >
                    <Typography variant="caption" sx={{ fontWeight: "400", color: "#5F5F5F" }}>NEW PASSWORD</Typography>
                    <TextField
                        fullWidth
                        placeholder="Enter your a new password"
                        name='Password'
                        type='password'
                        size="small"
                        helperText={props.errors.Password}
                        value={props.LogIn.Password}
                        onChange={props.handleChange}
                        onBlur={props.handleBlur}
                        error={!!props.errors.Password}
                        InputProps={{ sx: { borderRadius: "1vh"} }}
                    />
                </Grid>
                <Grid item xs={11.5} sx={{ backgroundColor: "transperant", p: "0.5vh" }} >
                    <Typography variant="caption" sx={{ fontWeight: "400", color: "#5F5F5F" }}>CONFIRM PASSWORD</Typography>
                    <TextField
                        fullWidth
                        placeholder="Enter your confirm password"
                        name='ConfirmPassword'
                        type='password'
                        size="small"
                        helperText={props.errors.ConfirmPassword}
                        value={props.LogIn.ConfirmPassword}
                        onChange={props.handleChange}
                        onBlur={props.handleBlur}
                        error={!!props.errors.ConfirmPassword}
                        InputProps={{ sx: { borderRadius: "1vh"} }}
                    />
                </Grid>
                <Grid container item xs={12} justifyContent={"center"} alignItems={"center"} sx={{ backgroundColor: "transperant", p: "2vh" }}>
                    <Grid item xs={10} sm={4} md={4} lg={3} sx={{ backgroundColor: "transperant" }}>
                        <Button fullWidth variant="contained"
                            // disabled={ !props.LogIn.otp || !props.LogIn.Password || !props.LogIn.confirmPassword || !props.LogIn.Email}
                            disabled={!props.LogIn.otp || !props.LogIn.Password || !props.LogIn.ConfirmPassword}
                            sx={{ textTransform: "initial", backgroundColor: !props.LogIn.otp || !props.LogIn.Password || !props.LogIn.ConfirmPassword ? "white" : "#2A2F42 !important", borderRadius: "0.5vw", color: "#F0F2FF", fontWeight: "700" }}
                            onClick={props.setNewPassword}>
                            {props.isloading ?
                                <CircularProgress sx={{ color: "white" }} size={20} /> : "Save Changes"}</Button><br />
                    </Grid>
                </Grid>
            </Grid>
        </>
    )
}