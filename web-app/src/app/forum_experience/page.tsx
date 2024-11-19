"use client"

import { CircularProgress } from '@mui/material';
import React, { useLayoutEffect, useState } from 'react'
import ForumExperience from './forum_experience';
import SnakBarAlert from "@/components/snakbaralert/snakbaralert";
import { StaticMessage } from '../util/StaticMessage';
import CallSignout from '@/util/callSignout';

function Page(props: any) {
    const [allForumsAction, setAllForumsAction] = useState<any>([]);
    const [addForumsAction, setAddForumsAction] = useState<any>([]);
    const [viewForumsAction, setViewForumsAction] = useState<any>([]);
    const [isLoading, setisLoading] = useState(true);
    const [alert, setAlert] = useState("");
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertSeverity, setAlertSeverity] = useState(false);

    //ACL API CALL
    const acl_api_call = async () => {
        setisLoading(true)
        var req_body = [
            {
                "module": "forums",
                "sub_module": "all_forums",
                "actions": ["update", "read"]
            },
            {
                "module": "forums",
                "sub_module": "add_forum",
                "actions": ["create", "read"]
            },
            {
                "module": "forums",
                "sub_module": "view_forum",
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
            if (res.status == 200) {
                setisLoading(false);
                api_data?.data?.map((item: any) => {
                    if (item.sub_module === "all_forums") {
                        setAllForumsAction(item.actions)
                    }
                    else if (item.sub_module === "add_forum") {
                        setAddForumsAction(item.actions)
                    }
                    else if (item.sub_module === "view_forum") {
                        setViewForumsAction(item.actions)
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
            AlertManager(StaticMessage.ErrorMessage, true);
        }
    }

    useLayoutEffect(() => {
        // acl_api_call()
    }, [])

    function AlertManager(message: string, severity: boolean) {
        setAlert(message)
        setAlertSeverity(severity)
        setAlertOpen(true)
    }
    // if (allForumsAction?.length == 0 && addForumsAction?.length == 0 && viewForumsAction?.length == 0) {
    return (
        <ForumExperience page_props={props} allForumsAction={allForumsAction} addForumsAction={addForumsAction} viewForumsAction={viewForumsAction} />
    )
    // } else {
    //     return (
    //         <div className='w-screen h-screen flex justify-center items-center'>
    //             {isLoading && <CircularProgress size={30} />}
    //             <SnakBarAlert alertOpen={alertOpen} setAlertOpen={setAlertOpen} alertSeverity={alertSeverity} alert={alert} />
    //         </div>
    //     )
    // }
}

export default Page