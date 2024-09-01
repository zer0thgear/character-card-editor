import React, { useEffect, useRef, useState } from 'react';

import {
    Button,
    Box,
    Checkbox,
    Container,
    FormControlLabel,
    IconButton,
    Paper,
    //TextField,
    Switch,
    Tab,
    Tabs,
    Tooltip
    //Typography
} from '@mui/material'
import { DarkMode, DarkModeOutlined, DeleteOutline, KeyboardDoubleArrowUp, LightMode, LightModeOutlined } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import AltGreetingTextField from '../AltGreetingTextField/AltGreetingTextField';
import CardTextField from '../CardTextField/CardTextField';
import ConfirmationDialog from '../ConfirmationDialog/ConfirmationDialog';
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
    const [deleteConfirmation, setDeleteConfirmation] = useState(false);
    const [deleteGreetingConfirmation, setDeleteGreetingConfirmation] = useState(false);
    const [displayImage, setDisplayImage] = useState(true);
    const [file, setFile] = useState();
    const [overwriteConfirmation, setOverwriteConfirmation] = useState(false);
    const [pendingGreeting, setPendingGreeting] = useState(-1);
    const [pendingJson, setPendingJson] = useState(null);
    const [promoteGreeting, setPromoteGreeting] = useState(false);
    const [preview, setPreview] = useState(default_avatar);
    const [tabValue, setTabValue] = useState(0);
    const [useV3Spec, setUseV3Spec] = useState(false);

    const charMetadataFields = [
        {fieldName: "name"},
        {fieldName: "description", multiline:true, rows:10},
        {fieldName: "personality", multiline:true},
        {fieldName: "scenario", multiline:true},
        {fieldName: "first_mes", label: "First Message", multiline:true, rows:10},
        {fieldName: "mes_example", label: "Example Messages", multiline:true, rows:10}
    ];

    const creatorMetadataFields = [
        {fieldName: "creator"},
        {fieldName: "character_version", label: "Character Version"},
        {fieldName: "creator_notes", label: "Creator Notes", multiline:true, rows:10},
        {fieldName: "tags", label: "Tagss (Comma separated, no quotes)"}
    ];

    const promptFields = [
        {fieldName: "system_prompt", label: "System Prompt", multiline:true, rows:5},
        {fieldName: "post_history_instructions", label: "Post History Instructions", multiline:true, rows:5}
    ]

    const closeDeleteConfirmation = () => {
        setDeleteConfirmation(false);
    };

    const closeDeleteGreetingConfirmation = () => {
        setDeleteGreetingConfirmation(false);
        setPendingGreeting(-1);
    }

    const closeOverwriteConfirmation = () => {
        setOverwriteConfirmation(false);
        setPendingJson(null);
    };

    const closePromoteGreeting = () => {
        setPromoteGreeting(false);
        setPendingGreeting(-1);
    };

    const handleAddGreeting = () => {
        if (useV3Spec){
            const altGreetingArray = cardDataV3.data.alternate_greetings;
            altGreetingArray.push("");
            setCardDataV3((prevState) => ({
                ...prevState,
                data: {
                    ...prevState.data,
                    alternate_greetings: altGreetingArray
                }
            }));
        } else {
            const altGreetingArray = cardDataV2.data.alternate_greetings;
            altGreetingArray.push("");
            setCardDataV2((prevState) => ({
                ...prevState,
                data: {
                    ...prevState.data,
                    alternate_greetings: altGreetingArray
                }
            }));
        }
    }

    const handleAltGreetingChange = (e) => {
        const {name, value} = e.target;
        const index = name.match(/altGreetingV[23](\d+)/)[1];
        setCardDataV2((prevState) => ({
            ...prevState,
            data: {
                ...prevState.data,
                alternate_greetings: prevState.data.alternate_greetings.map((greeting, i) => i === parseInt(index, 10) ? value : greeting)
            }
        }))
        setCardDataV3((prevState) => ({
            ...prevState,
            data: {
                ...prevState.data,
                alternate_greetings: prevState.data.alternate_greetings.map((greeting, i) => i === parseInt(index, 10) ? value : greeting)
            }
        }))
    };

    const handleAltGreetingClick = (index) => {
        if (useV3Spec){
            if (cardDataV3.data.alternate_greetings.length === 1) return;
        } else {
            if (cardDataV2.data.alternate_greetings.length === 1) return;
        }
        setPendingGreeting(index);
        setDeleteGreetingConfirmation(true);
    };

    const handleDeleteAltGreeting = () => {
        const altGreetings = useV3Spec ? cardDataV3.data.alternate_greetings : cardDataV2.data.alternate_greetings;
        altGreetings.splice(pendingGreeting, 1);
        if (useV3Spec) {
            setCardDataV3((prevState) => ({
                ...prevState,
                data: {
                    ...prevState.data,
                    alternate_greetings: altGreetings
                }
            }));
        } else {
            setCardDataV2((prevState) => ({
                ...prevState,
                data: {
                    ...prevState.data,
                    alternate_greetings: altGreetings
                }
            }));
        }
        setPendingGreeting(-1);
        setDeleteGreetingConfirmation(false);
    }

    const handleDragEnd = (result) => {
        if (!result.destination) return;

        const items = useV3Spec ? cardDataV3.data.alternate_greetings : cardDataV2.data.alternate_greetings;
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0 , reorderedItem);

        if (useV3Spec){
            setCardDataV3((prevState) => ({
                ...prevState,
                data: {
                    ...prevState.data,
                    alternate_greetings: items
                }
            }))
        } else {
            setCardDataV2((prevState) => ({
                ...prevState,
                data: {
                    ...prevState.data,
                    alternate_greetings: items
                }
            }))
        }
    };

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

    const handleDeleteClick = () => {
        setDeleteConfirmation(true);
    };

    const handleJsonDownload = () => {
        const blob = new Blob([JSON.stringify(useV3Spec ? cardDataV3 : cardDataV2, null, 4)], { type: 'application/json' });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${useV3Spec ? cardDataV3.data.name : cardDataV2.data.name}.json`
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        URL.revokeObjectURL(url);
    };

    async function handleOverwriteClick(event) {
        const file = event.target.files[0];
        if (file) {
            const parsedJson = JSON.parse(await file.text());
            setPendingJson(parsedJson);
            setOverwriteConfirmation(true);
        }
    };

    const handleOverwriteFile = () => {
        if(pendingJson.spec === "chara_card_v3"){
            setUseV3Spec(true);
            setCardDataV3(pendingJson);
        } else {
            setUseV3Spec(false);
            setCardDataV2(pendingJson);
        }
        setOverwriteConfirmation(false);
        setPendingJson(null)
    };

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

    const handlePromoteClick = (index) => {
        setPendingGreeting(index);
        setPromoteGreeting(true);
    };

    const handlePromoteGreeting = () => {
        if (useV3Spec) {
            const firstMes = cardDataV3.data.first_mes;
            const altGreetings = cardDataV3.data.alternate_greetings;
            const toPromote = altGreetings.splice(pendingGreeting, 1)
            altGreetings.unshift(firstMes);
            setCardDataV3((prevState) => ({
                ...prevState,
                data: {
                    ...prevState.data,
                    first_mes: toPromote,
                    alternate_greetings: altGreetings
                }
            }))
        } else {
            const firstMes = cardDataV2.data.first_mes;
            const altGreetings = cardDataV2.data.alternate_greetings;
            const toPromote = altGreetings.splice(pendingGreeting, 1)
            altGreetings.unshift(firstMes);
            setCardDataV2((prevState) => ({
                ...prevState,
                data: {
                    ...prevState.data,
                    first_mes: toPromote,
                    alternate_greetings: altGreetings
                }
            }))
        }
        setPromoteGreeting(false);
        setPendingGreeting(-1);
    };

    const handleRemoveFile = () => {
        setFile(null);
        setDeleteConfirmation(false);
        setPreview(default_avatar);
        setCardDataV2(v2CardPrototype);
        setCardDataV3(v3CardPrototype);
        setUseV3Spec(false);
    }

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    }

    const handleTextFieldChange = (e) => {
        const {name, value} = e.target;
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

    const toggleImageDisplay = () => {
        setDisplayImage(!displayImage);
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
            <ConfirmationDialog 
                open={deleteConfirmation} 
                handleClose={closeDeleteConfirmation} 
                dialogTitle="Clear all fields?" 
                dialogContent="Are you sure you want to clear all fields? This action cannot be undone."
                handleConfirm={handleRemoveFile}
            />
            <ConfirmationDialog
                open={overwriteConfirmation}
                handleClose={closeOverwriteConfirmation}
                dialogTitle="Overwrite with a JSON file?"
                dialogContent="Are you sure you want to overwrite the current fields with a different JSON file? This action cannot be undone."
                handleConfirm={handleOverwriteFile}
            />
            <ConfirmationDialog
                open={deleteGreetingConfirmation}
                handleClose={closeDeleteGreetingConfirmation}
                dialogTitle="Delete alternate greeting?"
                dialogContent={`Are you sure you want to delete Alt Greeting #${pendingGreeting}? This action cannot be undone.`}
                handleConfirm={handleDeleteAltGreeting}
            />
            <ConfirmationDialog
                open={promoteGreeting}
                handleClose={closePromoteGreeting}
                dialogTitle="Promote alternate greeting?"
                dialogContent={`Are you sure you want to promote Alt Greeting #${pendingGreeting} to the first message? The existing first message will be moved to Alternate Greeting #0's spot.`}
                handleConfirm={handlePromoteGreeting}
            />
            <Container disableGutters maxWidth={false} style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <FileUpload acceptedFileTypes={".json,.png"} file={file} fileChange={handleFileSelect} handleRemoveFile={handleDeleteClick}/>
                <FormControlLabel control={<Checkbox checked={displayImage} onChange={toggleImageDisplay}/>} label="Display image?"/>
                {file && 
                    <div>
                        <input accept={".json"} hidden id="json-upload" onChange={handleOverwriteClick} onClick={(event) => {event.target.value = null}} type="file"/>
                        <label htmlFor='json-upload'>
                            <Button component="span" variant="contained">Overwrite With JSON File</Button>
                        </label>
                    </div>
                }
                <Box style={{display:'flex', alignItems:'center'}}>
                    {theme.palette.mode === "dark" ? <LightModeOutlined/> : <LightMode/>}
                    <Switch checked={theme.palette.mode === "dark"} onChange={toggleTheme}/>
                    {theme.palette.mode === "dark" ? <DarkMode/> : <DarkModeOutlined/>}
                </Box>
            </Container>   
            <Paper elevation={6}>
                <Container disableGutters maxWidth={false} style={{display:"flex", height:"95vh"}}>
                    {displayImage && <Container disableGutters style={{alignItems:"center", display:"flex", flex:2, overflow:"auto"}} sx={{ml:2}}>
                        <img alt={file ? file.name : "No avatar loaded"} onClick={handlePreviewClick} src={preview} style={{cursor:'pointer', objectFit:'cover'}}/>
                        <input
                            accept=".png"
                            hidden
                            onChange={handlePreviewUpload}
                            ref={previewImageRef}
                            type="file"           
                        />
                    </Container>}
                    <Container disableGutters maxWidth={false} style={{display:"flex", flexDirection:"column", flex:5, margin:10, overflow:"auto"}}>
                        <Tabs onChange={handleTabChange} value={tabValue} sx={{mb:2}}>
                            <Tab id={0} label="v1 Spec Fields"/>
                            <Tab id={1} label="Alt Greetings"/>
                            <Tab id={2} label="Creator Metadata"/>
                            <Tab id={3} label="Prompts"/>
                        </Tabs>
                        {tabValue === 0 && charMetadataFields.map((field, index) => (
                            <CardTextField
                                key={field.fieldName.concat(index)} 
                                fieldName={field.fieldName} 
                                label={Object.hasOwn(field, "label") ? field.label : ""} 
                                multiline={Object.hasOwn(field, "multiline") ? field.multiline : false} 
                                rows={Object.hasOwn(field, "rows") ? field.rows : 1}
                                changeCallback={handleTextFieldChange} useV3Spec={useV3Spec} cardDataV2={cardDataV2} cardDataV3={cardDataV3}
                            />
                        ))}
                        {tabValue === 1 &&
                            <div>
                                <Button onClick={handleAddGreeting} variant="contained">Add new greeting</Button>
                                <DragDropContext onDragEnd={handleDragEnd}>
                                    <Droppable droppableId="droppable">
                                        {(provided) => (
                                            <Box
                                                {...provided.droppableProps}
                                                ref={provided.innerRef}
                                            >
                                                {(useV3Spec ? cardDataV3 :cardDataV2).data.alternate_greetings.map((text, index) => (
                                                    <Draggable key={`draggableGreeting#${index}`} draggableId={`draggableGreeting#${index}`} index={index}>
                                                        {(provided) => (
                                                            <Box 
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                style={{display:"flex"}}
                                                            >
                                                                <AltGreetingTextField
                                                                    key={(useV3Spec ? "altGreetingV3" : "altGreetingV2").concat(index)}
                                                                    greetingIndex={index}
                                                                    label={"Alternate Greeting #".concat(index)}
                                                                    fieldName={(useV3Spec ? "altGreetingV3" : "altGreetingV2").concat(index)}
                                                                    changeCallback={handleAltGreetingChange} useV3Spec={useV3Spec} cardDataV2={cardDataV2} cardDataV3={cardDataV3}
                                                                    style={{flex:9}}
                                                                />
                                                                <Tooltip title="Promote this greeting to first message"><IconButton onClick={() => handlePromoteClick(index)}><KeyboardDoubleArrowUp/></IconButton></Tooltip>
                                                                <Tooltip title="Delete this greeting"><IconButton aria-label="delete" color="error" onClick={() => handleAltGreetingClick(index)}><DeleteOutline/></IconButton></Tooltip>
                                                            </Box>
                                                        )}  
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                            </Box>
                                        )}
                                    </Droppable>
                                </DragDropContext>
                            </div>
                        }
                        {tabValue === 2 && creatorMetadataFields.map((field, index) => (
                            <CardTextField
                                key={field.fieldName.concat(index)}
                                fieldName={field.fieldName}
                                label={Object.hasOwn(field, "label") ? field.label : ""}
                                multiline={Object.hasOwn(field, "multiline") ? field.multiline : false}
                                rows={Object.hasOwn(field, "rows") ? field.rows : 1}
                                changeCallback={handleTextFieldChange} useV3Spec={useV3Spec} cardDataV2={cardDataV2} cardDataV3={cardDataV3}
                            />
                        ))}
                        {tabValue === 3 && promptFields.map((field, index) => (
                            <CardTextField
                                key={field.fieldName.concat(index)}
                                fieldName={field.fieldName}
                                label={Object.hasOwn(field, "label") ? field.label : ""}
                                multiline={Object.hasOwn(field, "multiline") ? field.multiline : false}
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