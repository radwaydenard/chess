import { useState, useEffect } from 'react'
import { Game } from './components/Game'
import './App.css'

function App() {
  const [isDarkTheme, setIsDarkTheme] = useState(true);

  useEffect(() => {
    document.body.className = isDarkTheme ? 'dark-theme' : 'light-theme';
  }, [isDarkTheme]);

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  return (
    <div className="app">
      <header className="header">
        <h1 className="game-title">Шашки</h1>
        <button className="theme-toggle" onClick={toggleTheme}>
          {isDarkTheme ? '☀️' : '🌙'}
        </button>
      </header>
      <Game />
    </div>
  )
}

export default App
