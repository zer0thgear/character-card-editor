import { useEffect, useState } from "react";

import { 
    MenuItem,
    TextField 
} from "@mui/material";

import { useCard } from "../../context/CardContext";

export function LorebookMetaString({label="", fieldName, changeCallback}){
    const { cardData } = useCard();
    const [localValue, setLocalValue] = useState(cardData.data.character_book[fieldName]);

    useEffect(() => {
        setLocalValue(cardData.data.character_book[fieldName]);
    }, [cardData.data.character_book[fieldName]]);

    const handleChange = (e) => {
        const { value } = e.target;
        setLocalValue(value);
        changeCallback(e);
    };

    return(
        <TextField
            autoComplete="off"
            fullWidth
            label={label && label !== "" ? label : "Lorebook".concat(" ", fieldName.charAt(0).toUpperCase() + fieldName.slice(1))}
            margin="normal"
            multiline
            name={fieldName}
            onChange={handleChange}
            slotProps={{htmlInput: {style: {resize:'vertical'}}}}
            value={localValue}
        />
    );
}

export function LorebookMetaInt({label="", fieldName, changeCallback}){
    const { cardData } = useCard();
    const [localValue, setLocalValue] = useState(cardData.data.character_book[fieldName]);

    useEffect(() => {
        setLocalValue(cardData.data.character_book[fieldName]);
    }, [cardData.data.character_book[fieldName]]);

    const handleChange = (e) => {
        const { value } = e.target;
        setLocalValue(value);
        changeCallback(e);
    };
    
    return(
        <TextField
            autoComplete="off"
            label={label && label !== "" ? label : "Lorebook".concat(" ", fieldName.charAt(0).toUpperCase() + fieldName.slice(1))}
            margin="normal"
            name={fieldName}
            onChange={handleChange}
            slotProps={{htmlInput: {inputMode: "numeric", style: {resize:'vertical'}}}}
            type="number"
            value={localValue}
        />
    );
}

export function LorebookMetaBool({label="", fieldName, changeCallback}){
    const { cardData } = useCard();
    return(
        <TextField
            defaultValue={undefined}
            label={label}
            onChange={changeCallback}
            select
            sx={{width:"20em"}}
            value={cardData.data.character_book[fieldName]}
        >
                <MenuItem value={undefined}>N/A</MenuItem>
                <MenuItem value={false}>False</MenuItem>
                <MenuItem value={true}>True</MenuItem>
        </TextField>
    );
}

export function LorebookEntryString({label="", fieldName, entryIndex, changeCallback, rows=1}){
    const { cardData } = useCard();
    const [localValue, setLocalValue] = useState(cardData.data.character_book.entries[entryIndex][fieldName]);

    useEffect(() => {
        setLocalValue(cardData.data.character_book.entries[entryIndex][fieldName]);
    }, [cardData.data.character_book.entries[entryIndex][fieldName]]);

    const handleChange = (e) => {
        const { value } = e.target;
        setLocalValue(value);
        changeCallback(e);
    }
    
    return(
        <TextField
            autoComplete="off"
            fullWidth
            label={label && label !== "" ? label : "Entry".concat(" ", fieldName.charAt(0).toUpperCase() + fieldName.slice(1))}
            margin="normal"
            multiline
            name={`${fieldName}#${entryIndex}`}
            onChange={handleChange}
            rows={rows}
            slotProps={{htmlInput: {style: {resize:'vertical'}}, inputLabel: {shrink:true}}}
            value={localValue}
        />
    );
}

export function LorebookEntryInt({label="", fieldName, entryIndex, changeCallback}){
    const { cardData } = useCard();
    const [localValue, setLocalValue] = useState(cardData.data.character_book.entries[entryIndex][fieldName]);

    useEffect(() => {
        setLocalValue(cardData.data.character_book.entries[entryIndex][fieldName]);
    }, [cardData.data.character_book.entries[entryIndex][fieldName]]);

    const handleChange = (e) => {
        const { value } = e.target;
        setLocalValue(value);
        changeCallback(e);
    }
    
    return(
        <TextField
            autoComplete="off"
            label={label && label !== "" ? label : "Lorebook".concat(" ", fieldName.charAt(0).toUpperCase() + fieldName.slice(1))}
            margin="normal"
            name={`${fieldName}#${entryIndex}`}
            onChange={handleChange}
            slotProps={{htmlInput: {inputMode: "numeric", style: {resize:'vertical'}}}}
            type="number"
            value={localValue}
        />
    );
}

export function LorebookEntryBool({label="", fieldName, entryIndex, changeCallback}){
    const { cardData } = useCard();
    return(
        <TextField
            defaultValue={undefined}
            label={label}
            name={`${fieldName}#${entryIndex}`}
            onChange={changeCallback}
            select
            sx={{width:"32em"}}
            value={cardData.data.character_book.entries[entryIndex][fieldName]}
        >
                <MenuItem value={undefined}>N/A</MenuItem>
                <MenuItem value={false}>False</MenuItem>
                <MenuItem value={true}>True</MenuItem>
        </TextField>
    );
}