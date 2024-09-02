import { 
    Box,
    Button,
    IconButton,
    Tooltip 
} from "@mui/material";
import { DeleteOutline, DragHandle, KeyboardDoubleArrowUp } from "@mui/icons-material";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";

import AltGreetingTextField from "../AltGreetingTextField/AltGreetingTextField";
import CardTextField from "../CardTextField/CardTextField";

export function BasicFieldTabPanel ({curTab, index, arrayToIterate, useV3Spec, cardDataV2, cardDataV3, setCardDataV2, setCardDataV3}) {
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

    return(
        <div hidden={curTab !== index}>
            {arrayToIterate.map((field, index) => (
                <CardTextField
                key={field.fieldName.concat(index)} 
                fieldName={field.fieldName} 
                label={Object.hasOwn(field, "label") ? field.label : ""} 
                multiline={Object.hasOwn(field, "multiline") ? field.multiline : false} 
                rows={Object.hasOwn(field, "rows") ? field.rows : 1}
                changeCallback={handleTextFieldChange} useV3Spec={useV3Spec} cardDataV2={cardDataV2} cardDataV3={cardDataV3}
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
                                            style={{display:"flex", ...provided.draggableProps.style}}
                                        >
                                            <Tooltip title="Drag to reorder">
                                                <IconButton {...provided.dragHandleProps}><DragHandle/></IconButton>
                                            </Tooltip>
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
    );
}