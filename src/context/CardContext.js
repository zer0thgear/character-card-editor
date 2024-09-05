import React, { createContext, useContext, useState } from 'react';

import { v3CardPrototype } from '../utils/v3CardPrototype';

const CardContext = createContext();

export const CardProvider = ({children}) => {
    const [cardData, setCardData] = useState(v3CardPrototype);

    return(
        <CardContext.Provider value={{ cardData, setCardData }}>
            {children}
        </CardContext.Provider>
    );
};

export const useCard = () => {
    return useContext(CardContext);
}