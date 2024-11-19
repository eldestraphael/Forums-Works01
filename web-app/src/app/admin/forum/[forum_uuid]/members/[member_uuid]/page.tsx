"use client"

import React, { useEffect, useState } from "react";
import { Autocomplete, Avatar, Button, CircularProgress, Grid, Link, TextField, Typography } from "@mui/material";
import SnakBarAlert from "@/components/snakbaralert/snakbaralert";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import BackDropLoading from "@/components/loading/backDropLoading";
import { useRouter } from 'next/navigation';
import Brightness1Icon from '@mui/icons-material/Brightness1';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import DateFormats from "@/components/dateFormat";
import EditMemberHealthCheck from "@/components/editMemberHealthCheck";
import { useSelector } from "react-redux";
import { getCookie } from "cookies-next";
import { StaticMessage } from "@/app/util/StaticMessage";


export default function MemberProfile(props: any) {

    const [formData, setFormData] = useState({
        FirstName: '',
        LastName: '',
        Phone: '',
        JobTitle: '',
    });
    const [errors, setErrors] = useState({
        FirstName: '',
        LastName: '',
        Phone: '',
        JobTitle: '',
    });
    const [memberInfo, setMemberInfo] = useState<any>([]);
    const [email, setEmail] = useState<any>("");
    const [alertOpen, setAlertOpen] = useState(false);
    const [alert, setAlert] = useState("");
    const [alertSeverity, setAlertSeverity] = useState(false);
    const [isloading, setisLoading] = useState<Boolean>(false);
    const [isBtnloading, setBtnIsLoading] = useState<Boolean>(false);
    const [filteredCompanyNames, setFilteredCompanyNames] = useState<any>([]);
    const [filteredForumNames, setFilteredForumNames] = useState([]);
    const [userRole, setUserRole] = useState<any>([]);
    const [userRoleValue, setUserRoleValue] = useState<any>(null);
    const [companyValue, setCompanyValue] = useState<any>(null);
    const [forumValue, setforumValue] = useState<any>([]);
    const [profileToggle, setProfileToggle] = useState<boolean>(false);
    const [selectedForumError, setSelectedForumError] = useState(false);
    const [selectedCompanyError, setSelectedCompanyError] = useState(false);
    const [selectedUserRoleError, setSelectedUserRoleError] = useState(false);
    const [healthCheckForMember, setHealthCheckForMember] = useState<any>([]);
    const [consolidatedHealth, setConsolidatedHealth] = useState<number>();
    const [open, setOpen] = React.useState(false);
    const [healthuuid, sethealthuuid] = React.useState('');
    const { push } = useRouter();
    const firstName = getCookie('member_first_name');
    const lastName = getCookie('member_last_name');
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
        if (name === 'Phone') {
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

    async function viewMemberProfile() {
        try {
            const requestAllMemberAPI = await fetch(`/api/admin/member?uuid=${props.params.member_uuid}`, {
                method: "GET",
                cache: 'no-store',
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const apiResponse = await requestAllMemberAPI.json();
            if (requestAllMemberAPI.status == 200) {
                setMemberInfo(apiResponse?.data?.member_info);
                setFormData({
                    ...formData, FirstName: apiResponse?.data?.member_info.first_name || '',
                    LastName: apiResponse?.data?.member_info.last_name || '',
                    JobTitle: apiResponse?.data?.member_info.job_title || '',
                    Phone: apiResponse?.data?.member_info.phone || ''
                });
                setEmail(apiResponse?.data?.member_info.email);
                setUserRole([...userRole, { label: apiResponse?.data?.member_info?.role }])
                setUserRoleValue({ label: apiResponse?.data?.member_info?.role || "Unknown role" })
                setforumValue(apiResponse?.data?.member_info.forums_info.map((forum: any) => {
                    return { label: forum.forum_name, uuid: forum.uuid }
                }))
                const newCompanyValue = {
                    label: apiResponse?.data?.member_info?.company_info?.company_name || 'Unknown Company',
                    uuid: apiResponse?.data?.member_info?.company_info?.uuid || 'Unknown UUID'
                };
                setCompanyValue(newCompanyValue);
            }
            else {
                AlertManager(apiResponse?.message, true);
            }
        }
        catch (error) {
            AlertManager(StaticMessage.ErrorMessage,true);
        }
        setisLoading(false);
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
        setisLoading(false);
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
        setisLoading(false);
    }

    async function editMemberInfo() {
        let requestBody = {
            first_name: formData.FirstName,
            last_name: formData.LastName,
            email: email,
            phone: formData.Phone,
            job_title: formData.JobTitle,
            company_uuid: companyValue?.uuid,
            forums_info: forumValue?.map((item: any) => {
                return { uuid: item.uuid }
            })
        }

        if (!formData.FirstName.length || !email.length || companyValue == null || !userRoleValue || formData.Phone.length < 10 ||
            !formData.JobTitle.length || !forumValue.length) {
            if (formData.Phone.length < 10) {
                return AlertManager('Please enter 10 to 15 digits phone number', true)
            }
            AlertManager("kindly fill all fields", true);
        }
        else {
            try {
                const requestEditMemberAPI = await fetch(`/api/admin/member?uuid=${props.params.member_uuid}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(
                        requestBody
                    ),
                });
                const apiResponse = await requestEditMemberAPI.json();
                setBtnIsLoading(true);
                push(`/admin/forum/${props.params.forum_uuid}/members`)
            }
            catch (error) {
                AlertManager(StaticMessage.ErrorMessage,true);
            }
        }
    }


    const memberHealthCheck = async () => {
        try {
            const memberHealthCheckAPI = await fetch(`/api/admin/member/health?uuid=${props.params.member_uuid}&forum=${props.params.forum_uuid}`, {
                method: "GET",
                cache: 'no-store',
                headers: {
                    "Content-Type": "application/json",
                },
            })
            const apiResponse = await memberHealthCheckAPI.json();
            if (memberHealthCheckAPI.status == 200) {
                setHealthCheckForMember(apiResponse?.data?.historical_health);
                setConsolidatedHealth(apiResponse?.data?.consolidated_health)
            }
            else {
                AlertManager(apiResponse?.message, true);
            }

        }
        catch (error) {
            AlertManager(StaticMessage.ErrorMessage,true);
        }
        setisLoading(false);
    }

    useEffect(() => {
        setisLoading(true);
        viewMemberProfile();
        CompanySearchAPI();
        forumSearchAPI();
    }, [])

    useEffect(() => {
        setisLoading(true);
        memberHealthCheck();
    }, [open])


    function AlertManager(message: string, severity: boolean) {
        setAlert(message)
        setAlertSeverity(severity)
        setAlertOpen(true)
        setisLoading(false);
    }


    const handleOpen = (uuid: any) => {
        sethealthuuid(uuid);
        setOpen(true);
    }
    const handleClose = () => setOpen(false);

    return (
        <>
            <div className="ml:0 lg:ml-[17.35vw]" style={{ backgroundColor: "#F6F5FB", paddingBottom: '5vh' }}>
                <Grid container item xs={12} justifyContent={'flex-start'} alignItems={'center'} sx={{ pt: 3, pb: 1, pl: 3 }}>
                    <Grid container item xs={11.5} alignItems={'center'}>
                        <BreadCrumComponent push={push} params={props?.params} firstName={firstName} lastName={lastName} forum_name={forum_name} />
                    </Grid>
                </Grid>

                <Grid container item xs={12} justifyContent={'flex-start'} alignItems={'center'} sx={{ pl: 3 }}>
                    <Grid container item xs={11.5} sm={11} md={10} alignItems={'center'} justifyContent={'center'} direction={'column'} sx={{ backgroundColor: 'white', borderRadius: '1vh', py: 2 }} >
                        <Grid container item xs={11.5} sx={{ height: '100%', }}>
                            <Grid container item xs={12} sm={6} md={5} lg={4} xl={4} justifyContent={'space-evenly'}>
                                <Grid item xs={5} >
                                    <Button
                                        fullWidth
                                        sx={{ textTransform: "initial", color: "#000000", borderBottom: profileToggle ? "0.5vh solid #5F83ED" : "transparent", fontWeight: profileToggle ? "700" : "500" }}
                                        onClick={() => { setProfileToggle(true) }}
                                    >
                                        Health Check
                                    </Button>
                                </Grid>
                                <Grid item xs={5} >
                                    <Button
                                        fullWidth
                                        sx={{ textTransform: "initial", fontWeight: profileToggle ? "500" : "700", color: "#000000", borderBottom: profileToggle ? "transparent" : "0.5vh solid #5F83ED" }}
                                        onClick={() => { setProfileToggle(false) }}
                                    >
                                        Profile
                                    </Button>
                                </Grid>
                            </Grid>
                        </Grid>
                        {
                            !profileToggle
                                ? <Grid container item xs={12} justifyContent={'center'} alignItems={'flex-start'} sx={{ pt: 2 }}>
                                    <Grid container item xs={11.7} sm={11} md={8} lg={7} justifyContent={'center'} sx={{ border: "1px solid #dedede", borderRadius: "2vh", p: 2 }}>
                                        <Grid container item md={12} sx={{ color: "#777", m: "1vh" }} justifyContent={'space-between'} alignItems={'flex-start'}>
                                            <Grid container item xs={5.7} direction={'column'} sx={{ backgroundColor: 'white', }}>
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
                                            <Grid container item xs={5.7} direction={'column'} justifyContent={'flex-end'} sx={{ backgroundColor: 'white', }}>
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
                                        </Grid>
                                        <Grid item xs={12} sx={{ color: "#777", m: "1vh" }}>
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
                                        <Grid item xs={12} sx={{ color: "#777", m: "1vh" }}>
                                            <Typography variant="caption">EMAIL</Typography>
                                            <TextField
                                                fullWidth
                                                placeholder="Email Address"
                                                type='email'
                                                size="small"
                                                disabled
                                                value={email}
                                                InputProps={{ sx: { borderRadius: "1vh", color: "#2A2F42", maxLength: 51 } }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sx={{ color: "#777", m: "1vh" }}>
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
                                        <Grid item xs={12} sx={{ color: "#777", m: "1vh" }}>
                                            <Typography variant="caption">USER ROLE</Typography>
                                            <Autocomplete
                                                fullWidth
                                                disablePortal
                                                id="combo-box-demo"
                                                options={userRole}
                                                value={userRoleValue}
                                                size="small"
                                                isOptionEqualToValue={(option, value) =>
                                                    option === value || option.label === value.label // Customize this based on your data structure
                                                }
                                                renderInput={(params) => <TextField {...params} placeholder="User role" name='UserRole' onBlur={handleBlur} error={selectedUserRoleError} helperText={selectedUserRoleError ? "User Role is required" : ''} sx={{ "& .MuiOutlinedInput-root": { borderRadius: "1vh" } }} />}
                                                onBlur={() => setSelectedUserRoleError(userRoleValue === null)}
                                                onChange={(event: any, newValue: any) => {
                                                    setUserRoleValue(newValue);
                                                    setSelectedUserRoleError(false);
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sx={{ color: "#777", m: "1vh" }}>
                                            <Typography variant="caption">FORUM</Typography>
                                            <Autocomplete
                                                fullWidth
                                                multiple
                                                size="small"
                                                id="tags-outlined"
                                                options={filteredForumNames}
                                                value={forumValue}
                                                filterSelectedOptions
                                                isOptionEqualToValue={(option, value) => option === value || option.label === value.label}
                                                renderInput={(params) => (<TextField{...params} placeholder="Forum" error={selectedForumError} helperText={selectedForumError ? "Forum Name is required" : ''} sx={{ "& .MuiOutlinedInput-root": { borderRadius: "1vh" } }} />)}
                                                onBlur={() => setSelectedForumError(forumValue.length === 0)}
                                                onChange={(event: any, newValue: any) => {
                                                    setforumValue(newValue);
                                                    setSelectedForumError(false);
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sx={{ color: "#777", m: "1vh" }}>
                                            <Typography variant="caption">COMPANY</Typography>
                                            <Autocomplete
                                                fullWidth
                                                disablePortal
                                                id="combo-box-demo"
                                                options={filteredCompanyNames}
                                                size="small"
                                                value={companyValue}
                                                renderInput={(params) => <TextField {...params} placeholder="Company" error={selectedCompanyError} helperText={selectedCompanyError ? "Company is required" : ''} sx={{ "& .MuiOutlinedInput-root": { borderRadius: "1vh" } }} />}
                                                isOptionEqualToValue={(option, value) => option === value || option.label === value.label}
                                                onBlur={() => setSelectedCompanyError(companyValue == null)}
                                                onChange={(event: any, newValue: any) => {
                                                    setCompanyValue(newValue);
                                                    setSelectedCompanyError(false);
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={10} sm={4} md={4} lg={3} sx={{ m: "1vh" }}>
                                            <Button
                                                fullWidth
                                                variant="contained"
                                                sx={{ backgroundColor: "#2A2F42", borderRadius: "0.5vh", color: "#F0F2FF", fontWeight: "700", '&:hover': { backgroundColor: '#2A2F42' } }}
                                                onClick={editMemberInfo}
                                            >
                                                {isBtnloading ? <CircularProgress sx={{ color: "white" }} size={20} /> : ' Save'}
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </Grid>
                                : <Grid container item xs={12} justifyContent={'center'} alignItems={'flex-start'} sx={{ pt: 2 }}>
                                    <Grid container item xs={11.7} sm={11} >
                                        <HealthCheckTab
                                            sethealthuuid={sethealthuuid}
                                            handleOpen={handleOpen}
                                            setOpen={setOpen}
                                            open={open}
                                            healthCheckForMember={healthCheckForMember}
                                            consolidatedHealth={consolidatedHealth}
                                            AlertManager={AlertManager}
                                            member_uuid={props.params.member_uuid}
                                            forum_uuid={props.params.forum_uuid}
                                        />
                                    </Grid>
                                </Grid>
                        }
                    </Grid>
                </Grid>
            </div >
            {open && <EditMemberHealthCheck handleClose={handleClose} open={open} health_uuid={healthuuid} AlertManager={AlertManager} member_uuid={props.params.member_uuid} forum_uuid={props.params.forum_uuid} />
            }
            <SnakBarAlert alertOpen={alertOpen} setAlertOpen={setAlertOpen} alertSeverity={alertSeverity} alert={alert} />
            <BackDropLoading isLoading={isloading} />
        </>
    )
}


//Breadcrum component
const BreadCrumComponent = ({ push, params, firstName, lastName, forum_name }: any) => {
    return (
        <>
            <ArrowBackIcon fontSize="large" sx={{ border: "1px solid #D8D8D8", color: 'black', p: 1, borderRadius: '0.5vh', cursor: 'pointer', mr: 2, backgroundColor: 'white' }} onClick={() => push("/admin/dashboard")} />
            <Typography variant="h6" sx={{ fontWeight: '600', cursor: 'pointer' }} onClick={(() => push("/admin/dashboard"))}>{forum_name}</Typography>
            <KeyboardArrowRightIcon />
            <Typography variant="subtitle1" sx={{ fontWeight: '600', cursor: 'pointer' }} onClick={() => push(`/admin/forum/${params.forum_uuid}/members`)}>Members</Typography>
            <KeyboardArrowRightIcon />
            <Typography variant="subtitle1" sx={{ fontWeight: '500' }} onClick={(() => push("/admin/dashboard"))}>{firstName}&nbsp;{lastName}</Typography>
        </>
    )
}

//Health Check Tab
const HealthCheckTab = (props: any) => {
    return (
        <Grid container item xs={12} direction={"column"} className=" min-h-[37.927vw] b-[2.5vh] gap-3 pb-5">
            <Grid container item className="border-[0.1vw] border-solid border-[#D8D8D8] rounded-md p-5 sm:px-3" justifyContent={'center'} alignItems={'center'} >
                <Grid container item xs={12} className="gap-2" justifyContent={'center'}>
                    <Grid container item xs={12} sm={5.7} direction={'column'} justifyContent={'space-evenly'} alignItems={'center'}>
                        <Grid item sx={{ py: 2 }}>
                            <Typography variant="h5" sx={{ textAlign: 'center', fontWeight: '600' }}>Health Check</Typography>
                        </Grid>
                        <Grid item sx={{ py: 2 }}>
                            <Typography variant="subtitle2" sx={{ textAlign: 'center', fontWeight: '500' }}>
                                Complete daily forum tracking to ensure employees <br />
                                are getting the most of the forum experience
                            </Typography>
                        </Grid>
                        <Grid item justifyContent={'center'} sx={{ py: 1.5 }}>
                            <Button variant="contained" fullWidth sx={{ backgroundColor: '#2A2F42 !important', textTransform: "initial", color: "#F0F2FF" }}>Take Survey</Button>
                        </Grid>
                    </Grid>
                    <Grid container item xs={12} sm={5.85} className='border-[0.1vw] border-solid border-[#FFFFFF] bg-gray-100 rounded-md flex items-center justify-center py-12'>
                        <Grid container item xs={12} sm={10} md={12} justifyContent={'center'} alignItems={'center'}>
                            <Typography variant="h5" sx={{ color: "#676767", fontWeight: "600", textAlign: 'center' }}>
                                Employee Score &nbsp;
                                <Brightness1Icon fontSize="small" sx={{ color: props?.consolidatedHealth <= 3 ? "#fa8072 " : props?.consolidatedHealth > 3 && props?.consolidatedHealth <= 6 ? "#EDD86D" : "#6EE3AB" }} />
                            </Typography>&nbsp;
                            <Typography variant="h5" sx={{ color: 'black', fontWeight: "700", mt: '0.2vh', textAlign: 'center' }}>
                                {props?.consolidatedHealth > 0 ? props?.consolidatedHealth : 0}/10
                            </Typography>
                        </Grid>
                    </Grid>
                </Grid>

            </Grid>
            <Grid container item gap={2}>
                {
                    props?.healthCheckForMember.map((item: any, i: number) => {
                        return (
                            <>
                                <Grid key={i} container item className="border-[0.1vw] border-solid border-[#D8D8D8]  rounded-md " justifyContent={'center'} >
                                    <Grid container item xs={11.5} >
                                        <Grid container item xs={5} sm={5} md={4} lg={5} direction={'column'} justifyContent={'flex start'} alignItems={'center'} sx={{ py: 1 }}>
                                            <Grid container item xs={6} className="text-[0.9vw] font-bold" alignItems={'flex-end'}>
                                                <Typography variant="body1" sx={{ fontWeight: '600' }}>{DateFormats(item.date, false)}</Typography>
                                            </Grid>
                                            <Grid container item xs={5} className="text-[0.8vw] font-thin">
                                                <Typography variant="caption" sx={{ fontWeight: '500' }}>{DateFormats(item.createdAt, false)} {DateFormats(item.createdAt, true)}</Typography>

                                            </Grid>
                                        </Grid>
                                        <Grid container item xs={5} sm={5} md={4} lg={3} justifyContent={'space-between'} alignItems={'center'} >
                                            <Typography variant="body1" sx={{ fontWeight: '600' }}>Health Tracking</Typography>
                                            <Typography variant="body1" sx={{ color: "black", fontWeight: "600", display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                <Brightness1Icon sx={{ fontSize: 15, color: item?.health <= 3 ? "#fa8072 " : item?.health > 3 && item?.health <= 6 ? "#EDD86D" : "#6EE3AB" }} /> &nbsp; {item.health > 0 ? item.health : 0}/10
                                            </Typography>
                                        </Grid>
                                        <Grid container item xs={2} sm={2} md={4} lg={4} justifyContent={'flex-end'} alignItems={'center'}>
                                            <ModeEditIcon fontSize="large" sx={{ backgroundColor: '#5F83ED', color: 'white', p: 1, borderRadius: '0.5vw', cursor: 'pointer' }} onClick={() => props?.handleOpen(item.uuid)} />
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </>
                        )
                    })
                }
            </Grid>
        </Grid>
    )
};