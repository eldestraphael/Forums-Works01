import { Box, Button, Grid, Modal, Typography, CircularProgress, FormControl, RadioGroup, FormControlLabel, Radio, } from "@mui/material";
import { ClearIcon } from "@mui/x-date-pickers";

interface ConfirmationModalProps {
    open: boolean;
    handleClose: () => void;
    title: string;
    handleSubmit: () => void;
    body: React.ReactNode;
    isLoading: boolean;
    confirmButton?: string;
    cancelButton?: string;
}

export default function ConfirmationModal({ open, handleClose, title, handleSubmit, body, isLoading, confirmButton, cancelButton }: ConfirmationModalProps) {
    return (
        <>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
                hideBackdrop={isLoading}
                disableAutoFocus={true}
            >
                <Grid
                    container
                    item
                    xs={11} md={8} lg={6}
                    direction={'column'}
                    justifyContent={'center'}
                    alignItems={'center'}
                    sx={{
                        position: 'absolute' as 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        bgcolor: '#2A2F42',
                        border: 0,
                        boxShadow: 24,
                        borderRadius: '2vh',
                        maxWidth: '40vw !important'
                    }}>
                    <Grid container item xs={2} justifyContent={'space-between'} alignItems={'center'} sx={{ py: 2, px: 2, borderRadius: "2vh 2vh 0 0", backgroundColor: "#2A2F42" }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: '600', color: 'white' }}> {title} </Typography>
                        <ClearIcon sx={{ cursor: 'pointer', color: 'white' }} onClick={handleClose} />
                    </Grid>
                    <Grid container item xs={8} sx={{ backgroundColor: 'white', py: 3, px: 2 }}>
                        {body}
                    </Grid>
                    <Grid container item xs={2} justifyContent={'center'} alignItems={'center'} sx={{ backgroundColor: 'white', py: 2, px: 2, borderRadius: "0 0 2vh 2vh ", gap: 2 }}>
                        <Grid container item xs={4}>
                            <Button fullWidth variant="contained" size="medium" sx={{ textTransform: "uppercase", backgroundColor: "#2A2F42", borderRadius: "0.5vh", color: "#F0F2FF", '&:hover': { backgroundColor: '#2A2F42' } }}
                                onClick={handleSubmit}>
                                {isLoading ? <CircularProgress sx={{ color: 'white' }} size={20} /> : confirmButton ? confirmButton : 'Yes'}</Button>
                        </Grid>
                        <Grid container item xs={4}>

                            <Button fullWidth variant="outlined" size="medium" sx={{ textTransform: "uppercase", borderColor: "#2A2F42", borderRadius: "0.5vh", color: "#2A2F42" }}
                                onClick={handleClose}>
                                {isLoading ? <CircularProgress sx={{ color: '#2A2F42' }} size={20} /> : cancelButton ? cancelButton : 'No'}
                            </Button>
                        </Grid>
                    </Grid>
                </Grid>
            </Modal>
        </>
    )

}