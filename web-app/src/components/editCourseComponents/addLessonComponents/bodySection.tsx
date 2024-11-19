'use client'

import { useEffect, useState } from "react";
import { Button, Checkbox, Grid, TextField, Typography } from "@mui/material";
import { TextareaAutosize as BaseTextareaAutosize } from '@mui/base/TextareaAutosize';
import React from 'react';
import { EditorState } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { convertToRaw, ContentState } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';


export default function BodySection({ index, section, updateSection }: any) {

    const [deleteIndication, setDeleteIndication] = useState<number | null>(null);
    const [debounceTimeout, setDebounceTimeout] = useState<number | undefined>(undefined);
    const [isDeleted, setIsDeleted] = useState<boolean>(true);
    const [errors, setErrors] = useState<any>({

        Title: "",
        Description: "",
        duration: "",
        order: "",
        duration_per_person: "",
        link: "",
    });
    const [editorStateHTML, setEditorStateHTML] = useState<string>("");
    const [editorState, setEditorState] = useState<EditorState>(() => {
        if (section?.description) {
            const contentBlock = htmlToDraft(section?.description);
            if (contentBlock) {
                const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
                return EditorState.createWithContent(contentState);
            }
        }
        return EditorState.createEmpty();
    });
    const [editorContentLength, setEditorContentLength] = useState<number>(section?.description?.length || 0);
    const [contentLength, setContentLength] = useState<number>(0);

    useEffect(() => {
        if (section?.description) {
            const contentBlock = htmlToDraft(section?.description);
            if (contentBlock) {
                const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
                const newEditorState = EditorState.createWithContent(contentState);
                if (newEditorState.getCurrentContent().getPlainText() !== editorState.getCurrentContent().getPlainText()) {
                    setEditorState(newEditorState);
                }
            }
        }
    }, [section?.description]);
     

    const onEditorStateChange = (newState: EditorState) => {
        const contentState = newState.getCurrentContent();
        const plainText = contentState.getPlainText('');
        const length = plainText.length;
        setContentLength(length);
        const characterLimit = 1500;
        if (length <= characterLimit) {
            setEditorContentLength(length);
            // Update editor state and other related states
            setEditorState(newState);
            // Convert editor content to HTML and update state
            const contentHTML = draftToHtml(convertToRaw(contentState));
            setEditorStateHTML(contentHTML);
            updateSection(index, "description", contentHTML);
            
        } else {
            setErrors((prevErrors: any) => ({
                ...prevErrors,
                Description: "Description must be 2500 characters or less"
            }));
        }
    };


    console.log(editorStateHTML);

    const isValidURL = (url: string): boolean => {
        const regex = /^(https?:\/\/)?((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|\d{1,3}(\.\d{1,3}){3}|\[([a-f\d]{0,4}:){7}[a-f\d]{0,4}\])(:\d+)?(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(#[-a-z\d_]*)?$/i;
        return regex.test(url);
    };

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        let maxLength = name === "Title" ? 250 : 2500;
        let truncatedValue = value.length > maxLength ? value.slice(0, maxLength) : value;
        let error = '';
        if (name === 'link' && value.length > 0) {
            if (debounceTimeout) clearTimeout(debounceTimeout);
            const timeout = setTimeout(() => {
                if (!isValidURL(truncatedValue)) {
                    error = 'Invalid URL';
                }
                setErrors((prevErrors: any) => ({ ...prevErrors, [name]: error }));
            }, 2000);
            setDebounceTimeout(timeout as unknown as number);
        }
        updateSection(index, name.toLowerCase(), truncatedValue);
        setErrors({ ...errors, [name]: error });
    };

    const handleBlur = (e: any) => {
        const { name, value } = e.target;
        let error = '';
        if (name == 'duration') {
            error = value.trim() === '' ? "Duration is required" : "";
        } else if (name == 'duration_per_person') {
            error = value.trim() === '' ? "Minutes is required" : "";
        } else {
            error = value.trim() === '' ? `Title or Description is required` : '';
        }
        setErrors({ ...errors, [name]: error });
    };

    //CHECKBOX HANDLE FOR REPEATABLE OPTION
    const handleCheckboxChange = (e: any) => {
        const { checked } = e.target;
        const value = checked ? 'repeatable' : 'once';
        updateSection(index, 'type', value);
    };

    //DELETE SECTION
    const handleDeleteSectionChange = (index: number) => {
        setIsDeleted(!isDeleted);
        if (isDeleted) {
            setDeleteIndication(index);
            updateSection(index, 'is_deleted', true);
        } else {
            updateSection(index, 'is_deleted', false);
        }
    };

    return (
        <Grid container item xs={12} justifyContent={"center"} alignItems={"center"} sx={{ backgroundColor: index == deleteIndication && !isDeleted ? "#FFCDD2" : null, borderBottom: "2px solid #D8D8D8", pb: "2vh", mt: "3vh", }} >
            <Grid container item xs={11.5} justifyContent={"center"} alignItems={"center"}>
                <Grid container item xs={12} direction="row" justifyContent={"space-between"} alignItems={"flex-start"} sx={{ mb: "1vh", minHeight: "12vh" }}>
                    <Grid item xs={1.5}  >
                        <Typography variant="caption" sx={{ textTransform: "uppercase" }}>ORDER</Typography>
                        <TextField
                            fullWidth
                            placeholder="Order No"
                            name="order"
                            type="number"
                            size="small"
                            value={section?.order}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={!!errors.order}
                            helperText={errors.order}
                            InputProps={{
                                sx: { borderRadius: "1vh", color: "#2A2F42", maxLength: 51 },
                                inputProps: {
                                    min: 0
                                }
                            }}
                        />
                    </Grid>

                    <Grid item xs={3}>
                        <Typography variant="caption" sx={{ textTransform: "uppercase" }}>Duration IN MINS</Typography>
                        <TextField
                            fullWidth
                            placeholder="Enter minutes"
                            name="duration"
                            type="number"
                            size="small"
                            value={section?.duration}
                            onChange={handleChange}
                            error={!!errors.duration}
                            helperText={errors.duration}
                            InputProps={{
                                sx: { borderRadius: "1vh", color: "#2A2F42", maxLength: 51 },
                                inputProps: {
                                    min: 1
                                }
                            }}
                        />
                    </Grid>
                    <Grid item xs={4} >
                        <Typography variant="caption" sx={{ textTransform: "uppercase" }}>Reference Link</Typography>
                        <TextField
                            fullWidth
                            placeholder="Enter a reference link"
                            name="link"
                            type="text"
                            size="small"
                            value={section?.link}
                            onChange={handleChange}
                            error={!!errors.link}
                            helperText={errors.link}
                            InputProps={{ sx: { borderRadius: "1vh", color: "#2A2F42", maxLength: 51 } }}
                        />
                    </Grid>
                    <Grid item xs={3}>
                        <Typography variant="caption" sx={{ textTransform: "uppercase", fontSize: '0.75rem', whiteSpace: 'nowrap' }}>mins per person</Typography>
                        <TextField
                            fullWidth
                            placeholder="Enter minutes"
                            name="duration_per_person"
                            type="number"
                            size="small"
                            value={section?.duration_per_person}
                            onChange={handleChange}
                            error={!!errors.duration_per_person}
                            helperText={errors.duration_per_person}
                            InputProps={{
                                sx: { borderRadius: "1vh", color: "#2A2F42" },
                                inputProps: {
                                    min: 1
                                }
                            }}
                        />
                    </Grid>
                </Grid>
                <Grid container item xs={12} justifyContent={"center"} alignItems={"center"} >
                    <Grid container item xs={12} sx={{ color: "#777" }}>
                        <Typography variant="caption" sx={{ textTransform: "uppercase" }}>Title</Typography>
                        <BaseTextareaAutosize
                            name="Title"
                            maxLength={251}
                            maxRows={4}
                            minRows={1}
                            placeholder={"Enter a section title"}
                            value={section?.title}
                            onChange={handleChange}
                            style={{
                                width: "100%", backgroundColor: index == deleteIndication && !isDeleted ? "#FFCDD2" : "white",
                                border: errors?.Title?.length ? "2px solid #cf0c0c" : section?.title?.length == 251 ? "2px solid #cf0c0c" : "1px solid #dedede", borderRadius: "1vh",
                                padding: "8px", outline: "none", resize: 'none', maxHeight: "198px", color: "black"
                            }}
                            onFocus={(e) => {
                                e.target.style.border = "2px solid #3182ce"
                            }}
                            onBlur={(e) => {
                                handleBlur(e);
                                section?.title?.length ? null : e.target.style.borderColor = "#cf0c0c"
                            }}
                            onMouseLeave={(e) => {
                                const target = e.target as HTMLTextAreaElement;
                                target.style.border = section?.title?.length == 251 ? "2px solid #cf0c0c" : "1px solid #e5e7eb"
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && e.shiftKey === false) {
                                    e.preventDefault();
                                }
                            }}
                        />
                        <Grid container item xs={12} direction="row">
                            <Grid item xs={6}>
                                <Typography variant="caption" sx={{ color: "#cf0c0c", ml: "2vh", fontWeight: "500" }}>{section?.title?.length == 251 ? "Title must be 250 characters or less" : errors?.Title}</Typography>
                            </Grid>
                            <Grid item xs={6} justifyContent={"flex-end"} alignItems={"center"}>
                                <Typography variant="caption" sx={{ textAlign: "right", display: "block", marginTop: '4px' }}>
                                    {section?.title?.length || 0} / 250
                                </Typography>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid container item xs={12} sx={{ color: "#777" }}>
                        <div className="border border-gray-300 p-4 rounded-md" style={{ maxWidth: "1000px", overflow: 'hidden' }}>
                            <Editor
                                editorState={editorState}
                                toolbarClassName="border border-gray-300 rounded-md bg-gray-100"
                                editorClassName="min-h-[200px] max-h-[200px] p-2 border border-gray-300 rounded-md bg-white overflow-auto"
                                onEditorStateChange={onEditorStateChange}
                            />
                            <Grid container item xs={12} direction="row">
                                <Grid item xs={6}>
                                    <Typography variant="caption" sx={{ color: "#cf0c0c", ml: "2vh", fontWeight: "500" }}>{contentLength > 1500 ? "Description must be 1500 characters or less" : null}</Typography>
                                </Grid>
                                <Grid item xs={6} justifyContent={"flex-end"} alignItems={"center"}>
                                    <Typography variant="caption" sx={{ textAlign: "right", display: "block", marginTop: '4px' }}>
                                        {editorContentLength} /1500
                                    </Typography>
                                </Grid>
                            </Grid>

                        </div>
                    </Grid>
                    <Grid container item xs={12} justifyContent={"space-between"} alignItems={"center"}>
                        <Grid container item sm={6.5} md={7.2} lg={4.5} xl={4} sx={{ backgroundColor: "transperant" }}>
                            <Grid item sm={12} md={11} lg={12} alignItems={"center"}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    sx={{
                                        backgroundColor: index == deleteIndication && !isDeleted ? "white" : "#cf0c0c", borderRadius: "1vh",
                                        color: index == deleteIndication && !isDeleted ? "#cf0c0c" : "#F0F2FF", textTransform: "initial", fontWeight: "700",
                                        '&:hover': { backgroundColor: index == deleteIndication && !isDeleted ? "white" : "#cf0c0c" }
                                    }}
                                    onClick={() => handleDeleteSectionChange(index)}
                                >
                                    <Typography sx={{ fontWeight: '400' }}>{!isDeleted ? "UNDO DELETION" : "DELETE THIS SECTION"}</Typography>
                                </Button>
                            </Grid>
                        </Grid>
                        <Grid item sm={5.3} md={4.8} lg={4} xl={3.1} justifyContent={"flex-end"} alignItems={"center"} sx={{ backgroundColor: "transperant" }}>
                            <Checkbox
                                key={index}
                                sx={{ m: 0, p: 0 }}
                                checked={section?.type == 'repeatable' ? true : false}
                                onClick={handleCheckboxChange} />
                            <Typography variant="caption" sx={{ ml: "3px", textAlign: "end" }}>REPEAT ON ALL GUIDES</Typography>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    )
}