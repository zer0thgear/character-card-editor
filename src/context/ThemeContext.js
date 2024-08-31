import React, {createContext, useState} from 'react';
import { themeData } from '../theme/themeData';

export const ThemeContext = createContext("");

function ThemeContextProvider(props) {
    const storedTheme = localStorage.getItem("storedTheme");
    const [theme, setTheme] = useState(storedTheme === 'light' ? themeData.defaultTheme : themeData.secondaryTheme);

    const toggleTheme = () => {
        setTheme((prevTheme) => prevTheme === themeData.defaultTheme ? themeData.secondaryTheme : themeData.defaultTheme);
    };

    return(
        <ThemeContext.Provider value={{currentTheme: theme, toggleTheme}}>
            {props.children}
        </ThemeContext.Provider>
    );
}

export default ThemeContextProvider;