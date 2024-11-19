'use client'

import { useCallback, useEffect, useState } from "react";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Accordion, AccordionDetails, AccordionSummary, Button, Checkbox, CircularProgress, Grid, Radio, Tooltip, Typography } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { TextareaAutosize as BaseTextareaAutosize } from '@mui/base/TextareaAutosize';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SnakBarAlert from "../../snakbaralert/snakbaralert";
import PopperComponent from "../PopperComponent";
import { setDiscardBtnDisable, setIsPageLoading, setSaveBtnLoader, setYesBtnLoading } from "@/redux/reducers/editCourse/addLessonSlice";
import BackDropLoading from "@/components/loading/backDropLoading";
import SelectOptionComponent from "./selectOptionComponent";

interface Choice {
    orderNo: string;
    value: string;
    text: string;
    set_correct: boolean;
}

interface ForumPrepData {
    name: string,
    title: string,
    elements: {
        name?: string,
        title: string,
        type?: string,
        isRequired?: boolean,
        choices?: Choice[],
        correctAnswer?: string,
        choicesOrder?: string
    }[];
}

export default function ForumPrep({ lessonName, setAddLessonToggle, assetInfo, handleFileUpload, enableDisableTheLessonAPI, draftInfo, deleteLesson, updateLesson }: any) {
    const [forumPrepData, setForumPrepData] = useState<any>({ Name: "", Question: "" });
    const [allPrepData, setAllPrepData] = useState<ForumPrepData>({ name: forumPrepData?.Name, title: '', elements: [] });
    const [errors, setErrors] = useState({ Name: '', Question: "" });
    const [discardChangesLoader, setDiscardChangeLoader] = useState<boolean>(false);
    const [textAreaFocus, setTextAreaFocus] = useState<boolean>(false);
    const [alert, setAlert] = useState("");
    const [alertSeverity, setAlertSeverity] = useState<boolean>(false);
    const [alertOpen, setAlertOpen] = useState<boolean>(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [afterFilterRearrangeElementsToggle, setAfterFilterRearrangeElementsToggle] = useState(false);
    const requestBody: {
        name: string;
        chapter_uuid?: string;
        asset_type?: string;
        asset_uuid?: string,
        is_preview: boolean;
        is_prerequisite: boolean;
        is_discussion_enabled: boolean;
        is_downloadable: boolean;
        asset_content_size?: number
    } = {
        name: allPrepData?.name,
        is_preview: false,
        is_prerequisite: false,
        is_discussion_enabled: false,
        is_downloadable: false,
        asset_content_size: 0
    };

    //GET VALUE FROM REDUX
    const saveLoader = useSelector((state: any) => state.editCourse.saveBtnLoader);
    const chapter_uuid = useSelector((state: any) => state.editCourse.chapterId);
    const discard: boolean = useSelector((state: any) => state.editCourse.discardBtnDisable);
    const userRoleAction = useSelector((state: any) => state.editCourse.editCourseAction);
    const isPageLoading = useSelector((state: any) => state.editCourse.isPageLoading);

    const dispatch = useDispatch();
    const popperOpen = Boolean(anchorEl);
    const id = popperOpen ? 'simple-popper' : undefined;

    //OPEN POPPER COMPONENT
    const handleClick = (event: any) => {
        setAnchorEl(anchorEl ? null : event.currentTarget);
    };

    const handleChange = (e: any) => {
        setTextAreaFocus(true);
        setIsFocused(true);
        const { name, value } = e.target;
        let maxLength = 250;
        let truncatedValue = value.length > (maxLength - 1) ? value.slice(0, maxLength) : value;
        setForumPrepData({ ...forumPrepData, [name]: truncatedValue });
        setAllPrepData({ ...allPrepData, name: truncatedValue, title: truncatedValue });
        let error = '';
        if (value.length > maxLength) {
            error = `Title must be ${maxLength} characters or less`;
        }
        setErrors({ ...errors, [name]: error });
    };

    const handleBlur = (e: any) => {
        const { name, value } = e.target;
        let error = '';
        error = value.trim() === '' ? `Title is required` : '';
        setErrors({ ...errors, [name]: error });
    };

    //ADD QUESTION
    const addQuestion = () => {
        setIsFocused(true);
        setAllPrepData((prevData) => ({
            ...prevData,
            elements: [
                ...prevData.elements,
                { name: "", title: "", type: "comment", maxLength: 1000, isRequired: true }
            ],
        }));
    };

    //UPDATE FLAGS IN QUESTION
    const updateQuestion = (index: number, questionName?: string, value?: string, field?: any, choices?: any[], correctAnswer?: string) => {
        setIsFocused(true);
        const newQuestion = [...allPrepData.elements];
        const updatedQuestion: any = {
            ...newQuestion[index],
            ...(questionName !== undefined && { name: questionName }),
            ...(value !== undefined && { title: value }),
            ...(field !== undefined && { type: field })
        };

        if (field === 'radiogroup' && choices !== undefined && choices.length > 0) {
            updatedQuestion.choices = choices;
            delete updatedQuestion?.maxLength;
        }

        if (field === 'comment') {
            delete updatedQuestion?.choices;
            delete updatedQuestion?.choicesOrder;
            delete updatedQuestion?.correctAnswer;
        }

        if (field === 'radiogroup' && correctAnswer !== undefined) {
            updatedQuestion.correctAnswer = correctAnswer;
        }

        newQuestion[index] = updatedQuestion;
        setAllPrepData({ ...allPrepData, elements: newQuestion });
    };

    //DELETE QUESTION
    const handleDeleteQuestion = (i: number) => {
        setIsFocused(true);
        setAfterFilterRearrangeElementsToggle(!afterFilterRearrangeElementsToggle);
        const filterAllPrepData = allPrepData.elements.filter((item, index) => index !== i);
        setAllPrepData({ ...allPrepData, elements: filterAllPrepData });
    }

    //SAVE BUTTON CLICK FUNCTION FOR API CALL
    function handleForumPrepFileCreateUpdateAndDelete(assetType: string) {
        requestBody.asset_content_size = allPrepData?.elements?.length;
        if (assetInfo) {
            requestBody.asset_type = assetType;
            requestBody.asset_uuid = assetInfo?.uuid;
            if (Object?.keys(allPrepData)?.length && requestBody) {
                updateLesson(allPrepData, requestBody);
            }
            else {
                AlertManager("Kindly fill all fields", true);
            }
        }
        else {
            if (Object?.keys(allPrepData)?.length && requestBody) {
                requestBody.chapter_uuid = chapter_uuid;
                requestBody.asset_type = assetType;
                handleFileUpload(allPrepData, requestBody);
            }
            else {
                AlertManager("Kindly fill all fields", true);
            }
        }
    }

    const handleEnableDisableCheck = (e: any) => {
        enableDisableTheLessonAPI(!e.target.checked);
    }

    function AlertManager(message: string, severity: boolean) {
        setAlert(message);
        setAlertSeverity(severity);
        setAlertOpen(true);
        dispatch(setYesBtnLoading(false));
        dispatch(setSaveBtnLoader(false));
        dispatch(setIsPageLoading(false));
        dispatch(setDiscardBtnDisable(false));
    }

    console.log("all", allPrepData)

    //VIEW API RESPONSE STORE IN STATE
    useEffect(() => {
        if (assetInfo) {
            const data = assetInfo?.forum_prep_info ? JSON.parse(assetInfo.forum_prep_info) : assetInfo.survey_data;
            setAllPrepData({ ...allPrepData, name: data?.name, title: data?.title, elements: data?.elements });
        }
    }, [assetInfo])

    return (
        <>
            {userRoleAction[1].read &&
                <Grid container item xs={11} direction='column' justifyContent={'center'} alignItems={'center'} >
                    <Grid container item xs={12}>
                        <Grid container item xs={12} justifyContent={"space-between"} alignItems={"center"} sx={{ backgroundColor: "transperant" }}>
                            <Grid item xs={10} xl={10.9} justifyContent={"flex-start"} >
                                <Button variant='contained'
                                    sx={{ backgroundColor: "#2A2F42", cursor: "auto", borderRadius: "5vh", border: "3px solid balck", m: 0, p: 0, px: 1, color: "#F0F2FF", textTransform: "initial", fontWeight: "700", '&:hover': { backgroundColor: '#2A2F42' } }}
                                >
                                    {lessonName}</Button>
                            </Grid>
                            <Grid item xs={1.8} sm={1.8} md={1.6} lg={1.2} xl={1} justifyContent={"flex-end"} alignItems={'center'} sx={{ backgroundColor: "transperant", mb: "1.5vh" }} >
                                {assetInfo ?
                                    userRoleAction[0].update &&
                                    <Tooltip title={!draftInfo ? "Publish this lesson" : " Make this lesson draft"} placement="top">
                                        <div style={{ display: "inline-flex", alignItems: 'center', justifyContent: "flex-end" }} >
                                            <Typography >Draft</Typography>
                                            <Checkbox
                                                checked={!draftInfo}
                                                sx={{ p: 0, m: 0 }}
                                                onClick={handleEnableDisableCheck}
                                            />
                                        </div>
                                    </Tooltip>
                                    : null
                                }
                            </Grid>
                        </Grid>
                        <Grid container item xs={12} direction='row' sx={{ mb: "1vh" }}>
                            <Grid container item xs={assetInfo ? 4 : 7} sm={assetInfo ? 4 : 6} md={assetInfo ? 4.5 : 6.5} lg={assetInfo ? 6.5 : 7.5} xl={assetInfo ? 7 : 8} alignItems={'center'}>
                                <Typography variant="body1" fontWeight={"600"}>{assetInfo ? `Edit ${lessonName}` : `New ${lessonName}` }</Typography>
                            </Grid>
                            <Grid container item xs={assetInfo ? 8 : 5} sm={assetInfo ? 8 : 6} md={assetInfo ? 7.5 : 5.5} lg={assetInfo ? 5.5 : 4.5} xl={assetInfo ? 5 : 4} justifyContent={"space-between"} alignItems={'center'} >
                                <Grid container item xs={12} justifyContent={"space-between"} alignItems={'center'} sx={{ display: 'flex', flexDirection: "row" }} >
                                    {assetInfo ?
                                        <Grid item xs={1} justifyContent={"flex-end"} alignItems={'center'} >
                                            {userRoleAction[0].update &&
                                                <Tooltip title="Delete this lesson" placement="top">
                                                    <DeleteIcon aria-describedby={id} onClick={handleClick} sx={{ fontSize: "30px", color: "#cf0c0c", cursor: "pointer" }} />
                                                </Tooltip>
                                            }
                                        </Grid>
                                        : null
                                    }
                                    <Grid item xs={assetInfo ? 4 : 7} sm={assetInfo ? 6.9 : 8} md={assetInfo ? 6.5 : 8} lg={assetInfo ? 6.5 : 8} xl={assetInfo ? 6 : 7} justifyContent={"flex-end"} alignItems={'center'} >
                                        <Button variant='outlined' fullWidth
                                            disabled={discard}
                                            sx={{ backgroundColor: "white", height: "4vh", borderRadius: "1vh", border: "1px solid #2A2F42", px: 1, py: 0.5, m: 0, color: "black", textTransform: "initial", fontWeight: "600", }}
                                            onClick={() => { setDiscardChangeLoader(true); setAddLessonToggle(false) }}>
                                            {discardChangesLoader ? <CircularProgress sx={{ color: "white" }} size={20} /> : " Discard Changes"}
                                        </Button>
                                    </Grid>
                                    <Grid item xs={assetInfo ? 3 : 4} sm={assetInfo ? 2.5 : 3} md={assetInfo ? 3.5 : 3} xl={assetInfo ? 4 : 4} justifyContent={"flex-end"} alignItems={'center'}>
                                        {userRoleAction[0].update &&
                                            <Button variant='contained' fullWidth
                                                disabled={assetInfo ?
                                                    (!allPrepData?.name || allPrepData?.elements?.length > 0 &&
                                                        !allPrepData?.elements[allPrepData?.elements?.length - 1]?.title?.length) ||
                                                    (allPrepData?.elements[allPrepData?.elements?.length - 1]?.type === 'radiogroup' && (!allPrepData?.elements[allPrepData?.elements?.length - 1]?.choices?.[0]?.text?.length)) ||
                                                    (allPrepData?.elements[allPrepData?.elements?.length - 1]?.type === 'radiogroup' && (allPrepData?.elements[allPrepData?.elements?.length - 1]?.choices?.length! < 2)) ||
                                                    (allPrepData?.elements[allPrepData?.elements?.length - 1]?.type === 'radiogroup' && !allPrepData?.elements[allPrepData?.elements?.length - 1]?.correctAnswer?.length && lessonName !== 'Survey')
                                                    :
                                                    !allPrepData?.name ||
                                                    !Object.keys(allPrepData?.elements)?.length ||
                                                    !allPrepData?.elements[allPrepData?.elements?.length - 1]?.title?.length ||
                                                    (allPrepData?.elements[allPrepData?.elements?.length - 1]?.type === 'radiogroup' && (!allPrepData?.elements[allPrepData?.elements?.length - 1]?.choices?.[0]?.text?.length)) ||
                                                    (allPrepData?.elements[allPrepData?.elements?.length - 1]?.type === 'radiogroup' && (allPrepData?.elements[allPrepData?.elements?.length - 1]?.choices?.length! < 2)) ||
                                                    (allPrepData?.elements[allPrepData?.elements?.length - 1]?.type === 'radiogroup' && !allPrepData?.elements[allPrepData?.elements?.length - 1]?.correctAnswer?.length) && lessonName !== 'Survey'}
                                                sx={{ backgroundColor: "#2A2F42", height: "4vh", borderRadius: "1vh", border: "3px solid balck", m: 0, p: 0.5, color: "#F0F2FF", textTransform: "initial", fontWeight: "600", '&:hover': { backgroundColor: '#2A2F42' } }}
                                                onClick={() => handleForumPrepFileCreateUpdateAndDelete(lessonName === "Survey" ? "survey" : "forum_prep")}
                                            >
                                                {saveLoader ? <CircularProgress sx={{ color: "white" }} size={20} /> : "SAVE"}
                                            </Button>
                                        }
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid container item xs={12} justifyContent={"center"} alignItems={"center"} sx={{ backgroundColor: "white" }}>
                            <Grid container item xs={11} justifyContent={"center"} alignItems={"center"} sx={{ pt: 2, pb: 3 }}>
                                <Grid item xs={12} sx={{ color: "#777", m: "1vh" }}>
                                    <Typography variant="caption">TITLE</Typography>
                                    <BaseTextareaAutosize
                                        name='Name'
                                        maxLength={251}
                                        maxRows={4}
                                        minRows={1}
                                        placeholder={`Enter a ${lessonName.toLowerCase()} title`}
                                        value={allPrepData?.name}
                                        onChange={handleChange}
                                        style={{
                                            width: "100%", border: errors?.Name?.length ? "2px solid #cf0c0c" : textAreaFocus ? "2px solid #3182ce" : "1px solid #dedede", borderRadius: "1vh",
                                            padding: "8px", outline: "none", resize: 'none', maxHeight: "198px", color: "black"
                                        }}
                                        onFocus={(e) => {
                                            setTextAreaFocus(true);
                                        }}
                                        onBlur={(e) => {
                                            handleBlur(e);
                                            setTextAreaFocus(false);
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && e.shiftKey === false) {
                                                e.preventDefault();
                                            }
                                        }}
                                    />
                                    <Typography variant="caption" sx={{ color: "#cf0c0c", ml: "2vh", fontWeight: "500" }}>{errors.Name}</Typography>
                                    <Typography variant="caption" sx={{ textAlign: 'right', display: 'block', marginTop: '4px' }}>
                                        {allPrepData?.name?.length} / 250
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Grid>
                        {allPrepData?.elements?.map((question: any, index: number) => {
                            return (
                                <React.Fragment key={index}>
                                    <Grid item xs={11.3} justifyContent={"center"} alignItems={"center"} sx={{ pt: 2, pb: 3, backgroundColor: "transperant" }}>
                                        <Grid item xs={12} sx={{ color: "#777", }}>
                                            <Question
                                                lessonName={lessonName}
                                                index={index}
                                                forumPrepData={forumPrepData}
                                                setForumPrepData={setForumPrepData}
                                                setIsFocused={setIsFocused}
                                                errors={errors}
                                                question={question}
                                                setAddLessonToggle={setAddLessonToggle}
                                                updateQuestion={updateQuestion}
                                                assetInfo={assetInfo}
                                                setAfterFilterRearrangeElementsToggle={setAfterFilterRearrangeElementsToggle}
                                                afterFilterRearrangeElementsToggle={afterFilterRearrangeElementsToggle}
                                            />
                                        </Grid>
                                    </Grid>
                                    <Grid item xs={0.7} justifyContent={"flex-start"} alignItems={"center"} sx={{ pt: 2, pb: 3, pl: 1, backgroundColor: "transperant" }}>
                                        <DeleteIcon
                                            fontSize="small"
                                            onClick={() => handleDeleteQuestion(index)}
                                            sx={{ color: "#cf0c0c", cursor: "pointer" }} />
                                    </Grid>
                                </React.Fragment>
                            )
                        })
                        }
                        <Grid item xs={12} sx={{ color: "#777", mt: "2vh" }}>
                            <Button
                                fullWidth
                                variant="outlined"
                                disabled={
                                    (allPrepData?.elements?.length > 0 &&
                                        !allPrepData?.elements[allPrepData?.elements?.length - 1]?.title?.length) ||
                                    (allPrepData?.elements[allPrepData?.elements?.length - 1]?.type === 'radiogroup' && !allPrepData?.elements[allPrepData?.elements?.length - 1]?.correctAnswer?.length && lessonName !== 'Survey')
                                }
                                sx={{
                                    backgroundColor:
                                        (allPrepData?.elements?.length > 0 && !allPrepData.elements[allPrepData.elements.length - 1]?.title?.length)
                                            ||
                                            (allPrepData?.elements[allPrepData?.elements?.length - 1]?.type === 'radiogroup' && !allPrepData?.elements[allPrepData?.elements?.length - 1]?.correctAnswer?.length && lessonName !== 'Survey') ? "white" : "#2A2F42",
                                    borderRadius: "1vh", color: "#F0F2FF", textTransform: "initial", fontWeight: "700", '&:hover': { backgroundColor: '#2A2F42' }
                                }}
                                onClick={addQuestion}
                            >
                                <AddIcon className="flex w-[0.99vw] h-[0.98vh] m-0" />
                                <Typography sx={{ fontWeight: '400' }}>&nbsp;ADD QUESTION</Typography>
                            </Button>
                        </Grid>
                    </Grid>
                </Grid >
            }
            <PopperComponent
                id={id}
                open={popperOpen}
                anchorEl={anchorEl}
                setAnchorEl={setAnchorEl}
                publishCourseAPI={deleteLesson}
                option={lessonName === "Survey" ? "Survey" : "Forum Prep"}
            />
            <SnakBarAlert alertOpen={alertOpen} setAlertOpen={setAlertOpen} alertSeverity={alertSeverity} alert={alert} />
            <BackDropLoading isLoading={isPageLoading} />
        </>
    )
}

