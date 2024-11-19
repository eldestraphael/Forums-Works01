"use client"

import { CircularProgress } from '@mui/material';
import React, { useLayoutEffect, useState } from 'react'
import EditCompany from './company_id';
import SnakBarAlert from "@/components/snakbaralert/snakbaralert";
import CallSignout from '@/util/callSignout';

function Page(props: any) {

    const [viewCompanyAction,  setViewCompanyAction] = useState<any>([]);
    const [isLoading, setisLoading] = useState(true);
    const [alert, setAlert] = useState("");
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertSeverity, setAlertSeverity] = useState(false);

    //ACL API CALL
    const acl_api_call = async () => {
        setisLoading(true)
        var req_body = [
            {
              "module": "companies",
              "sub_module": "view_company",
              "actions": ["update", "read"]
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
                    if (item.sub_module === "view_company") {
                        setViewCompanyAction(item.actions)
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
            AlertManager("Please try again later", true);
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

    if (viewCompanyAction?.length > 0 ) {
        return (
            <EditCompany page_props={props} viewCompanyAction={viewCompanyAction} />
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