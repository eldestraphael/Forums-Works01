"use client"
import BackDropLoading from "@/components/loading/backDropLoading";
import SnakBarAlert from "@/components/snakbaralert/snakbaralert";
import { Badge, Button, CircularProgress, Grid, InputAdornment, Pagination, Stack, TextField, Typography } from "@mui/material";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import AddIcon from '@mui/icons-material/Add';
import UserCard from "@/components/userCardComponents";
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import SearchIcon from '@mui/icons-material/Search';
import UserFilter from "@/components/userFilterComponents";
import { StaticMessage } from "../util/StaticMessage";


export default function AllUsers(props: any) {
    const pathname = usePathname();
    const searchParams = useSearchParams()
    const [alertOpen, setAlertOpen] = useState(false);
    const [alert, setAlert] = useState("");
    const [alertSeverity, setAlertSeverity] = useState(false);
    const [isLoading, setisLoading] = useState(false);
    const [isAddNewUserBtnLoader, setIsAddNewUserBtnLoader] = useState(false);
    const [isFilterBtnLoader, setIsFilterBtnLoader] = useState(false);
    const [allUser, setAllUser] = useState<any>([]);
    const [search, setSearch] = useState<any>(searchParams.get('search') || '');
    const [totalPage, setTotalPage] = useState(Number);
    const [currentPage, setCurrentPage] = useState(searchParams.get('page') || 1);
    const [selCompanyFilter, setSelCompanyFilter] = useState<any>(searchParams.get('company_filter') ? searchParams.get('company_filter')?.split(',').flatMap(uuid => uuid.split(',')) : []);
    const [selForumFilter, setSelForumFilter] = useState<any>(searchParams.get('forum_filter') ? searchParams.get('forum_filter')?.split(',').flatMap(uuid => uuid.split(',')) : []);
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const id = open ? 'simple-popper' : undefined;
    const { push } = useRouter();
    const initialRender = useRef(true);

    function AlertManager(message: string, severity: boolean) {
        setAlert(message)
        setAlertSeverity(severity)
        setAlertOpen(true)
        setisLoading(false);
    }

    const handleClick = (event: any) => setAnchorEl(anchorEl ? null : event.currentTarget);  //FILTER BUTTON CLICK FUNC

    async function getAllUsersAPI(searchTerm: any) {
        setisLoading(true);
        const company_params = selCompanyFilter.join(",");
        const forum_params = selForumFilter.join(",");
        try {
            const getAllUsersAPI = await fetch(`api/user?${search.length ? `search=${searchTerm}&` : ''}${selCompanyFilter.length ? `company=${company_params}&` : ''}${selForumFilter.length ? `forum=${forum_params}&` : ''}page=${currentPage}&limit=10`, {
                method: 'GET',
                cache: 'no-store',
                headers: {
                    "Content-Type": "application/json",
                },
            })
            const getAllUsersAPI_Response = await getAllUsersAPI.json();
            if (getAllUsersAPI.status == 200) {
                AlertManager(getAllUsersAPI_Response?.message, false);
                setAllUser(getAllUsersAPI_Response?.data);
                setCurrentPage(getAllUsersAPI_Response?.page_meta?.current)
                setTotalPage(getAllUsersAPI_Response?.page_meta?.total)
                setisLoading(false);
            }
            else {
                AlertManager(getAllUsersAPI_Response?.message, true);
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
            push(`/users?page=1${e.target.value ? `&search=${e.target.value}` : ''}${searchParams.get('company_filter') ? `&company_filter=${searchParams.get('company_filter')}` : ''}${selForumFilter?.length ? `&forum_filter=${selForumFilter.join(",")}` : ''}`);
        }
        setSearch(e.target.value);
    }

    //TOGGLE FUNCTION
    async function toggleApiCall(e: any, status: any, uuid: any) {
        try {
            const checkApi = await fetch(`api/user?uuid=${uuid}`, {
                method: "PATCH",
                cache: 'no-store',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    is_active: status
                }),
            });
            const checkApi_Response = await checkApi.json();
            if (checkApi.status == 200) {
                let newArray = allUser?.map((obj: any) => ({ ...obj }));
                let index = newArray.findIndex((obj: any) => obj?.user_info?.uuid === uuid); // Find the index of the object with the given UUID
                if (index !== -1) {
                    newArray[index].user_info.is_active = status;
                }
                setAllUser(newArray)
                AlertManager(checkApi_Response?.message, false);
            }
        }
        catch (error: any) {
            AlertManager(StaticMessage.ErrorMessage, true);
        }
    }
    useEffect(() => {
        if (initialRender.current) {
            initialRender.current = false;
            props?.allUsersAction[1]?.read ? getAllUsersAPI(search) : null;
        } else {
            if (search?.length && !selCompanyFilter?.length && !selForumFilter?.length) {
                const delayDebounceFn = setTimeout(() => {
                    props?.allUsersAction[1]?.read ? getAllUsersAPI(search) : null;
                }, 1000);
                return () => clearTimeout(delayDebounceFn);
            } else {
                setisLoading(true)
                props?.allUsersAction[1]?.read ? getAllUsersAPI(search) : setisLoading(false);
                push(`${pathname}${searchParams.get('page') ? `?page=${searchParams.get('page')}` : `?page=1`}${search?.length ? `&search=${search}` : ''}${selCompanyFilter?.length ? `&company_filter=${selCompanyFilter.join(",")}` : ''}${selForumFilter?.length ? `&forum_filter=${selForumFilter.join(",")}` : ''}`)
            }
        }
    }, [searchParams.get('page'), search, selCompanyFilter, selForumFilter])

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
                            <Grid container item direction="row" alignItems="center" xs={12} sm={9} md={9} lg={10} gap={1.5} justifyContent={'flex-start'} sx={{ mb: 1 }}>
                                <Grid item xs={12} sm={3.5} md={3} lg={2.5} xl={2} sx={{ height: "100%" }}>
                                    {props?.allUsersAction[0]?.update
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
                                <Grid item xs={12} sm={3.5} md={3.5} lg={2.5} xl={2} >
                                    {props?.allUsersAction[0]?.update
                                        ? <>
                                            <Button fullWidth variant="contained" color="error" sx={{ p: "1.05vh", backgroundColor: "#2A2F42 !important", borderRadius: "1vh" }} aria-describedby={id} type="button" onClick={handleClick}>
                                                {isFilterBtnLoader ? <CircularProgress sx={{ color: "white" }} size={20} /> :
                                                    <>
                                                        <FilterAltIcon />&nbsp;
                                                        <Typography variant="caption" sx={{ fontSize: "14px", fontWeight: "700", mr: "2vh" }}>Filter By</Typography>
                                                        <Badge badgeContent={<Typography variant="caption" sx={{ color: "#2A2F42", fontWeight: "700" }}>{`${selCompanyFilter?.length + selForumFilter?.length}`}</Typography>} sx={{ border: "1.5vh solid white", borderRadius: "8vh" }} />
                                                    </>
                                                }
                                            </Button>
                                            {open &&
                                                <UserFilter
                                                    id={id}
                                                    open={open}
                                                    anchorEl={anchorEl}
                                                    setAnchorEl={setAnchorEl}
                                                    setSelCompanyFilter={setSelCompanyFilter}
                                                    setSelForumFilter={setSelForumFilter}
                                                    selCompanyFilter={selCompanyFilter}
                                                    selForumFilter={selForumFilter}
                                                    setIsFilterBtnLoader={setIsFilterBtnLoader}
                                                    push={push}
                                                    setCurrentPage={setCurrentPage}
                                                />
                                            }
                                        </>
                                        : null
                                    }
                                </Grid>
                            </Grid>
                            <Grid container item xs={12} sm={3} md={3} lg={2} justifyContent={"flex-end"} >
                                {props?.addUsersAction[1]?.read
                                    && <Button
                                        fullWidth
                                        variant="contained"
                                        onClick={() => { setIsAddNewUserBtnLoader(true); push("/users/add") }}
                                        sx={{ textTransform: "initial", backgroundColor: "#2A2F42", borderRadius: "1vh !important", color: "#F0F2FF", fontWeight: "700", p: "1.2vh", '&:hover': { backgroundColor: '#32374e' } }}
                                    >
                                        {isAddNewUserBtnLoader ?
                                            <CircularProgress sx={{ color: 'white' }} size={25} />
                                            :
                                            <>
                                                <AddIcon className="flex w-[0.99vw] h-[0.98vh] m-0" />
                                                <Typography variant="caption" sx={{ fontWeight: "700" }}>ADD USER</Typography>
                                            </>
                                        }
                                    </Button>
                                }
                            </Grid>
                        </Grid>
                        <Grid item xs={12} justifyContent={"flex-start"} alignItems={"flex-start"} sx={{ mb: "1vh", minHeight: "61vh" }} >
                            {allUser.length === 0 && !isLoading ?
                                <>
                                    <Grid container item xs={12} justifyContent={"center"} alignItems={"center"} sx={{ mt: 5, height: "53vh" }}>
                                        <Grid item>
                                            <Typography variant='h6' sx={{ fontWeight: "600", color: '#5F83ED' }}>No Record Found</Typography>
                                        </Grid>
                                    </Grid>
                                </>
                                :
                                allUser.map((item: any, index: number) => {
                                    return (
                                        <Grid container item xs={12} key={index} justifyContent={"flex-start"} alignItems={"flex-start"} sx={{ mt: 2 }}>
                                            <UserCard key={index} user={item} toggleApiCall={toggleApiCall} viewUsersAction={props.viewUsersAction} />
                                        </Grid>
                                    )
                                })
                            }
                        </Grid>
                        <Grid container item xs={12} justifyContent={"center"} alignItems={"center"} sx={{ my: "2vh" }}>
                            <Grid item xs={12}>
                                <PaginationSection currentPage={currentPage} count={totalPage} handlePagination={(event: any, value: number) => { setCurrentPage(value); push(`/users?page=${value}${searchParams.get('search') ? `&search=${searchParams.get('search')}` : ''}`); }} shape="rounded" />
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
            <Typography variant="h6" sx={{ fontWeight: '600' }} >All Users</Typography>
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
                        fontWeight: "500",
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