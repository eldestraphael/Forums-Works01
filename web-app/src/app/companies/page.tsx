"use client"

import { CircularProgress } from '@mui/material';
import React, { useLayoutEffect, useState } from 'react'
import AllCompany from './company';
import SnakBarAlert from "@/components/snakbaralert/snakbaralert";
import { StaticMessage } from '../util/StaticMessage';
import CallSignout from '@/util/callSignout';

function Page(props: any) {
    const [allCompaniesAction, setAllCompaniesAction] = useState<any>([]);
    const [addUCompnyAction, setAddCompanyAction] = useState<any>([]);
    const [viewCompaniesAction, setViewCompaniesAction] = useState<any>([]);
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
                "sub_module": "all_companies",
                "actions": ["update", "read"]
            },
            {
                "module": "companies",
                "sub_module": "add_company",
                "actions": ["create", "read"]
            },
            {
                "module": "companies",
                "sub_module": "view_company",
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
                    if (item.sub_module === "all_companies") {
                        setAllCompaniesAction(item.actions)
                    }
                    else if (item.sub_module === "add_company") {
                        setAddCompanyAction(item.actions)
                    }
                    else if (item.sub_module === "view_company") {
                        setViewCompaniesAction(item.actions)
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

    if (allCompaniesAction?.length > 0 && addUCompnyAction?.length > 0 && viewCompaniesAction?.length > 0) {

        return (
            <AllCompany page_props={props} allCompaniesAction={allCompaniesAction} addUCompnyAction={addUCompnyAction} viewCompaniesAction={viewCompaniesAction} />
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