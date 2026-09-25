import { MenuItem, TextField } from "@mui/material";

import DebouncedTextField from "../DebouncedTextField/DebouncedTextField";
import capitalize from "../../utils/capitalize";
import { useCard } from "../../context/CardContext";

export function LorebookMetaString({label="", fieldName, changeCallback}){
    const { cardData } = useCard();

    return(
        <DebouncedTextField
            label={label && label !== "" ? label : "Lorebook".concat(" ", capitalize(fieldName))}
            multiline
            name={fieldName}
            onChange={changeCallback}
            value={cardData.data.character_book[fieldName]}
        />
    );
}

export function LorebookMetaInt({label="", fieldName, changeCallback}){
    const { cardData } = useCard();

    return(
        <DebouncedTextField
            fullWidth={false}
            label={label && label !== "" ? label : "Lorebook".concat(" ", capitalize(fieldName))}
            name={fieldName}
            onChange={changeCallback}
            preserveCursor={false}
            slotProps={{htmlInput: {inputMode: "numeric", style: {resize:'vertical'}}}}
            type="number"
            value={cardData.data.character_book[fieldName]}
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

    return(
        <DebouncedTextField
            label={label && label !== "" ? label : "Entry".concat(" ", capitalize(fieldName))}
            multiline
            name={`${fieldName}#${entryIndex}`}
            onChange={changeCallback}
            rows={rows}
            slotProps={{htmlInput: {style: {resize:'vertical'}}, inputLabel: {shrink:true}}}
            value={cardData.data.character_book.entries[entryIndex][fieldName]}
        />
    );
}

export function LorebookEntryInt({label="", fieldName, entryIndex, changeCallback}){
    const { cardData } = useCard();

    return(
        <DebouncedTextField
            fullWidth={false}
            label={label && label !== "" ? label : "Lorebook".concat(" ", capitalize(fieldName))}
            name={`${fieldName}#${entryIndex}`}
            onChange={changeCallback}
            preserveCursor={false}
            slotProps={{htmlInput: {inputMode: "numeric", style: {resize:'vertical'}}}}
            type="number"
            value={cardData.data.character_book.entries[entryIndex][fieldName]}
        />
    );
}

export function LorebookEntryBool({label="", fieldName, entryIndex, changeCallback}){
    const { cardData } = useCard();
    return(
        <TextField
            defaultValue={undefined}
            fullWidth
            label={label}
            name={`${fieldName}#${entryIndex}`}
            onChange={changeCallback}
            select
            value={cardData.data.character_book.entries[entryIndex][fieldName]}
        >
                <MenuItem value={undefined}>N/A</MenuItem>
                <MenuItem value={false}>False</MenuItem>
                <MenuItem value={true}>True</MenuItem>
        </TextField>
    );
}
