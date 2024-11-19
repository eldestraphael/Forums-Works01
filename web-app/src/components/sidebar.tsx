"use client";

import React, { useEffect, useState } from "react";
import Image from 'next/image';
import { redirect, usePathname, useRouter } from "next/navigation";
import { getSession, signOut, useSession } from "next-auth/react";
import { AppBar, Box, Button, CircularProgress, CssBaseline, Drawer, Grid, List, Typography, SwipeableDrawer, ListItem, ListItemText, ListItemSecondaryAction, Fab, Collapse, ListItemButton, Avatar, Tooltip } from "@mui/material";
import SquareIcon from '@mui/icons-material/Square';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import logo from '@/assets/forums-logo.png'
import forum_menu from '@/assets/forum_menu.png'
import course_menu from '@/assets/course_menu.png'
import company_menu from '@/assets/company_menu.png'
import users_menu from '@/assets/users_menu.png'
import MenuIcon from '@mui/icons-material/Menu';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import { useDispatch, useSelector } from "react-redux";
import { setSidebarMenu } from "@/redux/reducers/sidebarMenu/sidebarMenuSlice";
import SnakBarAlert from "@/components/snakbaralert/snakbaralert";
import { getCookie } from "cookies-next";
import CallSignout from "@/util/callSignout";



