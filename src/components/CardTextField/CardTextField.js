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
 * @returns
 */
const CardTextField = ({label, fieldName, changeCallback, multiline=false, rows=1}) => {
    const { cardData } = useCard();

    return(
        <DebouncedTextField
            debounceMs={0}
            label={label && label !== "" ? label : "Character".concat(" ", capitalize(fieldName))}
            multiline={multiline}
            name={fieldName}
            onChange={changeCallback}
            rows={rows}
            value={cardData.data[fieldName]}
        />
    )
}

export default CardTextField;
