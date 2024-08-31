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
 * @param {*} file The file being uploaded
 * @param {*} fileChange Callback function to handle a file being chosen
 * @param {*} handleRemoveFile Callback function to handle clearing the chosen file
 * @returns The FileUpload component
 */
const FileUpload = (props) => {
    return(
        <Box style={{display:'flex', alignItems:'center'}}>
            <input hidden id="file-upload" onChange={props.fileChange} onClick={(event) => {event.target.value = null}} type ="file"/>
            <label htmlFor='file-upload'>
                <Button component="span" size="small" variant="contained">Select File</Button>
            </label>
            <Typography sx={{ml:2}} variant="body2">
                {props.file ? `${props.file.name}` : 'No file selected'}
            </Typography>
            {props.file && (
                <IconButton aria-label="delete" color="error" onClick={props.handleRemoveFile} size="small">
                    <DeleteIcon/>
                </IconButton>
            )}
        </Box>
    );
}

export default FileUpload;