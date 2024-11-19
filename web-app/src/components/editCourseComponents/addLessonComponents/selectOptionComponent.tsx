
'use client'

import React, { useEffect, useState } from 'react';
import { Typography, Avatar, TextField, Button, Grid, Box, Radio } from '@mui/material';
import { Add as AddIcon, CloseOutlined as CloseOutlinedIcon } from '@mui/icons-material';
import { TextareaAutosize as BaseTextareaAutosize } from '@mui/base/TextareaAutosize';

interface Row {
    orderNo: string;
    value: number;
    text: string;
    set_correct?: boolean;
}


function SelectOptionComponent({ lessonName, setIsFocused, setChoices, updateQuestion, QIndex, question }: any) {
    const [rows, setRows] = useState<Row[]>(question?.choices || [{ orderNo: 'A', value: "", text: "" }]);
    const [errors, setErrors] = useState({ Option: '' });
    const [focusedTextareaId, setFocusedTextareaId] = useState<string | null>(null);

    const handleBlur = (e: any) => {
        const { name, value } = e.target;
        let error = '';
        error = value.trim() === '' ? `Option is required` : '';
        setErrors({ ...errors, [name]: error });
    };

    //ADD OPTION
    const addRow = () => {
        setIsFocused(true);
        setRows((prevRows: Row[]) => [
            ...prevRows,
            {
                orderNo: String.fromCharCode(65 + prevRows.length),
                value: 0,
                text: "",
                ...(lessonName !== 'Survey' && { set_correct: false })
            }
        ]);
    };

    useEffect(() => {
        setRows(question?.choices || [{ orderNo: 'A', value: 1, text: ""}, { orderNo: 'B', value: 1, text: ""}]);
    }, [question?.choices]);

    //REMOVE OPTION
    const removeRow = (order: string) => {
        setIsFocused(true);
        setRows((prevRows: any) => {
            const filteredRows = prevRows.filter((row: any) => row.orderNo !== order);
            const updatedRows = filteredRows.map((row: any, index: number) => ({
                ...row,
                orderNo: String.fromCharCode(65 + index),
                value: index + 1
            }));
            setChoices(updatedRows);
            updateQuestion(QIndex.index, undefined, undefined, "radiogroup", updatedRows);
            return updatedRows;
        });
    };

    //HANDLE OPTION CHANGE
    const handleOptionChange = (order: string, input: any) => {
        setFocusedTextareaId(order);
        const trimmedInput = input.length > 250 ? input.slice(0, 250) : input;
        setIsFocused(true);
        let error = '';
        if (input.length > 250) {
            error = `Option must be ${250} characters or less`;
        }
        setErrors({ ...errors, 'Option': error });
        const newRows = rows.map((row: any, i: number) => row.orderNo === order ? { ...row, text: trimmedInput, value: i + 1, } : row);
        setRows(newRows);
        setChoices(newRows);
        updateQuestion(QIndex.index, undefined, undefined, "radiogroup", newRows);
    };

    // SET CORRECT CHECK BOX FUNCTIONALITY
    const handleSetCorrect = (order: string, checked: boolean) => {
        setIsFocused(true);
        const updatedRows = rows.map((row: any) =>
            row.orderNo === order ? { ...row, set_correct: checked } : { ...row, set_correct: false }
        );
        setRows(updatedRows);
        const getCorrectAnswer = updatedRows.find((row: any) => row.orderNo === order);
        if (getCorrectAnswer) {
            updateQuestion(QIndex.index, undefined, undefined, "radiogroup", updatedRows, getCorrectAnswer.text);
        }
    }

    const disableAddOption = rows.length > 0 && rows.some(row => !row?.text?.length)

    return (
        <Box sx={{ p: "2vh", overflowX: 'auto' }}>
            <Grid container item direction="row" xs={12} alignItems="center" sx={{ color: "#777", backgroundColor: "#F6F5FB", mb: 2, py: "4px", borderBottom: "3px solid #726F83" }}>
                <Grid container item sm={1.5} md={2} lg={1} justifyContent={"center"} alignItems={"center"} sx={{ backgroundColor: "transperant" }}>
                    <Typography variant="subtitle2">Option</Typography>
                </Grid>
                <Grid container item sm={lessonName == "Forum Prep" ? 5.5 : 8.5} lg={lessonName == "Forum Prep" ? 7.5 : 9.5} xl={lessonName == "Forum Prep" ? 8 : 9.5} justifyContent={"flex-start"} alignItems={"center"} sx={{ backgroundColor: "transperant" }}>
                    <Typography variant="subtitle2" sx={{ ml: "10px" }}>Answer options</Typography>
                </Grid>
                {lessonName == "Forum Prep" &&
                    <Grid container item sm={3} md={3} lg={2} xl={1.5} justifyContent={"center"} alignItems={"center"} sx={{ backgroundColor: "transperant" }}>
                        <Typography variant="subtitle2">Set correct</Typography>
                    </Grid>
                }
                <Grid container item sm={2} md={1.5} lg={1.5} justifyContent={"center"} alignItems={"center"} sx={{ backgroundColor: "transperant" }}>
                    <Typography variant="subtitle2">Remove</Typography>
                </Grid>
            </Grid>
            {rows?.map((row: any, it: number) => (
                <Grid container item key={row.orderNo} xs={12} direction={"row"} justifyContent={"space-between"} alignItems={"flex-start"} sx={{ color: "#777", mt: "2vh" }}>
                    <Grid container item sm={1.6} md={2} lg={1} justifyContent={"flex-start"} alignItems={"center"}>
                        <Avatar variant="rounded" sx={{ backgroundColor: "white" }}>
                            <TextField
                                fullWidth
                                name="orderNo"
                                type='text'
                                size="small"
                                value={row?.orderNo}
                                InputProps={{
                                    sx: { borderRadius: "1vh" },
                                    readOnly: true,
                                }}
                            />
                        </Avatar>
                    </Grid>
                    <Grid container item sm={lessonName == "Forum Prep" ? 5.2 : 8.2} md={lessonName == "Forum Prep" ? 5.5 : 8.5} lg={lessonName == "Forum Prep" ? 7.5 : 9.5} xl={lessonName == "Forum Prep" ? 8 : 9.5} justifyContent={"flex-start"} alignItems={"center"}>
                        <Grid item sm={12} lg={11}>
                            <BaseTextareaAutosize
                                name='Option'
                                maxLength={251}
                                maxRows={2.5}
                                minRows={1}
                                placeholder={`Enter an option${it + 1}`}
                                value={row?.text}
                                onChange={(e) => handleOptionChange(row?.orderNo, e?.target?.value)}
                                style={{
                                    width: "100%", border: errors?.Option?.length && focusedTextareaId === row?.orderNo ? "2px solid #cf0c0c" : (focusedTextareaId === row?.orderNo ? "2px solid #3182ce" : "1px solid #dedede"), borderRadius: "1vh",
                                    padding: "8px", outline: "none", resize: 'none', maxHeight: "198px", color: "black"
                                }}
                                onFocus={() => setFocusedTextareaId(row?.orderNo)}
                                onBlur={(e) => {
                                    handleBlur(e);
                                    setFocusedTextareaId(null);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && e.shiftKey === false) {
                                        e.preventDefault();
                                    }
                                }}
                            />
                            <Typography variant="caption" sx={{ color: "#cf0c0c", ml: "2vh", fontWeight: "500" }}>{focusedTextareaId === row?.orderNo ? errors.Option : ""}</Typography>
                            <Typography variant="caption" sx={{ textAlign: 'right', display: 'block', marginTop: '4px' }}>
                                {row?.text?.length} / 250
                            </Typography>
                            {/* <TextField
                                fullWidth
                                name="Option"
                                type='text'
                                size="small"
                                placeholder={`Enter an option${it + 1}`}
                                helperText={
                                    helperText && Select == row?.orderNo ?
                                        <Typography variant="caption" sx={{ color: "#cf0c0c" }}>
                                            {helperText}
                                        </Typography> : null
                                }
                                value={row?.text}
                                onChange={(e) => handleOptionChange(row?.orderNo, e?.target?.value)}
                                sx={{ color: "#2A2F42" }}
                                InputProps={{ sx: { borderRadius: "1vh", color: "#2A2F42", maxLength: 251 } }}
                            /> */}
                        </Grid>
                    </Grid>
                    {lessonName == "Forum Prep" &&
                        <Grid container item sm={3} md={3} lg={2} xl={1.5} justifyContent={"center"} alignItems={"center"}>
                            <Radio
                                checked={row.set_correct}
                                onClick={(e: any) => { const { checked } = e.target; handleSetCorrect(row.orderNo, checked) }}
                            />
                        </Grid>
                    }
                    <Grid container item sm={2} md={1.5} lg={1.5} justifyContent={"center"} alignItems={"center"}>
                        <Avatar
                            variant="rounded"
                            sx={{
                                backgroundColor: "white",
                                border: '1px solid #bdbdbd',
                                cursor: 'pointer'
                            }}
                            onClick={() => removeRow(row.orderNo)}
                        >
                            <CloseOutlinedIcon fontSize="small" sx={{ color: "black" }} />
                        </Avatar>
                    </Grid>
                </Grid>
            ))}
            <Button
                fullWidth
                variant="outlined"
                disabled={disableAddOption}
                sx={{
                    backgroundColor: "white",
                    borderRadius: "1vh",
                    color: "black",
                    textTransform: "initial",
                    '&:hover': { border: '1px solid #bdbdbd', backgroundColor: 'white' },
                    border: '1px solid #bdbdbd',
                    mt: 2,
                }}
                onClick={addRow}
            >
                <AddIcon fontSize="small" className="flex w-[0.99vw] h-[0.98vh] m-0" />
                <Typography variant="subtitle2" sx={{ fontWeight: '600' }}>&nbsp;ADD OPTION</Typography>
            </Button>
        </Box>
    );
}

export default SelectOptionComponent;