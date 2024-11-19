"use client"

import React, { useState, useEffect } from "react";
import { Button, Grid, Pagination, Typography, CircularProgress } from "@mui/material";
import SnakBarAlert from "@/components/snakbaralert/snakbaralert";
import AddIcon from '@mui/icons-material/Add';
import Stack from '@mui/material/Stack';
import { useRouter } from 'next/navigation';
import Cards from "@/components/cards";
import { useSession } from "next-auth/react"
import { getCookie } from "cookies-next";
import { StaticMessage } from "@/app/util/StaticMessage";

export default function ForumDasboard(props: any) {
    const [alertOpen, setAlertOpen] = useState(false);
    const [alert, setAlert] = useState("");
    const [alertSeverity, setAlertSeverity] = useState(false);
    const [dashboard, setDashboard] = useState<any>([]);
    const [isLoading, setisLoading] = useState(true);
    const [totalPage, setTotalPage] = useState(Number);
    const [currentPage, setCurrentPage] = useState(Number);
    const { push } = useRouter();
    const [pagesNumber, setPagesNumber] = useState(1)
    const [isBtnLoader, setisBtnLoader] = useState(false);

    const { data: session, status } = useSession()

    const handlePagination = (event: any, value: number) => {
        setPagesNumber(value)
    };

    async function handleDashboard() {
        setisLoading(true)
        var forum_access_token: any = getCookie("forum_access_token")
        try {
            const res = await fetch(`/api/admin/forum?page=${pagesNumber}&limit=24`, {
                method: "GET",
                cache: 'no-store',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${forum_access_token}`

                },
            });
            const user = await res.json();
            if (res.status == 200) {
                setDashboard(user.data?.forum_info);
                setTotalPage(user?.data?.page_meta?.total)
                setCurrentPage(user?.data?.page_meta?.current)
                setisLoading(false)
            }
            else {
                AlertManager(user?.message, true)
                setisLoading(false)
            }
        }
        catch (error: any) {
            AlertManager(StaticMessage.ErrorMessage,true);
            setisLoading(false)
        }
    }

    const handleAddForum = async () => {
        setisBtnLoader(true);
         push("/admin/forum/create");
    }

    useEffect(() => {
        if (status) {
            props?.allForumsAction[1]?.read ? handleDashboard() : null;
        }
    }, [pagesNumber, status])

    function AlertManager(message: string, severity: boolean) {
        setAlert(message)
        setAlertSeverity(severity)
        setAlertOpen(true)
    }

    return (
        <>
            <div className="ml:0 lg:ml-[17.35vw]" style={{ backgroundColor: "#F6F5FB", minHeight: "100vh", }} >
                <Grid container item xs={12} sx={{ backgroundColor: "transperant", p: "2vh", minHeight: "100%" }}>
                    <Grid container item xs={12} sx={{ backgroundColor: "transperant" }}>
                        <Typography variant="h6" align="left" sx={{ color: "#000000", fontWeight: "700" }}>
                            All Forums
                        </Typography>
                    </Grid>
                    <Grid container item xs={12} sm={12} md={11.8} >
                        <Grid container item xs={12} sm={12} md={11.8} justifyContent={"center"} alignItems={"center"}
                            sx={{ backgroundColor: "white", borderRadius: "2vh", p: "2vh" }}
                            className="flex bg-white rounded-xl border-solid border-1 justify-center items-start"  >
                            {!isLoading ?
                                <Grid container item xs={12} sm={12} md={11.8} justifyContent={"center"} alignItems={"center"} sx={{ minHeight: "87.1vh", backgroundColor: "transperant" }}>
                                    <Grid container item xs={12} alignItems={"center"} justifyContent={"flex-end"} sx={{ backgroundColor: "transperant" }}>
                                        <Grid item xs={12} sm={4} md={2.5} lg={2.5} xl={1.8}>
                                           {props?.addForums[0]?.read ?
                                            <Button fullWidth variant="contained"
                                                sx={{ textTransform: "initial", backgroundColor: "#2A2F42 !important", borderRadius: "1vh !important", color: "#F0F2FF", fontWeight: "700" }}
                                                onClick={handleAddForum}>
                                                {isBtnLoader ?
                                                    <CircularProgress sx={{ color: 'white' }} size={25} />
                                                    :
                                                    <>
                                                        <AddIcon className="flex w-[0.99vw] h-[0.98vh] m-0" />
                                                        <Typography variant="caption" sx={{ fontWeight: "700" }}>ADD A FORUM</Typography>
                                                    </>
                                                }
                                            </Button>
                                            : null}
                                        </Grid>
                                    </Grid>
                                    <Grid container item xs={12} direction={'row'} sx={{ minHeight: "72vh", py: "1.5vh", backgroundColor: 'transperant' }} justifyContent={"flex-start"} alignItems={'flex-start'} >
                                        <Grid container item md={12} gap={2} justifyContent={"flex-start"} alignItems={'flex-start'} >
                                            {
                                                dashboard.map((itm: any, i: any) => {
                                                    return <Cards key={i} item={itm} />
                                                })
                                            }
                                        </Grid>
                                    </Grid>
                                    <Grid container item xs={12} justifyContent={"center"} alignItems={"center"} sx={{ my: "2vh" }}>
                                        <Grid item xs={12} sm={5.7} md={4.5} lg={4.5} xl={3.5} sx={{ backgroundColor: "transperant" }}>
                                            <Stack spacing={1}>
                                                <PaginationSection page={currentPage} count={totalPage} pageNumber={pagesNumber} handlePagination={handlePagination} shape="rounded" />
                                            </Stack>
                                        </Grid>
                                    </Grid>

                                </Grid>

                                :
                                <Grid container item xs={12} sx={{ height: "95vh" }} justifyContent={"center"} alignItems={"center"}>
                                    <CircularProgress color="primary" size={50} />
                                </Grid>}

                        </Grid>
                    </Grid>
                </Grid>
            </div >
            <SnakBarAlert alertOpen={alertOpen} setAlertOpen={setAlertOpen} alertSeverity={alertSeverity} alert={alert} />
        </>
    )
}

const PaginationSection = (props: any) => {
    return (
        <Stack spacing={2}>
            <Pagination
                sx={{
                    '& ul': {
                        justifyContent: 'center',
                    },
                    '& .Mui-selected': {
                        backgroundColor: '#F6F5FB',
                        color: 'black',
                        // fontWeight: "700"

                    },
                    '& .MuiPaginationItem-previousNext': {
                        backgroundColor: '#F6F5FB',
                    },
                }}
                size='small'
                shape="rounded"
                count={props.count} page={props.pageNumber} onChange={props.handlePagination} />
        </Stack>
    )
}

