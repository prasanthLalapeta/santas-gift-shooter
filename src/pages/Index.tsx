import React from 'react';
import GameCanvas from '@/components/game/GameCanvas';
import GameOverlay from '@/components/game/GameOverlay';
import { useGameState } from '@/hooks/useGameState';

const Index = () => {
  const GAME_WIDTH = 800;
  const GAME_HEIGHT = 600;

  const { 
    gameState, 
    score, 
    timeLeft, 
    santa, 
    gifts, 
    isMuted,
    startGame,
    toggleMute 
  } = useGameState(GAME_WIDTH, GAME_HEIGHT);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F2FCE2]">
      <div className="relative">
        <GameCanvas
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          santa={santa}
          gifts={gifts}
        />
        <GameOverlay
          score={score}
          timeLeft={timeLeft}
          gameState={gameState}
          isMuted={isMuted}
          onStart={startGame}
          onRestart={startGame}
          onToggleMute={toggleMute}
        />
      </div>
    </div>
  );
};

export default Index;