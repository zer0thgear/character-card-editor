import CardTextField from "../CardTextField/CardTextField";



export function BasicFieldTabPanel ({curTab, index, arrayToIterate, useV3Spec, cardDataV2, cardDataV3, setCardDataV2, setCardDataV3}) {
    const handleTextFieldChange = (e) => {
        const {name, value} = e.target;
        setCardDataV2((prevState) => ({
            ...prevState,
            data: {
                ...prevState.data,
                [name]: value,
            }
        }));
        setCardDataV3((prevState) => ({
            ...prevState,
            data: {
                ...prevState.data,
                [name]: value,
            }
        }));
    };

    return(
        <div hidden={curTab !== index}>
            {arrayToIterate.map((field, index) => (
                <CardTextField
                key={field.fieldName.concat(index)} 
                fieldName={field.fieldName} 
                label={Object.hasOwn(field, "label") ? field.label : ""} 
                multiline={Object.hasOwn(field, "multiline") ? field.multiline : false} 
                rows={Object.hasOwn(field, "rows") ? field.rows : 1}
                changeCallback={handleTextFieldChange} useV3Spec={useV3Spec} cardDataV2={cardDataV2} cardDataV3={cardDataV3}
            />
            ))}
        </div>
    );
}