"use client"
import React, { useState } from 'react'
import { Button, Grid, TextField, Typography, Tooltip } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import SnakBarAlert from '@/components/snakbaralert/snakbaralert';
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';

interface Chapter {
    chapter_uuid: string;
    chapter_name: string;
    chapter_files: File[];
}

function AddCourseTesting() {
    const [alertOpen, setAlertOpen] = useState(false);
    const [alert, setAlert] = useState("");
    const [alertSeverity, setAlertSeverity] = useState(false);
    const [isLoading, setisLoading] = useState(false);
    const { push } = useRouter();
    const [chapterData, setChapterData] = useState<Chapter[]>([
        {
            chapter_uuid: uuidv4(),
            chapter_name: '',
            chapter_files: [],
        }
    ]);

    function AlertManager(message: string, severity: boolean) {
        setAlert(message)
        setAlertSeverity(severity)
        setAlertOpen(true)
        setisLoading(false);
    }

    const handleAddChapter = () => {
        const lastChapter = chapterData[chapterData.length - 1];
        if (lastChapter.chapter_name.trim() === '' || lastChapter.chapter_files.length === 0) {
            AlertManager("Please fill in the chapter name and add files before adding a new chapter.", true);
            return;
        }

        setChapterData(prevState => [
            ...prevState,
            {
                chapter_uuid: uuidv4(),
                chapter_name: '',
                chapter_files: [],
            }
        ]);
    };

    const handleFilesChange = (chapterUuid: string, files: FileList) => {
        setChapterData(prevState => {
            return prevState.map(chapter => {
                if (chapter.chapter_uuid === chapterUuid) {
                    return { ...chapter, chapter_files: [...chapter.chapter_files, ...Array.from(files)] };
                }
                return chapter;
            });
        });
    };

    const handleDeleteFile = (chapterUuid: string, fileName: string) => {
        setChapterData(prevState => {
            return prevState.map(chapter => {
                if (chapter.chapter_uuid === chapterUuid) {
                    return { ...chapter, chapter_files: chapter.chapter_files.filter(file => file.name !== fileName) };
                }
                return chapter;
            });
        });
    };

    const handleChapterNameChange = (chapterUuid: string, name: string) => {
        setChapterData(prevState => {
            return prevState.map(chapter => {
                if (chapter.chapter_uuid === chapterUuid) {
                    return { ...chapter, chapter_name: name };
                }
                return chapter;
            });
        });
    };

    return (
        <>
            <div className="ml:0 lg:ml-[17.35vw]" style={{ backgroundColor: "#F6F5FB", paddingBottom: '5vh', minHeight: '100vh' }}>
                <Grid container item xs={12} justifyContent={'flex-start'} alignItems={'center'} sx={{ pt: 3, pb: 1, pl: 3, pr: 4 }}>
                    <Grid container item xs={12} lg={6} alignItems={'center'}>
                        <BreadCrumComponent push={push} params={''} />
                    </Grid>
                </Grid>

                <Grid container item xs={12} justifyContent={'flex-start'} alignItems={'center'} sx={{ pl: 3 }}>

                    <Grid container item xs={11.5} alignItems={'center'} justifyContent={'center'} sx={{ backgroundColor: 'white', borderRadius: '2vh', p: 2, }} >
                        {/* outer border */}
                        <Grid container item xs={11.5} sm={11.5} md={11.5} lg={7} justifyContent={'center'} sx={{ border: "1px solid #dedede", borderRadius: "2vh", p: 2, marginBottom: "3vh" }}>

                            <Grid container item xs={12} sm={12} md={11.5} lg={11.5} gap={1} sx={{ color: "#777", mt: 1.5 }}>
                                <Typography variant="caption">MODULE TITLE</Typography>
                                <TextField size='small'
                                    fullWidth
                                    placeholder="Enter a module title"
                                    sx={{ borderRadius: '1vh', color: "#2A2F42" }}
                                />
                                {chapterData.map(chapter => (
                                    <Chapter
                                        key={chapter.chapter_uuid}
                                        chapter={chapter}
                                        onFilesChange={handleFilesChange}
                                        onDeleteFile={handleDeleteFile}
                                        onChapterNameChange={handleChapterNameChange}
                                    />
                                ))}
                                <Grid container item sx={{ backgroundColor: 'transparent', mt: '2vh', }}>
                                    <Button variant='contained' sx={{ py: 1, backgroundColor: "white", textTransform: "initial", color: "#2A2F42", '&:hover': { backgroundColor: 'transparent' } }} fullWidth onClick={handleAddChapter}>
                                        <><AddIcon className="flex w-[0.99vw] h-[0.98vh] m-0" /><Typography sx={{ fontWeight: '500' }}>&nbsp; Add Chapter</Typography></>
                                    </Button>
                                </Grid>
                            </Grid>
                            <Grid item xs={9} sm={4} md={5} lg={4} sx={{ mt: '3vh', mb: '1vh' }}>
                                {/* {props.createCoursemAction[0].create && */}
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    sx={{ backgroundColor: "#2A2F42", borderRadius: "1vh", border: "3px solid balck", color: "#F0F2FF", textTransform: "initial", fontWeight: "700", '&:hover': { backgroundColor: '#2A2F42' } }}
                                // onClick={handleCreateCourse}
                                >
                                    <Typography sx={{ fontWeight: '500' }}>&nbsp; Add Module</Typography>

                                </Button>
                                {/* }  */}
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </div >
            <SnakBarAlert alertOpen={alertOpen} setAlertOpen={setAlertOpen} alertSeverity={alertSeverity} alert={alert} />
        </>

    )
}

