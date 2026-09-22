import { useCallback, useEffect, useRef, useState } from "react";
import debounce from "lodash.debounce";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    Box,
    Button,
    IconButton,
    TextField,
    Tooltip,
    Typography
} from "@mui/material";
import { ArrowDropDown, DeleteOutline, DragHandle, KeyboardDoubleArrowUp } from "@mui/icons-material";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";

import AltGreetingTextField, { GroupGreetingTextField } from "../AltGreetingTextField/AltGreetingTextField";
import CardTextField from "../CardTextField/CardTextField";
import { LorebookEntryBool, LorebookEntryInt, LorebookEntryString, LorebookMetaBool, LorebookMetaInt, LorebookMetaString } from "../LorebookTextFields/LorebookTextFields";
import { useCard } from "../../context/CardContext";
import normalizeCardData from "../../utils/normalizeCardData";
import { v3CharacterBookPrototype, v3CharacterBookEntryPrototype } from "../../utils/v3CardPrototype";

export function BasicFieldTabPanel ({curTab, index, arrayToIterate}) {
    const { setCardData } = useCard();

    // eslint-disable-next-line
    const debouncedSetCardData = useCallback(
        debounce((name, value) => {
            setCardData((prevState) => ({
                ...prevState,
                data: {
                    ...prevState.data,
                    [name]: value,
                }
            }));
        }, 300),
        [setCardData]
    );

    const handleTextFieldChange = (e) => {
        const {name, value} = e.target;
        debouncedSetCardData(name, value);
    };

    const handleTagChange = (e) => {
        const {name, value} = e.target;
        debouncedSetCardData(name, value.split(","));
    }

    return(
        <div hidden={curTab !== index}>
            {arrayToIterate.map((field, index) => (
                <CardTextField
                    key={field.fieldName.concat(index)} 
                    fieldName={field.fieldName} 
                    label={Object.hasOwn(field, "label") ? field.label : ""} 
                    multiline={Object.hasOwn(field, "multiline") ? field.multiline : false} 
                    rows={Object.hasOwn(field, "rows") ? field.rows : 1}
                    changeCallback={field.fieldName === "tags" ? handleTagChange : handleTextFieldChange}
                />
            ))}
        </div>
    );
}

/**
 * Shared reorderable-list panel for the two "list of greeting strings" fields
 * (alternate_greetings and group_only_greetings), which otherwise differ only in which
 * field they edit, their text/id labels, and whether a "promote" action is offered.
 *
 * @param {int} curTab Currently selected tab index
 * @param {int} index This panel's tab index
 * @param {string} fieldName Card data field to edit ("alternate_greetings" or "group_only_greetings")
 * @param {string} namePrefix Prefix used to build each field's unique name/key (e.g. "altGreeting")
 * @param {string} droppableId Unique id for the dnd Droppable
 * @param {string} accordionLabelPrefix Text prefixed to (index+1) for the accordion header
 * @param {string} fieldLabelPrefix Text prefixed to (index+1) for the text field's label
 * @param {*} TextFieldComponent Greeting text field component (AltGreetingTextField or GroupGreetingTextField)
 * @param {*} handleDeleteClick Called with the greeting's index when its delete button is clicked
 * @param {*} [handlePromoteClick] If provided, renders a "promote to first message" button per greeting
 */
