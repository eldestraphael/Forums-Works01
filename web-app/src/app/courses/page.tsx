"use client"

import { CircularProgress, Typography } from '@mui/material';
import React, { useLayoutEffect, useState } from 'react'
import AllCourses from './course';
import SnakBarAlert from "@/components/snakbaralert/snakbaralert";
import { StaticMessage } from '../util/StaticMessage';
import CallSignout from '@/util/callSignout';

function Page(props: any) {
    const [aclData, setaclData] = useState<any>([]);
    const [allCoursesAction, setAllCoursesAction] = useState<any>([]);
    const [addCoursesAction, setAddCoursesAction] = useState<any>([]);
    const [viewCoursesAction, setViewCoursesAction] = useState<any>([]);
    const [allUsersRead, setAllUsersRead] = useState<any>('');
    const [isLoading, setisLoading] = useState(true);
    const [alert, setAlert] = useState("");
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertSeverity, setAlertSeverity] = useState(false);

    //ACL API CALL
    const acl_api_call = async () => {
        setisLoading(true)
        var req_body = [
            {
                "module": "courses",
                "sub_module": "all_courses",
                "actions": ["update", "read"]
            },
            {
                "module": "courses",
                "sub_module": "add_course",
                "actions": ["create", "read"]
            },
            {
                "module": "courses",
                "sub_module": "view_course",
                "actions": ["update", "read"]
            },
        ];

        try {
            const res = await fetch(`/api/user/role/privileges`, {
                method: "POST",
                cache: 'no-store',
                headers: { "Content-Type": "application/json", },
                body: JSON.stringify(req_body),
            });
            const api_data = await res.json();
            console.log("course api",api_data)
            if (res.status == 200) {
                setisLoading(false);
                api_data?.data?.map((item: any) => {
                    if (item.sub_module === "all_courses") {
                        setAllCoursesAction(item.actions)
                    }
                    else if (item.sub_module === "add_course") {
                        setAddCoursesAction(item.actions)
                    }
                    else if (item.sub_module === "view_course") {
                        setViewCoursesAction(item.actions)
                    }
                })
            } else if(res.status == 401) {
                CallSignout();
            } else {
                setisLoading(false);
            }
        }
        catch (error: any) {
            setisLoading(false)
            AlertManager(StaticMessage.ErrorMessage,true);
        }
    }


    useLayoutEffect(() => {
        acl_api_call()
    }, [])



    function AlertManager(message: string, severity: boolean) {
        setAlert(message)
        setAlertSeverity(severity)
        setAlertOpen(true)
    }

    if (allCoursesAction?.length > 0 && addCoursesAction?.length > 0 && viewCoursesAction?.length > 0) {
        if ((addCoursesAction[0].create === false && addCoursesAction[1].read === false) &&
            (allCoursesAction[0].update === false && allCoursesAction[1].read === false) &&
            (viewCoursesAction[0].update === false && viewCoursesAction[1].read === false)) {
            return (
                <div className='w-screen h-screen flex justify-center items-center'>
                    <Typography variant='h5' sx={{ color: "red", mr: "2vh", fontWeight: "600" }}>404</Typography><Typography variant='h6' sx={{ fontWeight: "500" }}> Page not found</Typography>
                </div>)
        }
        else {
            return (
                <AllCourses page_props={props} allCoursesAction={allCoursesAction} addCoursesAction={addCoursesAction} viewCoursesAction={viewCoursesAction} />
            )
        }
    } else {
        return (
            <div className='w-screen h-screen flex justify-center items-center'>
                {isLoading && <CircularProgress size={30} />}
                <SnakBarAlert alertOpen={alertOpen} setAlertOpen={setAlertOpen} alertSeverity={alertSeverity} alert={alert} />
            </div>
        )
    }
}

export default Page