export default function Sidebar({ Children }: any) {
    const pathname = usePathname();
    const { push } = useRouter();
    const dispatch = useDispatch();
    const drawerWidth = "17.35vw";
    const [open, setOpen] = useState(false);
    const [menuApiData, setMenuApiData] = useState<any>([]); //REMOVE THIS STATE ONCE TESTING IN DONE
    const [isLinkLoading, setIsLinkLoading] = useState(false);
    const sideMenuState = useSelector((state: any) => state.sidebar.menu);
    const [alert, setAlert] = useState("");
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertSeverity, setAlertSeverity] = useState(false);
    const [userInfo, setUserInfo] = useState({ job_title: "" });
    const [isUserInfoLoading, setIsUserInfoLoading] = useState(true);
    const [checkUser, setCheckUser] = useState(false);
    const [fullname, setFullName] = useState('');

    function AlertManager(message: string, severity: boolean) {
        setAlert(message)
        setAlertSeverity(severity)
        setAlertOpen(true)
    }
    function logoClick() {
        if (pathname !== `/forums`) {
            setIsLinkLoading(true);
            push(`/forums`)
            setIsLinkLoading(false);
        }
    }

    const toggleDrawer = (openState: any) => (event: any) => {
        if (
            event &&
            event.type === 'keydown' &&
            (event.key === 'Tab' || event.key === 'Shift')
        ) {
            return;
        }
        setOpen(openState);
    };

    var LogoImage = <ListItem onClick={toggleDrawer(false)}>
        <Grid className="justify-center items-center " >
            <div style={{ cursor: 'pointer' }} onClick={() => { logoClick() }}>
                <Image src={logo}
                    priority={true}
                    placeholder="empty"
                    alt="forums@work"
                    style={{
                        objectFit: 'contain',
                        backgroundColor: "transparent",
                    }}
                    unoptimized
                />
            </div>
        </Grid>
    </ListItem>

    //MAIN MENU CLICK
    const menuClick = (clicked_itm: any) => {
        const updatedData = sideMenuState.map((item: any) => {
            if (item.menu === clicked_itm.menu) {
                // If clicked menu has sub_menus
                if (item.sub_menus) {
                    return {
                        ...item,
                        sub_menu_state: !item.sub_menu_state // Toggle sub_menu_state
                    };
                } else {
                    // If clicked menu does not have sub_menus
                    return {
                        ...item,
                        selected_status: true // Set selected_status to true
                    };
                }
            } else {
                // If clicked menu does not match
                if (item.sub_menus) {
                    // Retain state of menu items with sub_menus
                    const updatedSubMenus = item.sub_menus.map((subMenu: any) => ({
                        ...subMenu,
                        selected_status: false // Set selected_status to false for each sub menu item
                    }));

                    return {
                        ...item,
                        sub_menu_state: false,
                        sub_menus: updatedSubMenus
                    };
                } else {
                    // Reset other menu items without sub_menus
                    if (clicked_itm?.sub_menus?.length > 0) {
                        return { ...item }
                    } else {
                        return {
                            ...item,
                            selected_status: false
                        };
                    }
                }
            }
        });
        setMenuApiData(updatedData); // Assuming setMenuApiData is a function to update the state
        dispatch(setSidebarMenu(updatedData));
    };

    //SUBMENU CLICK
    const handleSubMenuClick = (menuWithSubMenus: any, clickedSubMenu: any) => {
        const updatedData = sideMenuState.map((item: any) => {
            if (item.menu === menuWithSubMenus.menu) {
                const updatedSubMenus = item.sub_menus.map((subMenu: any) => {
                    if (subMenu.sub_menu_item === clickedSubMenu.sub_menu_item) {
                        return {
                            ...subMenu,
                            selected_status: true // Set selected_status of clicked sub menu to true
                        };
                    } else {
                        return {
                            ...subMenu,
                            selected_status: false // Reset selected_status of other sub menus
                        };
                    }
                });

                return {
                    ...item,
                    sub_menus: updatedSubMenus
                };
            } else if (item.sub_menus) {
                // Reset selected_status of other menu items with sub_menus
                const updatedSubMenus = item.sub_menus.map((subMenu: any) => ({
                    ...subMenu,
                    selected_status: false
                }));

                return {
                    ...item,
                    sub_menus: updatedSubMenus
                };
            } else {
                // Reset selected_status of menu items without sub_menus
                return {
                    ...item,
                    selected_status: false
                };
            }
        });

        setMenuApiData(updatedData);
        dispatch(setSidebarMenu(updatedData));
    };

    //ACL SIDEBAR API FUNC
    const SideBarApi = async () => {
        try {
            let response = await fetch("/api/user/acl", {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const side_bar_data = await response.json();
            if (response.status == 200) {
                setMenuApiData(side_bar_data?.data);
                dispatch(setSidebarMenu(side_bar_data?.data));
                const forum_access_token = getCookie('forum_access_token');
                if (forum_access_token) {
                    const splitToken = (forum_access_token?.split('.'));
                    if (splitToken) {
                        const user_info = JSON.parse(atob(splitToken[1]));
                        const name = `${user_info?.first_name} ${user_info?.last_name}`;
                        setFullName(name);
                        setUserInfo((prevUserInfo) => ({
                            ...prevUserInfo,
                            job_title: user_info?.job_title
                        }));
                    }
                    setIsUserInfoLoading(false);
                }
            }
        }
        catch (error: any) {
            AlertManager("SideBar Error", true);
        }
    }

    const handleSignout = () => {
        setIsLinkLoading(true);
        CallSignout();
    };

    useEffect(() => {
        async function handleSidebarDisplay() {
            const session = await getSession();
            if (!session?.user) return setCheckUser(true);
            setCheckUser(false);
        }
        handleSidebarDisplay();
    }, [pathname]);


    useEffect(() => {
        async function handleACL() {
            const session = await getSession();
            if (session?.user) {
                SideBarApi();
            }
        }
        handleACL();
    }, [pathname])


    if(pathname.includes('survey-mobile')) {
        return <></>
    }
    return (
        <>
            <div className="hidden lg:block">
                <div className="flex flex-col justify-center items-center">
                    <Box sx={{ display: 'flex' }}>
                        <CssBaseline />
                        <AppBar
                            position="fixed"
                            sx={{ width: "17.35vw", ml: "0.026" }}
                        >
                        </AppBar>
                        <Drawer
                            sx={{
                                width: drawerWidth,
                                flexShrink: 0,
                                '& .MuiDrawer-paper': {
                                    width: drawerWidth,
                                    backgroundColor: "#2A2F42",
                                    boxSizing: 'border-box',
                                    display: 'flex', // Ensure flex layout
                                    flexDirection: 'column', // Arrange children vertically
                                    justifyContent: 'space-between', // Space between children
                                    overflow: "hidden"
                                },
                            }}
                            variant="permanent"
                            anchor="left"
                        >
                            <List sx={{ backgroundColor: "#2A2F42", px: 2 }}>
                                {LogoImage}
                                {pathname == '/sign-in' || pathname == '/reset-password' || pathname == '/sign-up' ? null :
                                    <MenuComponent sideMenuState={sideMenuState} menuClick={menuClick} handleSubMenuClick={handleSubMenuClick} toggleDrawer={toggleDrawer} push={push} />
                                }
                            </List>
                            {pathname == '/sign-in' || pathname == '/reset-password' || pathname == '/sign-up' ? null :
                                <Grid container justifyContent={"center"} alignItems={"flex-start"} sx={{ width: "100%", height: "23%", minHeight: "6vh" }} >
                                    <Grid
                                        container
                                        sx={{ width: "100%", minHeight: "6.399vw", my: "1.965vw", display: 'flex', justifyContent: "center", alignItems: "center", }}
                                    >
                                        {!isUserInfoLoading &&
                                            <Grid container justifyContent={"space-between"} alignItems={"center"} sx={{ width: "77%" }} >
                                                <Grid item xs={4} md={3.5} lg={3} xl={2.5} justifyContent={"center"} alignItems={"center"}  >
                                                    <Avatar>
                                                        <AccountCircleOutlinedIcon fontSize="medium" />
                                                    </Avatar>
                                                </Grid>
                                                <Grid container item xs={8} md={8.5} lg={9} xl={9.3} sx={{ display: "flex", flexDirection: "column" }}>
                                                    <Tooltip title={fullname.length > 18 ? fullname : ""}>
                                                        <Typography variant="body1" sx={{ fontWeight: '595', color: 'white', wordWrap: 'break-word', whiteSpace: 'normal', overflowWrap: 'break-word', width: "100%", minHeight: "1vh" }}>
                                                            {fullname.length > 18 ? `${fullname.slice(0, 17)}...` : fullname}
                                                        </Typography>
                                                    </Tooltip>
                                                    <Typography variant="body2" sx={{ color: "#726F83" }}>{userInfo.job_title}</Typography>
                                                </Grid>
                                            </Grid>
                                        }
                                        &nbsp;{!checkUser ?
                                            <Button variant="contained" className="cursor-pointer" sx={{ textTransform: "initial", backgroundColor: 'red', color: "white", width: '80%', '&:hover': { backgroundColor: '#ff3333' } }}
                                                onClick={handleSignout}>
                                                {isLinkLoading ? <CircularProgress sx={{ color: "white" }} size={25} /> : 'Sign out'}
                                            </Button> : null}
                                    </Grid>

                                </Grid>
                            }
                        </Drawer>
                        <Box
                            component="main"
                            sx={{ flexGrow: 1, bgcolor: '#F6F5FB' }}
                        >
                            {Children}
                        </Box>
                    </Box>
                </div>
            </div >
            <div className="block lg:hidden">
                <div>
                    <SwipeableDrawer
                        anchor="left"
                        open={open}
                        onClose={toggleDrawer(false)}
                        onOpen={toggleDrawer(true)}
                    >
                        <List className="w-[60vw] md:w-[30vw]" sx={{ height: '100%', backgroundColor: "#2A2F42", }}>
                            <Grid>
                                {LogoImage}
                                {pathname == '/sign-in' || pathname == '/reset-password' || pathname == '/sign-up' ? null :
                                    <MenuComponent sideMenuState={sideMenuState} menuClick={menuClick} handleSubMenuClick={handleSubMenuClick} toggleDrawer={toggleDrawer} setOpen={setOpen} mode={"mobile"} push={push} />
                                }
                            </Grid>
                            {pathname == '/sign-in' || pathname == '/reset-password' || pathname == '/sign-up' ? null :
                                <Grid container sx={{ width: "100%", my: "1.965vw", display: 'flex', justifyContent: "center", alignItems: "center" }}>
                                    {!isUserInfoLoading &&
                                        <Grid container justifyContent={"space-between"} alignItems={"center"} sx={{ display: "flex", flexDirection: "row", width: "77%" }} >
                                            <Grid item xs={4} md={3.5} lg={3} xl={2.5} justifyContent={"center"} alignItems={"center"}  >
                                                <Avatar>
                                                    <AccountCircleOutlinedIcon fontSize="medium" />
                                                </Avatar>
                                            </Grid>
                                            <Grid container item xs={8} md={8.5} lg={9} xl={9.3} sx={{ display: "flex", flexDirection: "column" }}>
                                                <Tooltip title={fullname.length > 18 ? fullname : ""}>
                                                    <Typography variant="body1" sx={{ fontWeight: '595', color: 'white', wordWrap: 'break-word', whiteSpace: 'normal', overflowWrap: 'break-word', width: "100%", minHeight: "1vh" }}>
                                                        {fullname.length > 18 ? `${fullname.slice(0, 17)}...` : fullname}
                                                    </Typography>
                                                </Tooltip>
                                                <Typography variant="body2" sx={{ color: "#726F83" }}>{userInfo.job_title}</Typography>
                                            </Grid>
                                        </Grid>
                                    }
                                    &nbsp;
                                    {!checkUser ?
                                        <Button
                                            variant="contained"
                                            className="cursor-pointer"
                                            sx={{ textTransform: "initial", backgroundColor: 'red', color: "white", width: '80%', '&:hover': { backgroundColor: '#ff3333' } }}
                                            onClick={handleSignout}
                                        >
                                            {isLinkLoading ? <CircularProgress sx={{ color: "white" }} size={25} /> : checkUser ? 'Sign in' : 'Sign out'}
                                        </Button> : null}

                                </Grid>
                            }
                        </List>
                    </SwipeableDrawer>
                    <Fab
                        aria-label="menu"
                        onClick={() => { setOpen(!open) }}
                        sx={{
                            position: 'fixed',
                            bottom: '16px',
                            left: '16px',
                            zIndex: 1300,
                            backgroundColor: "white",
                        }}
                    >
                        <MenuIcon sx={{ color: '#2A2F42', fontWeight: '600' }} />
                    </Fab>
                </div>
            </div>
            <SnakBarAlert alertOpen={alertOpen} setAlertOpen={setAlertOpen} alertSeverity={alertSeverity} alert={alert} />

        </>
    )
}

const MenuComponent = ({ sideMenuState, menuClick, handleSubMenuClick, toggleDrawer, setOpen, mode, push }: any) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isClick, setIsClick] = useState("");
    const pathname = usePathname();

    function handleredirect(url: string) {
        if (pathname !== url) {
            setIsLoading(true);
            setIsClick(url);
            push(url);
        }
    }
    useEffect(() => {
        const loadertimeout = setTimeout(() => {
            setIsLoading(false);
        }, 2000);
        return () => clearTimeout(loadertimeout);
    }, [pathname]);

    var menu_icon = [users_menu, forum_menu, company_menu, course_menu]
    return (
        sideMenuState?.map((item: any, i: any) => {
            if (!item?.sub_menus) {
                return (
                    <ListItemButton key={i} onClick={() => { menuClick(item); mode == "mobile" && setOpen(false); }} selected={item?.selected_status} sx={{ borderRadius: '1.5vh', py: 0.4, px: 2, my: 1, marginX: mode == "mobile" ? '2vh' : 0, '&:hover': { backgroundColor: '#161A29' } }}>
                        <SquareIcon sx={{ color: 'white', pr: 1 }} />
                        <ListItemText primary={item?.menu} sx={{ color: 'white' }} />
                    </ListItemButton >
                )
            } else {
                return (
                    <div key={i} style={{ margin: mode == "mobile" ? "0 2vh" : "1vh 0", }}>
                        <ListItemButton key={i} onClick={() => menuClick(item)} selected={item?.selected_status} sx={{ borderBottom: item?.sub_menu_state ? "0.1vh solid gray" : 0, borderRadius: item?.sub_menu_state ? '1.5vh 1.5vh 0 0' : '1.5vh', py: 0.9, px: 2, my: item?.sub_menu_state ? 0 : 1, backgroundColor: item?.sub_menu_state ? '#161A29' : null, '&:hover': { backgroundColor: '#161A29' } }}>
                            {/* <SquareIcon sx={{ color: 'white', pr: 1 }} /> */}
                            <Grid className="justify-center items-center " >
                                <div style={{ cursor: 'pointer', width: 25, height: 25 }}>
                                    <Image
                                        src={menu_icon[i]}
                                        priority={true}
                                        placeholder="empty"
                                        alt="forums@work"
                                        style={{
                                            objectFit: 'contain',
                                            backgroundColor: "transparent",
                                        }}
                                        unoptimized
                                    />
                                </div>
                            </Grid>
                            &nbsp;
                            <ListItemText primary={item?.menu} sx={{ color: 'white' }} />
                            {item?.sub_menu_state ? <ExpandLess sx={{ color: 'white' }} /> : <ExpandMore sx={{ color: 'white' }} />}
                        </ListItemButton >
                        <Collapse in={item?.sub_menu_state} timeout="auto" unmountOnExit sx={{ borderRadius: '0 0 2vh 2vh', backgroundColor: item?.sub_menu_state ? '#161A29' : null }}>
                            <List component="div" disablePadding>
                                {item.sub_menus
                                    ?.filter((filter_itm: any) => {
                                        return !filter_itm?.redirect_url?.includes("{")
                                    })
                                    ?.map((sub_item: any, i: any) => {
                                        var filter = item.sub_menus.filter((filter_itm: any) => {
                                            return !filter_itm?.redirect_url?.includes("{")
                                        })
                                        return (
                                            <ListItemButton
                                                key={i}
                                                onClick={() => {
                                                    handleredirect(sub_item?.redirect_url);
                                                    handleSubMenuClick(item, sub_item); mode == "mobile" && setOpen(false);
                                                }}
                                                selected={sub_item?.selected_status}
                                                sx={{
                                                    '&.Mui-selected': {
                                                        borderRadius: filter?.length == i + 1 ? '0 0 2vh 2vh' : '0vh',
                                                        // borderRadius: '2vh',
                                                        backgroundColor: 'rgba(45, 169, 224, 0.25)',

                                                    },
                                                    '&:hover': {
                                                        borderRadius: filter?.length == i + 1 ? '0 0 2vh 2vh' : '0vh',
                                                        backgroundColor: 'rgba(45, 169, 224, 0.05)',
                                                    },
                                                }}
                                            >
                                                {sub_item.selected_status && isLoading ? <CircularProgress sx={{ color: "white", mr: 1 }} size={18} /> : <ArrowRightIcon sx={{ color: 'white', pr: 1 }} />}
                                                <ListItemText primary={sub_item?.sub_menu_item} sx={{ color: '#d9d9d9' }} />
                                            </ListItemButton>
                                        )
                                    })}
                            </List>
                        </Collapse>
                    </div>
                )
            }
        })
    )
}
