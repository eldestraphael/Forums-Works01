'use client'

import React, { useEffect, useState } from 'react';
import { Typography, Grid, TextField, Checkbox, Accordion, InputAdornment, Paper, FormGroup, FormControlLabel, AccordionSummary, AccordionDetails, Link, Popper, CircularProgress } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import SnakBarAlert from '@/components/snakbaralert/snakbaralert';
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { StaticMessage } from '@/app/util/StaticMessage';


export default function CourseFilter(props: any) {
    const [alertOpen, setAlertOpen] = useState(false);
    const [alert, setAlert] = useState("");
    const [alertSeverity, setAlertSeverity] = useState(false);
    const [isBtnLoader, setisBtnLoader] = useState(false);
    const [isLoading, setisLoading] = useState(true);
    const [expanded, setExpanded] = useState<string | false>(false);
    const [filterData, setFilterData] = useState<any>([]);
    const [filtersearchData, setFilterSearchData] = useState<any>([]);
    const [localStateCompanyFilter, setLocalStateCompanyFilter] = useState<any>(props?.selCompanyFilter);
    const pathname = usePathname();
    const searchParams = useSearchParams()
    const { push } = useRouter();

    //ACCORDION OPEN/CLOSE FUNC
    const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
        setExpanded(isExpanded ? panel : false);
    };

    //FILTER API CALL
    const filterAPIFunc = async () => {
        setisLoading(true)
        props.setIsFilterBtnLoader(true)
        try {
            const res = await fetch(`/api/forum/filter?search=`, {
                method: "GET",
                cache: 'no-store',
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const api_res = await res.json();
            if (res.status == 200) {
                setFilterData(api_res?.data);
                setFilterSearchData(api_res?.data);
                props.setIsFilterBtnLoader(false);
                setisLoading(false);
            }
            else {
                AlertManager(StaticMessage.ErrorMessage,true);
                props.setIsFilterBtnLoader(false);
                setisLoading(false);
            }
        }
        catch (error: any) {
            AlertManager(StaticMessage.ErrorMessage,true);
            props.setIsFilterBtnLoader(false);
            setisLoading(false);
        }
    };

    //CHECKBOX HANDLE FUNC
    var localVariableCompanyFilter = props?.selCompanyFilter;
    function handleCheckBox(event: any, clicked_item: any) {
        const { name } = event.target;
        props.setCurrentPage(1);

        (clicked_item === "company" ? props.setSelCompanyFilter : props.setSelForumFilter)((prevState: any) => {
            const index = prevState.indexOf(name);
            if (index === -1) {
                // If the name is not in the array, add it
                push(`${pathname}?page=${searchParams.get('page')}&search=${searchParams.get('search')}${clicked_item === "company" ? `&CompanyFilter=${[...prevState, name].join(",")}` : `&ForumFilter=${[...prevState, name].join(",")}`}`)
                return [...prevState, name];
            } else {
                // If the name is already in the array, remove it
                const updatedState = [...prevState];
                updatedState.splice(index, 1);
                return updatedState;
            }
        });
    }

    function AlertManager(message: string, severity: boolean) {
        setAlert(message)
        setAlertSeverity(severity)
        setAlertOpen(true)
        setisLoading(false);
    }

    const filterSearch = (e: any) => {
        var filter = filterData[e.target.name]?.filter((item: any) => {
            return item[`${e.target.name}_name`]?.toLowerCase()?.includes(e.target.value)
        })
        setFilterSearchData((prevState: any) => ({
            ...prevState,  // Spread the previous state
            [e.target.name]: filter  // Update the specific property with the filtered data
        }));
    }
    
    useEffect(() => {

    }, [props.setSelCompanyFilter, props.setSelForumFilter])


    return (
        <>
            <Popper id={props.id} open={props.open} anchorEl={props.anchorEl} placement="bottom-start" sx={{ pt: "2vh" }} className='w-[80vw] sm:w-[70vw] md:w-[50vw] lg:w-[30vw] clg:w-[22vw] '>
                <Paper elevation={2} sx={{ borderRadius: '2vh', p: 3 }}>
                    <Grid container item xs={12} direction={'column'} >
                        <Grid container item xs={12} justifyContent={'flex-end'} >
                            <CloseIcon fontSize='small' onClick={() => props.setAnchorEl(null)} sx={{ cursor: 'pointer' }} />
                        </Grid>
                        <Grid container item xs={12} direction={'row'} justifyContent={'space-between'} >
                            <Grid item xs={5.5} >
                                <Typography sx={{ fontWeight: '600', color: 'black', fontSize: "26px" }}>Filters</Typography>
                            </Grid>
                            <Grid container item xs={4} justifyContent={'flex-end'} alignItems={'center'} >
                                <Link  >
                                    <Typography sx={{ cursor: 'pointer', color: "#5F83ED", fontWeight: "700", fontSize: "16px" }} onClick={() => { props.setSelCompanyFilter([]); props.setSelForumFilter([]) }}>
                                        Clear All
                                    </Typography>
                                </Link>
                            </Grid>
                        </Grid>

                    </Grid>

                    {
                        isLoading
                            ? <Grid container item xs={12} justifyContent={'center'} alignItems={'center'} height={'25vh'}><CircularProgress size={25} /></Grid>
                            : Object.values(filtersearchData)?.map((item: any, i: number) => {
                                return (
                                    <Grid key={i} container item xs={12}>
                                        <Accordion elevation={0} expanded={expanded === Object.keys(filtersearchData)[i]} onChange={handleChange(Object.keys(filtersearchData)[i])} sx={{ width: '100%', backgroundColor: 'transparent', border: 0 }}>
                                            <AccordionSummary
                                                expandIcon={<ExpandMoreIcon />}
                                                aria-controls="panel3-content"
                                                id="panel3-header"
                                                sx={{
                                                    '&.MuiAccordionSummary-root': {
                                                        padding: '0px',
                                                        margin: '0px',
                                                    },
                                                }}
                                            >
                                                <Grid container item alignItems={'center'} >
                                                    <Typography variant='h6' sx={{ fontWeight: 700 }}>
                                                        {Object.keys(filterData)[i] == 'company' ? 'Companies' : 'Forums'}
                                                    </Typography>
                                                    <Typography variant='subtitle2' sx={{ fontWeight: '600', pl: 0.5, pt: 0.3 }}>
                                                        ({item.length})
                                                    </Typography>
                                                </Grid>
                                            </AccordionSummary>
                                            <AccordionDetails sx={{ minHeight: '25vh', padding: '0px' }}>
                                                <Grid container item xs={12}>
                                                    <TextField
                                                        size='small'
                                                        placeholder={`SEARCH ${Object.keys(filterData)[i] == 'company' ? 'COMPANIES' : 'FORUMS'}`} name={Object.keys(filtersearchData)[i]}
                                                        fullWidth
                                                        onChange={filterSearch}
                                                        InputProps={{
                                                            sx: {
                                                                borderRadius: "1.5vh", color: "#5F83ED", maxLength: 51, backgroundColor: '#F0F2FF', border: 'none',
                                                                "& input::placeholder": { fontSize: "14px", fontWeight: "700" },
                                                                '&.MuiOutlinedInput-root': {
                                                                    '&:hover fieldset': {
                                                                        borderColor: '#5F83ED'
                                                                    },
                                                                    '& fieldset': {
                                                                        borderColor: 'transparent'
                                                                    }
                                                                },
                                                            },
                                                            startAdornment: (
                                                                <InputAdornment position="start">
                                                                    <SearchIcon color="action" sx={{ color: "#5F83ED" }} />
                                                                </InputAdornment>
                                                            )
                                                        }}
                                                    />
                                                </Grid>
                                                <Grid container item xs={12} sx={{
                                                    mt: 1.5,
                                                    height: '23vh',
                                                    overflow: 'auto',
                                                    '&::-webkit-scrollbar': {
                                                        width: '4px',

                                                    },
                                                    '&::-webkit-scrollbar-track': {
                                                        background: '#f1f1f1',
                                                        borderRadius: '10vh'
                                                    },
                                                    '&::-webkit-scrollbar-thumb': {
                                                        background: "#5F83ED",
                                                        borderRadius: '10vh'
                                                    },
                                                    '&::-webkit-scrollbar-thumb:hover': {
                                                        background: "#5F83ED",
                                                    }
                                                }}>
                                                    <FormGroup >
                                                        {item?.map((list: any, index: number) => {
                                                            return (
                                                                <FormControlLabel
                                                                    sx={{
                                                                        '& .MuiFormControlLabel-root': {
                                                                            color: "#5F5F5F"
                                                                        }
                                                                    }}
                                                                    key={index}
                                                                    control={<Checkbox />}
                                                                    checked={props.selCompanyFilter.includes(list?.uuid) || props.selForumFilter.includes(list?.uuid)}
                                                                    label={list?.company_name || list?.forum_name}
                                                                    name={list?.uuid}
                                                                    onClick={(e) => handleCheckBox(e, Object.keys(filtersearchData)[i])}
                                                                />

                                                            )
                                                        })}
                                                    </FormGroup>
                                                </Grid>
                                            </AccordionDetails>
                                        </Accordion>
                                    </Grid>
                                )
                            })
                    }
                </Paper>
            </Popper>
            <SnakBarAlert alertOpen={alertOpen} setAlertOpen={setAlertOpen} alertSeverity={alertSeverity} alert={alert} />
        </>
    );
}