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

import FileUpload from './FileUpload/FileUpload';
import './TavernCardEditor.css';

const TavernCardEditor = ({toggleTheme}) => {
    const theme = useTheme();

    const [file, setFile] = useState();
    const [preview, setPreview] = useState();

    const pngRegex = /.+\.png/;

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
        if (!file || !pngRegex.test(file.name)) {
            setPreview(undefined);
            return;
        }
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [file]);

    return(
        <Container maxWidth={false}>
            <Container maxWidth={false} style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <FileUpload acceptedFileTypes={".json,.png"} file={file} fileChange={handleFileSelect} handleRemoveFile={handleRemoveFile}/>
                <Box style={{display:'flex', alignItems:'center'}}>Light <Switch checked={theme.palette.mode === "dark"} onChange={toggleTheme}/> Dark</Box>
            </Container>   
            <Paper elevation={6}>{file && pngRegex.test(file.name) && <img alt={file.name} src={preview}/>}</Paper>
        </Container>
    );
}

export default TavernCardEditor;