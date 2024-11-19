'use client'
import { Autocomplete, Button, Grid, TextField, Typography, CircularProgress, Avatar, InputLabel, NativeSelect } from "@mui/material";
import SnakBarAlert from "@/components/snakbaralert/snakbaralert";
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import React, { useEffect, useState, useRef } from 'react'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs from "dayjs";
import BackDropLoading from '@/components/loading/backDropLoading';
import { useRouter } from 'next/navigation';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { renderTimeViewClock } from '@mui/x-date-pickers/timeViewRenderers';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { StaticMessage } from "@/app/util/StaticMessage";

export default function AddForum() {
    const [search, setSearch] = useState<any>([]);
    const [storeSearch, setStoreSearch] = useState<any>([]);
    const [selectedDate] = React.useState(dayjs());
    const [selectedDates, setSelectedDates] = useState<any>(dayjs().format('HH:mm:ss'));
    const [seletedDay, setSeletedDay] = useState<any>(new Date().toLocaleDateString('en-US', { weekday: 'long' }));
    const [alertOpen, setAlertOpen] = useState(false);
    const [alert, setAlert] = useState("");
    const [alertSeverity, setAlertSeverity] = useState(false);
    const [Loader, setLoader] = useState(false);
    const [isLoading, setisLoading] = useState(false);
    const [selectedCompanyError, setSelectedCompanyError] = useState(false);
    const { push } = useRouter();
    const [formData, setFormData] = useState({ForumName: ''});
    const [errors, setErrors] = useState({ForumName: ''});

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        let error = '';
        let maxLength = 50;
        if (value.length <= maxLength) {
            setFormData({ ...formData, [name]: value });
        } else {
            error = `${name} must be ${maxLength} characters or less`;
        }
        setErrors({ ...errors, [name]: error });
    };

    const handleBlur = (e: any) => {
        const { name, value } = e.target;
        let error = '';
        error = value.trim() === '' ? `${name} is required` : '';
        setErrors({ ...errors, [name]: error });
    };


    // //GETTING COMPANY DROPDOWN DATA
    async function handleSearch() {
        setisLoading(true)
        try {
            const response = await fetch(`/api/admin/company/search?q=`, {
                method: "GET",
                cache: 'no-store',
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const data = await response.json();
            if (response.status == 200) {
                const updatedItems = data?.data.map((item: any) => {
                    return { label: item.company_name, uuid: item.uuid };
                });
                setSearch(updatedItems);   
            }
            else {
                AlertManager(StaticMessage.ErrorMessage,true);
            }
        }
        catch (error: any) {
            AlertManager(StaticMessage.ErrorMessage,true);
        }
        setisLoading(false)
    }

    //SAVE BUTTON API CALL
    const handleSave = async (e: any) => {
        const requestBody ={
            forum_name: formData.ForumName,
            meeting_day: seletedDay,
            meeting_time: selectedDates,
            company_uuid: storeSearch?.uuid
        }

        if (!formData.ForumName.length || !seletedDay.length || selectedDates == undefined || !Object.keys(storeSearch).length) {
                AlertManager("Kindly fill all fields", true);
        }
        else {
            setLoader(true)

            try {
                const res = await fetch(`/api/admin/forum`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(requestBody),
                });
                if (res.status == 200) {
                    push("/admin/dashboard");
                }
                else {
                    AlertManager("Forum did not added", true)
                }
            }
            catch (error: any) {
                AlertManager(StaticMessage.ErrorMessage,true);
            }
        }
    }

    function AlertManager(message: string, severity: boolean) {
        setAlert(message)
        setAlertSeverity(severity)
        setAlertOpen(true)
        setisLoading(false);
        setLoader(false);
    }

    useEffect(() => {
        handleSearch();
    }, [])

    return (
        <div className="ml:0 lg:ml-[17.35vw]" style={{ backgroundColor: "#F6F5FB", paddingBottom: '5vh', minHeight: '100vh' }}>
            <Grid container item xs={12} justifyContent={'flex-start'} alignItems={'center'} sx={{ pt: 3, pb: 1, pl: 3, pr: 10 }}>
                <Grid container item xs={12} lg={6} alignItems={'center'}>
                    <BreadCrumComponent push={push} formData={formData} />
                </Grid>
            </Grid>
            <Grid container item xs={12} justifyContent={'flex-start'} alignItems={'center'} sx={{ pl: 3 }}>
                <Grid container item xs={11.5} alignItems={'center'} justifyContent={'center'} sx={{ backgroundColor: 'white', borderRadius: '1vh', p: 2, }} >
                    <Grid container item xs={12} justifyContent={'center'} alignItems={'flex-start'} sx={{ pt: 2 }}>
                        <Grid container item xs={11.7} sm={11} md={8} lg={7} justifyContent={'center'} sx={{ border: "1px solid #dedede", borderRadius: "2vh", p: 2 }}>
                            <Grid item xs={12} sx={{ color: "#777", m: "1vh" }}>
                                <Typography variant="caption">FORUM NAME</Typography>
                                <TextField
                                    fullWidth
                                    placeholder="Enter a forum name"
                                    name='ForumName'
                                    type='text'
                                    size="small"
                                    value={formData.ForumName}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={!!errors.ForumName}
                                    helperText={errors.ForumName}
                                    InputProps={{ sx: { borderRadius: "1vh", color: "#2A2F42", maxLength: 51 } }}
                                />
                            </Grid>

                            <Grid container item md={12} sx={{ color: "#777", m: "1vh" }} justifyContent={'space-between'} alignItems={'flex-start'}>
                                <Grid container item xs={12} sm={5.7} direction={'column'} sx={{ backgroundColor: 'white', }}>
                                    <Typography variant="caption" sx={{ color: "#5F5F5F" }}>MEETING DAY</Typography>
                                    <Select
                                        fullWidth
                                        size="small"
                                        id="demo-select-small"
                                        sx={{ borderRadius: '1vh' }}
                                        value={seletedDay}
                                        name={seletedDay}
                                        onChange={(e: any) => setSeletedDay(e.target.value)}>
                                        {
                                            ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((itm: any, i: number) => {
                                            return <MenuItem key={i} value={itm}> {itm} </MenuItem>
                                            })
                                        }
                                    </Select>
                                </Grid>
                                <Grid  container item xs={12} sm={5.7} direction={'column'} justifyContent={'flex-end'} sx={{ backgroundColor: 'white', }}>
                                    <Typography variant="caption" sx={{ color: "#5F5F5F" }}>MEETING TIME</Typography>
                                    <LocalizationProvider dateAdapter={AdapterDayjs} >

                                        <TimePicker
                                            value={selectedDate}
                                            onChange={(newValue: any) => {
                                                    setSelectedDates(newValue?.format('HH:mm:ss'))
                                                    }}
                                            sx={{
                                                width: '100%', // Set full width
                                                '& .MuiInputBase-root': {
                                                    padding: 0.96,
                                                    borderRadius: '1vh'
                                                    // height: '5.2vh', // Set input's height to fill the TimePicker's height
                                                },
                                                '& .MuiOutlinedInput-input': {
                                                    padding: '0vw', // Adjust padding as needed
                                                    // height: '4.5vh', // Ensure input fills the available height
                                                    // fontSize: '1vw',
                                                    backgroundColor: 'transparent'
                                                },
                                            }}
                                            viewRenderers={{
                                                hours: renderTimeViewClock,
                                                minutes: renderTimeViewClock,
                                                seconds: renderTimeViewClock,
                                            }}
                                        />
                                    </LocalizationProvider>
                                </Grid>

                            </Grid>
                            <Grid item xs={12} sx={{ color: "#777", m: "1vh" }}>
                                <Typography variant="caption">COMPANY</Typography>
                                <Autocomplete
                                    fullWidth
                                    size="small"
                                    disablePortal
                                    id="combo-box-demo"
                                    options={search}   
                                    // isOptionEqualToValue={(option, value) => option === value || option.label === value.label}
                                    renderInput={(params) => <TextField {...params} placeholder="Company Name" 
                                    error={selectedCompanyError} helperText={selectedCompanyError ? "Company is required" : ''}/>}
                                    onBlur={() => setSelectedCompanyError(Object.keys(storeSearch).length == 0)}
                                    onChange={(event, value) => { setStoreSearch(value); setSelectedCompanyError(false) }}
                                />
                            </Grid>
                            <Grid item xs={10} sm={4} md={4} lg={3} sx={{ m: "1vh" }}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    sx={{ backgroundColor: "#2A2F42", borderRadius: "1vh", color: "#F0F2FF", fontWeight: "700", '&:hover': { backgroundColor: '#2A2F42' } }}
                                    onClick={handleSave}
                                >
                                    {Loader ? <> &nbsp; <CircularProgress sx={{ color: "white" }} size={20} />
                                    </> : "SAVE"}
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
            <SnakBarAlert alertOpen={alertOpen} setAlertOpen={setAlertOpen} alertSeverity={alertSeverity} alert={alert} />
            <BackDropLoading isLoading={isLoading} />
        </div >
    )
}

