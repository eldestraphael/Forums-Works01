"use client";

import React, { useEffect, useState } from "react";
import { Button, Grid, Typography } from "@mui/material";
import "@zoom/videosdk-ui-toolkit/dist/videosdk-ui-toolkit.css";
import ModeratorGuide from "./moderatorGuide";
import { useAppSelector } from "@/redux/hooks";

const ZoomComponent = ({ zoomData, forum_name, forum_uuid,handleClose,setSessionClosed,setRenderZoom, chapter_uuid, meeting_time, setCurrentPageName }: any) => {
    // console.log("props zoom",zoomData,forum_name, forum_uuid,  chapter_uuid, meeting_time,sessisonClosed);
    const [isClient, setIsClient] = useState(false);
    const [uitoolkit, setUitoolkit] = useState<any>(null);
    const [disableModeratorGuideBtn, setDisableModeratorGuideBtn] = useState(true);
    const [moderatorGuideData, setModeratorGuideData] = useState<any>({});
    // const [open, setOpen] = useState<boolean>(false);
    // const handleClose = () => setOpen(false);
    const me_api_data: any = useAppSelector(state => state.forumExperience.me_api_data);
    let sessionContainer: HTMLElement | null;

    //INITIAL USEFFECT TO CHECK IF THE ZOOM IS ENABLED
    useEffect(() => {
        setIsClient(true);
        // Dynamically import uitoolkit only on the client side
        import("@zoom/videosdk-ui-toolkit").then((module) => {
            setUitoolkit(module.default);
        });
    }, []);

    //CONNECT ZOOM SESSION CALL
    useEffect(() => {
        if (zoomData && uitoolkit) {
            // getModeratorGuide()
            connectSession();
        }
    }, [zoomData, uitoolkit]);

    if (!isClient || !uitoolkit) {
        return null; // Return null or a loading indicator until the component and uitoolkit are ready
    }


    //NAME FORMATER FOR THE SESSION NAME
    function joinFields(name: string, dateTime: any) {
        const transformedName = name?.replace(/\s+/g, '_');
        const date = dateTime?.split(' ')[0];
        const transformedDate = date?.replace(/-/g, '_');
        const result = `${transformedName}-${transformedDate}`;
        return result;
    }

    //CONFIGURATOR
    const config = {
        videoSDKJWT: zoomData?.token,
        sessionName: forum_uuid,
        userName: `${me_api_data?.user_info?.first_name} ${me_api_data?.user_info?.last_name}`,
        sessionPasscode: "1234567890",
        features: ["video", "audio", "settings", "users", "chat", "share"],
    };

    const joinSession = () => {
        if (sessionContainer) {
            uitoolkit.joinSession(sessionContainer, config);
            uitoolkit.onSessionClosed(sessionClosed);
        }
    };

    //CONNECT SESSION
    const connectSession = async () => {
        sessionContainer = document.getElementById("sessionContainer");
        if (sessionContainer) {
            document.getElementById("join-flow")!.style.display = "none";
            joinSession();
        }
    };

    //LEAVE OR CLOSE FUNCTION
    const sessionClosed = async () => {
        if (sessionContainer) {
            const requestBody = {
                "type": "zoom",
                "meeting_uuid": zoomData?.meeting_uuid,
                "meeting_status_uuid": zoomData?.meeting_status_uuid
            };
            try {
                const res = await fetch(`/api/forumexperience/${forum_uuid}/leavemeeting`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(requestBody),
                });
                // const data = await res.json();
                if (res.status == 200) {
                    uitoolkit.closeSession(sessionContainer);
                    document.getElementById("join-flow")!.style.display = "flex";
                    setSessionClosed(true);
                    handleClose();
                    // setRenderZoom(false);
                    // setCurrentPageName("prework");
                } else {
                    // AlertManager(StaticMessage.ErrorMessage, true);
                }
            }
            catch (error: any) {
                // AlertManager(StaticMessage.ErrorMessage, true);
            }
        }
    };

    // //GET MODERATOR GUIDE
    // const getModeratorGuide = async () => {
    //     try {
    //         const res = await fetch(`/api/${chapter_uuid}/moderatorguide`, {
    //             method: "GET",
    //             cache: 'no-store',
    //             headers: {
    //                 "Content-Type": "application/json",
    //             },
    //         });
    //         const data = await res.json();
    //         if (res.status == 200) {
    //             setModeratorGuideData(data?.data)
    //             setDisableModeratorGuideBtn(false)
    //         } else {
    //             setDisableModeratorGuideBtn(true)
    //         }
    //     }
    //     catch (error: any) {
    //         setDisableModeratorGuideBtn(true)
    //     }
    // };

    return (
        <main className="w-full h-full flex flex-col justify-center items-center">
            <div id="join-flow" className="w-full flex justify-center items-center">
                <Typography variant='h6' sx={{ fontWeight: "600", color: '#5F83ED' }}>
                    Video call ended
                </Typography>
            </div>
            <div id="sessionContainer" className="max-w-screen-xl flex-1 overflow-auto">
            </div>
        </main>
    );
};

export default ZoomComponent;