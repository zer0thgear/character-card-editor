import React, { useEffect, useRef, useState } from 'react';

import {
    Button,
    Box,
    Container,
    Paper,
    //TextField,
    Switch,
    //Typography
} from '@mui/material'
import { useTheme } from '@mui/material/styles'

import CardTextField from '../CardTextField/CardTextField';
import default_avatar from '../../assets/default_avatar.png';
import FileUpload from '../FileUpload/FileUpload';
import assembleNewPng from '../../utils/assembleNewPng';
import parsePngChunks from '../../utils/parsePngChunks';
import stripPngChunks from '../../utils/stripPngChunks';
import { v2CardPrototype, /*v2CharacterBookEntryPrototype, v2CharacterBookPrototype*/ } from '../../utils/v2CardPrototype';
import { /*v3AssetPrototype,*/ v3CardPrototype, /*v3CharacterBookEntryPrototype, v3CharacterBookPrototype*/ } from '../../utils/v3CardPrototype';
import './TavernCardEditor.css';

const TavernCardEditor = ({toggleTheme}) => {
    const theme = useTheme();

    const previewImageRef = useRef(null);
    const [cardDataV2, setCardDataV2] = useState(v2CardPrototype);
    const [cardDataV3, setCardDataV3] = useState(v3CardPrototype);
    const [file, setFile] = useState();
    const [preview, setPreview] = useState(default_avatar);
    const [useV3Spec, setUseV3Spec] = useState(false);

    const charMetadataFields = [
        {fieldName: "name"},
        {fieldName: "description", multiline:true, rows:10},
        {fieldName: "personality"},
        {fieldName: "scenario"},
        {fieldName: "first_mes", label: "First Message", multiline:true, rows:10},
        {fieldName: "mes_example", label: "Example Messages", multiline:true, rows:10}
    ];

    async function handleFileSelect(event) {
        const selectedFile = event.target.files[0];
        setFile(selectedFile);
        if (/.+\.png$/.test(selectedFile.name)){
            const parsedCardData = await parsePngChunks(selectedFile, ["ccv3", "chara"]);
            if (parsedCardData) {
                if (parsedCardData.length >= 2) {
                    for (let item = 0; item < parsedCardData.length; item++){
                        if (parsedCardData[item].keyword === "ccv3"){
                            setCardDataV3(parsedCardData[item].data);
                            console.log("V3 Card info found");
                            console.log(parsedCardData[item].data);
                            setUseV3Spec(true);
                        } else if (parsedCardData[item].keyword === "chara"){
                            console.log("V2 card info found");
                            setCardDataV2(parsedCardData[item].data);
                            console.log(parsedCardData[item].data);
                        }
                    }
                }
                else {
                    console.log("Only V2 card info found");
                    setUseV3Spec(false);
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
            if (parsedJson.spec === "chara_card_v3"){
                setUseV3Spec(true);
                setCardDataV3(parsedJson)
            }
            else{
                setCardDataV2(parsedJson);
                setUseV3Spec(false);
            }
        }
        //console.log(selectedFile.name);
        //console.log(pngRegex.test(selectedFile.name));
    }

    function handleJsonDownload() {
        const blob = new Blob([JSON.stringify(cardDataV2, null, 4)], { type: 'application/json' });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${cardDataV2.data.name}.json`
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        URL.revokeObjectURL(url);
    }

    async function handlePngDownload() {
        try {
            const response = await fetch(preview);
            if (!response.ok){
                throw new Error("Network response was not OK");
            }
            const respBlob = await response.blob();
            const arrayBuffer = await respBlob.arrayBuffer();
            const strippedPng = await stripPngChunks(arrayBuffer);
            const assembledPng = await assembleNewPng(strippedPng, useV3Spec ? [{keyword:"chara", data:cardDataV2}, {keyword:"ccv3", data:cardDataV3}] : {keyword:"chara", data:cardDataV2});
            console.log("Saving as V3: ", useV3Spec);
            const blob = new Blob([assembledPng], { type: 'image/png' });

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${cardDataV2.data.name}.png`
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("There was an error retrieving the card's PNG: ", error)
        }
        
    }

    const handlePreviewClick = () => {
        previewImageRef.current.click();
    };

    const handlePreviewUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);
        }
    };

    function handleRemoveFile() {
        setFile(null);
        setPreview(default_avatar);
        setCardDataV2(v2CardPrototype);
        setCardDataV3(v3CardPrototype);
        setUseV3Spec(false);
    }

    const handleTextFieldChange = (e) => {
        const {name, value} = e.target;
        console.log("Name: ", name);
        setCardDataV2((prevState) => ({
            ...prevState,
            data: {
                ...prevState.data,
                [name]: value,
            }
        }));
        setCardDataV3((prevState) => ({
            ...prevState,
            data: {
                ...prevState.data,
                [name]: value,
            }
        }));
    };

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
                <Container disableGutters maxWidth={false} style={{display:"flex", height:"95vh"}}>
                    <Container disableGutters style={{alignItems:"center", display:"flex", flex:2, overflow:"auto"}} sx={{ml:2}}>
                        <img alt={file ? file.name : "No avatar loaded"} onClick={handlePreviewClick} src={preview} style={{cursor:'pointer', objectFit:'cover'}}/>
                        <input
                            accept=".png"
                            hidden
                            onChange={handlePreviewUpload}
                            ref={previewImageRef}
                            type="file"           
                        />
                    </Container>
                    <Container disableGutters maxWidth={false} style={{display:"flex", flexDirection:"column", flex:5, margin:10, overflow:"auto"}}>
                        {charMetadataFields.map((field, index) => (
                            <CardTextField 
                                fieldName={field.fieldName} 
                                label={Object.hasOwn(field, "label") ? field.label : ""} 
                                multiline={Object.hasOwn(field, "multiline") ? field.multiline : ""} 
                                rows={Object.hasOwn(field, "rows") ? field.rows : 1}
                                changeCallback={handleTextFieldChange} useV3Spec={useV3Spec} cardDataV2={cardDataV2} cardDataV3={cardDataV3}
                            />
                        ))}
                        <Container disableGutters maxWidth={false} style={{display:"flex", justifyContent:'space-between'}}>
                            <Button onClick={handleJsonDownload} variant="contained">Download as JSON</Button>
                            <Button onClick={handlePngDownload} variant="contained">Download as PNG</Button>
                        </Container>
                    </Container>
                </Container>
            </Paper>
        </Container>
    );
}

export default TavernCardEditor;