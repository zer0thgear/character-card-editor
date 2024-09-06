import React from 'react';
import { 
    Box,
    Button,
    IconButton,
    Typography 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

/**
 * Component that wraps over the basic HTML file upload component
 * Params should be passed as props to the FileUpload component when utilized
 * 
 * @param {string} acceptedFileTypes A list of accepted filetypes
 * @param {boolean} displayDeleteButton Optional boolean to arbitrarily display delete button without file being present
 * @param {*} file The file being uploaded
 * @param {*} fileChange Callback function to handle a file being chosen
 * @param {*} handleRemoveFile Callback function to handle clearing the chosen file
 * @returns The FileUpload component
 */
const FileUpload = ({acceptedFileTypes, displayDeleteButton=false, file, fileChange, handleRemoveFile}) => {
    return(
        <Box style={{display:'flex', alignItems:'center'}}>
            <input accept={acceptedFileTypes} hidden id="file-upload" onChange={fileChange} onClick={(event) => {event.target.value = null}} type ="file"/>
            <label htmlFor='file-upload'>
                <Button component="span" size="small" style={{whiteSpace:"nowrap"}} variant="contained">Select File</Button>
            </label>
            <Typography sx={{ml:2}} variant="body2">
                {file ? `${file.name}` : 'No file selected'}
            </Typography>
            {(file || displayDeleteButton) && (
                <IconButton aria-label="delete" color="error" onClick={handleRemoveFile} size="small">
                    <DeleteIcon/>
                </IconButton>
            )}
        </Box>
    );
}

export default FileUpload;