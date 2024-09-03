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

import AltGreetingTextField from "../AltGreetingTextField/AltGreetingTextField";
import CardTextField from "../CardTextField/CardTextField";
import { LorebookEntryBool, LorebookEntryString, LorebookMetaBool, LorebookMetaInt, LorebookMetaString } from "../LorebookTextFields/LorebookTextFields";
import { v2CharacterBookEntryPrototype, v2CharacterBookPrototype } from "../../utils/v2CardPrototype";
import { v3CharacterBookPrototype, v3CharacterBookEntryPrototype } from "../../utils/v3CardPrototype";

export function BasicFieldTabPanel ({curTab, index, arrayToIterate, useV3Spec, cardDataV2, cardDataV3, setCardDataV2, setCardDataV3}) {
    const handleTextFieldChange = (e) => {
        const {name, value} = e.target;
        setCardDataV2((prevState) => ({
            ...prevState,
            data: {
                ...prevState.data,
                [name]: value
            }
        }));
        setCardDataV3((prevState) => ({
            ...prevState,
            data: {
                ...prevState.data,
                [name]: value
            }
        }));
    };

    const handleTagChange = (e) => {
        const {name, value} = e.target;
        setCardDataV2((prevState) => ({
            ...prevState,
            data: {
                ...prevState.data,
                [name]: value.split(",")
            }
        }));
        setCardDataV3((prevState) => ({
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
                changeCallback={field.fieldName === "tags" ? handleTagChange : handleTextFieldChange} useV3Spec={useV3Spec} cardDataV2={cardDataV2} cardDataV3={cardDataV3}
            />
            ))}
        </div>
    );
}

