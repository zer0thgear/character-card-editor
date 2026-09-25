import React, { useContext } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

import TavernCardEditor from './components/TavernCardEditor/TavernCardEditor';
import { ThemeContext } from './context/ThemeContext';
import { CardProvider } from './context/CardContext';

function App() {
  const { currentTheme, toggleTheme } = useContext(ThemeContext);

  return (
    <ThemeProvider theme={currentTheme}>
      <CardProvider>
        <CssBaseline/>
        <TavernCardEditor
          toggleTheme={toggleTheme}
        />
      </CardProvider>
    </ThemeProvider>
  );
}

export default App;
