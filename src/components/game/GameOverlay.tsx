import React from 'react';
import { motion } from 'framer-motion';
import { Gift, Timer, CandyCane, Volume2, VolumeX } from 'lucide-react';

interface GameOverlayProps {
  score: number;
  gameState: 'start' | 'playing' | 'over';
  timeLeft: number;
  isMuted: boolean;
  onStart: () => void;
  onRestart: () => void;
  onToggleMute: () => void;
}

const GameOverlay: React.FC<GameOverlayProps> = ({
  score,
  gameState,
  timeLeft,
  isMuted,
  onStart,
  onRestart,
  onToggleMute,
}) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <button
        onClick={onToggleMute}
        className="absolute top-4 right-4 z-10 bg-white/90 p-2 rounded-full hover:bg-white/100 transition-colors"
      >
        {isMuted ? <VolumeX className="w-6 h-6 text-red-500" /> : <Volume2 className="w-6 h-6 text-green-500" />}
      </button>

      {gameState === 'start' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-white/90 p-8 rounded-lg shadow-lg border-4 border-red-500"
        >
          <h1 className="text-4xl font-bold text-red-500 mb-4 flex items-center justify-center gap-2">
            <CandyCane className="w-8 h-8" />
            Santa's Gift Catch
            <CandyCane className="w-8 h-8" />
          </h1>
          <p className="text-gray-600 mb-6">
            Help Santa catch all the falling gifts!
            <br />
            Use left and right arrow keys to move.
            <br />
            You have 60 seconds to catch as many gifts as possible!
          </p>
          <button
            onClick={onStart}
            className="bg-red-500 text-white px-8 py-3 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 mx-auto"
          >
            <Gift className="w-5 h-5" />
            Start Game
          </button>
        </motion.div>
      )}

      {gameState === 'playing' && (
        <div className="absolute top-4 left-4 flex gap-4">
          <div className="bg-white/90 px-4 py-2 rounded-lg flex items-center gap-2">
            <Gift className="w-5 h-5 text-red-500" />
            <span className="text-xl font-bold text-red-500">
              Score: {score}
            </span>
          </div>
          <div className="bg-white/90 px-4 py-2 rounded-lg flex items-center gap-2">
            <Timer className="w-5 h-5 text-red-500" />
            <span className="text-xl font-bold text-red-500">
              Time: {timeLeft}s
            </span>
          </div>
        </div>
      )}

      {gameState === 'over' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-white/90 p-8 rounded-lg shadow-lg border-4 border-red-500 relative overflow-hidden"
        >
          {/* Snowfall effect */}
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white rounded-full"
                initial={{ 
                  x: Math.random() * 400 - 200,
                  y: -20,
                }}
                animate={{ 
                  y: 400,
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          <h2 className="text-3xl font-bold text-red-500 mb-4 flex items-center justify-center gap-2">
            <CandyCane className="w-8 h-8" />
            Game Over
            <CandyCane className="w-8 h-8" />
          </h2>
          <p className="text-2xl text-gray-600 mb-6">
            You caught {score} gifts!
          </p>
          <button
            onClick={onRestart}
            className="bg-red-500 text-white px-8 py-3 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 mx-auto"
          >
            <Gift className="w-5 h-5" />
            Play Again
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default GameOverlay;