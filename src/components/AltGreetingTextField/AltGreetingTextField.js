import { TextField } from "@mui/material";

/**
 * 
 * @param {string} label Label to pass to the TextField component
 * @param {string} fieldName Name of the field to edit
 * @param {*} changeCallback onChange callback function
 * @param {int} greetingIndex Index of the alternate greeting to edit
 * @param {boolean} useV3Spec State of the same name
 * @param {*} cardDataV2 State of the same name
 * @param {*} cardDataV3 State of the same name
 * @returns 
 */
const AltGreetingTextField = ({label, fieldName, changeCallback, greetingIndex=0, useV3Spec, cardDataV2, cardDataV3}) => {
    return(
        <TextField 
            autoComplete="off"
            fullWidth
            label={label}
            margin="normal"
            multiline
            name={fieldName} 
            onChange={changeCallback}
            rows={3}
            slotProps = {{htmlInput: {style: {resize:'vertical'}}}}
            value={useV3Spec ? cardDataV3.data.alternate_greetings[greetingIndex] : cardDataV2.data.alternate_greetings[greetingIndex]}
        />
    )
}

export default AltGreetingTextField;