// Breadcrum component
const BreadCrumComponent = ({ push, formData }: any) => {
    return (
        <>
            <ArrowBackIcon fontSize="large" sx={{ border: "1px solid #D8D8D8", color: 'black', p: 1, borderRadius: '0.5vh', cursor: 'pointer', mr: 2, backgroundColor:'white' }} onClick={() => push("/admin/dashboard")} />
            <Typography variant="h6" sx={{ fontWeight: '600', cursor: 'pointer' }} onClick={(() => push("/admin/dashboard"))}></Typography>
            {/* <KeyboardArrowRightIcon /> */}
            <Typography variant="subtitle1" sx={{ fontWeight: '600', }}>Add Forum</Typography>
        </>
    )
}

// {/* <div style={{backgroundColor:"#F6F5FB", height:"100vh", marginLeft:"17.35vw"}}>
//             <Grid container item xs={12} sx={{p:"2vh"}}>
//                 <Grid container sx={{p:"2vh"}}>
//                     <Grid container item xs={3} sm={1.1} md={0.9} lg={0.8} justifyContent={'center'} alignItems={'center'}>
//                     <Avatar sx={{ bgcolor: "white", border: "1px solid #D8D8D8", cursor: 'pointer' }} variant="rounded" onClick={() => push("/admin/dashboard")}>
//                         <ArrowBackIcon style={{ color: "#000000", fontSize: "0.831vw", cursor: 'pointer' }} />
//                     </Avatar>&nbsp;&nbsp;
//                     </Grid>
//                     <Grid container item xs={2.5} sm={1.1} md={1.2} lg={0.9} justifyContent={'center'} alignItems={'center'}>
//                         <Typography className="flex items-center" sx={{ color: "#000000", fontSize: "1.09vw", fontWeight: "700" }}>Add Forum</Typography>
//                     </Grid>
//                 </Grid>
//             </Grid>
//             <Grid container item xs={12} sm={12} md={11} justifyContent="center" alignItems="center" sx={{backgroundColor:"white", borderRadius:"2vh", p:"2vh"}}>
//                 <Grid container item xs={12} sm={10} md={12} lg={8} sx={{borderRadius: '2vh',border:"1px solid #dedede", padding:"3vh"}}>
//                     <Grid item xs={12} sx={{color: "#777", m:"1vh"}}>
//                             <Typography variant="caption">FORUM NAME</Typography>
//                             <TextField
//                                 fullWidth
//                                 placeholder="Enter a forum name"
//                                 name='ForumName'
//                                 type='text'
//                                 size="small"
//                                 value={formData.ForumName}
//                                 onChange={handleChange}
//                                 onBlur={handleBlur}
//                                 error={!!errors.ForumName}
//                             />
//                     </Grid>
//                     <Grid item xs={12} sx={{color: "#FF0000", m:"1vh"}}>
//                             <Typography variant="caption">{errors.ForumName}</Typography>
//                     </Grid>
//                     {/* 2 grid combine side parent */}
//                     <Grid container item  xs={12} direction={'row'}  sx={{backgroundColor:'transparent'}}>
//                         {/* metting day grid parent */}
//                          <Grid item xs={12}  md={5.7}  sx={{color: "#777"}}>
//                             <Grid item xs={8} sm={12}  md={12} sx={{backgroundColor:'transparent', m:"1vh"}} >
//                                 <Typography variant="caption">MEETING DAY</Typography>
//                             </Grid>
//                             <Grid item xs={10} md={12} sx={{backgroundColor:'transparent', m:"1vh"}}>
//                                 <FormControl size="small" defaultValue={'ggvbn'} fullWidth>
//                                     <Select
//                                         fullWidth
//                                         id="demo-select-small"
//                                         value={seletedDay}
//                                         name={seletedDay}
//                                         onChange={(e: any) => setSeletedDay(e.target.value)}>
//                                         {
//                                             ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((itm: any, i: number) => {
//                                                 return <MenuItem key={i} value={itm}> {itm} </MenuItem>
//                                             })
//                                         }
//                                     </Select>
//                                 </FormControl>
//                             </Grid>
//                         </Grid> 
//                         {/* meeting time parent */}
//                         <Grid item xs={12} md={5.7} sx={{backgroundColor:'transparent', m:"1vh"}} >
//                             {/* metting time grid */}
//                             <Grid item xs={8} sm={12}  md={12} sx={{backgroundColor:'transparent'}} >
//                                 <Typography variant="caption">MEETING TIME</Typography>
//                             </Grid>
//                             <Grid item xs={10} md={12} sx={{backgroundColor:'transparent'}}>
//                                 <LocalizationProvider dateAdapter={AdapterDayjs}>
//                                 <DemoContainer components={['TimePicker']} >
//                                 <TimePicker
//                                     value={selectedDate}
//                                     onChange={(newValue: any) => {
//                                         setSelectedDates(newValue.format('HH:mm:ss'))
//                                     }}
//                                     viewRenderers={{
//                                             hours: renderTimeViewClock,
//                                             minutes: renderTimeViewClock,
//                                             seconds: renderTimeViewClock,
//                                         }}
//                                         sx={{
//                                                 width: '100%', // Set full width
//                                                 '& .MuiInputBase-root': {
//                                                     padding: '0.78vw',
//                                                     // borderRadius: '1vh'
//                                                     // height: '5.2vh', // Set input's height to fill the TimePicker's height
//                                                 },
//                                                 '& .MuiOutlinedInput-input': {
//                                                     padding: '0vw', // Adjust padding as needed
//                                                     // height: '4.5vh', // Ensure input fills the available height
//                                                     // fontSize: '1vw',
//                                                     backgroundColor: 'transparent'
//                                                 },
//                                             }}

