import React, { useState } from 'react';
import Home from './components/Home';
import OnlineGame from './components/OnlineGame';
import BaseGameContainer from './components/BaseGame/BaseGameContainer';

function App() {
  const [mode, setMode] = useState('home'); // home, online, offline

  return (
    <div className="App">
      {mode === 'home' && <Home onSelectMode={setMode} />}
      {mode === 'online' && <OnlineGame onBack={() => setMode('home')} />}
      {mode === 'offline' && <BaseGameContainer onBack={() => setMode('home')} />}
    </div>
  );
}

export default App;
