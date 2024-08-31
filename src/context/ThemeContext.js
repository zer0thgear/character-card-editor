import React, {createContext, useState} from 'react';
import { dark, light } from '../theme/themes';

export const ThemeContext = createContext("");

function ThemeContextProvider(props) {
    const storedTheme = JSON.parse(localStorage.getItem("storedTheme"));
    const [theme, setTheme] = useState(storedTheme === 'light' ? light : dark);

    const toggleTheme = () => {
        setTheme((prevTheme) => prevTheme === light ? dark : light)
    }

    return(
        <ThemeContext.Provider value={{currentTheme: theme, toggleTheme}}>
            {props.children}
        </ThemeContext.Provider>
    );
}

export default ThemeContextProvider;