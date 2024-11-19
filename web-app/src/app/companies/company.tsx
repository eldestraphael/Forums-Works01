"use client"
import { useEffect, useState } from "react";
import { Button, CircularProgress, Grid, InputAdornment, Pagination, Stack, TextField, Typography } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import BackDropLoading from "@/components/loading/backDropLoading";
import SnakBarAlert from "@/components/snakbaralert/snakbaralert";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import AddIcon from '@mui/icons-material/Add';
import CompanyCard from "@/components/company/companyCardComponents";
import { StaticMessage } from "../util/StaticMessage";

export default function AllCompany(props: any) {

    const searchParams = useSearchParams()
    const [alertOpen, setAlertOpen] = useState(false);
    const [alert, setAlert] = useState("");
    const [alertSeverity, setAlertSeverity] = useState(false);
    const [isLoading, setisLoading] = useState(false);
    const [isAddNewUserBtnLoader, setIsAddNewUserBtnLoader] = useState(false);
    const [allCompany, setAllCompany] = useState<any>([]);
    const [search, setSearch] = useState<any>(searchParams.get('search') || '');
    const [totalPage, setTotalPage] = useState(Number);
    const [currentPage, setCurrentPage] = useState(searchParams.get('page') || 1);
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const id = open ? 'simple-popper' : undefined;
    const { push } = useRouter();

    function AlertManager(message: string, severity: boolean) {
        setAlert(message)
        setAlertSeverity(severity)
        setAlertOpen(true)
        setisLoading(false);
    }

    async function getAllCompanyAPI(searchTerm: any) {
        setisLoading(true);
        try {
            const getAllCompanyAPI = await fetch(`/api/company?${search.length ? `search=${searchTerm}&` : ''}&page=${currentPage}&limit=10
            `, {
                method: 'GET',
                cache: 'no-store',
                headers: {
                    "Content-Type": "application/json",
                },
            })
            const getAllCompanyAPI_Response = await getAllCompanyAPI.json();
            if (getAllCompanyAPI.status == 200) {
                AlertManager(getAllCompanyAPI_Response?.message, false);
                setAllCompany(getAllCompanyAPI_Response?.data);
                setCurrentPage(getAllCompanyAPI_Response?.page_meta?.current)
                setTotalPage(getAllCompanyAPI_Response?.page_meta?.total)
                setisLoading(false);
            }
            else {
                AlertManager(getAllCompanyAPI_Response?.message, true);
                setisLoading(false);
            }
        }
        catch (error: any) {
            AlertManager(StaticMessage.ErrorMessage, true);
            setisLoading(false);
        }
    }

    //Search API
    async function handleChangeForSearch(e: any) {
        var page: any = searchParams.get('page')
        if (page !== 1) {
            setCurrentPage(1)
            push(`/companies?page=1&search=${e.target.value}`);
        }
        setSearch(e.target.value);
    }


    //TOGGLE FUNCTION
    async function toggleApiCall(e: any, status: any, uuid: any) {
        try {
            const checkApi = await fetch(`/api/company?uuid=${uuid}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    is_active: status
                }),
            });
            const checkApi_Response = await checkApi.json();
            if (checkApi.status == 200) {
                let newArray = allCompany?.map((obj: any) => ({ ...obj }));
                let index = newArray.findIndex((obj: any) => obj?.company_info?.uuid === uuid); // Find the index of the object with the given UUID
                if (index !== -1) {
                    newArray[index].company_info.is_active = status;
                }
                setAllCompany(newArray)
                AlertManager(checkApi_Response?.message, false);
            }
        }
        catch (error: any) {
            AlertManager(StaticMessage.ErrorMessage, true);
        }
    }

    useEffect(() => {
        if (search?.length) {
            const delayDebounceFn = setTimeout(() => {
                props?.allCompaniesAction[1]?.read ? getAllCompanyAPI(search) : null;
            }, 1000);
            return () => clearTimeout(delayDebounceFn);
        } else {
            setisLoading(true)
            props?.allCompaniesAction[1]?.read ? getAllCompanyAPI(search) : setisLoading(false);
        }

    }, [searchParams.get('page'), search])
    return (
        <>
            <div className="ml:0 lg:ml-[17.35vw]" style={{ backgroundColor: "#F6F5FB", paddingBottom: '5vh', minHeight: '100vh' }}>
                <Grid container item xs={12} justifyContent={'flex-start'} alignItems={'center'} sx={{ pt: 3, pb: 1, pl: 3, pr: 4 }}>
                    <Grid container item xs={12} lg={6} alignItems={'center'}>
                        <BreadCrumComponent push={push} params={props?.page_props?.params} />
                    </Grid>
                </Grid>

                <Grid container item xs={12} justifyContent={'flex-start'} alignItems={'center'} sx={{ pl: 3 }}>
                    <Grid container item xs={11.5} alignItems={'center'} justifyContent={'center'} sx={{ backgroundColor: 'white', borderRadius: '2vh', p: 2, }} >
                        <Grid container item xs={12} direction="row" justifyContent={"center"} alignItems={"center"} >
                            <Grid container item direction="row" alignItems="center" xs={12} sm={8.5} md={9} lg={9.5} gap={1.5} justifyContent={'flex-start'} sx={{ mb: 1 }}>
                                <Grid item xs={12} sm={3.5} md={3} lg={2.5} xl={2} sx={{ height: "100%" }}>
                                    {props?.allCompaniesAction[0]?.update
                                        ?
                                        <TextField
                                            fullWidth
                                            size='small'
                                            value={search}
                                            placeholder="SEARCH"
                                            onChange={(e: any) => handleChangeForSearch(e)}
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
                                        : null}
                                </Grid>
                            </Grid>
                            <Grid container item xs={12} sm={3.5} md={3} lg={2.5} justifyContent={"flex-end"} >
                                {props?.addUCompnyAction[1]?.read
                                    && <Button
                                        fullWidth
                                        variant="contained"
                                        onClick={() => { setIsAddNewUserBtnLoader(true); push("/companies/add") }}
                                        sx={{ textTransform: "initial", backgroundColor: "#2A2F42", borderRadius: "1vh !important", color: "#F0F2FF", fontWeight: "700", p: "1.2vh", '&:hover': { backgroundColor: '#32374e' } }}
                                    >
                                        {isAddNewUserBtnLoader ?
                                            <CircularProgress sx={{ color: 'white' }} size={25} />
                                            :
                                            <>
                                                <AddIcon className="flex w-[0.99vw] h-[0.98vh] m-0" />
                                                <Typography variant="caption" sx={{ fontWeight: "700" }}>ADD COMPANY</Typography>
                                            </>
                                        }
                                    </Button>
                                }
                            </Grid>
                        </Grid>
                        <Grid item xs={12} justifyContent={"flex-start"} alignItems={"flex-start"} sx={{ mb: "1vh", minHeight: "61vh" }} >
                            {allCompany.length === 0 && !isLoading ?
                                <>
                                    <Grid container item xs={12} justifyContent={"center"} alignItems={"center"} sx={{ mt: 5, height: "53vh" }}>
                                        <Grid item>
                                            <Typography variant='h6' sx={{ fontWeight: "600", color: '#5F83ED' }}>No Record Found</Typography>
                                        </Grid>
                                    </Grid>
                                </>
                                : allCompany.map((item: any, index: number) => {
                                    return (
                                        <Grid container item xs={12} key={index} justifyContent={"flex-start"} alignItems={"flex-start"} sx={{ mt: 2 }}>
                                            <CompanyCard key={index} company={item} viewCompaniesAction={props.viewCompaniesAction} toggleApiCall={toggleApiCall} />
                                        </Grid>
                                    )
                                })
                            }
                        </Grid>
                        <Grid container item xs={12} justifyContent={"center"} alignItems={"center"} sx={{ my: "2vh" }}>
                            <Grid item xs={12}>
                                <PaginationSection currentPage={currentPage} count={totalPage} handlePagination={(event: any, value: number) => { setCurrentPage(value); push(`/companies?page=${value}`); }} shape="rounded" />
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </div >
            <SnakBarAlert alertOpen={alertOpen} setAlertOpen={setAlertOpen} alertSeverity={alertSeverity} alert={alert} />
            <BackDropLoading isLoading={isLoading} />
        </>
    )
}

//Breadcrum component
const BreadCrumComponent = ({ push }: any) => {
    return (
        <>
            <Typography variant="h6" sx={{ fontWeight: '600' }} >All Companies</Typography>
        </>
    )
}

//Pagnation Component
const PaginationSection = (props: any) => {
    return (
        <Stack spacing={1}>
            <Pagination
                sx={{
                    '& .MuiPaginationItem-root': {
                        fontWeight: "700",
                        borderRadius: "1.1vh"
                    },
                    '& ul': {
                        justifyContent: 'center',
                    },
                    '& .Mui-selected': {
                        backgroundColor: '#F6F5FB',
                        color: 'black',
                        fontWeight: "700"
                    },
                    '& .MuiPaginationItem-previousNext': {
                        mx: "3vh",
                        backgroundColor: '#F6F5FB',
                        borderRadius: "1.1vh"
                    },
                }}
                size='medium'
                shape="rounded"
                count={props.count} page={props.currentPage} onChange={props.handlePagination} />
        </Stack>
    )
}