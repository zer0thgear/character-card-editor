import { useEffect, useMemo, useRef, useState } from "react";
import debounce from "lodash.debounce";

import { TextField } from "@mui/material";

/**
 * Shared MUI TextField wrapper for card fields.
 *
 * Keeps its own local value so typing feels instant, restores cursor position after each
 * change (MUI's controlled TextField otherwise kicks the cursor to the end on every keystroke
 * once the value comes from a debounced/async source), and optionally debounces the call to
 * onChange so rapid typing doesn't spam card-state updates.
 *
 * @param {string} label
 * @param {string} name Passed through as the underlying input's `name`, and as `e.target.name` in onChange
 * @param {*} onChange onChange callback, called with the raw change event
 * @param {string} value Current value from card state
 * @param {number} [debounceMs] Debounce delay in ms; pass 0 to call onChange synchronously
 * @param {boolean} [multiline]
 * @param {int} [rows]
 * @param {boolean} [preserveCursor] Restore cursor position after each change. Must be false for
 * inputs whose type doesn't support text selection (e.g. type="number"), which throw when
 * selectionStart/setSelectionRange are accessed.
 * @param {boolean} [readOnly] Renders the field as informational/non-editable (e.g. a V3 field
 * like "source" that the spec says shouldn't be user-edited), rather than disabled.
 * @param {boolean} [showCount] Shows a live character count as helper text.
 */
const DebouncedTextField = ({label, name, onChange, value, debounceMs = 300, multiline = false, rows, preserveCursor = true, readOnly = false, showCount = false, slotProps, ...rest}) => {
    const [localValue, setLocalValue] = useState(value);
    const inputRef = useRef(null);

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const debouncedOnChange = useMemo(() => (
        debounceMs > 0 ? debounce(onChange, debounceMs) : onChange
    ), [onChange, debounceMs]);

    useEffect(() => () => {
        if (debouncedOnChange.cancel) debouncedOnChange.cancel();
    }, [debouncedOnChange]);

    const handleChange = (e) => {
        const { value: newValue } = e.target;
        const cursorPosition = preserveCursor ? inputRef.current.selectionStart : null;
        setLocalValue(newValue);
        debouncedOnChange(e);
        if (preserveCursor) {
            setTimeout(() => {
                inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
            }, 0);
        }
    };

    const charCount = typeof localValue === "string" ? localValue.length : 0;

    const mergedSlotProps = {
        ...slotProps,
        htmlInput: {
            readOnly,
            style: multiline ? {resize: 'vertical'} : undefined,
            ...(slotProps?.htmlInput ?? {}),
        },
        // Labels always sit above the field, as a static caption, rather than floating
        // in/out of the border on focus.
        inputLabel: {
            shrink: true,
            ...(slotProps?.inputLabel ?? {}),
        },
        ...(showCount ? {
            formHelperText: {
                style: {textAlign: 'right', margin: 0},
                ...(slotProps?.formHelperText ?? {}),
            },
        } : {}),
    };

    return(
        <TextField
            autoComplete="off"
            fullWidth
            helperText={showCount ? `${charCount} character${charCount === 1 ? '' : 's'}` : undefined}
            inputRef={inputRef}
            label={label}
            margin="normal"
            multiline={multiline}
            name={name}
            onChange={handleChange}
            rows={multiline ? rows : undefined}
            slotProps={mergedSlotProps}
            value={localValue}
            {...rest}
        />
    );
};

export default DebouncedTextField;
