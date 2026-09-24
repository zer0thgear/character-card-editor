import { createTheme } from "@mui/material/styles";

// Shared across light/dark so both stay in sync; only palette colors differ per mode.
const typography = {
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    button: {
        textTransform: 'none',
        fontWeight: 600,
    },
};

const shape = { borderRadius: 8 };

const components = {
    MuiButton: {
        defaultProps: { disableElevation: true },
    },
    MuiPaper: {
        styleOverrides: {
            // MUI's dark-mode elevation overlay tints Paper with a translucent white
            // gradient by default, which muddies an already-custom dark background.
            root: { backgroundImage: 'none' },
        },
    },
    MuiTabs: {
        styleOverrides: {
            indicator: { height: 2, borderRadius: 2 },
        },
    },
    MuiTab: {
        styleOverrides: {
            root: { minHeight: 44, fontWeight: 500 },
        },
    },
    MuiAccordion: {
        styleOverrides: {
            root: {
                backgroundImage: 'none',
                '&:before': { display: 'none' },
            },
        },
    },
};

export const light = createTheme({
    palette: {
        mode: 'light',
        primary: { main: '#6C5CE7', light: '#8D7CFF', dark: '#5B4BC4', contrastText: '#FFFFFF' },
        secondary: { main: '#5236AB' },
        error: { main: '#D1383E' },
        background: { default: '#F7F7FA', paper: '#FFFFFF' },
        text: { primary: '#1B1C24', secondary: '#5B5D6E' },
        divider: '#E5E4EE',
    },
    direction: 'ltr',
    typography,
    shape,
    components,
});

export const dark = createTheme({
    palette: {
        mode: 'dark',
        primary: { main: '#6C5CE7', light: '#8D7CFF', dark: '#5B4BC4', contrastText: '#FFFFFF' },
        secondary: { main: '#8D7CFF' },
        error: { main: '#E5787C' },
        background: { default: '#14151B', paper: '#1B1C24' },
        text: { primary: '#ECEEF3', secondary: '#9698A8' },
        divider: '#2A2C38',
    },
    direction: 'ltr',
    typography,
    shape,
    components,
});