export default AddCourseTesting


//CHAPTER BOX COMPONENT
const Chapter: React.FC<{
    chapter: Chapter;
    onFilesChange: (chapterUuid: string, files: FileList) => void;
    onDeleteFile: (chapterUuid: string, fileName: string) => void;
    onChapterNameChange: (chapterUuid: string, name: string) => void;
}> = ({ chapter, onFilesChange, onDeleteFile, onChapterNameChange }) => {

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault(); // Prevent default behavior
        onFilesChange(chapter.chapter_uuid, e.dataTransfer.files);
    };

    const maxTooltipLength = 13;
    return (
        <Grid container item xs={12} gap={2} sx={{ border: '0.1vw solid #b3b3b3', borderRadius: '1vw', p: 2, mt: 1.5 }}>
            <Grid container item xs={12} >
                <TextField
                    fullWidth
                    size="small"
                    type="text"
                    value={chapter.chapter_name}
                    onChange={(e) => onChapterNameChange(chapter.chapter_uuid, e.target.value)}
                    placeholder="Enter chapter name"
                />
            </Grid>
            <Grid container item xs={12} onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}
                sx={{
                    border: '2px dashed #ccc',
                    borderRadius: '5px',
                    padding: '20px',
                    cursor: 'pointer',
                    textAlign: 'center'
                }}
                onClick={() => {
                    const fileInput = document.getElementById(`fileInput_${chapter.chapter_uuid}`);
                    if (fileInput) {
                        fileInput.click();
                    }
                }}
            >
                <Typography variant="body1" sx={{ color: 'black' }}>Drag and drop some files here, or click to select files</Typography>
                <Typography variant="body2">Accepted file types: JPEG, PNG, PDF, MP4</Typography>
                {/* Invisible file input element to capture file selection */}
                <input
                    id={`fileInput_${chapter.chapter_uuid}`}
                    type="file"
                    style={{ display: 'none' }}
                    onChange={(e) => onFilesChange(chapter.chapter_uuid, e.target.files as FileList)}
                    accept=".jpg,.jpeg,.png,.pdf,.mp4"
                    multiple
                />
            </Grid>
            <Grid container item xs={12} gap={1} justifyContent={'flex-start'} sx={{}}>
                {chapter.chapter_files.map((file, index) => (
                    <Grid container item xs={12} sm={5.8} md={3.8} key={index} direction={'row'} alignItems={'center'} justifyContent={"space-between"} sx={{ backgroundColor: '#e7e7e7', borderRadius: '0.3vw', px: 1, py: 1 }}>
                        <Typography variant="body2">
                            {file.name.length > maxTooltipLength ? (
                                <Tooltip title={file.name} arrow>
                                    <span>{`${file.name.substring(0, 13)}...`}</span>
                                </Tooltip>
                            ) : (
                                <span>{file.name}</span>
                            )}
                            {/* {file.name?.substring(0, 13) + "..."} */}
                        </Typography>
                        <CloseIcon fontSize='small' sx={{ cursor: 'pointer' }} onClick={() => onDeleteFile(chapter.chapter_uuid, file.name)} />
                    </Grid>
                ))}
            </Grid>
        </Grid >
    );
};


{/* <TextField
                fullWidth
                size="small"
                type="text"
                value={chapter.chapter_name}
                onChange={(e) => onChapterNameChange(chapter.chapter_uuid, e.target.value)}
                placeholder="Enter chapter name"
            />
            <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                style={{
                    border: '2px dashed #ccc',
                    borderRadius: '5px',
                    padding: '20px',
                    marginTop: '20px',
                    cursor: 'pointer',
                    textAlign: 'center'
                }}
            >
                <Typography variant="body1" sx={{ color: 'black', fontWeight: '600' }}>Drag and drop some files here, or click to select files</Typography>
                <Typography variant="caption">Accepted file types: JPEG,PNG,PDF,MP4</Typography>
            </div>
            <Grid container item xs={12} sx={{ backgroundColor: 'red' }} >
                {chapter.chapter_files.map((file, index) => (
                    <Grid container item xs={4} key={index}>
                        {file.name}
                        <button onClick={() => onDeleteFile(chapter.chapter_uuid, file.name)}>X</button>
                    </Grid>
                ))}
            </Grid> */}


//Breadcrum component
const BreadCrumComponent = ({ push }: any) => {
    return (
        <>
            <Typography variant="h6" sx={{ fontWeight: '600' }} >Add Module </Typography>
        </>
    )
}