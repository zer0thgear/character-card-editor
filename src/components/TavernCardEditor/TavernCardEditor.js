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
import { v2CardPrototype, v2CharacterBookEntryPrototype, v2CharacterBookPrototype } from '../../utils/v2CardPrototype';
import { v3AssetPrototype, v3CardPrototype, v3CharacterBookEntryPrototype, v3CharacterBookPrototype } from '../../utils/v3CardPrototype';
import './TavernCardEditor.css';

const TavernCardEditor = ({toggleTheme}) => {
    const theme = useTheme();

    const [cardDataV2, setCardDataV2] = useState(v2CardPrototype);
    const [cardDataV3, setCardDataV3] = useState(v3CardPrototype);
    const [file, setFile] = useState();
    const [preview, setPreview] = useState(default_avatar);

    async function handleFileSelect(event) {
        const selectedFile = event.target.files[0];
        setFile(selectedFile);
        if (/.+\.png$/.test(selectedFile.name)){
            const parsedCardData = await parsePngChunks(selectedFile, ["ccv3", "chara"]);
            if (parsedCardData) {
                //console.log(parsedCardData.data.name);
                //console.log(parsedCardData.spec);
                //console.log(parsedCardData.spec_version);
                //console.log(parsedCardData);
                if (parsedCardData.length >= 2) {
                    for (let item = 0; item < parsedCardData.length; item++){
                        //console.log(parsedCardData[item]);
                        if (parsedCardData[item].keyword === "ccv3"){
                            setCardDataV3(parsedCardData[item].data);
                            console.log("V3 Card info found");
                            console.log(parsedCardData[item].data);
                        } else if (parsedCardData[item].keyword === "chara"){
                            console.log("V2 card info found");
                            setCardDataV2(parsedCardData[item].data);
                            console.log(parsedCardData[item].data);
                        }
                    }
                }
                else {
                    console.log("Only V2 card info found")
                    setCardDataV2(parsedCardData[0].data);
                    console.log(parsedCardData[0].data);
                }
            } else {
                console.log("This PNG doesn't have any Card Data!");
            }
        } else { 
            const parsedJson = JSON.parse(await selectedFile.text());
            //console.log(parsedJson.data.name);
            //console.log(parsedJson.spec);
            //console.log(parsedJson.spec_version);
            console.log(parsedJson);
            setCardDataV2(parsedJson);
        }
        //console.log(selectedFile.name);
        //console.log(pngRegex.test(selectedFile.name));
    }

    function handleRemoveFile() {
        setFile(null);
        setPreview(default_avatar);
    }

    useEffect(() => {
        const pngRegex = /.+\.png$/;
        if (!file) {
            setPreview(default_avatar);
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
                    <img alt={file ? file.name : "No avatar loaded"} src={preview}/>
                </Container>
            </Paper>
        </Container>
    );
}

export default TavernCardEditor;