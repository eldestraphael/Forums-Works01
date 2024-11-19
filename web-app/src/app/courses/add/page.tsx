"use client"

import { CircularProgress, Typography } from '@mui/material';
import React, { useLayoutEffect, useState } from 'react'
import AddCourse from './add';
import CallSignout from '@/util/callSignout';

function Page(props: any) {
    const [createCourseAction, setCreateCourseAction] = useState<any>([]);
    const [isLoading, setisLoading] = useState(true);

    //ACL API CALL
    const acl_api_call = async () => {
        setisLoading(true)
        var req_body = [
            {
                "module": "courses",
                "sub_module": "add_course",
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
                    if (item.sub_module === "add_course") {
                        setCreateCourseAction(item.actions)
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
        }
    }

    useLayoutEffect(() => {
        acl_api_call()
    }, [])

    if (createCourseAction?.length > 0) {
        if ((createCourseAction[0]?.create === false && createCourseAction[1]?.read === false)) {
            return (
                <div className='w-screen h-screen flex justify-center items-center'>
                    <Typography variant='h5' sx={{ color: "red", mr: "2vh", fontWeight: "600" }}>404</Typography><Typography variant='h6' sx={{ fontWeight: "500" }}> Page not found</Typography>
                </div>)
        } else {
            return (
                <AddCourse page_props={props} createCourseAction={createCourseAction} />
            )
        }
    } else {
        return (
            <div className='w-screen h-screen flex justify-center items-center'>
                {isLoading && <CircularProgress size={30} />}
            </div>
        )
    }
}

export default Page