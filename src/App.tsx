import React from 'react';
import Game from './components/game/Game';

const App: React.FC = () => {
  // Update document title
  React.useEffect(() => {
    document.title = "🎅 Santa's Gift Drop";
  }, []);

  return (
    <div className="min-h-screen bg-gray-900">
      <Game />
    </div>
  );
};

export default App;
