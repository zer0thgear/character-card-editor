import React, { useEffect, useState } from 'react';

import {
    //Button,
    Box,
    Container,
    Paper,
    //TextField
    Switch,
    //Typography
} from '@mui/material'
import { useTheme } from '@mui/material/styles'

import FileUpload from '../FileUpload/FileUpload';
import default_avatar from '../../assets/default_avatar.png';
import './TavernCardEditor.css';

const TavernCardEditor = ({toggleTheme}) => {
    const theme = useTheme();

    const [file, setFile] = useState();
    const [preview, setPreview] = useState();

    function handleFileSelect(event) {
        const selectedFile = event.target.files[0];
        setFile(selectedFile);
        //console.log(selectedFile.name);
        //console.log(pngRegex.test(selectedFile.name));
    }

    function handleRemoveFile() {
        setFile(null);
    }

    useEffect(() => {
        const pngRegex = /.+\.png$/;
        if (!file) {
            setPreview(undefined);
            return;
        }
        if (!pngRegex.test(file.name)){
            setPreview(default_avatar);
            return;
        }
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [file]);

    return(
        <Container maxWidth={false}>
            <Container disableGutters maxWidth={false} style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <FileUpload acceptedFileTypes={".json,.png"} file={file} fileChange={handleFileSelect} handleRemoveFile={handleRemoveFile}/>
                <Box style={{display:'flex', alignItems:'center'}}>Light <Switch checked={theme.palette.mode === "dark"} onChange={toggleTheme}/> Dark</Box>
            </Container>   
            <Paper elevation={6}>
                <Container disableGutters maxWidth={false}>
                    {file && <img alt={file.name} src={preview}/>}
                </Container>
            </Paper>
        </Container>
    );
}

export default TavernCardEditor;