function GreetingListPanel({curTab, index, fieldName, namePrefix, droppableId, accordionLabelPrefix, fieldLabelPrefix, TextFieldComponent, handleDeleteClick, handlePromoteClick}) {
    const { cardData, setCardData } = useCard();
    const [expanded, setExpanded] = useState([]);

    const greetings = cardData.data[fieldName];

    const handleAddGreeting = () => {
        setCardData((prevState) => ({
            ...prevState,
            data: {
                ...prevState.data,
                [fieldName]: [...prevState.data[fieldName], ""]
            }
        }))
    };

    const handleAccordionChange = (panel) => (event, isExpanded) => {
        setExpanded((prevExpanded) =>
            isExpanded ? [...prevExpanded, panel] : prevExpanded.filter((p) => p !== panel)
        );
    };

    const handleGreetingChange = (e) => {
        const {name, value} = e.target;
        const greetingIndex = name.match(new RegExp(`${namePrefix}(\\d+)`))[1];
        setCardData((prevState) => ({
            ...prevState,
            data: {
                ...prevState.data,
                [fieldName]: prevState.data[fieldName].map((greeting, i) => i === parseInt(greetingIndex, 10) ? value : greeting)
            }
        }));
    };

    const handleDragEnd = (result) => {
        if (!result.destination) return;

        const items = [...greetings];
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0 , reorderedItem);

        setCardData((prevState) => ({
            ...prevState,
            data: {
                ...prevState.data,
                [fieldName]: items
            }
        }));

        setExpanded((prevExpanded) =>
            prevExpanded.map((panel) => {
                if (panel === result.source.index) return result.destination.index;
                if (panel > result.source.index && panel <= result.destination.index) return panel - 1;
                if (panel < result.source.index && panel >= result.destination.index) return panel + 1;
                return panel;
            })
        );
    };

    return(
        <div hidden={curTab !== index}>
            <Button onClick={handleAddGreeting} variant="contained" sx={{mb:1}}>Add new greeting</Button>
            <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId={droppableId}>
                    {(provided) => (
                        <Box
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            sx={{mb:1}}
                        >
                            {greetings.map((text, greetingIndex) => (
                                <Draggable key={`draggable${droppableId}#${greetingIndex}`} draggableId={`draggable${droppableId}#${greetingIndex}`} index={greetingIndex}>
                                    {(provided) => (
                                        <Box
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            style={{display:"flex", ...provided.draggableProps.style}}
                                        >
                                            <Tooltip title="Drag to reorder">
                                                <IconButton {...provided.dragHandleProps}><DragHandle/></IconButton>
                                            </Tooltip>
                                            <Accordion expanded={expanded.includes(greetingIndex)} onChange={handleAccordionChange(greetingIndex)} slotProps={{transition: {unmountOnExit: true}}} style={{width:'100%'}} sx={{mb:2, mt:2}}>
                                                <AccordionSummary expandIcon={<ArrowDropDown/>}>
                                                    {accordionLabelPrefix.concat(greetingIndex+1)}
                                                </AccordionSummary>
                                                <AccordionDetails>
                                                    <TextFieldComponent
                                                        key={namePrefix.concat(greetingIndex)}
                                                        greetingIndex={greetingIndex}
                                                        label={fieldLabelPrefix.concat(greetingIndex+1)}
                                                        fieldName={namePrefix.concat(greetingIndex)}
                                                        changeCallback={handleGreetingChange}
                                                        style={{flex:9}}
                                                    />
                                                </AccordionDetails>
                                            </Accordion>
                                            {handlePromoteClick &&
                                                <Tooltip title="Promote this greeting to first message"><IconButton onClick={() => handlePromoteClick(greetingIndex)}><KeyboardDoubleArrowUp/></IconButton></Tooltip>
                                            }
                                            <Tooltip title="Delete this greeting"><IconButton aria-label="delete" color="error" onClick={() => handleDeleteClick(greetingIndex)}><DeleteOutline/></IconButton></Tooltip>
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
    );
}

export function AltGreetingTabPanel({curTab, index, handleAltGreetingClick, handlePromoteClick}) {
    return(
        <GreetingListPanel
            curTab={curTab}
            index={index}
            fieldName="alternate_greetings"
            namePrefix="altGreeting"
            droppableId="droppableGreeting"
            accordionLabelPrefix="Alternate Greeting #"
            fieldLabelPrefix="Alternate Greeting #"
            TextFieldComponent={AltGreetingTextField}
            handleDeleteClick={handleAltGreetingClick}
            handlePromoteClick={handlePromoteClick}
        />
    );
}

export function LorebookPanel({curTab, index, handleDeleteEntryClick, handleDeleteLorebookClick, handleLorebookDownload, handleImport}){
    const { cardData, setCardData } = useCard();
    const [expanded, setExpanded] = useState([]);

    const addLorebook = () => {
        setCardData((prevState) => ({
            ...prevState,
            data: {
                ...prevState.data,
                character_book: v3CharacterBookPrototype()
            }
        }))
    }

    const addLoreBookEntry = () => {
        const blankEntry = v3CharacterBookEntryPrototype();
        const lorebookEntryArray = [...cardData.data.character_book.entries];
        lorebookEntryArray.push(blankEntry);
        setCardData((prevState) => ({
            ...prevState,
            data: {
                ...prevState.data,
                character_book: {
                    ...prevState.data.character_book,
                    entries: lorebookEntryArray
                }
            }
        }));
    }

    const handleAccordionChange = (panel) => (event, isExpanded) => {
        setExpanded((prevExpanded) =>
            isExpanded ? [...prevExpanded, panel] : prevExpanded.filter((p) => p !== panel)
        );
    };

    const handleDragEnd = (result) => {
        if (!result.destination) return;

        const items = [...cardData.data.character_book.entries];
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setCardData((prevState) => ({
            ...prevState,
            data: {
                ...prevState.data,
                character_book: {
                    ...prevState.data.character_book,
                    entries: items
                }
            }
        }));
        
        setExpanded((prevExpanded) =>
            prevExpanded.map((panel) => {
                if (panel === result.source.index) return result.destination.index;
                if (panel > result.source.index && panel <= result.destination.index) return panel - 1;
                if (panel < result.source.index && panel >= result.destination.index) return panel + 1;
                return panel;
            })
        );
    };

    const handleEntryChange = (e) => {
        const {name, value} = e.target;
        const regexMatches = name.match(/^([^\d]+)#([\d]+)/);
        const fieldName = regexMatches[1];
        const index = parseInt(regexMatches[2], 10);
        const items = [...cardData.data.character_book.entries];
        const [oldItem] = items.splice(index, 1);
        const alteredItem = {...oldItem};
        if (fieldName === "name") {
            alteredItem.name = value;
            alteredItem.comment = value;
        } else {
            alteredItem[fieldName] = (/^\d+$/.test(value) ? parseInt(value, 10) : value);
        }
        items.splice(index, 0, alteredItem);

        setCardData((prevState) => ({
            ...prevState,
            data: {
                ...prevState.data,
                character_book: {
                    ...prevState.data.character_book,
                    entries: items
                }
            }
        }));
    };

    const handleEntryKeysChange = (e) => {
        const {name, value} = e.target;
        const keys = value.split(",")
        const regexMatches = name.match(/^([^\d]+)#([\d]+)/);
        const fieldName = regexMatches[1];
        const index = parseInt(regexMatches[2], 10);
        const items = [...cardData.data.character_book.entries];
        const [oldItem] = items.splice(index, 1);
        const alteredItem = {...oldItem, [fieldName]: keys};
        items.splice(index, 0, alteredItem);

        setCardData((prevState) => ({
            ...prevState,
            data: {
                ...prevState.data,
                character_book: {
                    ...prevState.data.character_book,
                    entries: items
                }
            }
        }));
    };

    const handleMetaFieldChange = (e) => {
        const {name, value} = e.target;
        setCardData((prevState) => ({
            ...prevState,
            data: {
                ...prevState.data,
                character_book: {
                    ...prevState.data.character_book,
                    [name]: (/^\d+$/.test(value) ? parseInt(value, 10) : value)
                }
            }
        }));
    };

    return(
        <div hidden={curTab !== index}>
            {typeof cardData.data.character_book === "undefined" ?
                <Box sx={{mb:2}}>
                    
                    <Button variant="contained" onClick={addLorebook} sx={{mr:2}}>Attach new lorebook to card</Button>
                    <input accept=".json,.png" hidden id="import-lorebook" onChange={handleImport} onClick={(event) => {event.target.value = null}} type="file"/>
                    <Tooltip title="You can import from a card or standalone lorebook">
                        <label htmlFor="import-lorebook">
                            <Button component="span" variant="contained">Import Existing Lorebook</Button>
                        </label>
                    </Tooltip>
                </Box> :
                <Box sx={{mb:2}}>
                    <Box style={{display:'flex'}} sx={{gap:2}}>
                        <LorebookMetaString
                            fieldName="name"
                            changeCallback={handleMetaFieldChange}
                        />
                        <Tooltip title="Delete this lorebook">
                            <IconButton aria-label="delete" color="error" onClick={handleDeleteLorebookClick}><DeleteOutline/></IconButton>
                        </Tooltip>
                    </Box>
                    <LorebookMetaString
                        fieldName="description"
                        changeCallback={handleMetaFieldChange}
                    />
                    <Box style={{alignItems:'baseline', display:'flex'}} sx={{gap:2}}>
                        <LorebookMetaInt
                            label="Lorebook Scan Depth"
                            fieldName="scan_depth"
                            changeCallback={handleMetaFieldChange}
                        />
                        <LorebookMetaInt
                            label="Lorebook Token Budget"
                            fieldName="token_budget"
                            changeCallback={handleMetaFieldChange}
                        />
                        <LorebookMetaBool
                            label="Lorebook Recursive Scanning"
                            fieldName="recursive_scanning"
                            changeCallback={handleMetaFieldChange}
                        />
                        <Button onClick={handleLorebookDownload} variant="contained">Download Lorebook</Button>
                    </Box>
                    <Button variant="contained" onClick={addLoreBookEntry} sx={{mb:1}}>Add new lorebook entry</Button>
                    {cardData.data.character_book.entries.length === 0 ? <div></div>:
                        <DragDropContext onDragEnd={handleDragEnd}>
                            <Droppable droppableId="droppableLorebook">
                                {(provided) => (
                                    <Box
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                    >
                                        {cardData.data.character_book.entries.map((entry, index) => (
                                            <Draggable key={`draggableLorebookEntry#${index}`} draggableId={`draggableLorebookEntry#${index}`} index={index}>
                                                {(provided) => (
                                                    <Box
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        style={{display:"flex", ...provided.draggableProps.style}}
                                                    >
                                                        <Tooltip title="Drag to reorder">
                                                            <IconButton {...provided.dragHandleProps}><DragHandle/></IconButton>
                                                        </Tooltip>
                                                        <Accordion expanded={expanded.includes(index)} onChange={handleAccordionChange(index)} slotProps={{transition: {unmountOnExit:true}}} style={{width:'100%'}} sx={{mb:2, mt:2}}>
                                                            <AccordionSummary expandIcon={<ArrowDropDown/>}>
                                                                {entry.name || entry.comment || `Lorebook Entry #${index+1}`}
                                                            </AccordionSummary>
                                                            <AccordionDetails>
                                                                <Box style={{width:'100%'}}>
                                                                    <Box style={{display:'flex', flexDirection:'row', alignItems:'baseline'}}>
                                                                        <LorebookEntryString
                                                                            label={`Entry #${index+1} Name/Comment`}
                                                                            fieldName="name"
                                                                            entryIndex={index}
                                                                            changeCallback={handleEntryChange}
                                                                        />
                                                                        <LorebookEntryBool
                                                                            label={`Entry #${index+1} Enabled`}
                                                                            fieldName="enabled"
                                                                            entryIndex={index}
                                                                            changeCallback={handleEntryChange}
                                                                        />
                                                                    </Box>
                                                                    <Box style={{display:"flex", flexDirection:'row', alignItems:'baseline'}}>
                                                                        <LorebookEntryString
                                                                            label={`Entry #${index+1} Keys`}
                                                                            fieldName="keys"
                                                                            entryIndex={index}
                                                                            changeCallback={handleEntryKeysChange}
                                                                        />
                                                                        <LorebookEntryBool
                                                                            label={`Must Also Match Secondary Keys?`}
                                                                            fieldName="selective"
                                                                            entryIndex={index}
                                                                            changeCallback={handleEntryChange}
                                                                        />
                                                                        <LorebookEntryString
                                                                            label={`Entry #${index+1} Secondary Keys`}
                                                                            fieldName="secondary_keys"
                                                                            entryIndex={index}
                                                                            changeCallback={handleEntryKeysChange}
                                                                        />
                                                                    </Box>
                                                                    <Box style={{display:"flex", flexDirection:'row', alignItems:'baseline', justifyContent:'space-between'}}>
                                                                        <LorebookEntryInt
                                                                            label={`Entry #${index+1} Insertion Order`}
                                                                            fieldName="insertion_order"
                                                                            entryIndex={index}
                                                                            changeCallback={handleEntryChange}
                                                                        />
                                                                        <LorebookEntryBool
                                                                            label="Case Sensitive?"
                                                                            fieldName="case_sensitive"
                                                                            entryIndex={index}
                                                                            changeCallback={handleEntryChange}
                                                                        />
                                                                        <LorebookEntryInt
                                                                            label={`Entry #${index+1} Priority`}
                                                                            fieldName="priority"
                                                                            entryIndex={index}
                                                                            changeCallback={handleEntryChange}
                                                                        />
                                                                        <LorebookEntryBool
                                                                            label="Is this entry always active?"
                                                                            fieldName="constant"
                                                                            entryIndex={index}
                                                                            changeCallback={handleEntryChange}
                                                                        />
                                                                    </Box>
                                                                    <LorebookEntryString
                                                                        label={`Entry #${index+1} Content`}
                                                                        fieldName="content"
                                                                        entryIndex={index}
                                                                        changeCallback={handleEntryChange}
                                                                        rows={3}
                                                                    />
                                                                </Box>
                                                            </AccordionDetails>
                                                        </Accordion>
                                                        <Tooltip title="Delete this lorebook entry">
                                                            <IconButton aria-label="delete" color="error" onClick={() => handleDeleteEntryClick(index)}><DeleteOutline/></IconButton>
                                                        </Tooltip>
                                                    </Box>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </Box>
                                )}
                            </Droppable>
                        </DragDropContext>
                    }
                </Box>
            }
        </div>
    )
}

export function GroupGreetingPanel({curTab, index, handleGroupGreetingClick}){
    return(
        <GreetingListPanel
            curTab={curTab}
            index={index}
            fieldName="group_only_greetings"
            namePrefix="groupGreeting"
            droppableId="droppableGroupGreeting"
            accordionLabelPrefix="Group Greeting #"
            fieldLabelPrefix="Group Only Greeting #"
            TextFieldComponent={GroupGreetingTextField}
            handleDeleteClick={handleGroupGreetingClick}
        />
    );
}

export function MacrosPanel({curTab, index, handlePurgeClick, handleFindReplaceClick}){
    const toFindRef = useRef('');
    const toReplaceRef = useRef('');

    return(
        <div hidden={curTab !== index}>
            <Box sx={{margin:2}}>
                <Tooltip title="Remove ALL asterisks from ALL greeting fields">
                    <Button onClick={handlePurgeClick} variant="contained">Purge Asterisks</Button>
                </Tooltip>
                <Box style={{alignItems:"center", display:"flex", gap:4}} sx={{mt:2}}>
                    <TextField inputRef={toFindRef} label="Text to find" size="small" sx={{width:"15em"}}/>
                    <TextField inputRef={toReplaceRef} label="Text to use as replacement" size="small" sx={{width:"15em"}}/>
                    <Tooltip title="Find and replace given text in the Description, Personality, Scenario, and ALL greeting fields">
                        <Button onClick={() => handleFindReplaceClick(toFindRef.current.value, toReplaceRef.current.value)} variant="contained">Find and Replace</Button>
                    </Tooltip>
                </Box>
            </Box>
        </div>
    );
}

/**
 * Power-user escape hatch: view and directly edit the card's raw JSON. Local-only until
 * "Apply Changes" is clicked, so typing invalid/incomplete JSON along the way never touches
 * card state. Applying re-validates through the same normalizeCardData used for uploads, then
 * hands the result to onApply (the parent shows a confirmation and actually applies it, reusing
 * the same flow as "Overwrite With JSON File").
 *
 * @param {int} curTab Currently selected tab index
 * @param {int} index This panel's tab index
 * @param {*} onApply Called with the normalized card object once the edited JSON validates
 */
export function RawJsonPanel({curTab, index, onApply}) {
    const { cardData } = useCard();
    const [rawJsonText, setRawJsonText] = useState(() => JSON.stringify(cardData, null, 2));
    const [dirty, setDirty] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!dirty) setRawJsonText(JSON.stringify(cardData, null, 2));
    }, [cardData, dirty]);

    const handleChange = (e) => {
        setRawJsonText(e.target.value);
        setDirty(true);
        setError(null);
    };

    const handleReset = () => {
        setRawJsonText(JSON.stringify(cardData, null, 2));
        setDirty(false);
        setError(null);
    };

    const handleApplyClick = () => {
        let parsedJson;
        try {
            parsedJson = JSON.parse(rawJsonText);
        } catch (err) {
            setError(`Invalid JSON: ${err.message}`);
            return;
        }
        const result = normalizeCardData(parsedJson);
        if (!result.ok) {
            setError(result.error);
            return;
        }
        setError(null);
        setDirty(false);
        onApply(result.cardData);
    };

    return(
        <div hidden={curTab !== index}>
            <Box sx={{mb:1, display:"flex", alignItems:"center", gap:2}}>
                <Tooltip title="Validate and apply the JSON below to the card, after confirmation">
                    <Button onClick={handleApplyClick} variant="contained">Apply Changes</Button>
                </Tooltip>
                <Button disabled={!dirty} onClick={handleReset} variant="outlined">Reset</Button>
                {dirty && <Typography color="text.secondary" variant="body2">Unapplied changes</Typography>}
            </Box>
            {error && <Alert severity="error" sx={{mb:1}}>{error}</Alert>}
            <TextField
                autoComplete="off"
                fullWidth
                multiline
                onChange={handleChange}
                rows={20}
                slotProps={{htmlInput: {style: {fontFamily:"monospace", fontSize:"0.85em", resize:"vertical"}}}}
                value={rawJsonText}
            />
        </div>
    );
}