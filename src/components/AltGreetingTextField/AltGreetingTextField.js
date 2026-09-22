import DebouncedTextField from "../DebouncedTextField/DebouncedTextField";
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
        <DebouncedTextField
            label={label}
            multiline
            name={fieldName}
            onChange={changeCallback}
            rows={3}
            value={cardData.data.alternate_greetings[greetingIndex]}
        />
    )
}

export const GroupGreetingTextField = ({label, fieldName, changeCallback, greetingIndex=0}) => {
    const { cardData } = useCard();

    return(
        <DebouncedTextField
            label={label}
            multiline
            name={fieldName}
            onChange={changeCallback}
            rows={3}
            value={cardData.data.group_only_greetings[greetingIndex]}
        />
    )
}

export default AltGreetingTextField;
