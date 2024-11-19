"use client"

import { Button, CircularProgress, Grid, IconButton, Typography } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useDispatch, useSelector } from 'react-redux';
import { setCompletedPercent, setStatus, setTotalStatus, trackingPostAPI } from "@/redux/reducers/forumExperience/forumExperienceSlice";
import { usePathname } from "next/navigation";
import { RootState, AppDispatch } from "@/redux/store";
import { useAppSelector } from '@/redux/hooks';

interface PdfViewerProps {
    pdfUrl: string;
    size: any;
    pageEnable: boolean;
    setTotalPageForLMSPdf?: number | any
}

const PdfViewer: React.FC<PdfViewerProps> = ({ pdfUrl, size, pageEnable, setTotalPageForLMSPdf }) => {
    const dispatch = useDispatch<AppDispatch>();
    const pathname = usePathname();
    const [totalPages, setTotalPages] = useState(0);
    const [pageNumber, setPageNumber] = useState(1);
    const { status, total_status, completed_percent, current_lession_uuid, is_current_lesson_status } = useSelector((state: RootState) => state.forumExperience);
    const { current_forum_uuid } = useAppSelector(state => state.forumExperience);

    //PDF VIEWER CONFIG
    useEffect(() => {
        pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
    }, []);

    //TOTAL PAGE VALUE FUNCTION
    const handleDocumentLoad = (doc: any) => {
        const totalPages = doc.numPages;
        console.log("total",totalPages)
        setTotalPages(totalPages);
        pathname == '/pdf_viewer' ? null : setTotalPageForLMSPdf(totalPages);
        pathname == '/pdf_viewer' && is_current_lesson_status ? dispatch(setTotalStatus(totalPages)) : null;
    };

    //PREV PAGE FUNCTION
    const handlePreviousPage = () => {
        if (pageNumber > 1) {
            setPageNumber(pageNumber - 1);
        }
    };

    //NEXT PAGE FUNCTION
    const handleNextPage = () => {
        if (pageNumber < totalPages) {
            setPageNumber(pageNumber + 1);
            pathname == '/pdf_viewer' && is_current_lesson_status ? dispatch(setStatus(pageNumber + 1)) : null;
        }
    };

    //SET INITIAL PAGE NUMBER 
    useEffect(() => {
        pathname == '/pdf_viewer' && is_current_lesson_status ? status > 1 ? setPageNumber(status) : (setPageNumber(1), dispatch(setStatus(1))) : null;
    }, [])

    //SET INITIAL COMPLETED PERCENT DATA IN REDUX  
    useEffect(() => {
        if (total_status > 0 && status > 0)
            pathname == '/pdf_viewer' && is_current_lesson_status ? dispatch(setCompletedPercent()) : null;
    }, [total_status, status]);

    //TRACKING POST API CALL
    const handleTrackLesson = () => {
        dispatch(trackingPostAPI({
            forum_uuid: current_forum_uuid,
            lesson_uuid: current_lession_uuid,
            status,
            status_percent: completed_percent,
            is_current_lesson: true
        }))
    };

    //TRACKING API CALL WHEN COMPLETED PERCENT DATA IS GREATER THAN 0
    useEffect(() => {
        if (completed_percent > 0) {
            pathname == '/pdf_viewer' && is_current_lesson_status ? handleTrackLesson() : null;
        }
    }, [completed_percent]);

    const Loading = () => (
        <Grid container item xs={12} sx={{ height: '35vh' }} justifyContent={'center'} alignItems={'center'}>
            <CircularProgress />
        </Grid>
    );

    const ErrorComponent = () => (
        <Grid container item xs={12} sx={{ height: '35vh' }} justifyContent={'center'} alignItems={'center'}>
            <Typography variant='h6' color='red' sx={{ fontWeight: 'bold' }}>Failed to load PDF.</Typography>
        </Grid>
    );

    return (
        <Grid container item xs={12} justifyContent={'center'} alignItems={'center'}>
            {pageEnable &&
                <Grid container item xs={12} justifyContent={'center'} alignItems={'center'} gap={3} sx={{ height: '7vh' }}>
                    <IconButton onClick={handlePreviousPage} disabled={pageNumber === 1}>
                        <ArrowBackIcon />
                    </IconButton>
                    <span>Page {pageNumber} of {totalPages}</span>
                    <IconButton onClick={handleNextPage} disabled={pageNumber === totalPages}>
                        <ArrowForwardIcon />
                    </IconButton>
                </Grid>
            }
            <Grid container item xs={12} justifyContent={'center'} alignItems={'center'}>
                <Document
                    file={pdfUrl}
                    onLoadSuccess={handleDocumentLoad}
                    loading={<Loading />}
                    error={<ErrorComponent />}
                >
                    <Page scale={size} pageNumber={pageNumber} renderAnnotationLayer={false} renderTextLayer={false} />
                </Document>
            </Grid>
        </Grid>
    );
};

export default PdfViewer;
