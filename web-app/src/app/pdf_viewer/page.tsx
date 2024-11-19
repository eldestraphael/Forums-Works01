"use client"
import React, { useState } from 'react';
import PdfViewer from './PdfViewer';
import { useSelector } from "react-redux";
import { usePathname, useRouter } from "next/navigation";
import { Button, CircularProgress, Grid, Typography } from '@mui/material'
import ArrowBackIosNewOutlinedIcon from '@mui/icons-material/ArrowBackIosNewOutlined';

const PdfView: React.FC = (props: any) => {
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(false);
    const [totalPageForLMSPdf, setTotalPageForLMSPdf] = useState<number | undefined>(0);

    const url = useSelector((state: any) => state.forumExperience?.pdf_url)
    return (
        <div className="ml:0 lg:ml-[17.35vw]" style={{ backgroundColor: "#F6F5FB", paddingBottom: '5vh' }}>
            <Grid container item xs={12} justifyContent={'flex-start'} alignItems={'center'} sx={{ pt: 3, pb: 1, pl: 3, pr: 4 }}>
                <Grid container item xs={12} lg={6} alignItems={'center'} columnGap={2}>
                    <Button
                        // fullWidth
                        variant='outlined'
                        startIcon={<ArrowBackIosNewOutlinedIcon fontSize='small' />}
                        sx={{ textTransform: "initial", fontWeight: '600' }}
                        onClick={() => { router.back(); setLoading(true); }}
                    >
                        Back
                    </Button>
                    <Typography variant="h6" sx={{ fontWeight: '600' }} >{loading ? <CircularProgress size='small' /> : "PDF Viewer"}</Typography>
                </Grid>
            </Grid>

            <Grid container item xs={12} justifyContent={'flex-start'} alignItems={'center'} sx={{ pl: 3 }}>
                <Grid container item xs={11.5} alignItems={'center'} justifyContent={'center'} sx={{ position: 'relative', backgroundColor: 'white', borderRadius: '2vh', p: 0, }} >
                    <Grid className="justify-center items-center" sx={{ width: '90%', borderRadius: '1vw' }}>
                        <PdfViewer pdfUrl={url} size={1.4} pageEnable={true} setTotalPageForLMSPdf={setTotalPageForLMSPdf} />
                    </Grid>
                </Grid>
            </Grid>
        </div >
    );
};

export default PdfView;