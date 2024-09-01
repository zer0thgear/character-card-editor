import { TextField } from "@mui/material";

/**
 * 
 * @param {string} label Label to pass to the TextField component
 * @param {string} fieldName Name of the field to edit
 * @param {*} changeCallback onChange callback function
 * @param {boolean} [multiline] Whether or not the TextField should be multiline
 * @param {int} [rows] If multiline, how many rows
 * @param {*} useV3Spec
 * @param {*} cardDataV2
 * @param {*} cardDataV3
 * @returns 
 */
const CardTextField = ({label, fieldName, changeCallback, multiline=false, rows=1, useV3Spec, cardDataV2, cardDataV3}) => {
    return(
        <TextField 
            autoComplete="off"
            fullWidth
            label={label && label !== "" ? label : "Character".concat(" ", fieldName.charAt(0).toUpperCase() + fieldName.slice(1))}
            margin="normal"
            multiline={multiline}
            name={fieldName} 
            onChange={changeCallback}
            rows={multiline ? rows : undefined}
            slotProps = {multiline ? {htmlInput: {style: {resize:'vertical'}}} : {}}
            value={useV3Spec ? cardDataV3.data[fieldName] : cardDataV2.data[fieldName]}
        />
    )
}

export default CardTextField;