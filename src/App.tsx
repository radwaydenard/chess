import { useState } from 'react'
import Game from './components/Game'
import './App.css'

function App() {
  const [isDarkTheme, setIsDarkTheme] = useState(true);

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
    document.body.classList.toggle('light-theme');
  };

  return (
    <div className={`app ${isDarkTheme ? 'dark-theme' : 'light-theme'}`}>
      <div className="header">
        <h1>Шашки</h1>
        <button className="theme-toggle" onClick={toggleTheme}>
          {isDarkTheme ? '☀️' : '🌙'}
        </button>
      </div>
      <Game />
    </div>
  )
}

export default App