//                                 />
//                                 </DemoContainer>
//                                 </LocalizationProvider>
//                             </Grid>
//                         </Grid>
//                      </Grid>
//                     <Grid item xs={12} sx={{color: "#777", m:"1vh"}}>
//                         <Typography variant="caption">COMPANY</Typography>
//                         <Autocomplete
//                             disablePortal
//                             id="combo-box-demo"
//                             options={search}   
//                             size="small"
//                             renderInput={(params) => <TextField {...params} placeholder="Company Name" />}
//                             onBlur={() => setSelectedCompanyError(Object.keys(storeSearch).length == 0)}
//                             onChange={(event, value) => { setStoreSearch(value); setSelectedCompanyError(false) }}
                                
//                         />
//                     </Grid>
//                     <Grid item xs={12} sx={{color: "#FF0000", m:"1vh"}}>
//                         <Typography variant="body2" style={{ color: '#FF0000', fontSize: "0.6vw" }}>
//                             {selectedCompanyError ? "Company is required" : ''}
//                         </Typography>
//                     </Grid>

//                     <Grid container direction={'row'} justifyContent={'center'} alignItems={'center'} sx={{backgroundColor:'white'}}>
//                         <Grid container item xs={2} sm={2} md={2} lg={2} justifyContent={'center'} alignItems={'center'}  sx={{backgroundColor:'white'}}>
//                             <Button 
//                                 fullWidth
//                                 variant="contained" 
//                                 sx={{ textTransform: "initial", backgroundColor: "#2A2F42 !important", borderRadius: "1vh", color: "#F0F2FF !important", fontWeight: "700" }} onClick={handleSave}>
//                                 {Loader ? <> &nbsp; <CircularProgress sx={{ color: "white" }} size={20} />
//                                 </> : "SAVE"}
//                             </Button>
//                         </Grid>
//                     </Grid>
//                     {/* </Grid> */}
//                 </Grid> 
//             </Grid>
//         </div> */}







