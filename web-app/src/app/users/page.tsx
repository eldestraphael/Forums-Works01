"use client"

import { CircularProgress } from '@mui/material';
import React, { useLayoutEffect, useState } from 'react'
import AllUsers from './users';
import SnakBarAlert from "@/components/snakbaralert/snakbaralert";
import { StaticMessage } from '../util/StaticMessage';
import CallSignout from '@/util/callSignout';

function Page(props: any) {
    const [allUsersAction, setAllUsersAction] = useState<any>([]);
    const [addUsersAction, setAddUsersAction] = useState<any>([]);
    const [viewUsersAction, setViewUsersAction] = useState<any>([]);
    const [isLoading, setisLoading] = useState(true);
    const [alert, setAlert] = useState("");
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertSeverity, setAlertSeverity] = useState(false);

    //ACL API CALL
    const acl_api_call = async () => {
        setisLoading(true)
        var req_body = [
            {
                "module": "users",
                "sub_module": "all_users",
                "actions": ["update", "read"]
            },
            {
                "module": "users",
                "sub_module": "add_user",
                "actions": ["create", "read"]
            },
            {
                "module": "users",
                "sub_module": "view_user",
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
                    if (item.sub_module === "all_users") {
                        setAllUsersAction(item.actions)
                    }
                    else if (item.sub_module === "add_user") {
                        setAddUsersAction(item.actions)
                    }
                    else if (item.sub_module === "view_user") {
                        setViewUsersAction(item.actions)
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

    if (allUsersAction?.length > 0 && addUsersAction?.length > 0 && viewUsersAction?.length > 0) {
        return (
            <AllUsers page_props={props} allUsersAction={allUsersAction} addUsersAction={addUsersAction} viewUsersAction={viewUsersAction} />
        )
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