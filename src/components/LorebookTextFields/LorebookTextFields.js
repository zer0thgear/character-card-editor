import { 
    MenuItem,
    TextField 
} from "@mui/material";

export function LorebookMetaString({label="", fieldName, changeCallback, useV3Spec, cardDataV2, cardDataV3}){
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
            value={(useV3Spec ? cardDataV3 : cardDataV2).data.character_book[fieldName]}
        />
    );
}

export function LorebookMetaInt({label="", fieldName, changeCallback, useV3Spec, cardDataV2, cardDataV3}){
    return(
        <TextField
            autoComplete="off"
            label={label && label !== "" ? label : "Lorebook".concat(" ", fieldName.charAt(0).toUpperCase() + fieldName.slice(1))}
            margin="normal"
            name={fieldName}
            onChange={changeCallback}
            slotProps={{htmlInput: {inputMode: "numeric", style: {resize:'vertical'}}}}
            type="number"
            value={(useV3Spec ? cardDataV3 : cardDataV2).data.character_book[fieldName]}
        />
    );
}

export function LorebookMetaBool({label="", fieldName, changeCallback, useV3Spec, cardDataV2, cardDataV3}){
    return(
        <TextField
            defaultValue={false}
            label={label}
            onChange={changeCallback}
            select
            sx={{width:"12em"}}
            value={(useV3Spec ? cardDataV3 : cardDataV2).data.character_book[fieldName]}
        >
                <MenuItem value={false}>False</MenuItem>
                <MenuItem value={true}>True</MenuItem>
        </TextField>
    );
}

export function LorebookEntryString({label="", fieldName, entryIndex, changeCallback, rows=1, useV3Spec, cardDataV2, cardDataV3}){
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
            value={(useV3Spec ? cardDataV3 : cardDataV2).data.character_book.entries[entryIndex][fieldName]}
        />
    );
}

export function LorebookEntryInt({label="", fieldName, entryIndex, changeCallback, useV3Spec, cardDataV2, cardDataV3}){
    return(
        <TextField
            autoComplete="off"
            label={label && label !== "" ? label : "Lorebook".concat(" ", fieldName.charAt(0).toUpperCase() + fieldName.slice(1))}
            margin="normal"
            name={`${fieldName}#${entryIndex}`}
            onChange={changeCallback}
            slotProps={{htmlInput: {inputMode: "numeric", style: {resize:'vertical'}}}}
            type="number"
            value={(useV3Spec ? cardDataV3 : cardDataV2).data.character_book.entries[entryIndex][fieldName]}
        />
    );
}

export function LorebookEntryBool({label="", fieldName, entryIndex, changeCallback, useV3Spec, cardDataV2, cardDataV3}){
    return(
        <TextField
            defaultValue={false}
            label={label}
            name={`${fieldName}#${entryIndex}`}
            onChange={changeCallback}
            select
            sx={{width:"24em"}}
            value={(useV3Spec ? cardDataV3 : cardDataV2).data.character_book.entries[entryIndex][fieldName]}
        >
                <MenuItem value={false}>False</MenuItem>
                <MenuItem value={true}>True</MenuItem>
        </TextField>
    );
}