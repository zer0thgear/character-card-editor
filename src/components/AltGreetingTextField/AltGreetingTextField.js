import { TextField } from "@mui/material";

import { useCard } from "../../context/CardContext";

/**
 * 
 * @param {string} label Label to pass to the TextField component
 * @param {string} fieldName Name of the field to edit
 * @param {*} changeCallback onChange callback function
 * @param {int} greetingIndex Index of the alternate greeting to edit
 * @returns 
 */
const AltGreetingTextField = ({label, fieldName, changeCallback, greetingIndex=0}) => {
    const { cardData } = useCard();
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
            value={cardData.data.alternate_greetings[greetingIndex]}
        />
    )
}

export const GroupGreetingTextField = ({label, fieldName, changeCallback, greetingIndex=0}) => {
    const { cardData } = useCard();
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
            value={cardData.data.group_only_greetings[greetingIndex]}
        />
    )
}

export default AltGreetingTextField;