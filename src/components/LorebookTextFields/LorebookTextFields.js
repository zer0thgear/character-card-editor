import { 
    MenuItem,
    TextField 
} from "@mui/material";

export function LorebookMetaString({label="", fieldName, changeCallback, cardToEdit}){
    return(
        <TextField
            autoComplete="off"
            fullWidth
            label={label && label !== "" ? label : "Lorebook".concat(" ", fieldName.charAt(0).toUpperCase() + fieldName.slice(1))}
            margin="normal"
            multiline
            name={fieldName}
            onChange={changeCallback}
            slotProps={{htmlInput: {style: {resize:'vertical'}}}}
            value={cardToEdit.data.character_book[fieldName]}
        />
    );
}

export function LorebookMetaInt({label="", fieldName, changeCallback, cardToEdit}){
    return(
        <TextField
            autoComplete="off"
            label={label && label !== "" ? label : "Lorebook".concat(" ", fieldName.charAt(0).toUpperCase() + fieldName.slice(1))}
            margin="normal"
            name={fieldName}
            onChange={changeCallback}
            slotProps={{htmlInput: {inputMode: "numeric", style: {resize:'vertical'}}}}
            type="number"
            value={cardToEdit.data.character_book[fieldName]}
        />
    );
}

export function LorebookMetaBool({label="", fieldName, changeCallback, cardToEdit}){
    return(
        <TextField
            defaultValue={undefined}
            label={label}
            onChange={changeCallback}
            select
            sx={{width:"20em"}}
            value={cardToEdit.data.character_book[fieldName]}
        >
                <MenuItem value={undefined}>N/A</MenuItem>
                <MenuItem value={false}>False</MenuItem>
                <MenuItem value={true}>True</MenuItem>
        </TextField>
    );
}

export function LorebookEntryString({label="", fieldName, entryIndex, changeCallback, rows=1, cardToEdit}){
    return(
        <TextField
            autoComplete="off"
            fullWidth
            label={label && label !== "" ? label : "Entry".concat(" ", fieldName.charAt(0).toUpperCase() + fieldName.slice(1))}
            margin="normal"
            multiline
            name={`${fieldName}#${entryIndex}`}
            onChange={changeCallback}
            rows={rows}
            slotProps={{htmlInput: {style: {resize:'vertical'}}, inputLabel: {shrink:true}}}
            value={cardToEdit.data.character_book.entries[entryIndex][fieldName]}
        />
    );
}

export function LorebookEntryInt({label="", fieldName, entryIndex, changeCallback, cardToEdit}){
    return(
        <TextField
            autoComplete="off"
            label={label && label !== "" ? label : "Lorebook".concat(" ", fieldName.charAt(0).toUpperCase() + fieldName.slice(1))}
            margin="normal"
            name={`${fieldName}#${entryIndex}`}
            onChange={changeCallback}
            slotProps={{htmlInput: {inputMode: "numeric", style: {resize:'vertical'}}}}
            type="number"
            value={cardToEdit.data.character_book.entries[entryIndex][fieldName]}
        />
    );
}

export function LorebookEntryBool({label="", fieldName, entryIndex, changeCallback, cardToEdit}){
    return(
        <TextField
            defaultValue={undefined}
            label={label}
            name={`${fieldName}#${entryIndex}`}
            onChange={changeCallback}
            select
            sx={{width:"32em"}}
            value={cardToEdit.data.character_book.entries[entryIndex][fieldName]}
        >
                <MenuItem value={undefined}>N/A</MenuItem>
                <MenuItem value={false}>False</MenuItem>
                <MenuItem value={true}>True</MenuItem>
        </TextField>
    );
}