const Question = ({
    index,
    setForumPrepData,
    setIsFocused,
    forumPrepData,
    updateQuestion,
    question,
    lessonName,
    assetInfo,
    afterFilterRearrangeElementsToggle,
    setAfterFilterRearrangeElementsToggle
}: any) => {
    const [errors, setErrors] = useState({ Question: "" });
    const [choices, setChoices] = useState<any>([]);
    // const [assetChoicesLength, setAssetChoicesLength] = useState<number>(0);
    const [selectedQuestionType, setSelectedQuestionType] = useState<string | null>();
    const [expanded, setExpanded] = useState<{ [key: number]: boolean }>({});
    const [textAreaFocus, setTextAreaFocus] = useState<boolean>(false);

    const handleChange = (e: any) => {
        setIsFocused(true);
        setTextAreaFocus(true);
        const { name, value } = e.target;
        let maxLength = 250;
        let truncatedValue = value.length > (maxLength - 1) ? value.slice(0, maxLength) : value;
        let questionName = truncatedValue.toLowerCase().replace(/ /g, '_') + Date.now();
        updateQuestion(index, questionName, truncatedValue);
        setForumPrepData({ ...forumPrepData, [name]: truncatedValue });
        let error = '';
        if (value.length > maxLength) {
            error = `${name} must be ${maxLength} characters or less`;
        }
        setErrors({ ...errors, [name]: error });
    };

    const handleBlur = (e: any) => {
        const { name, value } = e.target;
        let error = '';
        const formattedName = name.replace(/_/g, ' ').replace(/\b\w/g, (char: any) => char.toUpperCase());
        error = value.trim() === '' ? `${formattedName} is required` : '';
        setErrors({ ...errors, [name]: error });
    };

    const qusetionsType = [
        {
            name: "Text",
            component: <TextComponent />
        },
        {
            name: "MCQ",
            component: <SelectOptionComponent
                lessonName={lessonName}
                choices={choices}
                setChoices={setChoices}
                updateQuestion={updateQuestion}
                question={question}
                setIsFocused={setIsFocused} />
        },
    ];


    //HANDLE QUESTION TYPES
    const handleTypeQuestion = (typeName: string, checked: boolean) => {
        setIsFocused(true);
        if (checked) {
            setSelectedQuestionType(typeName);
            typeName == 'Text' ?
                updateQuestion(index, undefined, undefined, "comment") :
                updateQuestion(index, undefined, undefined, "radiogroup", choices);
        } else {
            setSelectedQuestionType(null);
        }
    };

    //DURING DELETE TIME ACCORDION OPEN STATUS
    const handleAccordionToggle = (panel: string) => (event: React.ChangeEvent<{}>, isExpanded: boolean) => {
        setExpanded((prevState) => ({ ...prevState, [panel]: isExpanded }));
    };

    // FIND THE COMPONENT ACCORDING TO TYPE CLICK
    const matchingComponent = qusetionsType.find(type => type.name === selectedQuestionType);

    //INITIAL LOAD QUETION TYPE SELECTION
    useEffect(() => {
        question?.type == 'comment' ? setSelectedQuestionType('Text') : setSelectedQuestionType('MCQ'); setChoices(question?.choices);
    }, [afterFilterRearrangeElementsToggle]);

    return (
        <div key={index}>
            <Accordion
                expanded={expanded[index] || false}
                onChange={handleAccordionToggle(index)}
                sx={{ boderRadius: "2vh", backgroundColor: "tranperant" }} >
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1-content"
                    id="panel1-header"
                >
                    <Grid container direction="row" justifyContent={"flex-start"} alignItems={"center"}>
                        <Grid container item sm={4} lg={6.5} xl={7.5} justifyContent={"flex-start"} alignItems={"center"} sx={{ backgroundColor: "transperant" }}>
                            <Tooltip title={question?.title?.length > 40 ? question?.title : ""} placement="top">
                                <Typography variant="body1" sx={{ color: question?.title?.length == 0 ? "#989898" : "black", fontWeight: "600", pl: "3vh", wordWrap: 'break-word', whiteSpace: 'normal', overflowWrap: 'break-word', width: "100%", minHeight: "1vh" }}>
                                    {question?.title?.length == 0 ? "Question" : question?.title?.length > 40 ? `${question?.title.slice(0, 35)}...` : question?.title}
                                </Typography>
                            </Tooltip>
                        </Grid>
                        <Grid container item sm={8} lg={5.5} xl={4.5} justifyContent={"flex-end"}>
                            <Typography variant="subtitle2" sx={{ color: "#777", fontWeight: "600", mr: "0.5vh" }}>
                                Type - {selectedQuestionType === 'Text'
                                    ? "comment"
                                    : `select option (${choices?.length ?? 0} options)`
                                }
                            </Typography>                       </Grid>
                    </Grid>
                </AccordionSummary>
                <AccordionDetails sx={{ borderTop: "1px solid #dedede" }}>
                    <Grid container alignItems={"center"}>
                        <Grid item xs={11.8} sx={{ color: "#777", pl: "3vh" }}>
                            <Typography variant="caption" sx={{ fontWeight: "600" }}>QUESTION</Typography>
                            <BaseTextareaAutosize
                                name='Question'
                                maxLength={251}
                                maxRows={4}
                                minRows={1}
                                placeholder="Enter a question"
                                value={question?.title}
                                onChange={handleChange}
                                style={{
                                    width: "100%", border: errors?.Question?.length ? "2px solid #cf0c0c" : textAreaFocus ? "2px solid #3182ce" : "1px solid #dedede", borderRadius: "1vh",
                                    padding: "8px", outline: "none", resize: 'none', maxHeight: "198px", color: "black"
                                }}
                                onFocus={(e) => {
                                    setTextAreaFocus(true);
                                }}
                                onBlur={(e) => {
                                    handleBlur(e);
                                    setTextAreaFocus(false);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && e.shiftKey === false) {
                                        e.preventDefault();
                                    }
                                }}
                            />
                            <Typography variant="caption" sx={{ color: "#cf0c0c", ml: "2vh", fontWeight: "500" }}>{errors.Question}</Typography>
                            <Typography variant="caption" sx={{ textAlign: 'right', display: 'block', marginTop: '4px' }}>
                                {question?.title?.length} / 250
                            </Typography>
                        </Grid>
                    </Grid>
                    <Grid container direction="row" alignItems={"center"} sx={{ pl: "3vh" }}>
                        <Typography variant="caption" sx={{ color: "#777", fontWeight: "600" }}>TYPE OF ANSWER</Typography>
                        {qusetionsType.map((type: any, i: number) => {
                            return (
                                <>
                                    <Radio
                                        key={`${index + 1}${i + 1}`}
                                        checked={selectedQuestionType === type.name}
                                        sx={{ m: 0, p: 0, ml: "1vh" }}
                                        onClick={(e: any) => { const { checked } = e.target; handleTypeQuestion(type.name, checked) }} /><Typography variant="body1" sx={{ color: "black", m: 0, p: 0 }} >{type.name}</Typography>
                                </>
                            )
                        })}
                    </Grid>
                    {matchingComponent ? React.cloneElement(matchingComponent.component, { setChoices: setChoices, QIndex: { index } }) : null}
                </AccordionDetails>
            </Accordion>
        </div>
    )
}

const TextComponent = () => (
    <div></div>
);
