"use client"
import { useEffect, useState } from "react";
import { Button, CircularProgress, Grid, InputAdornment, Pagination, Stack, TextField, Typography } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import AllCoursesCard from '@/components/course/allCoursesCard'
import BackDropLoading from "@/components/loading/backDropLoading";
import SnakBarAlert from "@/components/snakbaralert/snakbaralert";
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { StaticMessage } from "../util/StaticMessage";

export default function AllCourses(props: any) {
    const searchParams = useSearchParams()
    const [alertOpen, setAlertOpen] = useState(false);
    const [alert, setAlert] = useState("");
    const [alertSeverity, setAlertSeverity] = useState(false);
    const [isLoading, setisLoading] = useState(false);
    const [isAddNewUserBtnLoader, setIsAddNewUserBtnLoader] = useState(false);
    const [allCourse, setAllCourse] = useState<any>([]);
    const [search, setSearch] = useState<any>(searchParams.get('search') || '');
    const [totalPage, setTotalPage] = useState(Number);
    const [currentPage, setCurrentPage] = useState(searchParams.get('page') || 1);
    const { push } = useRouter();

    function AlertManager(message: string, severity: boolean) {
        setAlert(message)
        setAlertSeverity(severity)
        setAlertOpen(true)
        setisLoading(false);
    }

    async function getAllCoursesAPI(searchTerm: any) {
        setisLoading(true);
        try {
            const getAllCoursesAPI = await fetch(`/api/course?${search.length ? `search=${searchTerm}&` : ''}&page=${currentPage}&limit=16`, {
                method: 'GET',
                cache: 'no-store',
                headers: {
                    "Content-Type": "application/json",
                },
            })
            const getAllCoursesAPI_Response = await getAllCoursesAPI.json();
            if (getAllCoursesAPI.status == 200) {
                AlertManager(getAllCoursesAPI_Response?.message, false);
                setAllCourse(getAllCoursesAPI_Response?.data);
                setCurrentPage(getAllCoursesAPI_Response?.page_meta?.current)
                setTotalPage(getAllCoursesAPI_Response?.page_meta?.total)
                setisLoading(false);
            }
            else {
                AlertManager(getAllCoursesAPI_Response?.message, true);
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
            push(`/courses?page=1&search=${e.target.value}`);
        }
        setSearch(e.target.value);
    }

    useEffect(() => {
        if (search?.length) {
            const delayDebounceFn = setTimeout(() => {
                props?.allCoursesAction[1]?.read ? getAllCoursesAPI(search) : null;
            }, 1000);
            return () => clearTimeout(delayDebounceFn);
        } else {
            setisLoading(true)
            props?.allCoursesAction[1]?.read ? getAllCoursesAPI(search) : setisLoading(false);
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
                            <Grid container item direction="row" alignItems="center" xs={12} sm={9} md={9} lg={10} gap={1.5} justifyContent={'flex-start'} sx={{ mb: 1 }}>
                                <Grid item xs={12} sm={3.5} md={3} lg={2.5} xl={2} sx={{ height: "100%" }}>
                                    {props?.allCoursesAction[1]?.read
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
                            <Grid container item xs={12} sm={3} md={3} lg={2} justifyContent={"flex-end"} >
                                {props?.addCoursesAction[1]?.read
                                    &&
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        onClick={() => { setIsAddNewUserBtnLoader(true); push("/courses/add") }}
                                        sx={{ textTransform: "initial", backgroundColor: "#2A2F42", borderRadius: "1vh !important", color: "#F0F2FF", fontWeight: "700", p: "1.2vh", '&:hover': { backgroundColor: '#32374e' } }}
                                    >
                                        {isAddNewUserBtnLoader ?
                                            <CircularProgress sx={{ color: 'white' }} size={25} />
                                            :
                                            <>
                                                <AddIcon className="flex w-[0.99vw] h-[0.98vh] m-0" />
                                                <Typography variant="caption" sx={{ fontWeight: "700" }}>&nbsp;ADD COURSE</Typography>
                                            </>
                                        }
                                    </Button>
                                }
                            </Grid>
                        </Grid>
                        {props?.allCoursesAction[1]?.read ?
                            <Grid container spacing={2} sx={{ backgroundColor: 'transparent' }}>
                                {allCourse.length === 0 && !isLoading ?
                                    <>
                                        <Grid container item xs={12} justifyContent={"center"} alignItems={"center"} sx={{ mt: 5, height: "53vh" }}>
                                            <Grid item>
                                                <Typography variant='h6' sx={{ fontWeight: "600", color: '#5F83ED' }}>No Record Found</Typography>
                                            </Grid>
                                        </Grid>
                                    </>
                                    :
                                    <Grid container item xs={12} justifyContent={"flex-start"} alignItems={'flex-start'} sx={{ backgroundColor: 'transparent' }}>
                                        {allCourse.map((item: any, index: number) => {
                                            return (
                                                <Grid container item xs={12} sm={3} key={index} justifyContent={"flex-start"} alignItems={"flex-start"} sx={{ mt: 2 }}>
                                                    <AllCoursesCard key={index} course={item} viewCoursesAction={props.viewCoursesAction} />
                                                </Grid>
                                            );
                                        })}
                                    </Grid>
                                }
                            </Grid>
                            : null}
                        <Grid container item xs={12} justifyContent={"center"} alignItems={"center"} sx={{ my: "2vh" }}>
                            <Grid item xs={12}>
                                <PaginationSection currentPage={currentPage} count={totalPage} handlePagination={(event: any, value: number) => { setCurrentPage(value); push(`/courses?page=${value}`); }} shape="rounded" />
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
            <Typography variant="h6" sx={{ fontWeight: '600' }} >All Courses </Typography>
        </>
    )
}

// Pagnation Component
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