import { 
    Button,
    Dialog, 
    DialogActions, 
    DialogContent, 
    DialogContentText, 
    DialogTitle 
} from "@mui/material";

const ConfirmationDialog = ({open, handleClose, dialogTitle, dialogContent, handleConfirm}) => {
    return (
        <div>
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="confirmation-dialog-title"
                aria-describedby="confirmation-dialog-description"
            >
                <DialogTitle id="confirmation-dialog-title">{dialogTitle}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="confirmation-dialog-description">
                        {dialogContent}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary" variant="contained">Cancel</Button>
                    <Button onClick={handleConfirm} color="primary" variant="contained">Confirm</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default ConfirmationDialog;