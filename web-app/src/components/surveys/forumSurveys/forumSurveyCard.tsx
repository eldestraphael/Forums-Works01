import * as React from 'react';
import { useState } from "react";
import { Grid, Typography, Tooltip, CircularProgress } from "@mui/material";
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import DateFormats from '@/components/dateFormat';
import { StaticMessage } from '@/app/util/StaticMessage';
const filenameRegex = /filename="?([^"]*)"?/;

interface forumSurveyCardProps {
    forum_uuid: string,
    survey: { uuid: string, name: string, completed_on: string, created_at: string }
    AlertManager(message: string, severity: boolean): void
}
export default function ForumSurveyCard({ forum_uuid, survey, AlertManager }: forumSurveyCardProps) {
    const [isCardLoader, setisCardLoader] = useState(false);

    const DownloadSurvey = async () => {
        try {
            setisCardLoader(true);
            const res = await fetch(`/api/forum/${forum_uuid}/survey/${survey.uuid}/download`, {
                method: "GET",
                cache: 'no-store',
                headers: {
                    "Content-Type": "application/json",
                },
            });

            // const data = await res.json();
            if (res.status == 200) {
                const contentDisposition = res.headers.get('Content-Disposition');
                if (!contentDisposition) {
                     AlertManager(StaticMessage.ErrorMessage, true);
                     return;
                  }
                const filenameMatch = filenameRegex.exec(contentDisposition);
                const filename = filenameMatch ? filenameMatch[1] : 'download.xlsx';

                // Convert the response to a blob
                const blob = await res.blob();

                // Create a link element, set its href to a URL representing the blob, and trigger a click event
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = filename;
                link.click();

                // Clean up the URL object
                URL.revokeObjectURL(link.href);
            }
            // } else {
            //     AlertManager(data?.message, true);
            // }
        }
        catch (error: any) {
            AlertManager(StaticMessage.ErrorMessage, true);
        } finally {
            setisCardLoader(false);
        }
    }

    const maxTooltipLength = 34;
    return (
        <>
            <Grid container item xs={11.2} sm={11.2} md={11.5} lg={11.5} sx={{ minHeight: "10vh", border: "1px solid #D8D8D8", borderRadius: "1vh", }}
                onClick={(e) => {
                    e.stopPropagation();
                }}>
                <Grid container item xs={12} sm={12} md={12} sx={{ backgroundColor: 'transparent' }}>
                    <Grid container item xs={12} sm={12} md={12} lg={12} direction={'row'} sx={{ backgroundColor: 'transparent', height: '8.7vh' }}>
                        <Grid container item xs={10.2} sm={8.8} md={10} lg={9.3} sx={{ backgroundColor: 'transparent', p: 1, height: "100%", wordWrap: 'break-word', overFlow: "hidden", width: '80%' }}>
                            <Typography variant="caption" sx={{ wordWrap: "break-word" }}>
                                {survey.name.length > maxTooltipLength ? (
                                    <Tooltip title={survey.name} arrow >
                                        <Typography variant='subtitle2'
                                            sx={{
                                                fontWeight: 600,
                                                wordWrap: 'break-word'
                                            }}>{`${survey.name.substring(0, 34)}...`}</Typography>
                                    </Tooltip>
                                ) : (
                                    <Typography variant='subtitle2' sx={{ fontWeight: 600, wordWrap: "break-word", }}>{survey.name}</Typography>
                                )}
                            </Typography>
                        </Grid>
                        <Grid container item xs={1.8} sm={3.2} md={2} lg={2.7} justifyContent={'center'} alignItems={'center'} sx={{ backgroundColor: 'transparent', p: 1 }}>
                            {isCardLoader ? <CircularProgress size={25} />
                                : <FileDownloadOutlinedIcon fontSize="large"
                                    onClick={() => DownloadSurvey()}
                                    sx={{ backgroundColor: '#5F83ED', color: 'white', p: 1, borderRadius: '0.5vw', cursor: 'pointer' }} />
                            }
                        </Grid>
                    </Grid>
                    <Grid container item sx={{ borderTop: '1px solid #D8D8D8' }} >
                        <Grid container item sx={{ backgroundColor: 'transparent', p: 1 }} alignItems={"center"}>
                            <Typography variant="caption" sx={{ fontWeight: 500, color: '#989898' }}>Created On - {DateFormats(survey.created_at, false)}</Typography>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid >
        </>
    )
}