'use client'

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, CircularProgress, Grid, Typography } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import SnakBarAlert from "../../snakbaralert/snakbaralert";
import { StaticMessage } from "@/app/util/StaticMessage";
import { setDiscardBtnDisable, setSaveBtnLoader, setYesBtnLoading } from "@/redux/reducers/editCourse/addLessonSlice";
import BackDropLoading from "@/components/loading/backDropLoading";
import StaticSection from "./staticSection";
import BodySection from "./bodySection";
import ModeratorGuide from "@/app/zoom_video/moderatorGuide";

interface ActionStep {
    section_uuid?: string;
    name: string | null;
    description: string;
}

interface Sections {
    section_uuid?: string;
    section_type: string;
    type: string
    title?: string;
    description?: string;
    order: number | null;
    duration?: number | null;
    duration_per_person?: number | null;
    link?: string | null;
    is_deleted?: boolean
}

export default function LMSModeratorGuide({ setLessonUUID, setAddLessonToggle, assetInfo, }: any) {

    const [footers, setFooters] = useState<Sections[]>([{
        section_type: "footer",
        type: "once",
        order: 1,
    }]);
    const [headers, setHeaders] = useState<Sections[]>([]);
    const [actionStep, setActionStep] = useState<ActionStep[]>([])
    const [bodySections, setBodySections] = useState<Sections[]>([{
        section_type: "body",
        type: "once",
        order: 1,
    }]);

    const [headerForAPICall, setHeaderForAPICall] = useState<Sections[]>([])
    const [footerForAPICall, setFooterForAPICall] = useState<Sections[]>([])
    const [bodyForAPICall, setBodyForAPICall] = useState<Sections[]>([])
    const [discardChangesLoader, setDiscardChangeLoader] = useState<boolean>(false);
    const [alert, setAlert] = useState("");
    const [alertSeverity, setAlertSeverity] = useState<boolean>(false);
    const [alertOpen, setAlertOpen] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [moderatorGuideData, setModeratorGuideData] = useState<any>({ header: [], footer: [], body: [],action_step:[]});
    const [open, setOpen] = useState<boolean>(false);
    const handleClose = () => setOpen(false);

    const saveLoader = useSelector((state: any) => state.editCourse.saveBtnLoader);
    const chapter_uuid = useSelector((state: any) => state.editCourse.chapterId);
    const discard: boolean = useSelector((state: any) => state.editCourse.discardBtnDisable);
    const userRoleAction = useSelector((state: any) => state.editCourse.editCourseAction);

    const dispatch = useDispatch();

    const addFooter = (orderIndex: number) => {
        setFooters((prevFooters: any) => [
            ...prevFooters,
            {
                section_type: "footer",
                type: "once",
                order: orderIndex,
            }
        ]);
    };

    const addHeader = (orderIndex: number) => {
        setHeaders((prevHeaders: any) => [
            ...prevHeaders,
            {
                section_type: "header",
                type: "once",
                order: orderIndex,
            },
        ]);
    };

    const addBody = (orderIndex: number) => {
        setBodySections((prevBodySection: any) => [
            ...prevBodySection,
            {
                section_type: "body",
                type: "once",
                order: orderIndex,
            },
        ]);
    };

    //REMOVE NULL VALUE IN INITIAL API RESPONSE
    const processResponse = (response: any, sectionType: string) => {
        const cleanObject = (obj: any) => {
            const cleanedObj: any = {};
            for (const key in obj) {
                if (obj[key] !== null && obj[key] !== "") {
                    cleanedObj[key] = obj[key];
                }
            }
            return cleanedObj;
        };

        const Objadd = response.map((section: any) => {
            const cleanedSection = cleanObject(section);
            return {
                ...cleanedSection,
                section_type: sectionType
            };
        });

        return Objadd
    };

    //CONVERT MINTUES INTO SECONDS 
    const convertDurationsToSeconds = (sections: any, place: string) => {
        return sections.map((section: any) => {
            const updatedSection = { ...section };
            if (section.duration !== undefined) {
                place == 'reqbody' ?
                    updatedSection.duration = section.duration * 60 :
                    updatedSection.duration = section.duration / 60;
            }
            if (section.duration_per_person !== undefined) {
                place == 'reqbody' ?
                    updatedSection.duration_per_person = section.duration_per_person * 60 :
                    updatedSection.duration_per_person = section.duration_per_person / 60
            }
            return updatedSection;
        });
    };


    //INITIAL GET MODERATOR GUIDE API
    async function getModeratorGuideDetails() {
        setIsLoading(true);
        try {
            const getModeratorGuideDetailsAPI = await fetch(`/api/${chapter_uuid}/moderatorguide`, {
                method: "GET",
                cache: "no-store",
                headers: {
                    "Content-Type": "application/json"
                },
            })
            const getModeratorGuideDetailsResponse = await getModeratorGuideDetailsAPI.json();
            if (getModeratorGuideDetailsAPI?.status == 200) {
                setActionStep(getModeratorGuideDetailsResponse?.data?.action_step);
                setModeratorGuideData((prevData:any)=>({
                    ...prevData,
                    action_step:getModeratorGuideDetailsResponse?.data?.action_step
                }))
                if (getModeratorGuideDetailsResponse?.data?.header?.length) {
                    const headerResponse: any = processResponse(getModeratorGuideDetailsResponse?.data?.header, "header");
                    const updatedHeaderResponse = convertDurationsToSeconds(headerResponse, "fromAPIReponse");
                    setHeaders(updatedHeaderResponse);
                    setModeratorGuideData((prevData: any) => ({
                        ...prevData,
                        header: headerResponse
                    }));
                }
                if (getModeratorGuideDetailsResponse?.data?.body?.length) {
                    const bodyResponse: any = processResponse(getModeratorGuideDetailsResponse?.data?.body, "body");
                    const updatedBodyResponse = convertDurationsToSeconds(bodyResponse, "fromAPIReponse");
                    setBodySections(updatedBodyResponse);
                    // Set the moderatorGuideData footer array
                    setModeratorGuideData((prevData: any) => ({
                        ...prevData,
                        body: bodyResponse,
                    }));
                }
                if (getModeratorGuideDetailsResponse?.data?.footer?.length) {
                    const footerResponse: any = processResponse(getModeratorGuideDetailsResponse?.data?.footer, "footer");
                    const updatedFooterResponse = convertDurationsToSeconds(footerResponse, "fromAPIReponse");
                    setFooters(updatedFooterResponse);
                    // Set the moderatorGuideData footer array
                    setModeratorGuideData((prevData: any) => ({
                        ...prevData,
                        footer: footerResponse,
                    }));
                }
                setLessonUUID('');

                AlertManager(getModeratorGuideDetailsResponse?.message, false);
            } else {
                AlertManager(getModeratorGuideDetailsResponse?.message, true);
            }
        }
        catch (error) {
            AlertManager(StaticMessage.ErrorMessage, true);
        }
    }


    //Update Header
    const updateHeader = (index: number, field: any, value: string | number | boolean) => {
        const newHeaders = [...headers];
        const updatedHeaders = [...headerForAPICall];

        // Convert duration and minperperson to seconds
        const valueInSeconds = (field === 'duration' || field === 'duration_per_person') && value !== null
            ? Number(value) * 60
            : value;


        if (field === 'order' || field === 'duration' || field === 'duration_per_person') {
            newHeaders[index] = { ...newHeaders[index], [field]: value !== null ? Number(value) : null };
            updatedHeaders[index] = { ...newHeaders[index], [field]: value !== null ? Number(value) : null };
        } else {
            if (field === 'is_deleted' && value == false) {
                const filteredHeaders = updatedHeaders.filter((item, i) => i !== index);
                setHeaderForAPICall(filteredHeaders);
                return;
            } else {
                newHeaders[index] = { ...newHeaders[index], [field]: value };
                updatedHeaders[index] = { ...newHeaders[index], [field]: value };
            }
        }
        setHeaders(newHeaders);  //state update for UI
        setHeaderForAPICall(updatedHeaders);  //state update for API call
        setModeratorGuideData((prevData: any) => {
            const newModeratorHeader = [...headers];
            newModeratorHeader[index] = { ...newModeratorHeader[index], [field]: value };
            const result = convertDurationsToSeconds(newModeratorHeader, "reqbody");
            return {
                ...prevData,
                header: result,
            };

        })
    }

    //Update Body Section
    const updateBoadSection = (index: number, field: string, value: string | number | boolean) => {
        const newBodySection = [...bodySections];
        const updatedbody = [...bodyForAPICall];

        if (field === 'order' || field === 'duration' || field === 'duration_per_person') {
            newBodySection[index] = { ...newBodySection[index], [field]: value !== null ? Number(value) : null };
            updatedbody[index] = { ...newBodySection[index], [field]: value !== null ? Number(value) : null };
        } else {
            if (field === 'is_deleted' && value == false) {
                const filteredBody = updatedbody.filter((item, i) => i !== index);
                setBodyForAPICall(filteredBody);
                return;
            } else {
                newBodySection[index] = { ...newBodySection[index], [field]: value };
                updatedbody[index] = { ...newBodySection[index], [field]: value };
            }
        }
        setBodySections(newBodySection);
        setBodyForAPICall(updatedbody);
        // Update the corresponding entry in moderatorGuideData.footer
        setModeratorGuideData((prevData: any) => {
            const newModeratorBody = [...bodySections];
            newModeratorBody[index] = { ...newModeratorBody[index], [field]: value };
            const result = convertDurationsToSeconds(newModeratorBody, "reqbody");
            return {
                ...prevData,
                body: result,
            };
        });
    }


    //Update Footer
    const updateFooter = (index: number, field: string, value: string | number | boolean) => {
        const newFooters = [...footers];
        const updatedFooters = [...footerForAPICall];

        if (field === 'order' || field === 'duration' || field === 'duration_per_person') {
            newFooters[index] = { ...newFooters[index], [field]: value !== null ? Number(value) : null };
            updatedFooters[index] = { ...newFooters[index], [field]: value !== null ? Number(value) : null };
        } else {
            if (field === 'is_deleted' && value == false) {
                const filteredFooter = updatedFooters.filter((item, i) => i !== index);
                setFooterForAPICall(filteredFooter);
                return;
            } else {
                newFooters[index] = { ...newFooters[index], [field]: value };
                updatedFooters[index] = { ...newFooters[index], [field]: value };
            }
        }
        setFooters(newFooters);
        setFooterForAPICall(updatedFooters);  //state update for API call

        // Update the corresponding entry in moderatorGuideData.footer
        setModeratorGuideData((prevData: any) => {
            const newModeratorFooter = [...footers];
            newModeratorFooter[index] = { ...newModeratorFooter[index], [field]: value };
            const result = convertDurationsToSeconds(newModeratorFooter, "reqbody");
            return {
                ...prevData,
                footer: result,
            };
        });

        
    };


    //POST Moderate Guide API
    async function saveModeratorGuide() {
        let filteredHeaders = headerForAPICall.filter(item => item !== undefined);
        let filteredBody = bodyForAPICall.filter(item => item !== undefined);
        let filteredFooters = footerForAPICall.filter(item => item !== undefined);
        const requestBody = [...filteredHeaders, ...filteredBody, ...filteredFooters]
        const updatedRequestBody = convertDurationsToSeconds(requestBody, "reqbody");
        setIsLoading(true);
        try {
            const getModeratorGuideDetailsAPI = await fetch(`/api/${chapter_uuid}/moderatorguide`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(updatedRequestBody)
            })
            const getModeratorGuideDetailsResponse = await getModeratorGuideDetailsAPI.json();
            if (getModeratorGuideDetailsAPI?.status == 200) {
                AlertManager(getModeratorGuideDetailsResponse?.message, false);
                setAddLessonToggle(false);

            } else {
                AlertManager(getModeratorGuideDetailsResponse?.message, true);
            }
        }
        catch (error) {
            AlertManager(StaticMessage.ErrorMessage, true);
        }
    }

    const getNextOrderValue = (Sections: any) => {
        if (Sections.length === 0) {
            return 1;
        }
        const lastOrder = Sections[Sections.length - 1]?.order ?? 0;
        return lastOrder + 1;
    };

    function AlertManager(message: string, severity: boolean) {
        setAlert(message);
        setAlertSeverity(severity);
        setAlertOpen(true);
        setIsLoading(false);
        dispatch(setYesBtnLoading(false));
        dispatch(setSaveBtnLoader(false));
        dispatch(setDiscardBtnDisable(false));
    }

    //Get  moderator guide 
    useEffect(() => {
        getModeratorGuideDetails();
    }, [chapter_uuid]);

            console.log("hearer",headers)
        console.log("body",bodySections)
        console.log("footers",footers)


    return (
        <>
            {userRoleAction[1].read &&
                <Grid container item xs={11} direction='column' justifyContent={'center'} alignItems={'center'} >
                    <Grid container item xs={12}>
                        <Grid container item xs={12}>
                            <Button variant='contained'
                                sx={{ backgroundColor: "#2A2F42", cursor: "auto", borderRadius: "5vh", border: "3px solid balck", m: 0, py: 0, px: 1.5, color: "#F0F2FF", textTransform: "initial", fontWeight: "700", '&:hover': { backgroundColor: '#2A2F42' } }}
                            >
                                Moderator Guide</Button>
                        </Grid>
                        <Grid container item xs={12} direction='row' sx={{ mb: "1vh" }}>
                            <Grid container item xs={assetInfo ? 4 : 7} sm={4} md={4.5} lg={5} xl={6} alignItems={'center'} sx={{ backgroundColor: "transperant" }}>
                                <Typography variant="body1" fontWeight={"600"}>Moderator Guide for this chapter</Typography>
                            </Grid>
                            <Grid container item xs={assetInfo ? 8 : 5} sm={8} md={7.5} lg={7} xl={6} justifyContent={"space-between"} alignItems={'center'} sx={{ backgroundColor: "transperant" }} >
                                <Grid container item xs={12} justifyContent={"space-between"} alignItems={'center'} sx={{ display: 'flex', flexDirection: "row" }} >
                                    <Grid item xs={assetInfo ? 3 : 4} sm={3} md={3} lg={3} xl={3.5} justifyContent={"flex-end"} alignItems={'center'}>
                                        <Button variant='outlined' fullWidth
                                            disabled={discard}
                                            sx={{ backgroundColor: "#2A2F42", height: "4vh", borderRadius: "1vh", border: "3px solid balck", m: 0, p: 0.5, color: "#F0F2FF", textTransform: "initial", fontWeight: "600", '&:hover': { backgroundColor: '#2A2F42' } }}
                                            onClick={() => { setOpen(true) }}>
                                            {"PREVIEW"}
                                        </Button>
                                    </Grid>
                                    <Grid item xs={assetInfo ? 4 : 7} sm={5.5} md={6.5} lg={5.5} xl={4.5} justifyContent={"flex-end"} alignItems={'center'} >
                                        <Button variant='outlined' fullWidth
                                            disabled={discard}
                                            sx={{ backgroundColor: "white", height: "4vh", borderRadius: "1vh", border: "1px solid #2A2F42", px: 1, py: 0.5, m: 0, color: "black", textTransform: "initial", fontWeight: "600", }}
                                            onClick={() => { setDiscardChangeLoader(true); setAddLessonToggle(false) }}>
                                            {discardChangesLoader ? <CircularProgress sx={{ color: "white" }} size={20} /> : " Discard Changes"}
                                        </Button>
                                    </Grid>
                                    <Grid item xs={assetInfo ? 3 : 4} sm={3} md={2} lg={3} xl={3} justifyContent={"flex-end"} alignItems={'center'}>
                                        {userRoleAction[0].update &&
                                            <Button variant='contained' fullWidth
                                                sx={{ backgroundColor: "#2A2F42", height: "4vh", borderRadius: "1vh", border: "3px solid balck", m: 0, p: 0.5, color: "#F0F2FF", textTransform: "initial", fontWeight: "600", '&:hover': { backgroundColor: '#2A2F42' } }}
                                                onClick={saveModeratorGuide}>
                                                {saveLoader ? <CircularProgress sx={{ color: "white" }} size={20} /> : "SAVE"}
                                            </Button>
                                        }
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid container item xs={12} justifyContent={"center"} alignItems={"center"} sx={{ backgroundColor: "white" }}>
                            <Grid container item xs={12} justifyContent={"center"} alignItems={"center"} sx={{ pt: 2, pb: 3 }}>
                                {headers?.map((header: any, index: number) => {
                                    if (header?.type == 'logical') {
                                        const headersData = { name: header?.title, description: header?.description };
                                        return (
                                            <Grid container item key={index} xs={10.5} justifyContent="center" alignItems="center" sx={{ pt: 2, pb: 3 }}>
                                                <StaticSection
                                                    headerAndActionStep={headersData}
                                                />
                                            </Grid>
                                        )
                                    }
                                    else {
                                        return (
                                            <Grid container item key={index} xs={11} justifyContent="center" alignItems="center" sx={{ pt: 2, pb: 3 }}>
                                                <BodySection
                                                    index={index}
                                                    section={header}
                                                    updateSection={updateHeader}
                                                />
                                            </Grid>
                                        )
                                    }
                                })}
                                <Grid container item xs={10.5} justifyContent={"center"} alignItems="center" sx={{ pb: 3 }}>
                                    <Grid item xs={4} sm={6} md={5} xl={4}>
                                        <Button
                                            fullWidth
                                            disabled={headers[headers.length - 1]?.title == undefined && headers[headers.length - 1]?.description == undefined ||
                                                !headers[headers.length - 1]?.title?.length && !headers[headers.length - 1]?.description?.length
                                            }
                                            variant="outlined"
                                            sx={{
                                                backgroundColor: headers[headers.length - 1]?.title == undefined && headers[headers.length - 1]?.description == undefined ||
                                                    !headers[headers.length - 1]?.title?.length && !headers[headers.length - 1]?.description?.length ? "#F6F5FB" : "#2A2F42",
                                                borderRadius: "1vh", color: "#F0F2FF", textTransform: "initial", fontWeight: "700", '&:hover': { backgroundColor: '#2A2F42' }
                                            }}
                                            onClick={() => { addHeader(getNextOrderValue(headers)) }}
                                        >
                                            <AddIcon className="flex w-[0.99vw] h-[0.98vh] m-0" />
                                            <Typography sx={{ fontWeight: '400' }}>&nbsp;ADD HEADER</Typography>
                                        </Button>
                                    </Grid>
                                </Grid>

                            </Grid>
                        </Grid>
                        <Grid container item xs={12} justifyContent={"center"} alignItems={"center"} sx={{ backgroundColor: "white", mt: "2vh" }}>
                            <Grid container item xs={12} justifyContent={"center"} alignItems={"center"} sx={{ pt: 2, pb: 3 }}>
                                {bodySections?.map((section: any, index: number) => {
                                    return (
                                        <Grid container item key={index} xs={11} justifyContent="center" alignItems="center" sx={{ pt: 2, pb: 3 }}>
                                            <BodySection
                                                index={index}
                                                section={section}
                                                updateSection={updateBoadSection}
                                            />
                                        </Grid>
                                    )
                                })}
                                <Grid container item xs={10.5} justifyContent="center" alignItems={"center"} sx={{ pb: 3 }}>
                                    <Grid item xs={4} sm={7.5} md={6} xl={4}>
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            disabled={
                                                bodySections[bodySections.length - 1]?.title == undefined
                                                && bodySections[bodySections.length - 1]?.description == undefined
                                                || !bodySections[bodySections.length - 1]?.title?.length
                                                && !bodySections[bodySections.length - 1]?.description?.length
                                            }
                                            sx={{
                                                backgroundColor: bodySections[bodySections.length - 1]?.title == undefined && bodySections[bodySections.length - 1]?.description == undefined || !bodySections[bodySections.length - 1]?.title?.length
                                                    && !bodySections[bodySections.length - 1]?.description?.length ? "#F6F5FB" : "#2A2F42",
                                                borderRadius: "1vh", border: "3px solid balck", color: "#F0F2FF", textTransform: "initial", fontWeight: "700", '&:hover': { backgroundColor: '#2A2F42' }
                                            }}
                                            onClick={() => { addBody(getNextOrderValue(bodySections)) }}>
                                            <><AddIcon className="flex w-[0.99vw] h-[0.98vh] m-0" /><Typography sx={{ fontWeight: '400' }}>&nbsp;ADD NEW SECTION</Typography></>
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid container item xs={12} justifyContent={"center"} alignItems={"center"} sx={{ backgroundColor: "white", mt: "2vh" }}>
                            {isLoading ? null
                                :
                                <Grid container item xs={10.5} justifyContent={"center"} alignItems={"center"} sx={{ pt: 2, pb: 3 }}>
                                    {Object.keys(actionStep).length ?
                                        <StaticSection
                                            headerAndActionStep={actionStep} />
                                        :
                                        <Typography variant="h6">Action Step is not created yet.</Typography>
                                    }
                                </Grid>
                            }
                        </Grid>
                        <Grid container item xs={12} justifyContent="center" alignItems="center" sx={{ backgroundColor: "white", mt: "2vh" }}>
                            {footers?.map((footer: any, index: number) => {
                                if (footer?.type == 'logical') {
                                    const footerData = { name: footer?.title, description: footer?.description };
                                    return (
                                        <Grid container item key={index} xs={11} justifyContent="center" alignItems="center" sx={{ pt: 2, pb: 3 }}>
                                            <StaticSection
                                                headerAndActionStep={footerData}
                                            />
                                        </Grid>
                                    )
                                }
                                else {
                                    return (
                                        <Grid container item key={index} xs={11} justifyContent="center" alignItems="center" sx={{ pt: 2, pb: 3 }}>
                                            <BodySection
                                                index={index}
                                                section={footer}
                                                updateSection={updateFooter}
                                            />
                                        </Grid>
                                    )
                                }
                            })}
                            <Grid container item xs={10.5} justifyContent="center" alignItems="center" sx={{ pb: 3 }}>
                                <Grid item xs={4} sm={6} md={5} xl={4}>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        disabled={footers[footers.length - 1]?.description == undefined && footers[footers.length - 1]?.title == undefined || !footers[footers.length - 1]?.title?.length && !footers[footers.length - 1]?.description?.length}
                                        sx={{ backgroundColor: footers[footers.length - 1]?.description == undefined && footers[footers.length - 1]?.title == undefined || !footers[footers.length - 1]?.title?.length && !footers[footers.length - 1]?.description?.length ? "#F6F5FB" : "#2A2F42", borderRadius: "1vh", color: "#F0F2FF", textTransform: "initial", fontWeight: "700", '&:hover': { backgroundColor: '#2A2F42' } }}
                                        onClick={() => { addFooter(getNextOrderValue(footers)) }}>
                                        <AddIcon className="flex w-[0.99vw] h-[0.98vh] m-0" />
                                        <Typography sx={{ fontWeight: '400' }}>&nbsp;ADD FOOTER</Typography>
                                    </Button>
                                </Grid>
                            </Grid>

                        </Grid>
                    </Grid>
                </Grid >
            }
            <ModeratorGuide open={open} handleClose={handleClose} moderatorGuideData={moderatorGuideData} />
            <SnakBarAlert alertOpen={alertOpen} setAlertOpen={setAlertOpen} alertSeverity={alertSeverity} alert={alert} />
            <BackDropLoading isLoading={isLoading} />
        </>
    )
}
