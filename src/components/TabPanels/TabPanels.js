import { 
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    IconButton,
    Tooltip 
} from "@mui/material";
import { ArrowDropDown, DeleteOutline, DragHandle, KeyboardDoubleArrowUp } from "@mui/icons-material";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";

import AltGreetingTextField, { GroupGreetingTextField } from "../AltGreetingTextField/AltGreetingTextField";
import CardTextField from "../CardTextField/CardTextField";
import { LorebookEntryBool, LorebookEntryInt, LorebookEntryString, LorebookMetaBool, LorebookMetaInt, LorebookMetaString } from "../LorebookTextFields/LorebookTextFields";
import { v2CharacterBookEntryPrototype, v2CharacterBookPrototype } from "../../utils/v2CardPrototype";
import { v3CharacterBookPrototype, v3CharacterBookEntryPrototype } from "../../utils/v3CardPrototype";

export function BasicFieldTabPanel ({curTab, index, arrayToIterate, useV3Spec, cardToEdit, cardSetter}) {
    const handleTextFieldChange = (e) => {
        const {name, value} = e.target;
        cardSetter((prevState) => ({
            ...prevState,
            data: {
                ...prevState.data,
                [name]: value
            }
        }));
    };

    const handleTagChange = (e) => {
        const {name, value} = e.target;
        cardSetter((prevState) => ({
            ...prevState,
            data: {
                ...prevState.data,
                [name]: value.split(",")
            }
        }));
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
                    changeCallback={field.fieldName === "tags" ? handleTagChange : handleTextFieldChange} cardToEdit={cardToEdit}
                />
            ))}
        </div>
    );
}

