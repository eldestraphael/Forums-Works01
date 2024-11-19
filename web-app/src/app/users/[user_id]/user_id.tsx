"use client"

import React, { useEffect, useRef, useState } from "react";
import { Autocomplete, Button, CircularProgress, Grid, TextField, Typography } from "@mui/material";
import SnakBarAlert from "@/components/snakbaralert/snakbaralert";
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import BackDropLoading from "@/components/loading/backDropLoading";
import { useRouter, useSearchParams } from 'next/navigation';
import EditMemberHealthCheck from "@/components/editMemberHealthCheck";
import UserDashboardComponents from "@/components/userDashboardComponents";
import dayjs from 'dayjs';
import HealthCheckTab from "@/components/healthCheckTabComponent";
import { getCookie } from "cookies-next";
import { StaticMessage } from "@/app/util/StaticMessage";
import ConfirmationModal from "@/components/confirmationModal";

export default function UserProfile(props: any) {
    const [formData, setFormData] = useState({
        FirstName: '',
        LastName: '',
        Phone: '',
        userRole: '',
        JobTitle: '',
    });
    const [errors, setErrors] = useState({
        FirstName: '',
        LastName: '',
        Phone: '',
        userRole: '',
        JobTitle: '',
    });
    const searchParams = useSearchParams()
    const [email, setEmail] = useState<any>("");
    const [alertOpen, setAlertOpen] = useState(false);
    const [alert, setAlert] = useState("");
    const [alertSeverity, setAlertSeverity] = useState(false);
    const [isloading, setisLoading] = useState<boolean>(false);
    const [isBtnloading, setBtnIsLoading] = useState<boolean>(false);
    const [filteredCompanyNames, setFilteredCompanyNames] = useState<any>([]);
    const [filteredForumNames, setFilteredForumNames] = useState([]);
    const [userRole, setUserRole] = useState<any>([]);
    const [userRoleValue, setUserRoleValue] = useState<any>(null);
    const [companyValue, setCompanyValue] = useState<any>(null);
    const [forumValue, setforumValue] = useState<any>([]);
    const [profileToggle, setProfileToggle] = useState<String>(props?.page_props?.searchParams?.tab || "profile");
    const [selectedForumError, setSelectedForumError] = useState(false);
    const [selectedCompanyError, setSelectedCompanyError] = useState(false);
    const [selectedUserRoleError, setSelectedUserRoleError] = useState(false);
    const [isFreeSoloCondition, setIsFreeSoloCondition] = useState(true);
    const [healthCheckForMember, setHealthCheckForMember] = useState<any>([]);
    const [dashboardData, setDashboardData] = useState<any>([]);
    const [consolidatedHealth, setConsolidatedHealth] = useState<number>();
    const [open, setOpen] = useState(false);
    const [healthuuid, sethealthuuid] = useState('');
    const [fromDateDashboard, setFromDateDashboard] = useState<any>(dayjs(new Date()).subtract(1, 'year').format('YYYY-MM-DD'));
    const [toDateDashboard, setToDateDashboard] = useState<any>(dayjs(new Date()));
    const [fromDateHealth, setFromDateHealth] = useState<any>(dayjs(new Date()).subtract(1, 'year').format('YYYY-MM-DD'));
    const [toDateHealth, setToDateHealth] = useState<any>(dayjs(new Date()));
    const [isFocused, setIsFocused] = useState(false);
    const { push } = useRouter();
    const [currentPage, setCurrentPage] = useState(searchParams.get('page') || 1);
    const [isAutocompletLoading, setIsAutocompletLoading] = useState(false);
    const [isCompanySearchLoading, setIsCompanySearchLoading] = useState(false);
    const [isUserRoleLoading, setIsUserRoleLoading] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
    var firstName: any = getCookie('user_first_name');
    var lastName: any = getCookie('user_last_name');
    const initialDashboardRender = useRef(true);
    const initialHealthRender = useRef(true);


    const handleChange = (e: any) => {
        setIsFocused(true);
        const { name, value } = e.target;
        // if(name === 'FirstName'){
        //     setIsFocused(true);
        // }
        // if(name === 'LastName'){
        //     setIsFocused(true);
        // }
        // if( name === 'JobTitle  1'){
        //     setIsFocused(true);
        // }
        let error = '';
        let maxLength = 50;
        const formattedName = name
            .replace(/([A-Z])/g, ' $1') // Add space before each uppercase letter
            .trim() // Remove leading and trailing spaces
            .toLowerCase() // Convert the entire string to lowercase
            .replace(/^./, (str: any) => str.toUpperCase()) // Capitalize the first letter of the entire string
            .replace('email', 'Email'); // Special case for Email

        if (name === 'Phone') {
            // setIsFocused(true)
            if (value.length <= 15) {
                setFormData({ ...formData, [name]: value });
                clearTimeout(typingTimer);
                typingTimer = setTimeout(() => {
                    handleBlur(e);
                }, 1000);
            }
            else {
                error = 'Please enter 10 to 15 digit phone number';
            }
        }
        else {
            if (value.length <= maxLength) {
                setFormData({ ...formData, [name]: value });
            } else {
                error = `${formattedName} must be ${maxLength} characters or less`;
            }
        }

        setErrors({ ...errors, [name]: error });
    };

    const handleBlur = (e: any) => {
        const { name, value } = e.target;
        let error = '';
        const formattedName = name
            .replace(/([A-Z])/g, ' $1') // Add space before each uppercase letter
            .trim() // Remove leading and trailing spaces
            .toLowerCase() // Convert the entire string to lowercase
            .replace(/^./, (str: any) => str.toUpperCase()) // Capitalize the first letter of the entire string
            .replace('email', 'Email'); // Special case for Email

        if (name === 'Phone') {
            if (value.trim() != '' && (value.length < 10 || value.length > 15)) {
                error = 'Please enter 10 to 15 digit phone number';
            }
            //  else if (value.length < 10 || value.length > 15) {
            //     error = 'Please enter 10 to 15 digit phone number';
            // }
        }
        // else {
        //     error = value.trim() === '' ? `${formattedName} is required` : '';
        // }

        setErrors({ ...errors, [name]: error });
    };

    let typingTimer: ReturnType<typeof setTimeout>;
    useEffect(() => {
        return () => clearTimeout(typingTimer);
    }, []);

    // VIEW USER PROFILE
    async function viewUserProfile() {
        setisLoading(true);
        try {
            const requestUserDetailAPI = await fetch(`/api/admin/member?uuid=${props.page_props.params.user_id}`, {
                method: "GET",
                cache: 'no-store',
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const apiResponse = await requestUserDetailAPI.json();
            if (requestUserDetailAPI.status == 200) {
                setFormData({
                    ...formData, FirstName: apiResponse?.data?.member_info.first_name || '',
                    LastName: apiResponse?.data?.member_info.last_name || '',
                    JobTitle: apiResponse?.data?.member_info.job_title || '',
                    Phone: apiResponse?.data?.member_info.phone || ''
                });
                setEmail(apiResponse?.data?.member_info.email);
                const newUserRoleValue = {
                    label: apiResponse?.data?.member_info?.role?.role_name || "Unknown role",
                    uuid: apiResponse?.data?.member_info?.role?.role_uuid || 'Unknown UUID'
                }
                setUserRoleValue(newUserRoleValue)
                setforumValue(apiResponse?.data?.member_info.forums_info.map((forum: any) => {
                    return { label: forum.forum_name, uuid: forum.uuid }
                }))
                const newCompanyValue = {
                    label: apiResponse?.data?.member_info?.company_info?.company_name || 'Unknown Company',
                    uuid: apiResponse?.data?.member_info?.company_info?.uuid || 'Unknown UUID'
                };
                setCompanyValue(newCompanyValue);
                setisLoading(false);
            }
            else {
                AlertManager(apiResponse?.message, true);
            }
        }
        catch (error) {
            AlertManager(StaticMessage.ErrorMessage, true);
        }
        setisLoading(false);
    }

    // FORUMSEARCHAPI
    async function forumSearchAPI(newInputValue: any, companyValue: any) {
        setIsFreeSoloCondition(false)
        setIsAutocompletLoading(true);
        try {
            const requestForumSearchAPI = await fetch(`/api/forum?${newInputValue.length ? `search=${newInputValue}` : ''}&company=${companyValue?.uuid}&page=${currentPage}&limit=1000&isDropdown=true`, {
                method: "GET",
                cache: 'no-store',
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const searchApiResponse = await requestForumSearchAPI.json();
            const updatedItems = searchApiResponse?.data.map((item: any) => {
                return { label: item.forum_info.forum_name, uuid: item.forum_info.uuid };
            });
            setFilteredForumNames(updatedItems);
            setCurrentPage(searchApiResponse?.page_meta?.current)
            setIsAutocompletLoading(false);
        }
        catch (error: any) {
            AlertManager(StaticMessage.ErrorMessage, true);
        }
        setIsAutocompletLoading(false);
    }

    // COMPANY SEARCH API
    async function CompanySearchAPI() {
        setIsCompanySearchLoading(true);
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
            setIsCompanySearchLoading(false);
        }
        catch (error) {
            AlertManager(StaticMessage.ErrorMessage, true);
        }
        setisLoading(false);
    }
    // USER ROLE SEARCH API
    async function UserRoleSearchAPI() {
        setIsUserRoleLoading(true);
        const searchWord = "";
        try {
            const requestUserRoleSearchAPI = await fetch(`/api/role${searchWord}`, {
                method: "GET",
                cache: 'no-store',
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const UserRoleApiResponse = await requestUserRoleSearchAPI.json();
            const mappedUserrole = UserRoleApiResponse?.data.map((item: any) => {
                return { label: item.name, uuid: item.uuid };
            })
            setUserRole(mappedUserrole);
            setIsUserRoleLoading(false);
        }
        catch (error) {
            AlertManager(StaticMessage.ErrorMessage, true);
        }
    }

    // EDIT USER INFO
    async function editUserInfo() {
        let requestBody: {
            first_name: string,
            last_name?: string,
            email: string,
            phone?: string,

            role_uuid: string,
            job_title: string,
            company_uuid: string,
            forums_info: string
        } = {
            first_name: formData.FirstName,
            last_name: formData.LastName,
            email: email,
            role_uuid: userRoleValue?.uuid,
            job_title: formData.JobTitle,
            company_uuid: companyValue.uuid,
            forums_info: forumValue.map((item: any) => {
                return { uuid: item.uuid }
            })
        }
        if (formData?.Phone.length == null) {
            requestBody.phone == null;
        }
        else {
            requestBody.phone = formData?.Phone;
        }

        if (!formData.FirstName.length || !email.length || companyValue == null || !userRoleValue || !formData.JobTitle.length) {
            AlertManager("kindly fill all fields", true);
        }
        else {

            try {
                const requestEditUserAPI = await fetch(`/api/admin/member?uuid=${props.page_props.params.user_id}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(
                        requestBody
                    ),
                });
                const apiResponse = await requestEditUserAPI.json();
                setBtnIsLoading(true);
                push(`/users`)
            }
            catch (error) {
                AlertManager(StaticMessage.ErrorMessage, true);
            }
        }
    }

    // USER HEALTH CHECK
    const userHealthCheck = async () => {
        try {
            const userHealthCheckAPI = await fetch(`/api/user/${props.page_props.params.user_id}/health?from=${fromDateHealth}&to=${dayjs(toDateHealth).format('YYYY-MM-DD')}`, {
                method: "GET",
                cache: 'no-store',
                headers: {
                    "Content-Type": "application/json",
                },
            })
            const apiResponse = await userHealthCheckAPI.json();
            if (userHealthCheckAPI.status == 200) {
                console.log("health", apiResponse?.data)
                setHealthCheckForMember(apiResponse?.data?.historical_health);
                setConsolidatedHealth(apiResponse?.data?.consolidated_health)
                setisLoading(false);
            }
            else {
                AlertManager(apiResponse?.message, true);
                setisLoading(false);
            }
        }
        catch (error) {
            AlertManager(StaticMessage.ErrorMessage, true);
            setisLoading(false);
        }
        setisLoading(false);
    }

    //DASHBOARD API FUNCTION
    const userDashboard = async () => {
        setisLoading(true);
        try {
            const apiResponse = await fetch(`/api/user/${props.page_props.params.user_id}/dashboard?from=${fromDateDashboard}&to=${dayjs(toDateDashboard).format('YYYY-MM-DD')}`, {
                method: "GET",
                cache: 'no-store',
                headers: {
                    "Content-Type": "application/json",
                },
            })
            const dashboardResponse = await apiResponse.json();
            if (apiResponse.status == 200) {
                setDashboardData(dashboardResponse?.data)
                AlertManager(dashboardResponse?.message, false);
            }
            else {
                AlertManager(dashboardResponse?.message, true);
                setisLoading(false);
            }
        }
        catch (error) {
            AlertManager(StaticMessage.ErrorMessage, true);
            setisLoading(false)
        }
        setisLoading(false);
    }

    // HANDLECOMPANY CLICK
    function handleCompanyClick(event: any, value: any) {
        setIsFocused(true);

        setCompanyValue(value);
        setforumValue([]);
        setSelectedCompanyError(false);
    }

    async function deleteUser() {
        try {
            setisLoading(true);
            const apiResponse = await fetch(`/api/admin/member?uuid=${props.page_props.params.user_id}`, {
                method: "DELETE",
                cache: 'no-store',
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const dashboardResponse = await apiResponse.json();
            if (apiResponse.status == 200) {
                await AlertManager(dashboardResponse?.message, false);
                setOpenDeleteModal(false);
                setTimeout(async function () {
                    await push("/users");
                    setisLoading(false);
                }, 500);
            }
            else {
                AlertManager(dashboardResponse?.message, true);
                setisLoading(false);
            }
        }
        catch (error) {
            AlertManager(StaticMessage.ErrorMessage, true);
            setisLoading(false)
        }
    }

    useEffect(() => {
        if (props.viewUserAction[1].read) {
            viewUserProfile();
        }
    }, [])

    useEffect(() => {
        if (initialHealthRender.current) {
            initialHealthRender.current = false;
        } else {
            userHealthCheck();
        }
    }, [open, fromDateHealth, toDateHealth])

    //THIS USE EFFECT RUNS WITH DASHBOARD FROM/TO DATE CHANGES
    useEffect(() => {
        if (initialDashboardRender.current) {
            initialDashboardRender.current = false;
        } else {
            userDashboard();
        }
    }, [fromDateDashboard, toDateDashboard]);

    function AlertManager(message: string, severity: boolean) {
        setAlert(message)
        setAlertSeverity(severity)
        setAlertOpen(true)
        setisLoading(false);
        setIsCompanySearchLoading(false);
        setIsUserRoleLoading(false);
    }

    const handleOpenUser = (uuid: any) => {
        sethealthuuid(uuid);
        setOpen(true);
    }
    const handleClose = () => setOpen(false);

    // Initialize a flag to track whether the user has finished typing
    let userFinishedTyping = false;
    // Initialize a variable to store the timer ID
    let debounceTimer: NodeJS.Timeout | null = null;
    // Custom debounce function
    const customDebounce = (callback: () => void, delay: number) => {
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }
        debounceTimer = setTimeout(callback, delay);
    };

    return (
        <>
            <div className="ml:0 lg:ml-[17.35vw]" style={{ backgroundColor: "#F6F5FB", paddingBottom: '5vh', minHeight: "100vh", }}>
                <Grid container item xs={12} justifyContent={'flex-start'} alignItems={'center'} sx={{ pt: 3, pb: 1, pl: 3 }}>
                    <Grid container item xs={11.5} alignItems={'center'}>
                        <BreadCrumComponent push={push} params={props?.params} firstName={firstName} lastName={lastName} profileToggle={profileToggle} userid={props.page_props.params.user_id} setProfileToggle={setProfileToggle} />
                    </Grid>
                </Grid>

                <Grid container item xs={12} justifyContent={'flex-start'} alignItems={'center'} sx={{ pl: 3 }}>
                    <Grid container item xs={11.5} sm={11} md={11.7} alignItems={'center'} justifyContent={'center'} direction={'column'} sx={{ backgroundColor: 'white', borderRadius: '2vh', py: 2 }} >
                        <Grid container item xs={11.5} sx={{ height: '100%' }}>
                            <Grid container item alignItems="center" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Grid item sx={{ display: 'flex', flexGrow: 1 }}>
                                    <Grid item xs={4} sm={3} md={2}>
                                        <Button
                                            fullWidth
                                            sx={{
                                                textTransform: "initial",
                                                fontWeight: profileToggle === "profile" ? "700" : "500",
                                                color: "#000000",
                                                borderBottom: profileToggle === "profile" ? "0.5vh solid #5F83ED" : "transparent"
                                            }}
                                            onClick={() => {
                                                setProfileToggle("profile");
                                                push(`/users/${props?.page_props?.params?.user_id}?tab=profile`);
                                            }}
                                        >
                                            Profile
                                        </Button>
                                    </Grid>
                                    <Grid item xs={4} sm={3} md={2}>
                                        <Button
                                            fullWidth
                                            sx={{
                                                textTransform: "initial",
                                                color: "#000000",
                                                borderBottom: profileToggle === "healthscore" ? "0.5vh solid #5F83ED" : "transparent",
                                                fontWeight: profileToggle === "healthscore" ? "700" : "500"
                                            }}
                                            onClick={() => {
                                                setProfileToggle("healthscore");
                                                push(`/users/${props?.page_props?.params?.user_id}?tab=healthscore`);
                                                userHealthCheck();
                                            }}
                                        >
                                            Health Score
                                        </Button>
                                    </Grid>
                                    <Grid item xs={4} sm={3} md={2}>
                                        <Button
                                            fullWidth
                                            sx={{
                                                textTransform: "initial",
                                                fontWeight: profileToggle === "dashboard" ? "700" : "500",
                                                color: "#000000",
                                                borderBottom: profileToggle === "dashboard" ? "0.5vh solid #5F83ED" : "transparent"
                                            }}
                                            onClick={() => {
                                                setProfileToggle("dashboard");
                                                push(`/users/${props?.page_props?.params?.user_id}?tab=dashboard`);
                                                userDashboard();
                                            }}
                                        >
                                            Dashboard
                                        </Button>
                                    </Grid>
                                </Grid>
                                {/* Delete Button */}
                                {props.viewUserAction[0].update &&
                                    <Grid item px={3}>
                                        <Button
                                            variant="outlined"
                                            sx={{ borderRadius: "0.5vh", fontWeight: "700", color: 'red', borderColor: 'red', '&:hover': { borderColor: 'red' } }}
                                            onClick={() => setOpenDeleteModal(true)}
                                        >
                                            <DeleteRoundedIcon className="cursor-pointer" sx={{ borderColor: 'red' }} />Delete User
                                        </Button>

                                        <ConfirmationModal
                                            open={openDeleteModal}
                                            handleClose={() => { setOpenDeleteModal(false) }}
                                            handleSubmit={() => { deleteUser() }}
                                            title="Are you sure you want to delete the user?"
                                            body={
                                                <Typography variant="body1">
                                                    All user related information along with their forum data would be deleted. You cannot undo this action.
                                                </Typography>
                                            }
                                            isLoading={isloading}
                                            confirmButton='Yes, Delete User'
                                            cancelButton='No, Cancel' />
                                    </Grid>
                                }
                            </Grid>
                        </Grid>

                        {
                            profileToggle == "profile"
                            && <Grid container item xs={12} justifyContent={'center'} alignItems={'flex-start'} sx={{ pt: 2 }}>
                                {props.viewUserAction[1].read ?
                                    <Grid container item xs={11.7} sm={11} md={8} lg={7} justifyContent={'center'} sx={{ border: "1px solid #dedede", borderRadius: "2vh", p: 2, marginBottom: "3vh" }}>
                                        <Grid container item md={12} sx={{ color: "#777", m: "1vh" }} justifyContent={'space-between'} alignItems={'flex-start'}>
                                            <Grid container item xs={5.7} direction={'column'} sx={{ backgroundColor: 'white', }}>
                                                <Typography variant="caption" sx={{ color: "#5F5F5F" }}>FIRST NAME</Typography>
                                                <TextField
                                                    fullWidth
                                                    name="FirstName"
                                                    type='text'
                                                    size="small"
                                                    placeholder="Enter the first name"
                                                    value={formData.FirstName}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    helperText={errors.FirstName}
                                                    error={!!errors.FirstName}
                                                    sx={{ color: "#2A2F42" }}
                                                    InputProps={{ readOnly: props.viewUserAction[0].update ? false : true, sx: { borderRadius: "1vh", color: "#2A2F42", maxLength: 51 } }}
                                                />
                                            </Grid>
                                            <Grid container item xs={5.7} direction={'column'} justifyContent={'flex-end'} sx={{ backgroundColor: 'white', }}>
                                                <Typography variant="caption" sx={{ color: "#5F5F5F" }}>LAST NAME (Optional)</Typography>
                                                <TextField
                                                    fullWidth
                                                    name="LastName"
                                                    type='text'
                                                    size="small"
                                                    placeholder="Enter the last name"
                                                    value={formData.LastName}
                                                    onChange={handleChange}
                                                    helperText={errors.LastName}
                                                    error={!!errors.LastName}
                                                    sx={{ color: "#2A2F42" }}
                                                    InputProps={{ readOnly: props.viewUserAction[0].update ? false : true, sx: { borderRadius: "1vh", color: "#2A2F42", maxLength: 51 } }}
                                                />
                                            </Grid>
                                        </Grid>
                                        <Grid item xs={12} sx={{ color: "#777", m: "1vh" }}>
                                            <Typography variant="caption">COMPANY NAME</Typography>
                                            <Autocomplete
                                                fullWidth
                                                disablePortal
                                                id="combo-box-demo"
                                                loading={isCompanySearchLoading}
                                                readOnly={props.viewUserAction[0].update ? undefined : true}
                                                options={filteredCompanyNames}
                                                size="small"
                                                value={companyValue}
                                                renderInput={(params) => <TextField {...params} placeholder="Choose the company of the user" error={selectedCompanyError} helperText={selectedCompanyError ? "Company name is required" : ''} sx={{ "& .MuiOutlinedInput-root": { borderRadius: "1vh" } }} />}
                                                isOptionEqualToValue={(option, value) => option === value || option.label === value.label}
                                                onBlur={() => setSelectedCompanyError(companyValue == null)}
                                                onChange={handleCompanyClick}
                                                onOpen={CompanySearchAPI}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sx={{ color: "#777", m: "1vh" }}>
                                            <Typography variant="caption">JOB TITLE</Typography>
                                            <TextField
                                                fullWidth
                                                name="JobTitle"
                                                type='text'
                                                size="small"
                                                placeholder="Enter the job title"
                                                value={formData.JobTitle}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                error={!!errors.JobTitle}
                                                helperText={errors.JobTitle}
                                                InputProps={{ readOnly: props.viewUserAction[0].update ? false : true, sx: { borderRadius: "1vh", color: "#2A2F42", maxLength: 51 } }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sx={{ color: "#777", m: "1vh" }}>
                                            <Typography variant="caption">EMAIL ADDRESS</Typography>
                                            <TextField
                                                fullWidth
                                                placeholder="Email Address"
                                                type='email'
                                                size="small"
                                                disabled
                                                value={email}
                                                InputProps={{ readOnly: props.viewUserAction[0].update ? false : true, sx: { borderRadius: "1vh", color: "#2A2F42", maxLength: 51 } }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sx={{ color: "#777", m: "1vh" }}>
                                            <Typography variant="caption">PHONE NUMBER (Optional)</Typography>
                                            <TextField
                                                fullWidth
                                                name="Phone"
                                                placeholder="Enter a phone number"
                                                type='number'
                                                size="small"
                                                value={formData.Phone}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                error={!!errors.Phone}
                                                helperText={errors.Phone}
                                                InputProps={{ readOnly: props.viewUserAction[0].update ? false : true, sx: { borderRadius: "1vh", color: "#2A2F42", maxLength: 15 } }}

                                            />
                                        </Grid>
                                        <Grid item xs={12} sx={{ color: "#777", m: "1vh" }}>
                                            <Typography variant="caption">USER ROLE</Typography>
                                            <Autocomplete
                                                fullWidth
                                                disablePortal
                                                id="combo-box-demo"
                                                loading={isUserRoleLoading}
                                                readOnly={props.viewUserAction[0].update ? undefined : true}
                                                options={userRole}
                                                value={userRoleValue}
                                                size="small"
                                                isOptionEqualToValue={(option, value) =>
                                                    option === value || option.label === value.label // Customize this based on your data structure
                                                }
                                                renderInput={(params) => <TextField {...params} placeholder="Enter an user role" name='UserRole' onBlur={handleBlur} error={selectedUserRoleError} helperText={selectedUserRoleError ? "User role is required" : ''} sx={{ "& .MuiOutlinedInput-root": { borderRadius: "1vh" } }} />}
                                                onBlur={() => setSelectedUserRoleError(userRoleValue === null)}
                                                onChange={(event: any, newValue: any) => {
                                                    setIsFocused(true);
                                                    setUserRoleValue(newValue);
                                                    setFormData((prevData) => ({
                                                        ...prevData,
                                                        userRole: newValue ? newValue.label : '', // Update formData.userRole
                                                    }));
                                                    setSelectedUserRoleError(false);
                                                }}
                                                onOpen={UserRoleSearchAPI}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sx={{ color: "#777", m: "1vh" }}>
                                            <Typography variant="caption">{`FORUM NAME (Optional)`}</Typography>
                                            <Autocomplete
                                                fullWidth
                                                multiple
                                                size="small"
                                                id="tags-outlined"
                                                readOnly={props.viewUserAction[0].update ? undefined : true}
                                                options={filteredForumNames}
                                                value={forumValue}
                                                loading={isAutocompletLoading}
                                                filterSelectedOptions
                                                freeSolo={filteredForumNames.length == 0 && isFreeSoloCondition}
                                                isOptionEqualToValue={(option, value) => option === value || option.label === value.label}
                                                renderInput={(params) => (<TextField {...params} placeholder="Search for a forum" error={selectedForumError} helperText={selectedForumError ? "Forum name is required" : ''} sx={{ "& .MuiOutlinedInput-root": { borderRadius: "1vh" } }} />)}
                                                onBlur={() => {
                                                    // setSelectedForumError(forumValue.length === 0);
                                                    setFilteredForumNames([]);
                                                    setIsFreeSoloCondition(true)

                                                }}
                                                onChange={(event: any, newValue: any) => {
                                                    setforumValue(newValue);
                                                    setFilteredForumNames([]);
                                                    setIsFreeSoloCondition(true);
                                                    setSelectedForumError(false);
                                                    setIsFocused(true);
                                                }}
                                                disableCloseOnSelect
                                                onInputChange={(event, newInputValue) => {
                                                    if (companyValue && event.type === 'change') {
                                                        if (newInputValue.length == 0) {
                                                            setIsFreeSoloCondition(true);
                                                        }
                                                        if (newInputValue && newInputValue.trim()) {
                                                            userFinishedTyping = false; // Reset the flag when user starts typing
                                                            customDebounce(() => {
                                                                if (!userFinishedTyping) {
                                                                    forumSearchAPI(newInputValue, companyValue);
                                                                    userFinishedTyping = true; // Mark the user as finished typing
                                                                }
                                                            }, 1500); // Adjust the delay as needed
                                                        } else {
                                                            setFilteredForumNames([]);
                                                            userFinishedTyping = true; // Mark the user as finished typing
                                                        }
                                                    }
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={10} sm={4} md={4} lg={3} sx={{ m: "1vh" }}>
                                            {props.viewUserAction[0].update
                                                &&
                                                <Button
                                                    fullWidth
                                                    variant="contained"
                                                    disabled={!formData.FirstName.length || formData.LastName.length == null || !email.length || companyValue == null || !formData.JobTitle.length || (formData.Phone.length !== 0) && (formData.Phone.length < 10 || formData?.Phone.length > 15) || !userRoleValue || !isFocused}
                                                    sx={{ backgroundColor: "#2A2F42", borderRadius: "0.5vh", color: "#F0F2FF", fontWeight: "700", '&:hover': { backgroundColor: '#2A2F42' } }} //forumData?.phone.length.trim() != '' && (forumData?.phone.length.length < 10 || forumData?.phone.length.length > 15)
                                                    onClick={editUserInfo}
                                                >
                                                    {isBtnloading ? <CircularProgress sx={{ color: "white" }} size={20} /> : ' Update'}
                                                </Button>
                                            }
                                        </Grid>
                                    </Grid>
                                    :
                                    <><Grid container item xs={11.7} sm={11} md={8} lg={7} justifyContent={'center'} sx={{ borderRadius: "2vh", p: 2, height: "75vh" }}></Grid></>
                                }
                            </Grid>
                        }
                        {profileToggle == "healthscore" &&
                            <Grid container item xs={12} justifyContent={'center'} alignItems={'flex-start'} sx={{ pt: 2 }}>
                                <Grid container item xs={11.7} sm={11}  >
                                    <HealthCheckTab
                                        sethealthuuid={sethealthuuid}
                                        handleOpenUser={handleOpenUser}
                                        setOpen={setOpen}
                                        open={open}
                                        healthCheckForMember={healthCheckForMember}
                                        consolidatedHealth={consolidatedHealth}
                                        AlertManager={AlertManager}
                                        setFromDateHealth={setFromDateHealth}
                                        setToDateHealth={setToDateHealth}
                                        fromDateHealth={fromDateHealth}
                                        toDateHealth={toDateHealth}
                                        viewUserAction={props.viewUserAction[0].update}
                                    />
                                </Grid>
                            </Grid>
                        }
                        {profileToggle == "dashboard" &&
                            <Grid container item xs={12} justifyContent={'center'} alignItems={'flex-start'} sx={{ pt: 2 }}>
                                <Grid container item xs={11.7} sm={11}  >
                                    <UserDashboardComponents
                                        Page='user'
                                        dashboardData={dashboardData}
                                        setFromDateDashboard={setFromDateDashboard}
                                        setToDateDashboard={setToDateDashboard}
                                        fromDateDashboard={fromDateDashboard}
                                        toDateDashboard={toDateDashboard}
                                    />
                                </Grid>
                            </Grid>
                        }
                    </Grid>

                </Grid>
            </div >
            {open && <EditMemberHealthCheck handleClose={handleClose} open={open} health_uuid={healthuuid} AlertManager={AlertManager} member_uuid={props.page_props.params.user_id} />
            }
            <SnakBarAlert alertOpen={alertOpen} setAlertOpen={setAlertOpen} alertSeverity={alertSeverity} alert={alert} />
            <BackDropLoading isLoading={isloading} />
        </>
    )
}


//Breadcrum component
const BreadCrumComponent = ({ push, firstName, lastName, profileToggle, userid, setProfileToggle }: any) => {
    return (
        <>
            <Typography variant="h6" sx={{ fontWeight: '600', cursor: 'pointer' }} onClick={(() => push("/users"))}>All Users</Typography>
            <KeyboardArrowRightIcon />
            <Typography variant="subtitle1" sx={{ fontWeight: '600', cursor: 'pointer' }} onClick={() => { setProfileToggle("profile"); push(`/users/${userid}?tab=profile`) }}>{firstName}&nbsp;{lastName}</Typography>
            <KeyboardArrowRightIcon />
            <Typography variant="subtitle1" sx={{ fontWeight: '500', textTransform: "capitalize" }} > {profileToggle == 'healthscore' ? 'Health Score' : profileToggle} </Typography>
        </>
    )
}