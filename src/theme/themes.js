import { createTheme } from "@mui/material";

export const light = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#E31937'
        },
        secondary: {
            main: '#5236AB'
        },
        background: {
            default: '#f5f5f5'
        },
        text: {
            primary: '#1F2937'
        }
    }
});

export const dark = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#5236AB'
        },
        secondary: {
            main: '#E31937'
        },
        background: {
            main: '#1F2937'
        },
        text: {
            primary: '#f5f5f5'
        }
    }
});