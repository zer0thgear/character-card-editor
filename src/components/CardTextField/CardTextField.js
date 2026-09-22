import DebouncedTextField from "../DebouncedTextField/DebouncedTextField";
import capitalize from "../../utils/capitalize";
import { useCard } from "../../context/CardContext";

/**
 *
 * @param {string} label Label to pass to the TextField component
 * @param {string} fieldName Name of the field to edit
 * @param {*} changeCallback onChange callback function
 * @param {boolean} [multiline] Whether or not the TextField should be multiline
 * @param {int} [rows] If multiline, how many rows
 * @param {boolean} [readOnly] Renders the field as informational/non-editable
 * @returns
 */
const CardTextField = ({label, fieldName, changeCallback, multiline=false, rows=1, readOnly=false}) => {
    const { cardData } = useCard();
    const rawValue = cardData.data[fieldName];
    // "source" is a V3 field the spec says shouldn't be user-edited, and is an array of URIs
    // rather than a plain string, so it needs its own display formatting.
    const value = fieldName === "source"
        ? (Array.isArray(rawValue) ? rawValue.join("\n") : rawValue ?? "")
        : rawValue;

    return(
        <DebouncedTextField
            debounceMs={0}
            label={label && label !== "" ? label : "Character".concat(" ", capitalize(fieldName))}
            multiline={multiline}
            name={fieldName}
            onChange={changeCallback}
            readOnly={readOnly}
            rows={rows}
            value={value}
        />
    )
}

export default CardTextField;