export function AltGreetingTabPanel({curTab, index, handleAltGreetingClick, handlePromoteClick, useV3Spec, cardToEdit, cardSetter}) {
    const handleAddGreeting = () => {
        const altGreetingArray = cardToEdit.data.alternate_greetings;
        altGreetingArray.push("");
        cardSetter((prevState) => ({
            ...prevState,
            data: {
                ...prevState.data,
                alternate_greetings: altGreetingArray
            }
        }));
    }

    const handleAltGreetingChange = (e) => {
        const {name, value} = e.target;
        const index = name.match(/altGreetingV[23](\d+)/)[1];
        cardSetter((prevState) => ({
            ...prevState,
            data: {
                ...prevState.data,
                alternate_greetings: prevState.data.alternate_greetings.map((greeting, i) => i === parseInt(index, 10) ? value : greeting)
            }
        }))
    };

    const handleDragEnd = (result) => {
        if (!result.destination) return;

        const items = cardToEdit.data.alternate_greetings;
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0 , reorderedItem);

        cardSetter((prevState) => ({
            ...prevState,
            data: {
                ...prevState.data,
                alternate_greetings: items
            }
        }))
    };

    return(
        <div hidden={curTab !== index}>
            <Button onClick={handleAddGreeting} variant="contained" sx={{mb:1}}>Add new greeting</Button>
            <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="droppable">
                    {(provided) => (
                        <Box
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            sx={{mb:1}}
                        >
                            {cardToEdit.data.alternate_greetings.map((text, index) => (
                                <Draggable key={`draggableGreeting#${index}`} draggableId={`draggableGreeting#${index}`} index={index}>
                                    {(provided) => (
                                        <Box 
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            style={{display:"flex", ...provided.draggableProps.style}}
                                        >
                                            <Tooltip title="Drag to reorder">
                                                <IconButton {...provided.dragHandleProps}><DragHandle/></IconButton>
                                            </Tooltip>
                                            <Accordion style={{width:'100%'}} sx={{mb:2, mt:2}}>
                                                <AccordionSummary expandIcon={<ArrowDropDown/>}>
                                                    {"Alternate Greeting #".concat(index)}
                                                </AccordionSummary>
                                                <AccordionDetails>
                                                    <AltGreetingTextField
                                                        key={(useV3Spec ? "altGreetingV3" : "altGreetingV2").concat(index)}
                                                        greetingIndex={index}
                                                        label={"Alternate Greeting #".concat(index)}
                                                        fieldName={(useV3Spec ? "altGreetingV3" : "altGreetingV2").concat(index)}
                                                        changeCallback={handleAltGreetingChange} useV3Spec={useV3Spec} cardToEdit={cardToEdit}
                                                        style={{flex:9}}
                                                    />
                                                </AccordionDetails>
                                            </Accordion>
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
    );
}

export function LorebookPanel({curTab, index, handleDeleteEntryClick, handleDeleteLorebookClick, handleLorebookDownload, useV3Spec, cardToEdit, cardSetter, handleImport}){
    const addLorebook = () => {
        cardSetter((prevState) => ({
            ...prevState,
            data: {
                ...prevState.data,
                character_book: useV3Spec ? v3CharacterBookPrototype() : v2CharacterBookPrototype()
            }
        }))
    }

    const addLoreBookEntry = () => {
        const blankEntry = useV3Spec ? v3CharacterBookEntryPrototype() : v2CharacterBookEntryPrototype();
        const lorebookEntryArray = cardToEdit.data.character_book.entries;
        lorebookEntryArray.push(blankEntry);
        cardSetter((prevState) => ({
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

    const handleDragEnd = (result) => {
        if (!result.destination) return;

        const items = cardToEdit.data.character_book.entries;
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        cardSetter((prevState) => ({
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

    const handleEntryChange = (e) => {
        const {name, value} = e.target;
        const regexMatches = name.match(/^([^\d]+)#([\d]+)/);
        const fieldName = regexMatches[1];
        const index = parseInt(regexMatches[2], 10);
        const items = cardToEdit.data.character_book.entries;
        const [alteredItem] = items.splice(index, 1);
        if (fieldName === "name") {
            alteredItem.name = value;
            alteredItem.comment = value;
        } else {
            alteredItem[fieldName] = (/^\d+$/.test(value) ? parseInt(value, 10) : value);
        }
        items.splice(index, 0, alteredItem);

        cardSetter((prevState) => ({
            ...prevState,
            data: {
                ...prevState.data,
                character_book:{
                    ...prevState.data.character_book,
                    entries: items
                }
            }
        }));
    }

    const handleEntryKeysChange = (e) => {
        const {name, value} = e.target;
        const keys = value.split(",")
        const regexMatches = name.match(/^([^\d]+)#([\d]+)/);
        const fieldName = regexMatches[1];
        const index = parseInt(regexMatches[2], 10);
        const items = cardToEdit.data.character_book.entries;
        const [alteredItem] = items.splice(index, 1);
        alteredItem[fieldName] = keys;
        items.splice(index, 0, alteredItem);

        cardSetter((prevState) => ({
            ...prevState,
            data: {
                ...prevState.data,
                character_book: {
                    ...prevState.data.character_book,
                    entries: items
                }
            }
        }))
    }

    const handleMetaFieldChange = (e) => {
        const {name, value} = e.target;
        cardSetter((prevState) => ({
            ...prevState,
            data: {
                ...prevState.data,
                character_book:{
                    ...prevState.data.character_book,
                    [name]: (/^\d+$/.test(value) ? parseInt(value, 10) : value)
                }
            }
        }));
    };

    return(
        <div hidden={curTab !== index}>
            {typeof cardToEdit.data.character_book === "undefined" ?
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
                            useV3Spec={useV3Spec} cardToEdit={cardToEdit} cardSetter={cardSetter}
                        />
                        <Tooltip title="Delete this lorebook">
                            <IconButton aria-label="delete" color="error" onClick={handleDeleteLorebookClick}><DeleteOutline/></IconButton>
                        </Tooltip>
                    </Box>
                    <LorebookMetaString
                        fieldName="description"
                        changeCallback={handleMetaFieldChange}
                        cardToEdit={cardToEdit}
                    />
                    <Box style={{alignItems:'baseline', display:'flex'}} sx={{gap:2}}>
                        <LorebookMetaInt
                            label="Lorebook Scan Depth"
                            fieldName="scan_depth"
                            changeCallback={handleMetaFieldChange}
                            cardToEdit={cardToEdit}
                        />
                        <LorebookMetaInt
                            label="Lorebook Token Budget"
                            fieldName="token_budget"
                            changeCallback={handleMetaFieldChange}
                            cardToEdit={cardToEdit}
                        />
                        <LorebookMetaBool
                            label="Lorebook Recursive Scanning"
                            fieldName="recursive_scanning"
                            changeCallback={handleMetaFieldChange}
                            cardToEdit={cardToEdit}
                        />
                        <Button onClick={handleLorebookDownload} variant="contained">Download Lorebook</Button>
                    </Box>
                    <Button variant="contained" onClick={addLoreBookEntry} sx={{mb:1}}>Add new lorebook entry</Button>
                    {cardToEdit.data.character_book.entries.length === 0 ? <div></div>:
                        <DragDropContext onDragEnd={handleDragEnd}>
                            <Droppable droppableId="droppableLorebook">
                                {(provided) => (
                                    <Box
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                    >
                                        {cardToEdit.data.character_book.entries.map((text, index) => (
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
                                                        <Accordion style={{width:'100%'}} sx={{mb:2, mt:2}}>
                                                            <AccordionSummary expandIcon={<ArrowDropDown/>}>
                                                                {`Entry #${index}`}
                                                            </AccordionSummary>
                                                            <AccordionDetails>
                                                                <Box style={{width:'100%'}}>
                                                                    <Box style={{display:'flex', flexDirection:'row', alignItems:'baseline'}}>
                                                                        <LorebookEntryString
                                                                            label={`Entry #${index} Name/Comment`}
                                                                            fieldName="name"
                                                                            entryIndex={index}
                                                                            changeCallback={handleEntryChange}
                                                                            cardToEdit={cardToEdit}
                                                                        />
                                                                        <LorebookEntryBool
                                                                            label={`Entry #${index} Enabled`}
                                                                            fieldName="enabled"
                                                                            entryIndex={index}
                                                                            changeCallback={handleEntryChange}
                                                                            cardToEdit={cardToEdit}
                                                                        />
                                                                    </Box>
                                                                    <Box style={{display:"flex", flexDirection:'row', alignItems:'baseline'}}>
                                                                        <LorebookEntryString
                                                                            label={`Entry #${index} Keys`}
                                                                            fieldName="keys"
                                                                            entryIndex={index}
                                                                            changeCallback={handleEntryKeysChange}
                                                                            cardToEdit={cardToEdit}
                                                                        />
                                                                        <LorebookEntryBool
                                                                            label={`Must Also Match Secondary Keys?`}
                                                                            fieldName="selective"
                                                                            entryIndex={index}
                                                                            changeCallback={handleEntryChange}
                                                                            cardToEdit={cardToEdit}
                                                                        />
                                                                        <LorebookEntryString
                                                                            label={`Entry #${index} Secondary Keys`}
                                                                            fieldName="secondary_keys"
                                                                            entryIndex={index}
                                                                            changeCallback={handleEntryKeysChange}
                                                                            cardToEdit={cardToEdit}
                                                                        />
                                                                    </Box>
                                                                    <Box style={{display:"flex", flexDirection:'row', alignItems:'baseline', justifyContent:'space-between'}}>
                                                                        <LorebookEntryInt
                                                                            label={`Entry #${index} Insertion Order`}
                                                                            fieldName="insertion_order"
                                                                            entryIndex={index}
                                                                            changeCallback={handleEntryChange}
                                                                            cardToEdit={cardToEdit}
                                                                        />
                                                                        <LorebookEntryBool
                                                                            label="Case Sensitive?"
                                                                            fieldName="case_sensitive"
                                                                            entryIndex={index}
                                                                            changeCallback={handleEntryChange}
                                                                            cardToEdit={cardToEdit}
                                                                        />
                                                                        <LorebookEntryInt
                                                                            label={`Entry #${index} Priority`}
                                                                            fieldName="priority"
                                                                            entryIndex={index}
                                                                            changeCallback={handleEntryChange}
                                                                            cardToEdit={cardToEdit}
                                                                        />
                                                                        <LorebookEntryBool
                                                                            label="Is this entry always active?"
                                                                            fieldName="constant"
                                                                            entryIndex={index}
                                                                            changeCallback={handleEntryChange}
                                                                            cardToEdit={cardToEdit}
                                                                        />
                                                                    </Box>
                                                                    <LorebookEntryString
                                                                        label={`Entry #${index} Content`}
                                                                        fieldName="content"
                                                                        entryIndex={index}
                                                                        changeCallback={handleEntryChange}
                                                                        rows={3}
                                                                        cardToEdit={cardToEdit}
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

export function GroupGreetingPanel({curTab, index, handleGroupGreetingClick, useV3Spec, cardToEdit, cardSetter}){
    const handleAddGroupGreeting = () => {
        const groupGreetingArray = cardToEdit.data.group_only_greetings;
        groupGreetingArray.push("");
        cardSetter((prevState) => ({
            ...prevState,
            data: {
                ...prevState.data,
                group_only_greetings: groupGreetingArray
            }
        }));
    }

    const handleGroupGreetingChange = (e) => {
        const {name, value} = e.target;
        const index = name.match(/groupGreetingV[23](\d+)/)[1];
        cardSetter((prevState) => ({
            ...prevState,
            data: {
                ...prevState.data,
                group_only_greetings: prevState.data.group_only_greetings.map((greeting, i) => i === parseInt(index, 10) ? value : greeting)
            }
        }))
    };

    const handleDragEnd = (result) => {
        if (!result.destination) return;

        const items = cardToEdit.data.group_only_greetings;
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0 , reorderedItem);

        cardSetter((prevState) => ({
            ...prevState,
            data: {
                ...prevState.data,
                group_only_greetings: items
            }
        }))
    };

    return(
        <div hidden={curTab !== index}>
            <Button onClick={handleAddGroupGreeting} variant="contained" sx={{mb:1}}>Add new greeting</Button>
            <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="droppableGroupGreeting">
                    {(provided) => (
                        <Box
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            sx={{mb:1}}
                        >
                            {cardToEdit.data.group_only_greetings.map((text, index) => (
                                <Draggable key={`draggableGroupGreeting#${index}`} draggableId={`draggableGroupGreeting#${index}`} index={index}>
                                    {(provided) => (
                                        <Box 
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            style={{display:"flex", ...provided.draggableProps.style}}
                                        >
                                            <Tooltip title="Drag to reorder">
                                                <IconButton {...provided.dragHandleProps}><DragHandle/></IconButton>
                                            </Tooltip>
                                            <Accordion style={{width:'100%'}} sx={{mb:2, mt:2}}>
                                                <AccordionSummary expandIcon={<ArrowDropDown/>}>
                                                    {"Group Greeting #".concat(index)}
                                                </AccordionSummary>
                                                <AccordionDetails>
                                                    <GroupGreetingTextField
                                                        key={(useV3Spec ? "groupGreetingV3" : "groupGreetingV2").concat(index)}
                                                        greetingIndex={index}
                                                        label={"Group Only Greeting #".concat(index)}
                                                        fieldName={(useV3Spec ? "groupGreetingV3" : "groupGreetingV2").concat(index)}
                                                        changeCallback={handleGroupGreetingChange} useV3Spec={useV3Spec} cardToEdit={cardToEdit}
                                                        style={{flex:9}}
                                                    />
                                                </AccordionDetails>
                                            </Accordion>
                                            <Tooltip title="Delete this greeting"><IconButton aria-label="delete" color="error" onClick={() => handleGroupGreetingClick(index)}><DeleteOutline/></IconButton></Tooltip>
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