"use client"

import React, { useEffect, useState } from "react";
import { styled } from '@mui/material/styles';
import { Autocomplete, Button, CircularProgress, Grid, TextField, Typography } from "@mui/material";
import SnakBarAlert from "@/components/snakbaralert/snakbaralert";
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import BackDropLoading from "@/components/loading/backDropLoading";
import { useRouter, useSearchParams } from 'next/navigation';
import { useSelector } from "react-redux";
import { StaticMessage } from "@/app/util/StaticMessage";

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

export default function AddUsers(props: any) {

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
    const searchParams = useSearchParams()
    const [alertOpen, setAlertOpen] = useState(false);
    const [alert, setAlert] = useState("");
    const [alertSeverity, setAlertSeverity] = useState(false);
    const [isloading, setisLoading] = useState<Boolean>(false);
    const [isBtnloading, setBtnIsLoading] = useState<Boolean>(false);
    const [filteredCompanyNames, setFilteredCompanyNames] = useState<any>([]);
    const [filteredForumNames, setFilteredForumNames] = useState([]);
    const [companyValue, setCompanyValue] = useState<any>(null);
    const [forumValue, setforumValue] = useState<any>([]);
    const [selectedForumError, setSelectedForumError] = useState(false);
    const [selectedCompanyError, setSelectedCompanyError] = useState(false);
    const [userRole, setUserRole] = useState<any>([]);
    const [userRoleValue, setUserRoleValue] = useState<any>(null);
    const [selectedUserRoleError, setSelectedUserRoleError] = useState(false);
    const [isTHINKIFICBtnLoader, setIsTHINKIFICBtnLoader] = useState(false);
    const [isCSVBtnLoader, setIsCSVBtnLoader] = useState(false);
    const { push } = useRouter();
    const forum_name = useSelector((state: any) => state.forumName.forumNameValue)
    const [currentPage, setCurrentPage] = useState(searchParams.get('page') || 1);
    const [isAutocompletLoading, setIsAutocompletLoading] = useState(false);
    const [isFreeSoloCondition, setIsFreeSoloCondition] = useState(true);
    const [errorEmail, setErrorEmail] = useState(false);
    const [isCompanySearchLoading, setIsCompanySearchLoading] = useState(false);
    const [isUserRoleLoading, setIsUserRoleLoading] = useState(false);
    const handleChange = (e: any) => {
        const { name, value } = e.target;
        let error = '';
        let maxLength = 50;

        const formattedName = name
            .replace(/([A-Z])/g, ' $1') // Add space before each uppercase letter
            .trim() // Remove leading and trailing spaces
            .toLowerCase() // Convert the entire string to lowercase
            .replace(/^./, (str: any) => str.toUpperCase()) // Capitalize the first letter of the entire string
            .replace('email', 'Email'); // Special case for Email
        if (name === 'Phone') {
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
                if (name === 'Email') {
                    setFormData({ ...formData, [name]: value });
                    clearTimeout(typingTimer);
                    typingTimer = setTimeout(() => {
                        handleBlur(e);
                    }, 1000);
                }
                setFormData({ ...formData, [name]: value });
            } else {
                error = `${formattedName} must be ${maxLength} characters or less`;
            }
        }
        setErrors({ ...errors, [name]: error });
    };

    const validateEmail = (email: any) => {
        const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        return re.test(String(email).toLowerCase());
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

        if (name === 'Email') {
            if (value.trim() === '') {
                error = `${formattedName} address is required`;
            } else {
                const isValidEmail = validateEmail(value);
                error = !isValidEmail ? 'Please enter a valid email address' : '';
                setErrorEmail(isValidEmail);
            }
        }
        else if (name === 'Phone') {
            if (value.trim() != '' && (value.length < 10 || value.length > 15)) {
                error = 'Please enter 10 to 15 digit phone number';
            }
        }
        setErrors({ ...errors, [name]: error });
    };

    let typingTimer: ReturnType<typeof setTimeout>;

    useEffect(() => {
        return () => clearTimeout(typingTimer);
    }, []);


    async function handleSaveMember() {

        if (!formData.FirstName.length || !formData.Email.length || !userRoleValue || !formData.JobTitle.length || companyValue == null) {
            AlertManager("kindly fill all fields", true);
        }
        else {
            setBtnIsLoading(true);
            try {

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
                    email: formData.Email,
                    role_uuid: userRoleValue?.uuid,
                    job_title: formData.JobTitle,
                    company_uuid: companyValue.uuid,
                    forums_info: forumValue.map((item: any) => {
                        return { uuid: item.uuid }
                    })

                }
                if (formData.Phone || formData.Phone == null) {
                    requestBody.phone = formData.Phone;
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
                    setBtnIsLoading(true);
                    push(`/users`)
                }
                else {
                    AlertManager(apiResponse?.message, true);
                }
            }
            catch (error) {
                AlertManager(StaticMessage.ErrorMessage, true);
            }
        }
    }

    function AlertManager(message: string, severity: boolean) {
        setAlert(message)
        setAlertSeverity(severity)
        setAlertOpen(true)
        setisLoading(false);
        setBtnIsLoading(false);
        setIsCompanySearchLoading(false);
        setIsUserRoleLoading(false);
    }

      //GET Thinkific API call
      async function handleThinkIfIcGET() {
        setIsTHINKIFICBtnLoader(true)
        AlertManager("Fetching data. This might take a while", false);
        try {
            const resThinkIfIcAPI = await fetch(`/api/thinkfic/migration/users?page=1&limit=100`, {
                method: "GET",
                cache: 'no-store',
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const ThinkIfIcAPI = await resThinkIfIcAPI.json();
            if (resThinkIfIcAPI.status == 200) {
                AlertManager(`${ThinkIfIcAPI?.messages}. redirecting..`, false);
                setIsTHINKIFICBtnLoader(false)
                setTimeout(function () {
                    push("/users")
                }, 1000);
            } else {
                AlertManager(ThinkIfIcAPI?.message, true);
                setIsTHINKIFICBtnLoader(false)
            }
        }
        catch (error: any) {
            AlertManager(StaticMessage.ErrorMessage, true);
        }
    }

    //CSV User Upload
    const handleFileUpload = async (e: any) => {
        setIsCSVBtnLoader(true)
        try {
            if (e.target.files[0]) {
                const formData = new FormData();
                formData.append("file", e.target.files[0]);

                const res = await fetch('/api/auth/sign-up-with-csv', {
                    method: "POST",
                    body: formData,

                });
                const data = await res.json();
                e.target.value = null
                if (res.status == 200) {
                    AlertManager(`${data?.message}. redirecting..`, false);
                    setTimeout(function () {
                        push("/users")
                    }, 1000);
                }
                else {
                    e.target.value = null
                    throw { res, data };
                }
                setIsCSVBtnLoader(false)
            }
        } catch (err: any) {
            if (err?.response?.status) {
                AlertManager(`Error : ${err?.data?.message}`, true);
            } else {
                AlertManager(`Unable to proccess the req now.`, true);
            }
            setIsCSVBtnLoader(false)
        }
    };

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
            setIsAutocompletLoading(false);
        }
    }

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
            setisLoading(false);
            setIsCompanySearchLoading(false);
        }
        catch (error) {
            AlertManager(StaticMessage.ErrorMessage, true);
        }
    }

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
            setisLoading(false);
            setIsUserRoleLoading(false);
        }
        catch (error) {
            AlertManager(StaticMessage.ErrorMessage, true);
        }
    }

    // HANDLECOMPANY CLICK
    function handlecompanyClick(event: any, value: any) {
        setCompanyValue(value);
        setforumValue([]);
        setSelectedCompanyError(false);
    }

    // useEffect(() => {
    //     setisLoading(true);
    //     CompanySearchAPI();
    //     // if(companyValue){
    //     //     forumSearchAPI();
    //     // }
    //     UserRoleSearchAPI();
    // }, [])

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
            <div className="ml:0 lg:ml-[17.35vw]" style={{ backgroundColor: "#F6F5FB", paddingBottom: '5vh', minHeight: "100vh" }}>
                <Grid container item xs={12} justifyContent={'flex-start'} alignItems={'center'} sx={{ pt: 3, pb: 1, pl: 3 }}>
                    <Grid container item xs={11.5} alignItems={'center'} >
                        <BreadCrumComponent push={push} params={props?.params} forum_name={forum_name} />
                    </Grid>
                </Grid>
                <Grid container item xs={12} justifyContent={'flex-start'} alignItems={'center'} sx={{ pl: 3 }}>
                    {props.addUserAction[1].read &&
                        <Grid container item xs={11.5} sm={11} md={10} alignItems={'center'} justifyContent={'center'} direction={'column'} sx={{ backgroundColor: 'white', borderRadius: '1vh', py: 2 }} >
                            <Grid container item md={11} justifyContent={'flex-end'} gap={1} sx={{ px: 2, backgroundColor: 'transparent' }}>
                                <Grid container item xs={12} sm={3} md={3} lg={2} justifyContent={"flex-end"} sx={{ backgroundColor: 'transparent' }}>
                                    {props.addUserAction[0].create
                                        &&
                                        <Button variant="contained" fullWidth component="label" sx={{ textTransform: "initial", backgroundColor: "#2A2F42", borderRadius: "1vh !important", color: "#F0F2FF", fontWeight: "700", p: "1.2vh", '&:hover': { backgroundColor: '#32374e' } }}
                                        >
                                            <VisuallyHiddenInput type="file" accept="xlsx" onChange={handleFileUpload} />
                                            {isCSVBtnLoader ? <> Uploading &nbsp;&nbsp; <CircularProgress sx={{ color: 'white' }} size={20} />
                                            </> : <Typography variant="caption" sx={{ fontWeight: "700" }}>Import as CSV</Typography>}
                                        </Button>
                                    }
                                </Grid>
                                <Grid container item xs={12} sm={3} md={4} lg={3} xl={2} justifyContent={"flex-end"} sx={{ backgroundColor: 'transparent' }}>
                                    {props.addUserAction[0].create
                                        &&
                                        <Button variant="contained" fullWidth component="label" sx={{ textTransform: "initial", backgroundColor: "#2A2F42", borderRadius: "1vh !important", color: "#F0F2FF", fontWeight: "700", p: "1.2vh", '&:hover': { backgroundColor: '#32374e' } }}
                                            onClick={handleThinkIfIcGET}
                                        >
                                            {isTHINKIFICBtnLoader ? <> Uploading &nbsp;&nbsp; <CircularProgress sx={{ color: 'white' }} size={20} />
                                            </> : <Typography variant="caption" sx={{ fontWeight: "700" }}>Import from THINKIFIC</Typography>}
                                        </Button>
                                    }
                                </Grid>
                            </Grid>
                            <Grid container item xs={12} justifyContent={'center'} alignItems={'flex-start'} sx={{ pt: 2 }}>
                                <Grid container item xs={11.7} sm={11} md={8.2} lg={7.2} justifyContent={'center'} alignItems={"center"} sx={{ border: "1px solid #dedede", borderRadius: "2vh", p: 0.5, marginBottom: "0.5vh" }}>
                                    <Grid container item md={12} sx={{ color: "#777", m: "1vh", backgroundColor: "transperant" }} justifyContent={'space-between'} alignItems={'flex-start'}>
                                        <Grid container item xs={12} sm={5.8} direction={'column'} sx={{ backgroundColor: 'transparent', }}>
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
                                                InputProps={{ sx: { borderRadius: "1vh", color: "#2A2F42", maxLength: 51 } }}
                                            />
                                        </Grid>
                                        <Grid container item xs={12} sm={5.7} direction={'column'} justifyContent={'flex-end'} sx={{ backgroundColor: 'white', }}>
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
                                                InputProps={{ sx: { borderRadius: "1vh", color: "#2A2F42", maxLength: 51 } }}
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
                                                loading={isCompanySearchLoading}
                                                options={filteredCompanyNames}
                                                size="small"
                                                value={companyValue}
                                                renderInput={(params) => <TextField {...params} placeholder="Choose the company of the user" error={selectedCompanyError} helperText={selectedCompanyError ? "Company name is required" : ''} sx={{ "& .MuiOutlinedInput-root": { borderRadius: "1vh" } }} />}
                                                isOptionEqualToValue={(option, value) => { return option.label === value.label }}
                                                onBlur={() => setSelectedCompanyError(companyValue == null)}
                                                onChange={handlecompanyClick}
                                                onOpen={CompanySearchAPI}

                                            />
                                        </Grid>
                                        <Grid item xs={12} sx={{ color: "#777", my: "1vh", backgroundColor: "transperant" }}>
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
                                                InputProps={{ sx: { borderRadius: "1vh", color: "#2A2F42", maxLength: 51 } }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sx={{ color: "#777", my: "1vh" }}>
                                            <Typography variant="caption">EMAIL ADDRESS</Typography>
                                            <TextField
                                                fullWidth
                                                name='Email'
                                                placeholder="Enter an email address"
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
                                            <Typography variant="caption">PHONE NUMBER (Optional)</Typography>
                                            <TextField
                                                fullWidth
                                                name="Phone"
                                                type='number'
                                                size="small"
                                                placeholder="Enter a Phone number"
                                                value={formData.Phone}
                                                onChange={handleChange}
                                                helperText={errors.Phone}
                                                error={!!errors.Phone}
                                                sx={{ color: "#2A2F42" }}
                                                InputProps={{ sx: { borderRadius: "1vh", color: "#2A2F42", maxLength: 15 } }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sx={{ color: "#777", my: "1vh" }}>
                                            <Typography variant="caption">USER ROLE</Typography>
                                            <Autocomplete
                                                fullWidth
                                                // disablePortal
                                                id="combo-box-demo"
                                                loading={isUserRoleLoading}
                                                options={userRole}
                                                value={userRoleValue}
                                                size="small"
                                                isOptionEqualToValue={(option, value) =>
                                                    option === value || option.label === value.label // Customize this based on your data structure
                                                }
                                                renderInput={(params) => <TextField {...params} placeholder="Enter an user role" name='UserRole' onBlur={handleBlur} error={selectedUserRoleError} helperText={selectedUserRoleError ? "User role is required" : ''} sx={{ "& .MuiOutlinedInput-root": { borderRadius: "1vh" } }} />}
                                                onBlur={() => setSelectedUserRoleError(userRoleValue === null)}
                                                onChange={(event: any, newValue: any) => {
                                                    setUserRoleValue(newValue);
                                                    setSelectedUserRoleError(false);
                                                }}
                                                onOpen={UserRoleSearchAPI}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sx={{ color: "#777", my: "1vh" }}>
                                            <Typography variant="caption">{`FORUM NAME (Optional)`}</Typography>
                                            <Autocomplete
                                                fullWidth
                                                multiple
                                                size="small"
                                                id="tags-outlined"
                                                options={filteredForumNames}
                                                value={forumValue}
                                                loading={isAutocompletLoading}
                                                filterSelectedOptions
                                                freeSolo={filteredForumNames.length == 0 && isFreeSoloCondition}
                                                isOptionEqualToValue={(option, value) => option.label === value.label}
                                                renderInput={(params) => (<TextField{...params} placeholder="Search for a forum" error={selectedForumError} helperText={selectedForumError ? "Forum name is required" : ''} sx={{ "& .MuiOutlinedInput-root": { borderRadius: "1vh" } }} />)}
                                                onBlur={() => {
                                                    // setSelectedForumError(forumValue.length === 0)
                                                    setFilteredForumNames([]);
                                                    setIsFreeSoloCondition(true)
                                                }}
                                                onChange={(event: any, newValue: any) => {
                                                    setforumValue(newValue);
                                                    setFilteredForumNames([]);
                                                    setIsFreeSoloCondition(true);
                                                    setSelectedForumError(false);
                                                }}
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
                                        <Grid container item md={12} sx={{ justifyContent: "center", alignItems: "center" }}>
                                            <Grid item xs={10} sm={4} md={4} lg={3} sx={{ m: "1vh" }}>
                                                {props.addUserAction[0].create &&
                                                    <Button
                                                        fullWidth
                                                        variant="contained"
                                                        disabled={!formData.FirstName || !formData.JobTitle || (!formData.Email || !errorEmail) || !userRoleValue || !companyValue || (formData.Phone.length !== 0) && (formData.Phone.length < 10 || formData?.Phone.length > 15)}
                                                        sx={{ backgroundColor: "#2A2F42", borderRadius: "0.5vh", color: "#F0F2FF", fontWeight: "700", '&:hover': { backgroundColor: '#2A2F42' } }}
                                                        onClick={handleSaveMember}
                                                    >
                                                        <Typography variant="caption" sx={{ fontWeight: "700" }}>{isBtnloading ? <CircularProgress sx={{ color: "white" }} size={20} /> : ' Add User'}</Typography>
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
            <Typography variant="h6" sx={{ fontWeight: '600', cursor: 'pointer' }} onClick={(() => push("/users"))} >All Users</Typography>
            <KeyboardArrowRightIcon />
            <Typography variant="subtitle1" sx={{ fontWeight: '500' }} >Add User</Typography>
        </>
    )
}