{/* <div style={{ backgroundColor: "#F6F5FB" }} > */}
        //     <Grid md={12} container item sx={{ backgroundColor: "#F6F5FB", width: "79vw", height: "100vh", ml: "20vw", alignItems: "flex-start", pt: "2vh" }} >
        //         <Grid md={11.3} container item direction={"row"} sx={{
        //             backgroundColor: "#F6F5FB", width: "68.946vw", height: "25.625vw", mt: "0.729vw"
        //         }}>
        //             <Grid md={12} container item direction={"row"} className="mt-0.5" style={{ height: "5vh", justifyContent: "space-between", backgroundColor: "transperant", margin: "1.2vh" }}>
        //                 <Grid item container md={11.1} className="justify-start items-center" >
        //                     <Avatar sx={{ bgcolor: "white", height: "2.19vw", width: "2.19vw", border: "1px solid #D8D8D8", cursor: 'pointer' }} variant="rounded" onClick={() => push("/admin/dashboard")}>
        //                         <ArrowBackIcon style={{ color: "#000000", fontSize: "0.831vw", cursor: 'pointer' }} />
        //                     </Avatar>&nbsp;&nbsp;
        //                     <Typography className="flex items-center" style={{ color: "#000000", fontSize: "1.09vw", fontWeight: "700" }}>Add Forum</Typography>
        //                 </Grid>
        //             </Grid>
        //             <Grid md={12} container item className="flex justify-start items-start  mt-3" style={{ height: "23.125vw", }}>
        //                 <Grid md={12} container item className=" bg-white rounded-xl flex  border-solid border-1 justify-center items-center" sx={{ height: "22.083vw", }}>
        //                     <Grid container className='drop-shadow-2xl' style={{ width: "39.219vw", height: "18.625vw", justifyContent: "center", alignItems: "center", border: "1px solid #dedede ", borderRadius: "2vh" }} >
        //                         <Grid md={12} container item style={{ width: "36.719vw", height: "15.833vw", justifyContent: "center", alignItems: "center" }} >
        //                             <Grid container style={{ width: "36.719vw", height: "3.646vw", marginBottom: "0.7vw" }} >
        //                                 <Grid container item md={12} style={{ marginLeft: "auto" }}>
        //                                     <Typography style={{ fontSize: "0.729vw", fontWeight: "400", color: "#5F5F5F" }}>FORUM NAME</Typography>
        //                                     <TextField
        //                                         style={{ width: "36.5vw", fontSize: "0.833vw" }}
        //                                         placeholder="Enter a forum name"
        //                                         name='ForumName'
        //                                         type='text'
        //                                         size="small"
        //                                         InputProps={{
        //                                             sx: {
        //                                                 "& input::placeholder": {
        //                                                     fontSize: "1vw", color: "#777777",
        //                                                     height: "5vh",
        //                                                     borderRadius: "1vh"
        //                                                 }, maxLength: 51
        //                                             }
        //                                         }}
        //                                         InputLabelProps={{
        //                                             style: { fontSize: "0.833vw", color: "#777777" }
        //                                         }}
        //                                         value={formData.ForumName}
        //                                         onChange={handleChange}
        //                                         onBlur={handleBlur}
        //                                         error={!!errors.ForumName}
        //                                     />
        //                                 </Grid>
        //                                 <Grid container md={12} item sx={{ width: "100%", marginTop: "0.1vw" }}>
        //                                     <Typography variant="body2" style={{ color: '#FF0000', fontSize: "0.6vw" }}>
        //                                         {errors.ForumName} </Typography>
        //                                 </Grid>
        //                             </Grid>
        //                             <Grid container justifyContent={'space-between'} direction={'column'} style={{ width: "36.719vw", height: "3.646vw", marginBottom: "0.417vw", backgroundColor: 'transparent' }}>
        //                                 <Grid container style={{ width: "17.813vw", height: "3.646vw", backgroundColor: 'transparent' }} >
        //                                     <Typography style={{ fontSize: "0.729vw", fontWeight: "400", color: "#5F5F5F" }}>MEETING DAY</Typography>
        //                                     <FormControl sx={{ width: "17.813vw", height: '2.5vw' }} size="small" defaultValue={'ggvbn'}>
        //                                         {/* <InputLabel id="demo-simple-select-helper-label">Select</InputLabel> */}
        //                                         <Select
        //                                             id="demo-select-small"
        //                                             value={seletedDay}
        //                                             name={seletedDay}
        //                                             sx={{ fontSize: '1vw', color: '#777777', height: '6vh' }}
        //                                             onChange={(e: any) => setSeletedDay(e.target.value)}>

        //                                             {
        //                                                 ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((itm: any, i: number) => {
        //                                                     return <MenuItem key={i} value={itm}> {itm} </MenuItem>
        //                                                 })
        //                                             }
        //                                         </Select>
        //                                     </FormControl>
        //                                 </Grid>&nbsp;&nbsp;&nbsp;
        //                                 <Grid container style={{ width: "17.813vw", height: "3.646vw", backgroundColor: 'transparent' }}>
        //                                     <Typography style={{ fontSize: "0.729vw", fontWeight: "400", color: "#5F5F5F", backgroundColor: 'transparent' }}>MEETING TIME</Typography>
        //                                     <LocalizationProvider dateAdapter={AdapterDayjs} >
        //                                         <DemoContainer components={['TimePicker']} sx={{ Margin: 0, padding: 0, height: '2.7vw', display: 'flex', alignItems: 'center' }}>
        //                                             <TimePicker
        //                                                 value={selectedDate}
        //                                                 onChange={(newValue: any) => {
        //                                                     setSelectedDates(newValue.format('HH:mm:ss'))
        //                                                 }}
        //                                                 slotProps={{
        //                                                     textField: {
        //                                                         inputProps: {
        //                                                             style: {
        //                                                                 padding: 7,
        //                                                                 height: 'auto',
        //                                                                 fontSize: '1.1vw',
        //                                                                 backgroundColor: 'transparent'
        //                                                             }
        //                                                         }
        //                                                     }
        //                                                 }}
        //                                                 viewRenderers={{
        //                                                     hours: renderTimeViewClock,
        //                                                     minutes: renderTimeViewClock,
        //                                                     seconds: renderTimeViewClock,
        //                                                 }}
        //                                             />
        //                                         </DemoContainer>
        //                                     </LocalizationProvider>
        //                                 </Grid>
        //                             </Grid>
        //                             <Grid container style={{ width: "36.719vw", height: "2.5vw", marginBottom: "1.8vw" }} >
        //                                 <Grid container item md={12} style={{ marginLeft: "auto" }}>

        //                                     <Typography style={{ fontSize: "0.729vw", fontWeight: "400", color: "#5F5F5F" }}>COMPANY</Typography>
        //                                     <Autocomplete
        //                                         disablePortal
        //                                         id="combo-box-demo"
        //                                         options={search}   
        //                                         size="small"
        //                                         renderInput={(params) => <TextField {...params} placeholder="Company Name" />}
        //                                         onBlur={() => setSelectedCompanyError(Object.keys(storeSearch).length == 0)}

        //                                         onChange={(event, value) => { setStoreSearch(value); setSelectedCompanyError(false) }}
        //                                         sx={{
        //                                             width: "36.5vw", fontSize: '0.833vw', color: '#777777', height: '5vh' // Set your height here.
        //                                         }}
        //                                     />
        //                                 </Grid>
        //                                 <Grid container md={12} item sx={{ width: "100%", marginTop: "0.1vw" }}>
        //                                     <Typography variant="body2" style={{ color: '#FF0000', fontSize: "0.6vw" }}>
        //                                         {selectedCompanyError ? "Company is required" : ''}                                                   </Typography>
        //                                 </Grid>
        //                             </Grid>
        //                             <Grid container item md={12} style={{ width: "36.719vw", height: "2.396vw" }} justifyContent={"center"} alignItems={"center"} >
        //                                 <Button variant="contained" style={{ textTransform: "initial", width: "10.677vw", height: "4.8vh", backgroundColor: "#2A2F42", borderRadius: "0.5vw", color: "#F0F2FF", fontSize: "0.72vw", fontWeight: "700" }} onClick={handleSave}>
        //                                     {Loader ? <> &nbsp; <CircularProgress sx={{ color: "white" }} size={20} />
        //                                     </> : "SAVE"}
        //                                 </Button><br />
        //                             </Grid>
        //                         </Grid>
        //                     </Grid>
        //                 </Grid>
        //             </Grid>
        //         </Grid>
        //     </Grid >
        //     <SnakBarAlert alertOpen={alertOpen} setAlertOpen={setAlertOpen} alertSeverity={alertSeverity} alert={alert} />
        //     <BackDropLoading isLoading={isLoading} />
        // </div >
