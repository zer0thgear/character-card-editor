import React, { useEffect, useRef, useState } from 'react';

import {
    Button,
    Box,
    Checkbox,
    Container,
    FormControlLabel,
    //IconButton,
    Paper,
    //TextField,
    Switch,
    Tab,
    Tabs,
    //Tooltip
    //Typography
} from '@mui/material'
import { DarkMode, DarkModeOutlined, LightMode, LightModeOutlined } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles'

import ConfirmationDialog from '../ConfirmationDialog/ConfirmationDialog';
import default_avatar from '../../assets/default_avatar.png';
import FileUpload from '../FileUpload/FileUpload';
import assembleNewPng from '../../utils/assembleNewPng';
import parsePngChunks from '../../utils/parsePngChunks';
import stripPngChunks from '../../utils/stripPngChunks';
import { AltGreetingTabPanel, BasicFieldTabPanel, GroupGreetingPanel, LorebookPanel } from '../TabPanels/TabPanels';
import { v2CardPrototype, } from '../../utils/v2CardPrototype';
import { v3CardPrototype } from '../../utils/v3CardPrototype';
import './TavernCardEditor.css';

const TavernCardEditor = ({toggleTheme}) => {
    const theme = useTheme();

    const previewImageRef = useRef(null);
    const [cardDataV2, setCardDataV2] = useState(v2CardPrototype());
    const [cardDataV3, setCardDataV3] = useState(v3CardPrototype());
    const [backfillEntriesConfirmation, setBackfillEntriesConfirmation] = useState(false)
    const [deleteConfirmation, setDeleteConfirmation] = useState(false);
    const [deleteEntryConfirmation, setDeleteEntryConfirmation] = useState(false);
    const [deleteGreetingConfirmation, setDeleteGreetingConfirmation] = useState(false);
    const [deleteGroupGreetingConfirmation, setDeleteGroupGreetingConfirmation] = useState(false);
    const [displayImage, setDisplayImage] = useState(true);
    const [file, setFile] = useState();
    const [overwriteConfirmation, setOverwriteConfirmation] = useState(false);
    const [pendingEntry, setPendingEntry] = useState(-1);
    const [pendingGreeting, setPendingGreeting] = useState(-1);
    const [pendingGroupGreeting, setPendingGroupGreeting] = useState(-1)
    const [pendingJson, setPendingJson] = useState(null);
    const [promoteGreeting, setPromoteGreeting] = useState(false);
    const [preview, setPreview] = useState(default_avatar);
    const [saveAsV3Spec, setSaveAsV3Spec] = useState(false)
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
        {fieldName: "tags", label: "Tags (Comma separated, no quotes)", multiline:true}
    ];

    const promptFields = [
        {fieldName: "system_prompt", label: "System Prompt", multiline:true, rows:5},
        {fieldName: "post_history_instructions", label: "Post History Instructions", multiline:true, rows:5}
    ]

    const backfillV2Data = (inJson) => {
        if (inJson.spec === "chara_card_v2" && inJson.spec_version === "2.0") return inJson;
        const outJson = inJson;
        outJson.spec = 'chara_card_v2';
        outJson.spec_version = '2.0';
        return outJson;
    };

    const backfillLorebookNames = () => {
        const lorebookEntries = (useV3Spec ? cardDataV3 : cardDataV2).data.character_book.entries.map((entry) => {
            const newEntry = entry;
            if (newEntry.name === "" || !Object.hasOwn(newEntry, "name")) newEntry.name = newEntry.comment;
            else newEntry.comment = newEntry.name;
            return newEntry
        });
        (useV3Spec ? setCardDataV3 : setCardDataV2)((prevState) => ({
            ...prevState,
            data: {
                ...prevState.data,
                character_book: {
                    ...prevState.data.character_book,
                    entries: lorebookEntries
                }
            }
        }))
        setBackfillEntriesConfirmation(false);
    };

    const populateV3Fields = (inJson) => {
        if (inJson.spec === "chara_card_v3" && inJson.spec_version === "3.0") return inJson;
        const outJson = inJson;
        outJson.spec = 'chara_card_v3';
        outJson.spec_version = '3.0';
        const currTime = Math.floor(Date.now() / 1000);
        if (!Object.hasOwn(outJson.data, "creation_date") || typeof outJson.data.creation_date === "undefined") outJson.data.creation_date = currTime;
        outJson.data.modification_date = currTime;
        return outJson;
    };

    const closeBackfillConfirmation = () => {
        setBackfillEntriesConfirmation(false);
    };

    const closeDeleteConfirmation = () => {
        setDeleteConfirmation(false);
    };

    const closeDeleteEntryConfirmation = () => {
        setDeleteEntryConfirmation(false);
    };

    const closeDeleteGreetingConfirmation = () => {
        setDeleteGreetingConfirmation(false);
        setPendingGreeting(-1);
    };

    const closeGroupGreetingConfirmation = () => {
        setDeleteGroupGreetingConfirmation(false);
    };

    const closeOverwriteConfirmation = () => {
        setOverwriteConfirmation(false);
        setPendingJson(null);
    };

    const closePromoteGreeting = () => {
        setPromoteGreeting(false);
        setPendingGreeting(-1);
    };

    const handleAltGreetingClick = (index) => {
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

    const handleDeleteEntry = () => {
        const lorebookEntries = (useV3Spec ? cardDataV3 : cardDataV2).data.character_book.entries;
        lorebookEntries.splice(pendingEntry, 1);
        (useV3Spec ? setCardDataV3 : setCardDataV2)((prevState) => ({
            ...prevState,
            data: {
                ...prevState.data,
                character_book: {
                    ...prevState.data.character_book,
                    entries: lorebookEntries
                }
            }
        }));
        setPendingEntry(-1);
        setDeleteEntryConfirmation(false);
    }

    const handleDeleteClick = () => {
        setDeleteConfirmation(true);
    };

    const handleDeleteEntryClick = (index) => {
        setPendingEntry(index);
        setDeleteEntryConfirmation(true);
    }

    const handleDeleteGroupGreeting = () => {
        const groupGreetings = (useV3Spec ? cardDataV3 : cardDataV2).data.group_only_greetings;
        groupGreetings.splice(pendingGroupGreeting, 1);
        (useV3Spec ? setCardDataV3 : setCardDataV3)((prevState) => ({
            ...prevState,
            data: {
                ...prevState.data,
                group_only_greetings: groupGreetings
            }
        }));
        setPendingGroupGreeting(-1);
        setDeleteGroupGreetingConfirmation(false);
    };

    async function handleFileSelect(event, importLorebook=false) {
        const selectedFile = event.target.files[0];
        setFile(selectedFile);
        if (/.+\.png$/.test(selectedFile.name)){
            const readCardData = await parsePngChunks(selectedFile, ["ccv3", "chara"]);
            if (readCardData) {
                if (readCardData.length >= 2) {
                    for (let item = 0; item < readCardData.length; item++){
                        const parsedCardData = readCardData[item].data;
                        if (!Object.hasOwn(parsedCardData.data, "group_only_greetings")) parsedCardData.data.group_only_greetings = [];
                        if (readCardData[item].keyword === "ccv3"){
                            if (importLorebook){
                                handleLorebookImportLogic(parsedCardData.data.character_book);
                                return;
                            }
                            setCardDataV3(parsedCardData);
                            console.log("V3 Card info found");
                            console.log(parsedCardData);
                            if (typeof parsedCardData.data.character_book !== "undefined" && parsedCardData.data.character_book.entries.length > 0)
                                scanLorebookEntryNames(parsedCardData.data.character_book.entries);
                            setUseV3Spec(true);
                        } else if (readCardData[item].keyword === "chara"){
                            if (importLorebook && item === readCardData.length - 1 && !useV3Spec){
                                handleLorebookImportLogic(parsedCardData.data.character_book);
                                return;
                            }
                            console.log("V2 card info found");
                            setCardDataV2(parsedCardData);
                            if (typeof parsedCardData.data.character_book !== "undefined" && parsedCardData.data.character_book.entries.length > 0 && item === readCardData.length - 1 && !useV3Spec)
                                scanLorebookEntryNames(parsedCardData.data.character_book.entries);
                            console.log(parsedCardData);
                        }
                    }
                }
                else {
                    const parsedCardData = readCardData[0].data;
                    if (!Object.hasOwn(parsedCardData.data, "group_only_greetings")) parsedCardData.data.group_only_greetings = [];
                    if (importLorebook){
                        handleLorebookImportLogic(parsedCardData.data.character_book);
                        return;
                    }
                    console.log(`Only ${readCardData[0].keyword === "ccv3" ? "V3" : "V2"} Card info found`);
                    setUseV3Spec(readCardData[0].keyword === "ccv3");
                    console.log(parsedCardData);
                    (readCardData[0].keyword === "ccv3" ? setCardDataV3 : setCardDataV2)(parsedCardData);
                    if (typeof parsedCardData.data.character_book !== "undefined" && parsedCardData.data.character_book.entries.length > 0)
                        scanLorebookEntryNames(parsedCardData.data.character_book.entries);
                }
            } else {
                console.log("This PNG doesn't have any Card Data!");
            }
        } else { 
            const parsedJson = JSON.parse(await selectedFile.text());
            console.log(parsedJson);
            if (importLorebook){
                handleLorebookImportLogic(parsedJson.data.character_book);
                return;
            }
            setUseV3Spec(parsedJson.spec === "chara_card_v3");
            (parsedJson.spec === "chara_card_v3" ? setCardDataV3 : setCardDataV2)(parsedJson);
            if (typeof parsedJson.data.character_book !== "undefined" && parsedJson.data.character_book.entries.length > 0)
                scanLorebookEntryNames(parsedJson.data.character_book.entries);
        }
    }

    const handleGroupGreetingClick = (index) => {
        setPendingGroupGreeting(index);
        setDeleteGroupGreetingConfirmation(true);
    };

    const handleJsonDownload = () => {
        const outgoingJson = (saveAsV3Spec ? populateV3Fields : backfillV2Data)(useV3Spec ? cardDataV3 : cardDataV2);
        const blob = new Blob([JSON.stringify(outgoingJson, null, 4)], { type: 'application/json' });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${outgoingJson.data.name}.json`
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        URL.revokeObjectURL(url);
    };

    const handleLorebookImport = (event) => {
        handleFileSelect(event, true);
    }

    const handleLorebookImportLogic = (newLorebook) => {
        (useV3Spec ? setCardDataV3 : setCardDataV2)((prevState) => ({
            ...prevState,
            data: {
                ...prevState.data,
                character_book: newLorebook
            }
        }))
        if (typeof newLorebook !== "undefined" && newLorebook.entries.length > 0)
            scanLorebookEntryNames(newLorebook.entries);
    }

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
        scanLorebookEntryNames(pendingJson.data.character_book.entries);
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
            const outgoingJson = (saveAsV3Spec ? populateV3Fields : backfillV2Data)(useV3Spec ? cardDataV3 : cardDataV2);
            const assembledPng = await assembleNewPng(strippedPng, saveAsV3Spec ? [{keyword:"ccv3", data:outgoingJson}] : {keyword:"chara", data:outgoingJson});
            const blob = new Blob([assembledPng], { type: 'image/png' });

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${outgoingJson.data.name}.png`
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
        setCardDataV2(v2CardPrototype());
        setCardDataV3(v3CardPrototype());
        setUseV3Spec(false);
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const scanLorebookEntryNames = (lorebook) => {
        for (let i = 0; i < lorebook.length; i++){
            if (lorebook[i].name !== lorebook[i].comment && (lorebook[i].name === "" || lorebook[i].comment === "" || !Object.hasOwn(lorebook[i], "name") || !Object.hasOwn(lorebook[i], "comment"))){
                setBackfillEntriesConfirmation(true);
                return;
            }
        }
    };

    const toggleImageDisplay = () => {
        setDisplayImage(!displayImage);
    };

    const toggleSaveAsV3 = () => {
        setSaveAsV3Spec(!saveAsV3Spec);
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
            <ConfirmationDialog
                open={deleteEntryConfirmation}
                handleClose={closeDeleteEntryConfirmation}
                dialogTitle="Delete lorebook entry?"
                dialogContent={`Are you sure you want to delete Lorebook Entry #${pendingEntry}? This action cannot be undone.`}
                handleConfirm={handleDeleteEntry}
            />
            <ConfirmationDialog
                open={backfillEntriesConfirmation}
                handleClose={closeBackfillConfirmation}
                dialogTitle="Backfill lorebook entry names and comments?"
                dialogContent={"The names and comments in your lorebook entries are mismatched. Would you like to backfill empty entries? Only the names and comments will be altered."}
                handleConfirm={backfillLorebookNames}
            />
            <ConfirmationDialog
                open={deleteGroupGreetingConfirmation}
                handleClose={closeGroupGreetingConfirmation}
                dialogTitle="Delete this group only greeting?"
                dialogContent={`Are you sure you want to delete Group Only Greeting #${pendingGroupGreeting}? This action cannot be undone.`}
                handleConfirm={handleDeleteGroupGreeting}
            />
            <Container disableGutters maxWidth={false} style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <FileUpload acceptedFileTypes={".json,.png"} displayDeleteButton={true} file={file} fileChange={handleFileSelect} handleRemoveFile={handleDeleteClick}/>
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
                    Save as V2 spec <Switch checked={saveAsV3Spec} onChange={toggleSaveAsV3}/> Save as V3 spec
                </Box>
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
                            <Tab id={4} label="Lorebook"/>
                            <Tab id={5} label="Group Greetings"/>
                        </Tabs>
                        <BasicFieldTabPanel
                            curTab={tabValue}
                            index={0}
                            arrayToIterate={charMetadataFields}
                            cardToEdit={useV3Spec ? cardDataV3 : cardDataV2}
                            cardSetter={useV3Spec ? setCardDataV3 : setCardDataV2}
                            useV3Spec={useV3Spec}
                        />
                        <AltGreetingTabPanel
                            curTab={tabValue}
                            index={1}
                            handleAltGreetingClick={handleAltGreetingClick}
                            handlePromoteClick={handlePromoteClick}
                            cardToEdit={useV3Spec ? cardDataV3 : cardDataV2}
                            cardSetter={useV3Spec ? setCardDataV3 : setCardDataV2}
                            useV3Spec={useV3Spec}
                        />
                        <BasicFieldTabPanel
                            curTab={tabValue}
                            index={2}
                            arrayToIterate={creatorMetadataFields}
                            cardToEdit={useV3Spec ? cardDataV3 : cardDataV2}
                            cardSetter={useV3Spec ? setCardDataV3 : setCardDataV2}
                            useV3Spec={useV3Spec}
                        />
                        <BasicFieldTabPanel
                            curTab={tabValue}
                            index={3}
                            arrayToIterate={promptFields}
                            cardToEdit={useV3Spec ? cardDataV3 : cardDataV2}
                            cardSetter={useV3Spec ? setCardDataV3 : setCardDataV2}
                            useV3Spec={useV3Spec}
                        />
                        <LorebookPanel
                            curTab={tabValue}
                            index={4}
                            handleDeleteEntryClick={handleDeleteEntryClick}
                            cardToEdit={useV3Spec ? cardDataV3 : cardDataV2}
                            cardSetter={useV3Spec ? setCardDataV3 : setCardDataV2}
                            useV3Spec={useV3Spec} handleImport={handleLorebookImport}
                        />
                        <GroupGreetingPanel
                            curTab={tabValue}
                            index={5}
                            handleGroupGreetingClick={handleGroupGreetingClick}
                            cardToEdit={useV3Spec ? cardDataV3 : cardDataV2}
                            cardSetter={useV3Spec ? setCardDataV3 : setCardDataV2}
                            useV3Spec={useV3Spec}
                        />
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