'use client'
import { Autocomplete, Button, Grid, TextField, Typography, CircularProgress, Avatar, Link } from "@mui/material";
import SnakBarAlert from "@/components/snakbaralert/snakbaralert";
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import React, { useEffect, useState } from 'react'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs from "dayjs";
import BackDropLoading from '@/components/loading/backDropLoading';
import { useRouter } from 'next/navigation';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { renderTimeViewClock } from '@mui/x-date-pickers/timeViewRenderers';
import Brightness1Icon from '@mui/icons-material/Brightness1';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import DateFormats from "@/components/dateFormat";
import { usePathname } from 'next/navigation'
import { StaticMessage } from "@/app/util/StaticMessage";

export default function EditForum(props: any) {
    const [search, setSearch] = useState<any>([]);
    const [storeSearch, setStoreSearch] = useState<any>(null);
    const [defaultDate, setDefaultDate] = React.useState(dayjs());
    const [selectedDates, setSelectedDates] = useState<any>('');
    const [seletedDay, setSeletedDay] = useState<any>('');
    const [alertOpen, setAlertOpen] = useState(false);
    const [alert, setAlert] = useState("");
    const [alertSeverity, setAlertSeverity] = useState(false);
    const [Loader, setLoader] = useState(false);
    const [isLoading, setisLoading] = useState(false);
    const [historicalHealth, sethistoricalHealth] = useState<any>([]);

    const [selectedCompanyError, setSelectedCompanyError] = useState(false);
    const [formData, setFormData] = useState({ ForumName: '' });
    const [errors, setErrors] = useState({ ForumName: '' });
    const { push } = useRouter();

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

    //GETTING COMPANY DROP DOWN VALUE
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

    //SAVE BUTTON API FUNCTION
    const handleSave = async () => {
        if (!formData.ForumName.length || !seletedDay.length || selectedDates == undefined || !storeSearch) {
            AlertManager("Kindly fill all fields", true);
        }
        else {
            setLoader(true)
            try {
                const res = await fetch(`/api/admin/forum?uuid=${props.params.forum_uuid}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        forum_name: formData.ForumName,
                        meeting_day: seletedDay,
                        meeting_time: selectedDates,
                        company_uuid: storeSearch.uuid
                    }),
                });
                const data = await res.json();
                if (res.status == 200) {
                    push("/admin/dashboard");
                }
                else {
                    AlertManager(StaticMessage.ErrorMessage,true);
                }
            }
            catch (error: any) {
                AlertManager(StaticMessage.ErrorMessage,true);
            }
        }
    }


    //GETTING INITIAL VALUE
    async function handleView() {
        try {
            const res = await fetch(`/api/admin/forum?uuid=${props.params.forum_uuid}`, {
                method: "GET",
                cache: 'no-store',
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const data = await res.json();
            if (res.status == 200) {
                setFormData({ ...formData, ForumName: data?.data?.forum_info?.forum_name })
                setSeletedDay(data?.data?.forum_info?.meeting_day == null ? new Date().toLocaleDateString('en-US', { weekday: 'long' }) : data?.data?.forum_info?.meeting_day)
                let newTime = data?.data?.forum_info?.meeting_time == null ? dayjs().format('HH:mm:ss') : data?.data?.forum_info?.meeting_time.slice(0, 5);
                setDefaultDate(dayjs(newTime, 'HH:mm'))
                setSelectedDates(newTime + ":00")
                const newCompanyValue = {
                    label: data?.data?.forum_info?.company_info?.company_name || 'Unknown Company',
                    uuid: data?.data?.forum_info?.company_info?.uuid || 'Unknown UUID'
                };
                setStoreSearch(newCompanyValue)
            } else {
                AlertManager(StaticMessage.ErrorMessage,true);
            }
        }
        catch (error: any) {
            AlertManager(StaticMessage.ErrorMessage,true);
        }
    }

    async function cardView() {
        try {
            const cardResponse = await fetch(`/api/admin/forum/health?uuid=${props.params.forum_uuid}`, {
                method: "GET",
                cache: 'no-store',
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const data = await cardResponse.json();
            if (cardResponse.status == 200) {
                sethistoricalHealth(data?.data?.historical_health)
                // sethistoricalHealth(data?.data?.his)
            }
        }
        catch (error: any) {
            AlertManager(StaticMessage.ErrorMessage,true);
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
        handleView();
        cardView();
    }, [])

    function handleOpen(item: any) {

        push(`/admin/forum/${props.params.forum_uuid}/members/?health_check_date=${item?.date}&settings=true`)
    }

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
                                        value={seletedDay}
                                        name={seletedDay}
                                        sx={{ borderRadius: '1vh' }}
                                        onChange={(e: any) => { setSeletedDay(e.target.value); }}>
                                        {
                                            ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((itm: any, i: number) => {
                                                return <MenuItem key={i} value={itm}> {itm} </MenuItem>
                                            })
                                        }
                                    </Select>
                                </Grid>
                                <Grid container item xs={12} sm={5.7} direction={'column'} justifyContent={'flex-end'} sx={{ backgroundColor: 'white', }}>
                                    <Typography variant="caption" sx={{ color: "#5F5F5F" }}>MEETING TIME</Typography>
                                    <LocalizationProvider dateAdapter={AdapterDayjs} >

                                        <TimePicker
                                            value={defaultDate}
                                            onChange={(newValue: any) => {
                                                setSelectedDates(newValue.format('HH:mm:ss'));
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
                                    value={storeSearch}
                                    renderInput={(params) => <TextField {...params} placeholder="Company Name" error={selectedCompanyError} helperText={selectedCompanyError ? "Company is required" : ''} sx={{ "& .MuiOutlinedInput-root": { borderRadius: "1vh" } }} />}
                                    isOptionEqualToValue={(option, value) => option === value || option.label === value.label}
                                    onBlur={() => setSelectedCompanyError(storeSearch == null)}
                                    onChange={(event, value) => { setStoreSearch(value); setSelectedCompanyError(false) }}
                                />
                            </Grid>
                            <Grid item xs={10} sm={4} md={4} lg={3} sx={{ m: "1vh" }}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    sx={{ backgroundColor: "#2A2F42", borderRadius: "1vh", color: "#F0F2FF", fontWeight: "700", '&:hover': { backgroundColor: '#2A2F42' } }}
                                    onClick={() => handleSave()}
                                >
                                    {Loader ? <> &nbsp; <CircularProgress sx={{ color: "white" }} size={20} />
                                    </> : "SAVE"}
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>


                <Grid container item xs={11.5} alignItems={'center'} justifyContent={'center'} gap={2} sx={{ borderRadius: '1vh', mt: 2 }} >
                    {historicalHealth && historicalHealth.map((itm: any, i: any) => <SettingPageCard key={i} itm={itm} handleOpen={handleOpen} />)}
                </Grid>
            </Grid>
            <SnakBarAlert alertOpen={alertOpen} setAlertOpen={setAlertOpen} alertSeverity={alertSeverity} alert={alert} />
            <BackDropLoading isLoading={isLoading} />
        </div >
    )
}

//Breadcrum component
const BreadCrumComponent = ({ push, formData }: any) => {
    return (
        <>
            <ArrowBackIcon fontSize="large" sx={{ border: "1px solid #D8D8D8", color: 'black', p: 1, borderRadius: '0.5vh', cursor: 'pointer', mr: 2, backgroundColor: 'white' }} onClick={() => push("/admin/dashboard")} />
            <Typography variant="h6" sx={{ fontWeight: '600', cursor: 'pointer' }} onClick={(() => push("/admin/dashboard"))}>{formData.ForumName}</Typography>
            <KeyboardArrowRightIcon />
            <Typography variant="subtitle1" sx={{ fontWeight: '600', }}>Settings</Typography>
        </>
    )
}

//Setting page card

const SettingPageCard = ({ itm, handleOpen }: any) => {
    const [iconLoading, setIconLoading] = useState(false);

    return (
        <>
            <Grid container item className="-solid border-[#D8D8D8] rounded-md bg-white" justifyContent={'center'} sx={{ py: 2 }}>
                <Grid container item xs={11.5} >
                    <Grid container item xs={5} sm={5} md={4} lg={5} direction={'column'} justifyContent={'flex start'} alignItems={'center'} sx={{ py: 1 }}>
                        <Grid container item xs={6} className="text-[0.9vw] font-bold" alignItems={'flex-end'}>
                            <Typography variant="body1" sx={{ fontWeight: '600' }}>{DateFormats(itm.date, false)}</Typography>
                        </Grid>
                        <Grid container item xs={5} className="text-[0.8vw] font-thin">
                            <Typography variant="caption" sx={{ fontWeight: '500' }}>{DateFormats(itm.updatedAt, false)} {DateFormats(itm.updatedAt, true)} </Typography>
                        </Grid>
                    </Grid>
                    <Grid container item xs={5} sm={5} md={4} lg={3} justifyContent={'space-between'} alignItems={'center'} >
                        <Typography variant="body1" sx={{ fontWeight: '600' }}>Health Tracking</Typography>
                        <Typography variant="body1" sx={{ color: "black", fontWeight: "600", display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <Brightness1Icon sx={{ fontSize: 15, color: itm?.health <= 3 ? "#fa8072 " : itm?.health > 3 && itm?.health <= 6 ? "#EDD86D" : "#6EE3AB" }} /> &nbsp; {itm.health > 0 ? itm.health : 0}/10
                        </Typography>
                    </Grid>
                    <Grid container item xs={2} sm={2} md={4} lg={4} justifyContent={'flex-end'} alignItems={'center'}>
                        {iconLoading
                            ? <CircularProgress sx={{ color: "blue" }} size={25} />
                            : <ModeEditIcon fontSize="large" sx={{ backgroundColor: '#5F83ED', color: 'white', p: 1, borderRadius: '0.5vw', cursor: 'pointer' }} onClick={() => { setIconLoading(true); handleOpen(itm); }} />
                        }
                    </Grid>
                </Grid>
            </Grid>
        </>
    )
}




{/* <Grid md={12} container item sx={{ backgroundColor: "#F6F5FB", width: "79vw", minHeight: "60vw", ml: "20vw", alignItems: "flex-start", pt: "2vh" }} >
                <Grid md={11.3} container item direction={"row"} sx={{
                    backgroundColor: "#F6F5FB", width: "68.946vw", height: "25.625vw", mt: "0.729vw"
                }}>
                    <Grid md={12} container item direction={"row"} className="mt-0.5" style={{ height: "5vh", justifyContent: "space-between", backgroundColor: "transperant", margin: "1.2vh" }}>
                        <Grid item container md={11.1} className="justify-start items-center" >
                            <Avatar sx={{ bgcolor: "white", height: "2.19vw", width: "2.19vw", border: "1px solid #D8D8D8", cursor: 'pointer' }} variant="rounded" onClick={() => push("/admin/dashboard")}>
                                <ArrowBackIcon style={{ color: "#000000", fontSize: "0.831vw", cursor: 'pointer' }} />
                            </Avatar>&nbsp;&nbsp;
                            <Link style={{ cursor: "pointer" }} color="inherit" underline="hover" variant="body2" href="/admin/dashboard">
                                <Typography className="flex items-center" style={{ color: "#000000", fontSize: "1.354vw", fontWeight: "700" }}>{formData.ForumName}</Typography></Link>
                            <Link style={{ cursor: "pointer" }} color="inherit" underline="hover" variant="body2" href="/admin/members">
                                <Typography style={{ color: "#000000", fontSize: "1vw", fontWeight: "700" }}>< KeyboardArrowRightIcon className="h-[0.781] w-[0.781]" />Settings</Typography>
                            </Link>
                        </Grid>
                    </Grid>
                    <Grid md={12} container item className="flex justify-start items-start  mt-3" style={{ height: "23.125vw", }}>
                        <Grid md={12} container item className=" bg-white rounded-xl flex  border-solid border-1 justify-center items-center" sx={{ height: "22.083vw", }}>
                            <Grid container className='drop-shadow-2xl' style={{ width: "39.219vw", height: "18.625vw", justifyContent: "center", alignItems: "center", border: "1px solid #dedede ", borderRadius: "2vh" }} >
                                <Grid md={12} container item style={{ width: "36.719vw", height: "15.833vw", justifyContent: "center", alignItems: "center" }} >
                                    <Grid container style={{ width: "36.719vw", height: "3.646vw", marginBottom: "0.7vw" }} >
                                        <Grid container item md={12} style={{ marginLeft: "auto" }}>
                                            <Typography style={{ fontSize: "0.729vw", fontWeight: "400", color: "#5F5F5F" }}>FORUM NAME</Typography>
                                            <TextField
                                                style={{ width: "36.5vw", fontSize: "0.833vw" }}
                                                placeholder="Enter a forum name"
                                                name='ForumName'
                                                type='text'
                                                size="small"
                                                InputProps={{
                                                    sx: {
                                                        "& input::placeholder": {
                                                            fontSize: "1vw", color: "#777777",
                                                            height: "5vh",
                                                            borderRadius: "1vh"
                                                        }, maxLength: 51
                                                    }
                                                }}
                                                InputLabelProps={{
                                                    style: { fontSize: "0.833vw", color: "#777777" }
                                                }}

                                                value={formData.ForumName}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                error={!!errors.ForumName}
                                            />
                                        </Grid>
                                        <Grid container md={12} item sx={{ width: "100%", marginTop: "0.1vw" }}>
                                            <Typography variant="body2" style={{ color: '#FF0000', fontSize: "0.6vw" }}>
                                                {errors.ForumName} </Typography>
                                        </Grid>
                                    </Grid>
                                    <Grid container justifyContent={'space-between'} direction={'column'} style={{ width: "36.719vw", height: "3.646vw", marginBottom: "0.417vw", backgroundColor: 'transparent' }}>
                                        <Grid container style={{ width: "17.813vw", height: "3.646vw", backgroundColor: 'transparent' }} >
                                            <Typography style={{ fontSize: "0.729vw", fontWeight: "400", color: "#5F5F5F" }}>MEETING DAY</Typography>
                                            <FormControl sx={{ width: "17.813vw", height: '2.5vw' }} size="small" defaultValue={'ggvbn'}>
                                                <Select
                                                    id="demo-select-small"
                                                    value={seletedDay}
                                                    name={seletedDay}
                                                    sx={{ fontSize: '1vw', color: 'black', height: '6vh' }}
                                                    onChange={(e: any) => { setSeletedDay(e.target.value); }}>
                                                    {
                                                        ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((itm: any, i: number) => {
                                                            return <MenuItem key={i} value={itm}> {itm} </MenuItem>
                                                        })
                                                    }
                                                </Select>
                                            </FormControl>
                                        </Grid>&nbsp;&nbsp;&nbsp;
                                        <Grid container style={{ width: "17.813vw", height: "3.646vw", backgroundColor: 'transparent' }}>
                                            <Typography style={{ fontSize: "0.729vw", fontWeight: "400", color: "#5F5F5F", backgroundColor: 'transparent' }}>MEETING TIME</Typography>
                                            <LocalizationProvider dateAdapter={AdapterDayjs} >
                                                <DemoContainer components={['TimePicker']} sx={{ Margin: 0, padding: 0, height: '2.7vw', display: 'flex', alignItems: 'center' }}>
                                                    <TimePicker
                                                        value={defaultDate}
                                                        onChange={(newValue: any) => {
                                                            setSelectedDates(newValue.format('HH:mm:ss'));
                                                        }}
                                                        slotProps={{
                                                            textField: {
                                                                inputProps: {
                                                                    style: {
                                                                        padding: 7,
                                                                        height: 'auto',
                                                                        fontSize: '1.1vw',
                                                                        backgroundColor: 'transparent'
                                                                    }
                                                                }
                                                            }
                                                        }}
                                                        // label="With Time Clock"
                                                        viewRenderers={{
                                                            hours: renderTimeViewClock,
                                                            minutes: renderTimeViewClock,
                                                            seconds: renderTimeViewClock,
                                                        }}
                                                    />
                                                </DemoContainer>
                                            </LocalizationProvider>
                                        </Grid>
                                    </Grid>
                                    <Grid container style={{ width: "36.719vw", height: "2.5vw", marginBottom: "1.8vw" }} >
                                        <Grid container item md={12} style={{ marginLeft: "auto" }}>
                                            <Typography style={{ fontSize: "0.729vw", fontWeight: "400", color: "#5F5F5F" }}>COMPANY</Typography>
                                            <Autocomplete
                                                disablePortal
                                                id="combo-box-demo"
                                                options={search}   
                                                value={storeSearch}
                                                size="small"
                                                renderInput={(params) => <TextField {...params} placeholder="Company Name" />}
                                                onBlur={() => setSelectedCompanyError(storeSearch == null)}

                                                onChange={(event, value) => { setStoreSearch(value); setSelectedCompanyError(false) }}
                                                sx={{
                                                    width: "36.5vw", fontSize: '0.833vw', color: '#777777', height: '5vh' // Set your height here.
                                                }}
                                            />
                                        </Grid>
                                        <Grid container md={12} item sx={{ width: "100%", marginTop: "0.1vw" }}>
                                            <Typography variant="body2" style={{ color: '#FF0000', fontSize: "0.6vw" }}>
                                                {selectedCompanyError ? "Company is required" : ''}                                                   </Typography>
                                        </Grid>
                                    </Grid>
                                    <Grid container item md={12} style={{ width: "36.719vw", height: "2.396vw" }} justifyContent={"center"} alignItems={"center"} >
                                        <Button variant="contained" style={{ textTransform: "initial", width: "10.677vw", height: "4.8vh", backgroundColor: "#2A2F42", borderRadius: "0.5vw", color: "#F0F2FF", fontSize: "0.72vw", fontWeight: "700" }} onClick={() => handleSave()}>
                                            {Loader ? <> &nbsp; <CircularProgress sx={{ color: "white" }} size={20} />
                                            </> : "SAVE"}
                                        </Button><br />
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>

                    <Grid container item md={12} minHeight={'10vw'} alignItems={'flex-start '}>
                        {historicalHealth.map((itm: any, i: any) => {
                            return (
                                <Grid container item key={i} className="border-[0.1vw] border-solid border-[#D8D8D8] h-[5vw] rounded-xl bg bg-white" sx={{ marginBottom: '2vh' }} width={'72vw'} justifyContent={'center'} >
                                    <Grid container item md={11.5}>
                                        <Grid container item md={5} className="" direction={'column'} justifyContent={'flex start'} alignItems={'center'}>
                                            <Grid container item md={6} className="text-[0.9vw] font-bold" alignItems={'flex-end'}>
                                                {DateFormats(itm.date, false)}
                                            </Grid>
                                            <Grid container item md={6} className="text-[0.8vw] font-thin">
                                            </Grid>
                                        </Grid>
                                        <Grid container item md={3} className="" justifyContent={'space-between'} alignItems={'center'}><br />
                                            <span className="font-bold text-[1vw]">Health Tracking</span>&nbsp;
                                            <Typography sx={{ color: "black", fontSize: "1vw", fontWeight: "600", display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                <Brightness1Icon sx={{ fontSize: 15, color: itm?.health <= 3 ? "#fa8072 " : itm?.health > 3 && itm?.health <= 6 ? "#EDD86D" : "#6EE3AB" }} /> &nbsp;
                                                {itm.health > 0 ? itm.health : 0} /10
                                            </Typography>
                                        </Grid>
                                        <Grid container item md={4} justifyContent={'flex-end'} alignItems={'center'}>
                                            <ModeEditIcon sx={{ backgroundColor: '#5F83ED', color: 'white', fontSize: '2vw', padding: 1, borderRadius: '0.5vw', cursor: 'pointer' }} onClick={() => handleOpen(itm.date)} />
                                        </Grid>
                                    </Grid>
                                </Grid>
                            )
                        })
                        }
                    </Grid>
                </Grid>
            </Grid > */}
