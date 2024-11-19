"use client"

import React, { useEffect, useState } from "react";
import { Autocomplete, Avatar, Button, CircularProgress, Grid, TextField, Typography, Link } from "@mui/material";
import SnakBarAlert from "@/components/snakbaralert/snakbaralert";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import BackDropLoading from "@/components/loading/backDropLoading";
import { useRouter } from 'next/navigation';
import validateEmail from "@/app/util/emailValidators";
import { useSelector } from "react-redux";
import { StaticMessage } from "@/app/util/StaticMessage";


export default function CreateMember(props: any) {

    const [formData, setFormData] = useState({
        FirstName: '',
        LastName: '',
        Email: '',
        Phone: '',
        JobTitle: '',
    });
    const [errors, setErrors] = useState({
        FirstName: '',
        LastName: '',
        Email: '',
        Phone: '',
        JobTitle: '',
        Forum: ''
    });
    const [alertOpen, setAlertOpen] = useState(false);
    const [alert, setAlert] = useState("");
    const [alertSeverity, setAlertSeverity] = useState(false);
    const [isloading, setisLoading] = useState<Boolean>(false);
    const [isBtnloading, setBtnIsLoading] = useState<Boolean>(false);
    const [filteredCompanyNames, setFilteredCompanyNames] = useState<any>([]);
    const [filteredForumNames, setFilteredForumNames] = useState([]);
    const [companyValue, setCompanyValue] = useState<any>(null);
    const [forumValue, setforumValue] = useState<any>([]);
    const [memberInfo, setMemberInfo] = useState<any>([]);
    const [selectedForumError, setSelectedForumError] = useState(false);
    const [selectedCompanyError, setSelectedCompanyError] = useState(false);
    const { push } = useRouter();
    const forum_name = useSelector((state: any) => state.forumName.forumNameValue)

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        let error = '';
        let maxLength = 50;

        if (name === 'Phone') {
            if (value.length <= 15) {
                setFormData({ ...formData, [name]: value });
                clearTimeout(typingTimer);
                typingTimer = setTimeout(() => {
                    handleBlur(e);
                }, 1000);
            }
            else {
                error = 'Please enter 10 to 15 digits';
            }
        } else {
            if (value.length <= maxLength) {
                if (name === 'Email') {
                    setFormData({ ...formData, [name]: value });
                    clearTimeout(typingTimer);
                    typingTimer = setTimeout(() => {
                        handleBlur(e);
                    }, 1000);

                }
                setFormData({ ...formData, [name]: value });
            } else {
                error = `${name} must be ${maxLength} characters or less`;
            }
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
        } else if (name === 'Phone') {
            error = value.length > 15 ? 'Please enter 10 to 15 digits phone number' : '';
            error = value.length < 10 ? 'Please enter 10 to 15 digits phone number' : '';
        } else {
            error = value.trim() === '' ? `${name} is required` : '';
        }
        setErrors({ ...errors, [name]: error });
    };

    let typingTimer: ReturnType<typeof setTimeout>;

    useEffect(() => {
        return () => clearTimeout(typingTimer);
    }, []);


    async function handleSaveMember() {

        if (!formData.FirstName.length || !formData.Email.length || !formData.JobTitle.length || !forumValue.length || companyValue == null || formData.Phone.length < 10) {
            if (formData.Phone.length < 10) {
                return AlertManager('Please enter 10 to 15 digits phone number', true)
            }
            AlertManager("kindly fill all fields", true);
        }
        else {
            setBtnIsLoading(true);
            try {
                let requestBody = {
                    first_name: formData.FirstName,
                    last_name: formData.LastName,
                    email: formData.Email,
                    phone: formData.Phone,
                    job_title: formData.JobTitle,
                    company_uuid: companyValue.uuid,
                    forums_info: forumValue.map((item: any) => {
                        return { uuid: item.uuid }
                    })
                }
                const requestSaveMemberAPI = await fetch(`/api/admin/member`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(
                        requestBody
                    ),
                });

                const apiResponse = await requestSaveMemberAPI.json();
                if (requestSaveMemberAPI.status == 200) {
                    setMemberInfo(apiResponse?.data);
                    setBtnIsLoading(true);
                    push(`/admin/forum/${props.params.forum_uuid}/members`)
                }
                else {
                    AlertManager(apiResponse?.message, true);
                }
            }
            catch (error) {
                AlertManager(StaticMessage.ErrorMessage,true);
            }
        }
    }

    function AlertManager(message: string, severity: boolean) {
        setAlert(message)
        setAlertSeverity(severity)
        setAlertOpen(true)
        setisLoading(false);
        setBtnIsLoading(false);
    }

    async function forumSearchAPI() {
        const searchWord = "";
        try {
            const requestForumSearchAPI = await fetch(`/api/admin/forum/search?q=${searchWord}`, {
                method: "GET",
                cache: 'no-store',
                headers: {
                    "Content-Type": "application/json",
                },

            });
            const searchApiResponse = await requestForumSearchAPI.json();
            const updatedItems = searchApiResponse?.data.map((item: any) => {
                return { label: item.forum_name, uuid: item.uuid };
            });
            setFilteredForumNames(updatedItems);
            setisLoading(false);

        }
        catch (error: any) {
            AlertManager(StaticMessage.ErrorMessage,true);
        }
    }

    async function CompanySearchAPI() {
        const searchWord = "";
        try {
            const requestCompanySearchAPI = await fetch(`/api/admin/company/search?q=${searchWord}`, {
                method: "GET",
                cache: 'no-store',
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const searchApiResponse = await requestCompanySearchAPI.json();
            const updatedItems = searchApiResponse?.data.map((item: any) => {
                return { label: item.company_name, uuid: item.uuid };
            });
            setFilteredCompanyNames(updatedItems);

        }
        catch (error) {
            AlertManager(StaticMessage.ErrorMessage,true);
        }

    }

    useEffect(() => {
        setisLoading(true);
        CompanySearchAPI();
        forumSearchAPI();
    }, [])



    return (
        <>
            <div className="ml:0 lg:ml-[17.35vw]" style={{ backgroundColor: "#F6F5FB", paddingBottom: '5vh' }}>
                <Grid container item xs={12} justifyContent={'flex-start'} alignItems={'center'} sx={{ pt: 3, pb: 1, pl: 3 }}>
                    <Grid container item xs={11.5} alignItems={'center'} >
                        <BreadCrumComponent push={push} params={props?.params} forum_name={forum_name} />
                    </Grid>
                </Grid>
                <Grid container item xs={12} justifyContent={'flex-start'} alignItems={'center'} sx={{ pl: 3, backgroundColor: "transperant" }}>
                    <Grid container item xs={11.5} sm={11} md={10} alignItems={'center'} justifyContent={'center'} direction={'column'} sx={{ backgroundColor: 'white', borderRadius: '1vh', py: 2 }} >
                        <Grid container item xs={12} justifyContent={'center'} alignItems={'flex-start'} sx={{ pt: 2 }}>
                            <Grid container item xs={11.7} sm={11} md={8.2} lg={7.2} justifyContent={'center'} alignItems={"center"} sx={{ border: "1px solid #dedede", borderRadius: "2vh", p: 2 }}>
                                <Grid container item md={12} sx={{ color: "#777", m: "1vh", backgroundColor: "transperant" }} justifyContent={'space-between'} alignItems={'flex-start'}>
                                    <Grid container item xs={12} sm={5.7} direction={'column'} sx={{ backgroundColor: 'transperant', }}>
                                        <Typography variant="caption" sx={{ color: "#5F5F5F" }}>FIRST NAME</Typography>
                                        <TextField
                                            fullWidth
                                            name="FirstName"
                                            type='text'
                                            size="small"
                                            placeholder="Enter First Name"
                                            value={formData.FirstName}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            helperText={errors.FirstName}
                                            error={!!errors.FirstName}
                                            sx={{ color: "#2A2F42" }}
                                            InputProps={{ sx: { borderRadius: "1vh", color: "#2A2F42", maxLength: 51 } }}

                                        />
                                    </Grid>
                                    <Grid container item xs={12} sm={5.7} direction={'column'} justifyContent={'flex-end'} sx={{ backgroundColor: 'white', }}>
                                        <Typography variant="caption" sx={{ color: "#5F5F5F" }}>LAST NAME</Typography>
                                        <TextField
                                            fullWidth
                                            name="LastName"
                                            type='text'
                                            size="small"
                                            placeholder="Enter Last Name"
                                            value={formData.LastName}
                                            onChange={handleChange}
                                            helperText={errors.LastName}
                                            error={!!errors.LastName}
                                            sx={{ color: "#2A2F42" }}
                                            InputProps={{ sx: { borderRadius: "1vh", color: "#2A2F42", maxLength: 51 } }}

                                        />
                                    </Grid>
                                    <Grid item xs={12} sx={{ color: "#777", my: "1vh", backgroundColor: "transperant" }}>
                                        <Typography variant="caption">JOB TITLE</Typography>
                                        <TextField
                                            fullWidth
                                            name="JobTitle"
                                            type='text'
                                            size="small"
                                            placeholder="Job Title"
                                            value={formData.JobTitle}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={!!errors.JobTitle}
                                            helperText={errors.JobTitle}
                                            InputProps={{ sx: { borderRadius: "1vh", color: "#2A2F42", maxLength: 51 } }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sx={{ color: "#777", my: "1vh" }}>
                                        <Typography variant="caption">EMAIL</Typography>
                                        <TextField
                                            fullWidth
                                            name='Email'
                                            placeholder="Email Address"
                                            type='email'
                                            size="small"
                                            value={formData.Email}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={!!errors.Email}
                                            helperText={errors.Email}
                                            InputProps={{ sx: { borderRadius: "1vh", color: "#2A2F42", maxLength: 51 } }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sx={{ color: "#777", my: "1vh" }}>
                                        <Typography variant="caption">PHONE</Typography>
                                        <TextField
                                            fullWidth
                                            name="Phone"
                                            placeholder="Phone"
                                            type='number'
                                            size="small"
                                            value={formData.Phone}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={!!errors.Phone}
                                            helperText={errors.Phone}
                                            InputProps={{ sx: { borderRadius: "1vh", color: "#2A2F42", maxLength: 15 } }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sx={{ color: "#777", my: "1vh" }}>
                                        <Typography variant="caption">FORUM NAME</Typography>
                                        <Autocomplete
                                            fullWidth
                                            multiple
                                            size="small"
                                            id="tags-outlined"
                                            options={filteredForumNames}
                                            value={forumValue}
                                            filterSelectedOptions
                                            isOptionEqualToValue={(option, value) => option.label === value.label}
                                            renderInput={(params) => (<TextField{...params} placeholder="Forum" error={selectedForumError} helperText={selectedForumError ? "Forum Name is required" : ''} sx={{ "& .MuiOutlinedInput-root": { borderRadius: "1vh" } }} />)}
                                            onBlur={() => setSelectedForumError(forumValue.length === 0)}
                                            onChange={(event: any, newValue: any) => {
                                                setforumValue(newValue);
                                                setSelectedForumError(false);
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sx={{ color: "#777", my: "1vh" }}>
                                        <Typography variant="caption">COMPANY NAME</Typography>
                                        <Autocomplete
                                            fullWidth
                                            disablePortal
                                            id="combo-box-demo"
                                            getOptionLabel={(option) => {
                                                if (Array.isArray(option)) {
                                                    return "";
                                                }
                                                return option.label
                                            }}
                                            options={filteredCompanyNames}
                                            size="small"
                                            value={companyValue}
                                            renderInput={(params) => <TextField {...params} placeholder="Company" error={selectedCompanyError} helperText={selectedCompanyError ? "Company is required" : ''} sx={{ "& .MuiOutlinedInput-root": { borderRadius: "1vh" } }} />}
                                            isOptionEqualToValue={(option, value) => { return option.label === value.label }}
                                            onBlur={() => setSelectedCompanyError(companyValue == null)}
                                            onChange={(event: any, newValue: any) => {
                                                setCompanyValue(newValue);
                                                setSelectedCompanyError(false);
                                            }}
                                        />
                                    </Grid>
                                    <Grid container item md={12} sx={{ justifyContent: "center", alignItems: "center" }}>
                                        <Grid item xs={10} sm={4} md={4} lg={3} sx={{ m: "1vh" }}>
                                            <Button
                                                fullWidth
                                                variant="contained"
                                                sx={{ backgroundColor: "#2A2F42", borderRadius: "0.5vh", color: "#F0F2FF", fontWeight: "700", '&:hover': { backgroundColor: '#2A2F42' } }}
                                                onClick={handleSaveMember}
                                            >
                                                <Typography variant="caption" sx={{ fontWeight: "400" }}>{isBtnloading ? <CircularProgress sx={{ color: "white" }} size={20} /> : ' Save'}</Typography>
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </div>
            <SnakBarAlert alertOpen={alertOpen} setAlertOpen={setAlertOpen} alertSeverity={alertSeverity} alert={alert} />
            <BackDropLoading isLoading={isloading} />
        </>
    )
}

//Breadcrum component
const BreadCrumComponent = ({ push, params, forum_name }: any) => {
    return (
        <>
            <ArrowBackIcon fontSize="large" sx={{ border: "1px solid #D8D8D8", color: 'black', p: 1, borderRadius: '0.5vh', cursor: 'pointer', mr: 2 }} onClick={() => push("/admin/dashboard")} />
            <Typography variant="h6" sx={{ fontWeight: '600', cursor: 'pointer' }} onClick={(() => push("/admin/dashboard"))}>{forum_name}</Typography>
            <KeyboardArrowRightIcon />
            <Typography variant="subtitle1" sx={{ fontWeight: '600', cursor: 'pointer' }} onClick={() => push(`/admin/forum/${params.forum_uuid}/members`)}>Members</Typography>
            <KeyboardArrowRightIcon />
            <Typography variant="subtitle1" sx={{ fontWeight: '500' }} onClick={(() => push("/admin/dashboard"))}>Add Member</Typography>
        </>
    )
}