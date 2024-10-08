import { useEffect, useRef, useState } from "react";

import { TextField } from "@mui/material";

import { useCard } from "../../context/CardContext";

/**
 * 
 * @param {string} label Label to pass to the TextField component
 * @param {string} fieldName Name of the field to edit
 * @param {*} changeCallback onChange callback function
 * @param {boolean} [multiline] Whether or not the TextField should be multiline
 * @param {int} [rows] If multiline, how many rows
 * @returns 
 */
const CardTextField = ({label, fieldName, changeCallback, multiline=false, rows=1}) => {
    const { cardData } = useCard();
    const [localValue, setLocalValue] = useState(cardData.data[fieldName]);
    const inputRef = useRef(null);

    useEffect(() => {
        setLocalValue(cardData.data[fieldName]);
    }, [cardData.data, fieldName]);

    const handleChange = (e) => {
        const { value } = e.target;
        const cursorPosition = inputRef.current.selectionStart;
        setLocalValue(value);
        changeCallback(e);
        setTimeout(() => {
            inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
        }, 0);
    }

    return(
        <TextField 
            autoComplete="off"
            fullWidth
            inputRef={inputRef}
            label={label && label !== "" ? label : "Character".concat(" ", fieldName.charAt(0).toUpperCase() + fieldName.slice(1))}
            margin="normal"
            multiline={multiline}
            name={fieldName} 
            onChange={handleChange}
            rows={multiline ? rows : undefined}
            slotProps = {multiline ? {htmlInput: {style: {resize:'vertical'}}} : {}}
            value={localValue}
        />
    )
}

export default CardTextField;