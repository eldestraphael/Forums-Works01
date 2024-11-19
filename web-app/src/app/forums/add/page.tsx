"use client"

import { CircularProgress } from '@mui/material';
import React, { useLayoutEffect, useState } from 'react'
import AddForum from './add';
import CallSignout from '@/util/callSignout';


function Page(props: any) {
    const [addForumAction, setAddForumAction] = useState<any>([]);
    const [isLoading, setisLoading] = useState(true);

    //ACL API CALL
    const acl_api_call = async () => {
        setisLoading(true)
        var req_body = [
            {
                "module": "forums",
                "sub_module": "add_forum",
                "actions": ["create", "read"]
            }
        ]
        try {
            const res = await fetch(`/api/user/role/privileges`, {
                method: "POST",
                headers: { "Content-Type": "application/json", },
                body: JSON.stringify(req_body),
            });
            const api_data = await res.json();
            if (res.status == 200) {
                setisLoading(false);
                api_data?.data?.map((item: any) => {
                    if (item.sub_module === "add_forum") {
                        setAddForumAction(item.actions)
                    }
                })
            } else if (res.status == 401) {
                CallSignout();
            } else {
                setisLoading(false);
            }
        }
        catch (error: any) {
            setisLoading(false)
        }
    }

    useLayoutEffect(() => {
        acl_api_call()
    }, [])

    if (addForumAction?.length > 0) {
        return (
            <AddForum page_props={props} addForumAction={addForumAction} />
        )
    } else {
        return (
            <div className='w-screen h-screen flex justify-center items-center'>
                {isLoading && <CircularProgress size={30} />}
            </div>
        )
    }
}

export default Page