export function AltGreetingTabPanel({curTab, index, handleAltGreetingClick, handlePromoteClick, useV3Spec, cardDataV2, cardDataV3, setCardDataV2, setCardDataV3}) {
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
                            {(useV3Spec ? cardDataV3 :cardDataV2).data.alternate_greetings.map((text, index) => (
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
                                                        changeCallback={handleAltGreetingChange} useV3Spec={useV3Spec} cardDataV2={cardDataV2} cardDataV3={cardDataV3}
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

export function LorebookPanel({curTab, index, handleDeleteEntryClick, useV3Spec, cardDataV2, cardDataV3, setCardDataV2, setCardDataV3}){
    const addLorebook = () => {
        (useV3Spec ? setCardDataV3 : setCardDataV2)((prevState) => ({
            ...prevState,
            data: {
                ...prevState.data,
                character_book: useV3Spec ? v3CharacterBookPrototype() : v2CharacterBookPrototype()
            }
        }))
    }

    const addLoreBookEntry = () => {
        const blankEntry = useV3Spec ? v3CharacterBookEntryPrototype() : v2CharacterBookEntryPrototype();
        const lorebookEntryArray = (useV3Spec ? cardDataV3 : cardDataV2).data.character_book.entries;
        lorebookEntryArray.push(blankEntry);
        (useV3Spec ? setCardDataV3 : setCardDataV2)((prevState) => ({
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

        const items = (useV3Spec ? cardDataV3 : cardDataV2).data.character_book.entries;
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        (useV3Spec ? setCardDataV3 : setCardDataV2)((prevState) => ({
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
        const items = (useV3Spec ? cardDataV3 : cardDataV2).data.character_book.entries;
        const [alteredItem] = items.splice(index, 1);
        if (fieldName === "name") {
            alteredItem.name = value;
            alteredItem.comment = value;
        } else {
            alteredItem[fieldName] = (/^\d+$/.test(value) ? parseInt(value, 10) : value);
        }
        items.splice(index, 0, alteredItem);

        (useV3Spec ? setCardDataV3 : setCardDataV2)((prevState) => ({
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
        const items = (useV3Spec ? cardDataV3 : cardDataV2).data.character_book.entries;
        const [alteredItem] = items.splice(index, 1);
        alteredItem[fieldName] = keys;
        items.splice(index, 0, alteredItem);

        (useV3Spec ? setCardDataV3 : setCardDataV2)((prevState) => ({
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
        (useV3Spec ? setCardDataV3 : setCardDataV2)((prevState) => ({
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
            {typeof (useV3Spec ? cardDataV3 : cardDataV2).data.character_book === "undefined" ?
                <Box sx={{mb:2}}>
                    <Button variant="contained" onClick={addLorebook}>Attach new lorebook to card</Button>
                </Box> :
                <Box sx={{mb:2}}>
                    <LorebookMetaString
                        fieldName="name"
                        changeCallback={handleMetaFieldChange}
                        useV3Spec={useV3Spec} cardDataV2={cardDataV2} cardDataV3={cardDataV3}
                    />
                    <LorebookMetaString
                        fieldName="description"
                        changeCallback={handleMetaFieldChange}
                        useV3Spec={useV3Spec} cardDataV2={cardDataV2} cardDataV3={cardDataV3}
                    />
                    <Box style={{alignItems:'baseline', display:'flex'}} sx={{gap:2}}>
                        <LorebookMetaInt
                            label="Lorebook Scan Depth"
                            fieldName="scan_depth"
                            changeCallback={handleMetaFieldChange}
                            useV3Spec={useV3Spec} cardDataV2={cardDataV2} cardDataV3={cardDataV3}
                        />
                        <LorebookMetaInt
                            label="Lorebook Token Budget"
                            fieldName="token_budget"
                            changeCallback={handleMetaFieldChange}
                            useV3Spec={useV3Spec} cardDataV2={cardDataV2} cardDataV3={cardDataV3}
                        />
                        <LorebookMetaBool
                            label="Lorebook Recursive Scanning"
                            fieldName="recursive_scanning"
                            changeCallback={handleMetaFieldChange}
                            useV3Spec={useV3Spec} cardDataV2={cardDataV2} cardDataV3={cardDataV3}
                        />
                    </Box>
                    <Button variant="contained" onClick={addLoreBookEntry} sx={{mb:1}}>Add new lorebook entry</Button>
                    {(useV3Spec ? cardDataV3 : cardDataV2).data.character_book.entries.length === 0 ? <div></div>:
                        <DragDropContext onDragEnd={handleDragEnd}>
                            <Droppable droppableId="droppableLorebook">
                                {(provided) => (
                                    <Box
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                    >
                                        {(useV3Spec ? cardDataV3 : cardDataV2).data.character_book.entries.map((text, index) => (
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
                                                                    <Box>
                                                                        <LorebookEntryString
                                                                            label={`Entry #${index} Name/Comment`}
                                                                            fieldName="name"
                                                                            entryIndex={index}
                                                                            changeCallback={handleEntryChange}
                                                                            useV3Spec={useV3Spec} cardDataV2={cardDataV2} cardDataV3={cardDataV3}
                                                                        />
                                                                    </Box>
                                                                    <Box style={{display:"flex", flexDirection:'row', alignItems:'baseline'}}>
                                                                        <LorebookEntryString
                                                                            label={`Entry #${index} Keys`}
                                                                            fieldName="keys"
                                                                            entryIndex={index}
                                                                            changeCallback={handleEntryKeysChange}
                                                                            useV3Spec={useV3Spec} cardDataV2={cardDataV2} cardDataV3={cardDataV3}
                                                                        />
                                                                        <LorebookEntryBool
                                                                            label={`Entry #${index} Selective`}
                                                                            fieldName="selective"
                                                                            entryIndex={index}
                                                                            changeCallback={handleEntryChange}
                                                                            useV3Spec={useV3Spec} cardDataV2={cardDataV2} cardDataV3={cardDataV3}
                                                                        />
                                                                        <LorebookEntryString
                                                                            label={`Entry #${index} Secondary Keys`}
                                                                            fieldName="secondary_keys"
                                                                            entryIndex={index}
                                                                            changeCallback={handleEntryChange}
                                                                            useV3Spec={useV3Spec} cardDataV2={cardDataV2} cardDataV3={cardDataV3}
                                                                        />
                                                                    </Box>
                                                                    <LorebookEntryString
                                                                        label={`Entry #${index} Content`}
                                                                        fieldName="content"
                                                                        entryIndex={index}
                                                                        changeCallback={handleEntryChange}
                                                                        rows={3}
                                                                        useV3Spec={useV3Spec} cardDataV2={cardDataV2} cardDataV3={cardDataV3}
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