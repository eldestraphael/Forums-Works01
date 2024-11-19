"use client"

import React from 'react'
import { Card, Chip, Dialog, Divider, Grid, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';


function ModeratorGuide({ open, handleClose, moderatorGuideData }: any) {
    // console.log("89",moderatorGuideDat)
    return (
        <Dialog open={open} onClose={handleClose} maxWidth={false} sx={{ '& .MuiDialog-paper': { width: { xs: '90%', sm: '80%', md: '70%', lg: '60%', xl: '50%' } } }}>
            <Grid container item xs={12} direction={'row'} justifyContent={'space-between'} alignItems={'flex-start'} sx={{ backgroundColor: "white", px: 2, pt: 2, position: 'sticky', top: 0, zIndex: 1 }}>
                {moderatorGuideData?.header?.map((header: any, i: number) => {
                    if (header?.type == 'logical')
                        return (
                            <Grid key={i} container item xs={11.5} direction={'column'}>
                                <Typography variant="h6" fontWeight={600} sx={{ color: 'black' }}>{header?.title}</Typography>
                                <Typography fontSize={13} sx={{ color: 'black' }}>{header?.description}</Typography>
                            </Grid>
                        )
                })}
                <CloseIcon
                    fontSize='small'
                    onClick={() => { handleClose(); }}
                    sx={{ cursor: 'pointer', color: "black" }}
                />
            </Grid>

            <Divider variant='middle' sx={{ flex: 1, m: 2 }} />

            <Grid container item xs={12} direction={'column'} rowGap={2} sx={{ mt: "1vh", px: 2, }}>

                {/* HEADER 2 */}
                {moderatorGuideData?.header?.map((header: any, i: number) => {
                    if (header?.type == "repeatable" || header?.type == "once") {
                        return (
                            <Grid key={i} container item xs={11} sx={{ backgroundColor: '#EEF3FF', borderRadius: '1vw', }}>
                                <Grid container item xs={0.3} sx={{ width: 1, backgroundColor: '#2a3041', borderRadius: '1vw 0 0 1vw', }}></Grid>
                                <Grid container item xs={11.6} direction={'column'} sx={{ width: 1, p: 2 }}>
                                    <Typography variant="subtitle2" sx={{ color: '#2a3041', fontWeight: '600', wordWrap: 'break-word', width: '100%' }}>{header?.title}</Typography>
                                    <div style={{ fontSize: '12px', color: 'black', wordWrap: 'break-word', width: '100%' }}>
                                        <div
                                            dangerouslySetInnerHTML={{
                                                __html: `
                                                                     <style>
                                                                        ol { list-style-type: decimal !important; padding-left: 20px; }
                                                                        ul { list-style-type: disc !important; padding-left: 20px; }
                                                                    </style>
                                                         ${header?.description || ''}`,
                                            }}
                                        />
                                    </div>
                                </Grid>
                            </Grid>
                        )
                    }
                })}

                {moderatorGuideData?.body?.length ?
                    <Divider variant='middle' sx={{ flex: 1, mt: 0 }} /> : null}

                {/* BODY CONTENT CARD */}
                {moderatorGuideData?.body?.map((body: any, i: number) => {
                    var ChipContent = () => {
                        return (
                            <Grid container item xs={12} justifyContent={'center'} alignItems={'center'} columnGap={0.5} >
                                <AccessTimeFilledIcon sx={{ fontSize: '15px' }} />
                                <Typography fontSize={12} fontWeight={600}>{body?.duration <= 60 ? `${body?.duration} seconds` : `${(body?.duration / 60)} minutes`}</Typography>
                            </Grid>
                        )
                    }
                    return (
                        <Grid key={i} container item xs={11} sx={{ border: `0.1vw solid ${i % 2 === 0 ? '#EEF3FF' : '#F5F4FB'}`, backgroundColor: i % 2 === 0 ? '#EEF3FF' : '#F5F4FB', borderRadius: '1vw', py: 2 }}>
                            <Grid container item xs={1.2} justifyContent={'center'} alignItems={'center'} >
                                <Typography variant="h3" sx={{ color: '#2a3041', fontWeight: '600' }}>{body?.order}</Typography>
                            </Grid>

                            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

                            <Grid container item xs={8.5} direction={'column'} sx={{ px: 1 }} >
                                <Typography variant="h6" sx={{ color: '#2a3041', fontWeight: '600', wordWrap: 'break-word', width: '100%' }}>{body?.title}</Typography>
                                <div style={{ fontSize: '12px', color: 'black', wordWrap: 'break-word', width: '100%' }}>
                                    <div
                                        dangerouslySetInnerHTML={{
                                            __html: `
                                                                     <style>
                                                                        ol { list-style-type: decimal !important; padding-left: 20px; }
                                                                        ul { list-style-type: disc !important; padding-left: 20px; }
                                                                    </style>
                                                         ${body?.description || ''}`,
                                        }}
                                    />
                                </div>
                            </Grid>
                            <Grid container item xs={1.9} direction={'column'} justifyContent={'space-between'} >
                                <Grid container item xs={4} direction={'column'} rowGap={0.5} alignItems={'flex-end'}>
                                    {body?.duration ? <Chip size='small' label={<ChipContent />}
                                        sx={{
                                            backgroundColor: "white",
                                            borderRadius: "5px",
                                            width: "auto",
                                            height: "auto",
                                            padding: "2px ",
                                        }} /> : null}
                                    {body?.duration_per_person ? <Typography align='right' fontWeight={600} sx={{ color: 'black', fontSize: '10px' }}>{`${body?.duration_per_person / 60} minutes per person`}</Typography> : null}
                                </Grid>
                                <Grid container item xs={2} justifyContent={'flex-end'} >
                                    {body?.link?.length > 0
                                        ? <IconButton aria-label="moderator guide" size="small" onClick={() => window.open(body?.link, '_blank')}
                                            sx={{
                                                backgroundColor: "white",
                                                borderRadius: '50%',
                                                width: '30px',
                                                height: '30px',
                                                padding: '6px',
                                            }}>
                                            <PlayCircleOutlineIcon sx={{ fontSize: "20px" }} />
                                        </IconButton>
                                        : null
                                    }
                                </Grid>
                            </Grid>
                        </Grid>
                    )
                })}

                {Object.keys(moderatorGuideData?.action_step || {}).length ?
                    <Divider variant='middle' sx={{ flex: 1, mt: 0 }} /> : null}

                {/* ACTION STEP CONTENT CARD */}

                {Object.keys(moderatorGuideData?.action_step || {}).length ?
                    <Grid container item xs={11} direction={'column'} justifyContent={'center'} alignItems={'center'} sx={{ backgroundColor: "#2a3041", borderRadius: '1vw', p: 2, py: 3 }}>
                        <Typography variant="h6" align='center' sx={{ color: 'white', fontWeight: '600', wordWrap: 'break-word', width: '100%' }}>{moderatorGuideData?.action_step?.name}</Typography>
                        <Typography fontSize={12} textAlign={'center'} sx={{ color: 'white', wordWrap: 'break-word', width: '100%' }}>{moderatorGuideData?.action_step?.description}</Typography>
                    </Grid>
                    : null
                }

                {moderatorGuideData?.footer?.length ?
                    <Divider variant='middle' sx={{ flex: 1, mt: 0 }} /> : null}

                {/* FOOTER CARD  */}
                {moderatorGuideData?.footer?.map((footer: any, i: number) => {
                    return (
                        <Grid key={i} container item xs={11} justifyContent={'center'} alignItems={'center'} sx={{ backgroundColor: "white", mb: 4, mt: 0.5 }}>
                            <Grid container item xs={11} sm={9} md={8} justifyContent={'center'} alignItems={'center'} sx={{ border: '0.1vw solid gray', borderRadius: '1vw', p: 2 }}>
                                {/* <Typography fontSize={12} sx={{ color: 'black', fontWeight: '600' }}>Footer</Typography> */}
                                {/* <Typography fontSize={10} fontWeight={600} textAlign={'center'} sx={{ color: 'black', wordWrap: 'break-word', width: '100%', fontSize: '11px' }}>{footer?.description}</Typography> */}
                                <div style={{ fontSize: '12px', color: 'black', wordWrap: 'break-word', width: '100%' }}>
                                    <div
                                        dangerouslySetInnerHTML={{
                                            __html: `
                                                                     <style>
                                                                        ol { list-style-type: decimal !important; padding-left: 20px; }
                                                                        ul { list-style-type: disc !important; padding-left: 20px; }
                                                                    </style>
                                                         ${footer?.description || ''}`,
                                        }}
                                    />
                                </div>
                            </Grid>
                        </Grid>
                    )
                })}
            </Grid>
        </Dialog >
    )
}

export default ModeratorGuide