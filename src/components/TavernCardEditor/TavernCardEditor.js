import React, { useCallback, useEffect, useRef, useState } from 'react';
import debounce from "lodash.debounce";
import imageCompression from 'browser-image-compression';

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
    Tooltip
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
import { AltGreetingTabPanel, BasicFieldTabPanel, GroupGreetingPanel, LorebookPanel, MacrosPanel } from '../TabPanels/TabPanels';
import { useCard } from '../../context/CardContext';
import { v3CardPrototype } from '../../utils/v3CardPrototype';
import './TavernCardEditor.css';

const TavernCardEditor = ({toggleTheme}) => {
    const theme = useTheme();

    const { cardData, setCardData } = useCard();

    const previewImageRef = useRef(null);
    const [backfillEntriesConfirmation, setBackfillEntriesConfirmation] = useState(false)
    const [deleteConfirmation, setDeleteConfirmation] = useState(false);
    const [deleteEntryConfirmation, setDeleteEntryConfirmation] = useState(false);
    const [deleteGreetingConfirmation, setDeleteGreetingConfirmation] = useState(false);
    const [deleteGroupGreetingConfirmation, setDeleteGroupGreetingConfirmation] = useState(false);
    const [deleteLorebookConfirmation, setDeleteLorebookConfirmation] = useState(false);
    const [displayImage, setDisplayImage] = useState(true);
    const [file, setFile] = useState(localStorage.getItem("cardData") === null ? null : {name: JSON.parse(localStorage.getItem("cardData")).data.name});
    const [findReplaceConfirmation, setFindReplaceConfirmation] = useState(false);
    const [overwriteConfirmation, setOverwriteConfirmation] = useState(false);
    const [pendingEntry, setPendingEntry] = useState(-1);
    const [pendingGreeting, setPendingGreeting] = useState(-1);
    const [pendingGroupGreeting, setPendingGroupGreeting] = useState(-1)
    const [pendingFindReplace, setPendingFindReplace] = useState([]);
    const [pendingJson, setPendingJson] = useState(null);
    const [promoteGreeting, setPromoteGreeting] = useState(false);
    const [purgeAsterisksConfirmation, setPurgeAsterisksConfirmation] = useState(false);
    const [preview, setPreview] = useState(default_avatar);
    const [tabValue, setTabValue] = useState(0);

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
        const lorebookEntries = [...cardData.data.character_book.entries].map((entry) => {
            const newEntry = entry;
            if (newEntry.name === "" || !Object.hasOwn(newEntry, "name") || typeof newEntry.name === "undefined") newEntry.name = newEntry.comment;
            else newEntry.comment = newEntry.name;
            return newEntry
        });
        setCardData((prevState) => ({
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
        const outJson = inJson;
        if (!inJson.spec === "chara_card_v3" && !inJson.spec_version === "3.0"){
            outJson.spec = 'chara_card_v3';
        outJson.spec_version = '3.0';
        }
        const currTime = Math.floor(Date.now() / 1000);
        if (!Object.hasOwn(outJson.data, "creation_date") || typeof outJson.data.creation_date === "undefined") outJson.data.creation_date = currTime;
        outJson.data.modification_date = currTime;
        return outJson;
    };

    const closeDeleteGreetingConfirmation = () => {
        setDeleteGreetingConfirmation(false);
        setPendingGreeting(-1);
    };

    const closeFindReplaceConfirmation = () => {
        setFindReplaceConfirmation(false);
        setPendingFindReplace([]);
    };

    const closeGroupGreetingConfirmation = () => {
        setDeleteGroupGreetingConfirmation(false);
        setPendingGroupGreeting(-1);
    };

    const closeOverwriteConfirmation = () => {
        setOverwriteConfirmation(false);
        setPendingJson(null);
    };

    const closePromoteGreeting = () => {
        setPromoteGreeting(false);
        setPendingGreeting(-1);
    };

    async function convertBufferToBase64(arrayBuffer) {
        return new Promise((resolve) => {
            const blob = new Blob([arrayBuffer], {type: 'image/png'});
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result;
                resolve(base64String);
            }
            reader.readAsDataURL(blob);
        });
    }

    const handleAltGreetingClick = (index) => {
        setPendingGreeting(index);
        setDeleteGreetingConfirmation(true);
    };

    const handleDeleteAltGreeting = () => {
        const altGreetings = [...cardData.data.alternate_greetings];
        altGreetings.splice(pendingGreeting, 1);
        setCardData((prevState) => ({
            ...prevState,
            data: {
                ...prevState.data,
                alternate_greetings: altGreetings
            }
        }));
        setPendingGreeting(-1);
        setDeleteGreetingConfirmation(false);
    }

    const handleDeleteEntry = () => {
        const lorebookEntries = [...cardData.data.character_book.entries];
        lorebookEntries.splice(pendingEntry, 1);
        setCardData((prevState) => ({
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

    const handleDeleteEntryClick = (index) => {
        setPendingEntry(index);
        setDeleteEntryConfirmation(true);
    }

    const handleDeleteGroupGreeting = () => {
        const groupGreetings = [...cardData.data.group_only_greetings];
        groupGreetings.splice(pendingGroupGreeting, 1);
        setCardData((prevState) => ({
            ...prevState,
            data: {
                ...prevState.data,
                group_only_greetings: groupGreetings
            }
        }));
        setPendingGroupGreeting(-1);
        setDeleteGroupGreetingConfirmation(false);
    };

    const handleDeleteLorebook = () => {
        setCardData((prevState) => ({
            ...prevState,
            data: {
                ...prevState.data,
                character_book: undefined
            }
        }))
        setDeleteLorebookConfirmation(false);
    };

    async function handleFileSelect(event, importLorebook=false) {
        const selectedFile = event.target.files[0];
        if(!importLorebook) setFile(selectedFile);
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
                            setCardData(parsedCardData);
                            localStorage.setItem("cardData", JSON.stringify(parsedCardData));
                            console.log("V3 Card info found");
                            console.log(parsedCardData);
                            if (typeof parsedCardData.data.character_book !== "undefined" && parsedCardData.data.character_book.entries.length > 0)
                                scanLorebookEntryNames(parsedCardData.data.character_book.entries);
                            return;
                        } else if (readCardData[item].keyword === "chara"){
                            if (importLorebook && item === readCardData.length - 1 && item === readCardData.length - 1){
                                handleLorebookImportLogic(parsedCardData.data.character_book);
                                return;
                            }
                            console.log("V2 card info found");
                            if (typeof parsedCardData.data.character_book !== "undefined" && parsedCardData.data.character_book.entries.length > 0 && item === readCardData.length - 1){
                                setCardData(parsedCardData);
                                localStorage.setItem("cardData", JSON.stringify(parsedCardData));
                                scanLorebookEntryNames(parsedCardData.data.character_book.entries);
                            }
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
                    console.log(parsedCardData);
                    setCardData(parsedCardData);
                    localStorage.setItem("cardData", JSON.stringify(parsedCardData));
                    if (typeof parsedCardData.data.character_book !== "undefined" && parsedCardData.data.character_book.entries.length > 0)
                        scanLorebookEntryNames(parsedCardData.data.character_book.entries);
                }
            } else {
                console.log("This PNG doesn't have any Card Data!");
            }
        } else if (/.+\.json$/.test(selectedFile.name)){ 
            const parsedJson = JSON.parse(await selectedFile.text());
            if(Object.hasOwn(parsedJson, "spec") || Object.hasOwn(parsedJson, "name")){
                console.log(parsedJson);
                if (importLorebook){
                    handleLorebookImportLogic(parsedJson.spec==="lorebook_v3" ? parsedJson.data : parsedJson.data.character_book);
                    return;
                }
                if (parsedJson.spec === "lorebook_v3" && !importLorebook){
                    console.error("Uploaded file was a lorebook, not a card");
                    return;
                }
                setCardData(parsedJson);
                if (typeof parsedJson.data.character_book !== "undefined" && parsedJson.data.character_book.entries.length > 0)
                    scanLorebookEntryNames(parsedJson.data.character_book.entries);
            } else {
                console.error("Please upload a valid .json")
            }
        } else {
            console.error("Please upload a valid card file type (.png or .json)")
        }
    }

    const handleFindReplace = () => {
        const [toFind, toReplace] = pendingFindReplace;
        const newDescription = cardData.data.description.replaceAll(toFind, toReplace);
        const newPersonality = cardData.data.personality.replaceAll(toFind, toReplace);
        const newScenario = cardData.data.scenario.replaceAll(toFind, toReplace);
        const newGreeting = cardData.data.first_mes.replaceAll(toFind, toReplace);
        const newExample = cardData.data.mes_example.replaceAll(toFind, toReplace);
        const newAlternates = cardData.data.alternate_greetings.length > 0 ? [...cardData.data.alternate_greetings].map((greeting) => greeting.replaceAll(toFind, toReplace)) : []
        const newGropGreetings = cardData.data.group_only_greetings.length > 0 ? [...cardData.data.group_only_greetings].map((greeting) => greeting.replaceAll(toFind, toReplace)) : [];
        setCardData((prevState) => ({
            ...prevState,
            data: {
                ...prevState.data,
                description: newDescription,
                personality: newPersonality,
                scenario: newScenario,
                first_mes: newGreeting,
                mes_example: newExample,
                alternate_greetings: newAlternates,
                group_only_greetings: newGropGreetings
            }
        }));
        setFindReplaceConfirmation(false);
        setPendingFindReplace([]);
    }

    const handleFindReplaceClick = (toFind, toReplace) => {
        setPendingFindReplace([toFind, toReplace]);
        setFindReplaceConfirmation(true);
    };

    const handleGroupGreetingClick = (index) => {
        setPendingGroupGreeting(index);
        setDeleteGroupGreetingConfirmation(true);
    };

    const handleJsonDownload = () => {
        const outgoingJson = populateV3Fields(cardData);
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

    const handleLorebookDownload = () =>{
        const outgoingBook = cardData.data.character_book;
        const outgoingJson = {spec: "lorebook_v3", data: outgoingBook};
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

    const handleLorebookImportLogic = (newLorebook) => {
        setCardData((prevState) => ({
            ...prevState,
            data: {
                ...prevState.data,
                character_book: newLorebook
            }
        }))
        if (typeof newLorebook !== "undefined" && newLorebook.entries.length > 0)
            scanLorebookEntryNames(newLorebook.entries);
    };

    async function handleOverwriteClick(event) {
        const file = event.target.files[0];
        if (file) {
            const parsedJson = JSON.parse(await file.text());
            setPendingJson(parsedJson);
            setOverwriteConfirmation(true);
        }
    }

    const handleOverwriteFile = () => {
        setCardData(pendingJson);
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
            const outgoingV3 = populateV3Fields(cardData);
            const outgoingV2 = backfillV2Data(cardData);
            const assembledPng = await assembleNewPng(strippedPng, [{keyword:"ccv3", data:outgoingV3}, {keyword: "chara", data:outgoingV2}]);
            const blob = new Blob([assembledPng], { type: 'image/png' });

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${outgoingV3.data.name}.png`
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("There was an error retrieving the card's PNG: ", error)
        }
    }

    async function handlePreviewUpload (event) {
        const file = event.target.files[0];
        if (!file) return;
        if (file && file.type.startsWith("image/") && file.type !== "image/png") {
            const img = new Image();
            img.src = URL.createObjectURL(file);
            img.onload = async () => {
                const canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext("2d");

                ctx.drawImage(img, 0, 0);

                const base64String = canvas.toDataURL("image/png");
                const pngBlob = await (await fetch(base64String)).blob();
                // Compressing converted PNGs
                const compressedPngBlob = await imageCompression(pngBlob, {maxSizeMb: 1, useWebWorker: true});

                const comrpessedBase64Png = await imageCompression.getDataUrlFromFile(compressedPngBlob);

                setPreview(comrpessedBase64Png);
                localStorage.setItem("previewImage", comrpessedBase64Png);
            }
        }
        else if (file && file.type === "image/png") {
            try {
                const inputBuffer = await readToBuffer(file);
                const arrayBuffer = await stripPngChunks(inputBuffer);
                const pngBlob = new Blob([arrayBuffer], {type: "image/png"});
                const compressedPngBlob = await imageCompression(pngBlob, {maxSizeMb: 1, useWebWorker: true});

                const comrpessedBase64Png = await imageCompression.getDataUrlFromFile(compressedPngBlob);

                setPreview(comrpessedBase64Png);
                localStorage.setItem("previewImage", comrpessedBase64Png);
                //const base64String = await convertBufferToBase64(arrayBuffer);
                //setPreview(base64String);
                //localStorage.setItem("previewImage", base64String);
            } catch (error) {
                console.error("Error stripping PNG chunks and converting to base64: ", error);
            }
        } else {
            console.error("Invalid file type upload");
            return;
        }
    }

    const handlePromoteClick = (index) => {
        setPendingGreeting(index);
        setPromoteGreeting(true);
    };

    const handlePromoteGreeting = () => {
        const firstMes = cardData.data.first_mes;
        const altGreetings = [...cardData.data.alternate_greetings];
        const toPromote = altGreetings.splice(pendingGreeting, 1)
        altGreetings.unshift(firstMes);
        setCardData((prevState) => ({
            ...prevState,
            data: {
                ...prevState.data,
                first_mes: toPromote,
                alternate_greetings: altGreetings
            }
        }))
        setPromoteGreeting(false);
        setPendingGreeting(-1);
    };

    const handlePurgeAsterisks =() => {
        const asteriskRegex = /\*(.+?)\*/g;
        const newGreeting = cardData.data.first_mes.replace(asteriskRegex, '$1');
        const newExample = cardData.data.mes_example.replace(asteriskRegex, '$1');
        const newAlternates = cardData.data.alternate_greetings.length > 0 ? [...cardData.data.alternate_greetings].map((greeting) => greeting.replace(asteriskRegex, '$1')) : []
        const newGropGreetings = cardData.data.group_only_greetings.length > 0 ? [...cardData.data.group_only_greetings].map((greeting) => greeting.replace(asteriskRegex, '$1')) : [];
        setCardData((prevState) => ({
            ...prevState,
            data: {
                ...prevState.data,
                first_mes: newGreeting,
                mes_example: newExample,
                alternate_greetings: newAlternates,
                group_only_greetings: newGropGreetings
            }
        }));
        setPurgeAsterisksConfirmation(false);
    };

    const handleRemoveFile = () => {
        setFile(null);
        setDeleteConfirmation(false);
        setPreview(default_avatar);
        setCardData(v3CardPrototype());
        localStorage.setItem("cardData", JSON.stringify(v3CardPrototype()));
        localStorage.setItem("previewImage", default_avatar);
    };

    const readToBuffer = (infile) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsArrayBuffer(infile);
        });
    };

    const scanLorebookEntryNames = (lorebook) => {
        for (let i = 0; i < lorebook.length; i++){
            if (lorebook[i].name !== lorebook[i].comment && (lorebook[i].name === "" || lorebook[i].comment === "" || !Object.hasOwn(lorebook[i], "name") || !Object.hasOwn(lorebook[i], "comment"))){
                setBackfillEntriesConfirmation(true);
                return;
            }
        }
    };

    // eslint-disable-next-line
    const debouncedSave = useCallback(
        debounce((data) => {
            localStorage.setItem("cardData", JSON.stringify(data));
        }, 5000), []
    );

    useEffect(() => {
        if (cardData) {
            debouncedSave(cardData);
        }
    }, [cardData, debouncedSave]);

    useEffect(() => {
        (async () => {
            const pngRegex = /.+\.png$/;
            if (!file) {
                setPreview(default_avatar);
                return;
            }
            if (!pngRegex.test(file.name)){
                setPreview(default_avatar);
                return;
            }
            
            const inputBuffer = await readToBuffer(file);
            const strippedBuffer = await stripPngChunks(inputBuffer);
            const base64String = await convertBufferToBase64(strippedBuffer)
            setPreview(base64String);
            localStorage.setItem("previewImage", base64String)
        })()
    }, [file]);

    useEffect(() => {
        const storedPreviewImage = localStorage.getItem("previewImage");
        if (storedPreviewImage){
            setPreview(storedPreviewImage);
        }
    }, []);

    return(
        <Container maxWidth={false}>
            <ConfirmationDialog 
                open={deleteConfirmation} 
                handleClose={() => setDeleteConfirmation(false)} 
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
                dialogContent={`Are you sure you want to delete Alt Greeting #${pendingGreeting + 1}? This action cannot be undone.`}
                handleConfirm={handleDeleteAltGreeting}
            />
            <ConfirmationDialog
                open={promoteGreeting}
                handleClose={closePromoteGreeting}
                dialogTitle="Promote alternate greeting?"
                dialogContent={`Are you sure you want to promote Alt Greeting #${pendingGreeting + 1} to the first message? The existing first message will be moved to Alternate Greeting #0's spot.`}
                handleConfirm={handlePromoteGreeting}
            />
            <ConfirmationDialog
                open={deleteEntryConfirmation}
                handleClose={() => setDeleteEntryConfirmation(false)}
                dialogTitle="Delete lorebook entry?"
                dialogContent={`Are you sure you want to delete Lorebook Entry #${pendingEntry + 1}? This action cannot be undone.`}
                handleConfirm={handleDeleteEntry}
            />
            <ConfirmationDialog
                open={backfillEntriesConfirmation}
                handleClose={() => setBackfillEntriesConfirmation(false)}
                dialogTitle="Backfill lorebook entry names and comments?"
                dialogContent={"The names and comments in your lorebook entries are mismatched. Would you like to backfill empty entries? Only the names and comments will be altered."}
                handleConfirm={backfillLorebookNames}
            />
            <ConfirmationDialog
                open={deleteGroupGreetingConfirmation}
                handleClose={closeGroupGreetingConfirmation}
                dialogTitle="Delete this group only greeting?"
                dialogContent={`Are you sure you want to delete Group Only Greeting #${pendingGroupGreeting + 1}? This action cannot be undone.`}
                handleConfirm={handleDeleteGroupGreeting}
            />
            <ConfirmationDialog 
                open={deleteLorebookConfirmation}
                handleClose={() => setDeleteLorebookConfirmation(false)}
                dialogTitle="Delete this lorebook"
                dialogContent={"Are you sure you want to delete this lorebook? This action cannot be undone."}
                handleConfirm={handleDeleteLorebook}
            />
            <ConfirmationDialog 
                open={purgeAsterisksConfirmation}
                handleClose={() => setPurgeAsterisksConfirmation(false)}
                dialogTitle="Purge asterisks from greetings?"
                dialogContent={"Are you sure you want to purge asterisks from all greetings? This macro should be used at your own risk as it does not discriminate and it cannot be undone."}
                handleConfirm={handlePurgeAsterisks}
            />
            <ConfirmationDialog
                open={findReplaceConfirmation}
                handleClose={closeFindReplaceConfirmation}
                dialogTitle="Find and replace the text provided?"
                dialogContent="Are you sure you want to find and replace the text you've provided? This will replace the specified text in the Description, Personality, Scenario, and ALL greetings. Note that there is no logic and is a quick and dirty find-and-replace. This action cannot be undone."
                handleConfirm={handleFindReplace}
            />
            <Container disableGutters maxWidth={false} style={{display:'flex', justifyContent:'space-between', alignItems:'center', overflow:"auto"}}>
                <FileUpload acceptedFileTypes={".json,.png"} displayDeleteButton={true} file={file} fileChange={handleFileSelect} handleRemoveFile={() => setDeleteConfirmation(true)}/>
                <FormControlLabel control={<Checkbox checked={displayImage} onChange={() => setDisplayImage(!displayImage)}/>} label="Display image?" style={{whiteSpace:"nowrap"}}/>
                {file && 
                    <div>
                        <input accept={".json"} hidden id="json-upload" onChange={handleOverwriteClick} onClick={(event) => {event.target.value = null}} type="file"/>
                        <label htmlFor='json-upload'>
                            <Tooltip title="Overwrite the contents of this card with a JSON while retaining the display picture">
                                <Button component="span" style={{whiteSpace: "nowrap"}} variant="contained">Overwrite With JSON File</Button>
                            </Tooltip>
                        </label>
                    </div>
                }
                <Box style={{display:'flex', alignItems:'center'}}>
                    {theme.palette.mode === "dark" ? <LightModeOutlined/> : <LightMode/>}
                    <Switch checked={theme.palette.mode === "dark"} onChange={toggleTheme}/>
                    {theme.palette.mode === "dark" ? <DarkMode/> : <DarkModeOutlined/>}
                </Box>
            </Container>
            <Container disableGutters maxWidth={false}> 
                <Paper elevation={6} style={{width:"100%"}}>
                    <Container disableGutters maxWidth={false} style={{display:"flex", height:"95vh"}}>
                        {displayImage && <Container disableGutters style={{alignItems:"center", display:"flex", flex:2, overflow:"auto"}} sx={{ml:2}}>
                            <img alt={file ? file.name : "No avatar loaded"} onClick={() => previewImageRef.current.click()} src={preview} style={{cursor:'pointer', objectFit:'cover', width: "100%", height: "100%"}}/>
                            <input
                                accept="image/*"
                                hidden
                                onChange={handlePreviewUpload}
                                ref={previewImageRef}
                                type="file"           
                            />
                        </Container>}
                        <Container disableGutters maxWidth={false} style={{display:"flex", flexDirection:"column", flex:5, margin:10, overflow:"auto"}}>
                            <Tabs onChange={(event, newValue) => setTabValue(newValue)} value={tabValue} scrollButtons="auto" sx={{mb:2}} variant="scrollable">
                                <Tab id={0} label="v1 Spec Fields"/>
                                <Tab id={1} label="Alt Greetings"/>
                                <Tab id={2} label="Creator Metadata"/>
                                <Tab id={3} label="Prompts"/>
                                <Tab id={4} label="Lorebook"/>
                                <Tab id={5} label="Group Greetings"/>
                                <Tab id={6} label="Macros"/>
                            </Tabs>
                            <BasicFieldTabPanel
                                curTab={tabValue}
                                index={0}
                                arrayToIterate={charMetadataFields}
                            />
                            <AltGreetingTabPanel
                                curTab={tabValue}
                                index={1}
                                handleAltGreetingClick={handleAltGreetingClick}
                                handlePromoteClick={handlePromoteClick}
                            />
                            <BasicFieldTabPanel
                                curTab={tabValue}
                                index={2}
                                arrayToIterate={creatorMetadataFields}
                            />
                            <BasicFieldTabPanel
                                curTab={tabValue}
                                index={3}
                                arrayToIterate={promptFields}

                            />
                            <LorebookPanel
                                curTab={tabValue}
                                index={4}
                                handleDeleteEntryClick={handleDeleteEntryClick}
                                handleDeleteLorebookClick={() => setDeleteLorebookConfirmation(true)}
                                handleLorebookDownload={handleLorebookDownload}
                                handleImport={(event) => handleFileSelect(event, true)}
                            />
                            <GroupGreetingPanel
                                curTab={tabValue}
                                index={5}
                                handleGroupGreetingClick={handleGroupGreetingClick}
                            />
                            <MacrosPanel
                                curTab={tabValue}
                                index={6}
                                handlePurgeClick={() => setPurgeAsterisksConfirmation(true)}
                                handleFindReplaceClick={(val1, val2) => handleFindReplaceClick(val1, val2)}
                            />
                            <Container disableGutters maxWidth={false} style={{display:"flex", justifyContent:'space-between'}}>
                                <Button onClick={handleJsonDownload} variant="contained">Download as JSON</Button>
                                <Button onClick={handlePngDownload} variant="contained">Download as PNG</Button>
                            </Container>
                        </Container>
                    </Container>
                </Paper>
            </Container>  
        </Container>
    );
}

export default TavernCardEditor;