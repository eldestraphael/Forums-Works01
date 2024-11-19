"use client"

import React, { ChangeEvent, useRef, useState } from "react";
import { Avatar, Box, Button, Chip, FormControl, Grid, InputAdornment, Link, MenuItem, Select, TextField, Typography } from "@mui/material";
import SnakBarAlert from "@/components/snakbaralert/snakbaralert";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import SettingsIcon from '@mui/icons-material/Settings';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { StaticMessage } from "@/app/util/StaticMessage";




export default function AddMember() {

    const firstname = useRef("");
    const lastname = useRef("");
    const email = useRef("");
    const forums = useRef("");
    const phone = useRef("");
    const jobTitle = useRef("");
    const companyName = useRef("");



    const [alertOpen, setAlertOpen] = useState(false);
    const [alert, setAlert] = useState("");
    const [alertSeverity, setAlertSeverity] = useState(false);
    const [Toggle, setToggle] = useState(false);
    const [search, setSearch] = useState("");
    const [forumNamess, setForumNamess] = useState([]);
    const [companyUuid, setCompanyUuid] = useState<string[]>([]);
    const [ForumUuid, setForumUuid] = useState<string[]>([]);

    const [companySearch, setCompanySearch] = useState("");
    const [filteredCompanyNames, setFilteredCompanyNames] = useState([]);

    const [forumSearch, setForumSearch] = useState("");
    const [filteredForumNames, setFilteredForumNames] = useState([]);



    async function handleSaveMember() {

        const forumNames = forums.current
        const splitForums = forumNames.split(',');
        const newObjects: any = [];
        splitForums.forEach(item => {
            newObjects.push({ uuid: item.trim() }); // Creating objects with id property
        });
        try {
            let requestBody = {
                first_name: firstname.current,
                last_name: lastname.current,
                email: email.current,
                phone: phone.current,
                job_title: jobTitle.current,
                company_uuid: companyUuid,
                forums_info: ForumUuid
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
        }
        catch (error) {
            AlertManager(StaticMessage.ErrorMessage,true);

        }

    }
    async function SearchAPI(searchWord: string) {
        try {
            const requestForumSearchAPI = await fetch(`/api/admin/forum/search?q=${searchWord}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },

            });
            const searchApiResponse = await requestForumSearchAPI.json();
            return searchApiResponse?.data
        }
        catch (error: any) {
            AlertManager(StaticMessage.ErrorMessage,true);
        }
    }

    async function handleSearch(e: any) {
        const searchValue = e.target.value;
        setForumSearch(searchValue);
        const forumNames: any = await SearchAPI(searchValue);
        setFilteredForumNames(forumNames);
    }


    async function CompanySearchAPI(searchWord: string) {
        try {
            const requestCompanySearchAPI = await fetch(`/api/admin/company/search?q=${searchWord}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const searchApiResponse = await requestCompanySearchAPI.json();
            return searchApiResponse?.data;
        }
        catch (error) {
            AlertManager(StaticMessage.ErrorMessage,true);
        }

    }


    async function handleCompanySearch(e: any) {
        const searchValue = e.target.value;
        setCompanySearch(searchValue);
        const companyNames: any = await CompanySearchAPI(searchValue);
        setFilteredCompanyNames(companyNames);

    }

    async function handleClick(companyName: string, companyUuid: any) {
        setCompanySearch(companyName);
        setCompanyUuid(companyUuid);

        // const isSelected = selectedCompanies.includes(companyName);
        // if (isSelected) {
        //     setSelectedCompanies(selectedCompanies.filter(name => name !== companyName));
        // } else {
        //     setSelectedCompanies([...selectedCompanies, companyName]);
        // }
        const companyNames: any = await CompanySearchAPI(companyName);
        setFilteredCompanyNames([]);
    }

    async function handleForumClick(forumName: string, forumUuid: any) {
        setForumSearch(forumName);
        let obj: any = {};
        obj["uuid"] = forumUuid;

        ForumUuid.push(obj)
        const forumNames: any = await SearchAPI(forumName);
        setFilteredCompanyNames([]);
    }

    function AlertManager(message: string, severity: boolean) {
        setAlert(message)
        setAlertSeverity(severity)
        setAlertOpen(true)
    }

    return (
        <>
            <div style={{ backgroundColor: "#dedede", minHeight: "100vh" }} >
                <Grid md={12} container sx={{ backgroundColor: "#dedede", width: "80vw", minHeight: "100vh", ml: "19vw", alignItems: "flex-start" }} >
                    <Grid md={11.3} container direction={"column"} sx={{
                        backgroundColor: "#dedede", width: "68.946vw", minHeight: "98vh", mt: "0.729vw"
                    }} >
                        <Grid md={12} container item direction={"row"} className="mt-0.5" style={{ height: "5vh", justifyContent: "space-between", backgroundColor: "transperant", marginTop: "1.2vh" }}>
                            <Grid item container md={11.1} className="justify-start items-center" >
                                <Avatar sx={{ bgcolor: "white", height: "2.19vw", width: "2.19vw", border: "1px solid #D8D8D8" }} variant="rounded">
                                    <ArrowBackIcon style={{ color: "#000000", fontSize: "0.831vw" }} />
                                </Avatar>
                                <Typography style={{ paddingLeft: "0.7vw", color: "#000000", fontSize: "1.354vw", fontWeight: "700" }}>
                                    HR Forums</Typography>
                                <Typography style={{ color: "#000000", fontSize: "1.09vw", fontWeight: "700" }}>< KeyboardArrowRightIcon className="h-[0.781] w-[0.781]" />members</Typography>
                                <Typography style={{ color: "#000000", fontSize: "1.09vw", fontWeight: "700" }}>< KeyboardArrowRightIcon className="h-[0.781] w-[0.781]" />Add member</Typography>

                            </Grid>

                        </Grid>
                        <Grid md={12} container item className="flex justify-start items-start" style={{ minHeight: "35.469vw", width: "100%", backgroundColor: "transperant", marginTop: "1vh" }}>
                            <Grid md={12} container item className=" bg-white rounded-xl flex  border-solid border-1 justify-center items-center" sx={{ minHeight: "35.469vw", width: "68.94vw" }}>


                                <Grid container style={{ width: "39.219vw", minHeight: "32.96vw", justifyContent: "center", alignItems: "center", border: "1px solid #dedede ", borderRadius: "2vh" }} >
                                    <Grid md={12} container item style={{ width: "36.719vw", minHeight: "32.96vw", justifyContent: "center", alignItems: "center", backgroundColor: "transperant" }} >
                                        <Grid container item md={11.2} sx={{ minHeight: "27.823vw", width: "36.719vw", backgroundColor: "transperant", marginTop: "0.6vw" }}>

                                            <Grid container md={12} item direction={"row"} justifyContent={"space-between"} >
                                                <Grid container item md={5.8} style={{ width: "17.839vw", height: "3.646vw", marginBottom: "0.2vw" }} >
                                                    <Typography style={{ fontSize: "0.729vw", fontWeight: "400", color: "#5F5F5F" }}>FIRST NAME</Typography>
                                                    <TextField
                                                        style={{ width: "18vw", fontSize: "0.5vw" }}
                                                        placeholder="Enter your first name"
                                                        type='text'
                                                        size="small"
                                                        InputProps={{
                                                            sx: {
                                                                "& input::placeholder": {
                                                                    fontSize: "0.833vw", color: "#777777",
                                                                    height: "5vh",
                                                                    borderRadius: "1vh"
                                                                },
                                                            }
                                                        }}
                                                        InputLabelProps={{
                                                            style: { fontSize: "0.833vw", color: "#777777" }
                                                        }}

                                                        onChange={(e) => (firstname.current = e.target.value)}

                                                    />

                                                </Grid>
                                                <Grid container item md={5.9} style={{ width: "17.839vw", height: "3.646vw", marginBottom: "0.2vw", backgroundColor: "transperant" }} >
                                                    <Typography style={{ fontSize: "0.729vw", fontWeight: "400", color: "#5F5F5F" }}>LAST NAME</Typography>
                                                    <TextField
                                                        style={{ width: "18.5vw", fontSize: "0.5vw" }}
                                                        placeholder="Enter your last name"
                                                        type='text'
                                                        size="small"
                                                        InputProps={{
                                                            sx: {
                                                                "& input::placeholder": {
                                                                    fontSize: "0.833vw", color: "#777777",
                                                                    height: "5vh",
                                                                    borderRadius: "1vh"
                                                                },
                                                            }
                                                        }}
                                                        InputLabelProps={{
                                                            style: { fontSize: "0.833vw", color: "#777777" }
                                                        }}
                                                        onChange={(e) => (lastname.current = e.target.value)}
                                                    />

                                                </Grid>

                                            </Grid>

                                            <Grid container style={{ width: "36.719vw", height: "3.646vw", marginBottom: "0.2vw" }} >
                                                <Typography style={{ fontSize: "0.729vw", fontWeight: "400", color: "#5F5F5F" }}>JOB TITLE</Typography>
                                                <TextField
                                                    style={{ width: "36.5vw", fontSize: "0.5vw" }}
                                                    placeholder="Job Title"
                                                    type='text'
                                                    size="small"
                                                    InputProps={{
                                                        sx: {
                                                            "& input::placeholder": {
                                                                fontSize: "0.833vw", color: "#777777",
                                                                height: "5vh",
                                                                borderRadius: "1vh"
                                                            },
                                                        }
                                                    }}
                                                    InputLabelProps={{
                                                        style: { fontSize: "0.833vw", color: "#777777" }
                                                    }}
                                                    onChange={(e) => (jobTitle.current = e.target.value)}
                                                />
                                            </Grid>

                                            <Grid container style={{ width: "36.719vw", height: "3.646vw", marginBottom: "0.3vw" }} >
                                                <Typography style={{ fontSize: "0.729vw", fontWeight: "400", color: "#5F5F5F" }}>EMAIL</Typography>
                                                <TextField
                                                    style={{ width: "36.5vw", fontSize: "0.5vw" }}
                                                    placeholder="Email Address"
                                                    type='email'
                                                    size="small"
                                                    InputProps={{
                                                        sx: {
                                                            "& input::placeholder": {
                                                                fontSize: "0.833vw", color: "#777777",
                                                                height: "5vh",
                                                                borderRadius: "1vh"
                                                            },
                                                        }
                                                    }}
                                                    InputLabelProps={{
                                                        style: { fontSize: "0.833vw", color: "#777777" }
                                                    }}
                                                    onChange={(e) => (email.current = e.target.value)}
                                                />
                                            </Grid>
                                            <Grid container style={{ width: "36.719vw", height: "3.646vw", marginBottom: "0.3vw" }} >
                                                <Typography style={{ fontSize: "0.729vw", fontWeight: "400", color: "#5F5F5F" }}>PHONE</Typography>
                                                <TextField
                                                    style={{ width: "36.5vw", fontSize: "0.5vw" }}
                                                    placeholder="Phone"
                                                    type='text'
                                                    size="small"
                                                    InputProps={{
                                                        sx: {
                                                            "& input::placeholder": {
                                                                fontSize: "0.833vw", color: "#777777",
                                                                height: "5vh",
                                                                borderRadius: "1vh"
                                                            },
                                                        }
                                                    }}
                                                    InputLabelProps={{
                                                        style: { fontSize: "0.833vw", color: "#777777" }
                                                    }}
                                                    onChange={(e) => (phone.current = e.target.value)}
                                                />
                                            </Grid>
                                            <Grid container style={{ width: "36.719vw", minHeight: "3.646vw", marginBottom: "0.3vw" }} >
                                                <Typography style={{ fontSize: "0.729vw", fontWeight: "400", color: "#5F5F5F" }}>FORUMS</Typography>
                                                {/* <FormControl sx={{ width: 300 }}>
                                                    <Select
                                                        sx={{ width: '100%', backgroundColor: "white", marginBottom: "1.4vh" }}
                                                        multiple
                                                        color='secondary'
                                                        value={props.item.selectedData}
                                                        onChange={(e: any) => props.handleChange(e, props.item)}
                                                        renderValue={(selected) => {
                                                            return (
                                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                                    {selected.map((value: any) => (
                                                                        <Chip key={value} label={value} sx={{ fontSize: '0.78vw', padding: '0.3vw' }} />
                                                                    ))}
                                                                </Box>
                                                            )
                                                        }}
                                                        MenuProps={MenuProps}
                                                    >
                                                        {forumNamess.map((name: any, index: number) => {
                                                            // var names: any = Object.values(name)[0]
                                                            return (
                                                                <MenuItem
                                                                    key={index}
                                                                    value={name?.forum_name}
                                                                     style={getStyles(name, personName, theme)}
                                                                    sx={{ fontSize: '1vw' }}
                                                                >
                                                                    {name?.forum_name}
                                                                </MenuItem>
                                                            )
                                                        })}
                                                    </Select>
                                                </FormControl> */}


                                                <TextField
                                                    style={{ width: "36.5vw", fontSize: "0.5vw" }}
                                                    placeholder="Forum Names"
                                                    type='search'
                                                    size="small"

                                                    InputProps={{
                                                        endAdornment: (
                                                            <InputAdornment position='end' sx={{ position: 'absolute', right: '0.5vw' }}>
                                                                <SearchIcon />
                                                            </InputAdornment>
                                                        ),
                                                        sx: {
                                                            "& input::placeholder": {
                                                                fontSize: "0.833vw", color: "#777777",
                                                                height: "5vh",
                                                                borderRadius: "1vh"
                                                            },
                                                        }
                                                    }}
                                                    InputLabelProps={{
                                                        style: { fontSize: "0.833vw", color: "#777777" }
                                                    }}
                                                    value={forumSearch}
                                                    onChange={(e) => handleSearch(e)}
                                                />
                                                {filteredForumNames.map((item: any, index) => {
                                                    return (
                                                        <div key={index} onClick={() => handleForumClick(item.forum_name, item.uuid)} > <p>{item?.forum_name}</p> </div>
                                                    )
                                                })}

                                            </Grid>
                                            <Grid container style={{ width: "36.719vw", height: "3.646vw", marginBottom: "0.3vw" }} >
                                                <Typography style={{ fontSize: "0.729vw", fontWeight: "400", color: "#5F5F5F" }}>COMPANY NAME</Typography>
                                                <TextField
                                                    style={{ width: "36.5vw", fontSize: "0.5vw" }}
                                                    placeholder="Company Name"
                                                    type='text'
                                                    size="small"
                                                    InputProps={{
                                                        sx: {
                                                            "& input::placeholder": {
                                                                fontSize: "0.833vw", color: "#777777",
                                                                height: "5vh",
                                                                borderRadius: "1vh"
                                                            },
                                                        }
                                                    }}
                                                    InputLabelProps={{
                                                        style: { fontSize: "0.833vw", color: "#777777" }
                                                    }}
                                                    value={companySearch}
                                                    onChange={(e) => { handleCompanySearch(e) }}
                                                // onKeyDown={}
                                                />
                                                <Grid container item md={12} sx={{ height: "10vw", justifyContent: "flex-start" }} overflow={"scroll"}>

                                                    {filteredCompanyNames.map((item: any, index: number) => {
                                                        return (
                                                            <div key={index} style={{ cursor: "pointer", width: "36vw", height: "1vw", paddingLeft: "1vw" }} onClick={() => handleClick(item.company_name, item.uuid)}> <p>{item?.company_name}</p> &nbsp;&nbsp;&nbsp;&nbsp;</div>


                                                        )
                                                    })}
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                        <Grid container item md={12} style={{ width: "36.719vw", height: "3.396vw" }} justifyContent={"center"} alignItems={"flex-start"} sx={{ backgroundColor: "transperant" }}>
                                            <Button variant="contained" style={{ width: "10.677vw", height: "4.8vh", backgroundColor: "#2A2F42", borderRadius: "0.5vw", color: "#F0F2FF", fontSize: "0.72vw", fontWeight: "700" }} onClick={handleSaveMember}>Save</Button>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>

            </div >
            <SnakBarAlert alertOpen={alertOpen} setAlertOpen={setAlertOpen} alertSeverity={alertSeverity} alert={alert} />
        </>
    )
}
