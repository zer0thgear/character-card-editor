import React, { useContext } from 'react';
import { ThemeProvider } from '@mui/material/styles';

//import logo from './logo.svg';
import './App.css';
import TavernCardEditor from './components/TavernCardEditor/TavernCardEditor';
import { ThemeContext } from './context/ThemeContext';

function App() {
  const { currentTheme, toggleTheme } = useContext(ThemeContext);

  return (
    <ThemeProvider theme={currentTheme}>
      <TavernCardEditor/>
    </ThemeProvider>
      /* <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div> */
  );
}

export default App;
