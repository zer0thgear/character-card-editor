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

import default_avatar from '../../assets/default_avatar.png';
import FileUpload from '../FileUpload/FileUpload';
import { parsePngChunks } from '../../utils/parsePngChunks';
import './TavernCardEditor.css';

const TavernCardEditor = ({toggleTheme}) => {
    const theme = useTheme();

    const [cardData, setCardData] = useState();
    const [file, setFile] = useState();
    const [preview, setPreview] = useState();

    async function handleFileSelect(event) {
        const selectedFile = event.target.files[0];
        setFile(selectedFile);
        if (/.+\.png$/.test(selectedFile.name)){
            const parsedCardData = await parsePngChunks(selectedFile);
            console.log(parsedCardData.data.name);
            setCardData(parsedCardData);
        } else { 
            const parsedJson = JSON.parse(await selectedFile.text());
            console.log(parsedJson.data.name);
            setCardData(parsedJson);
        }
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