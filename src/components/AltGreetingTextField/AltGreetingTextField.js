import { useCallback, useEffect, useRef, useState } from "react";
import debounce from "lodash.debounce";

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
    const [localValue, setLocalValue] = useState(cardData.data.alternate_greetings[greetingIndex]);
    const inputRef = useRef(null);

    useEffect(() => {
        setLocalValue(cardData.data.alternate_greetings[greetingIndex]);
    }, [cardData.data.alternate_greetings, greetingIndex]);

    // eslint-disable-next-line
    const debouncedChangeCallback = useCallback(
        debounce((e) => {
            changeCallback(e);
        }, 300),
        [changeCallback]
    );

    const handleChange = (e) => {
        const { value } = e.target;
        const cursorPosition = inputRef.current.selectionStart;
        setLocalValue(value);
        debouncedChangeCallback(e);
        setTimeout(() => {
            inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
        }, 0);
    }

    return(
        <TextField 
            autoComplete="off"
            fullWidth
            inputRef={inputRef}
            label={label}
            margin="normal"
            multiline
            name={fieldName} 
            onChange={handleChange}
            rows={3}
            slotProps = {{htmlInput: {style: {resize:'vertical'}}}}
            value={localValue}
        />
    )
}

export const GroupGreetingTextField = ({label, fieldName, changeCallback, greetingIndex=0}) => {
    const { cardData } = useCard();
    const [localValue, setLocalValue] = useState(cardData.data.group_only_greetings[greetingIndex]);
    const inputRef = useRef(null);

    useEffect(() => {
        setLocalValue(cardData.data.group_only_greetings[greetingIndex]);
    }, [cardData.data.group_only_greetings, greetingIndex]);

    // eslint-disable-next-line
    const debouncedChangeCallback = useCallback(
        debounce((e) => {
            changeCallback(e);
        }, 300), 
        [changeCallback]
    );


    const handleChange = (e) => {
        const { value } = e.target;
        const cursorPosition = inputRef.current.selectionStart;
        setLocalValue(value);
        debouncedChangeCallback(e);
        setTimeout(() => {
            inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
        }, 0);
    }

    return(
        <TextField 
            autoComplete="off"
            fullWidth
            inputRef={inputRef}
            label={label}
            margin="normal"
            multiline
            name={fieldName} 
            onChange={handleChange}
            rows={3}
            slotProps = {{htmlInput: {style: {resize:'vertical'}}}}
            value={localValue}
        />
    )
}

export default AltGreetingTextField;