import { useState, useEffect, useCallback } from 'react';
import { Howl } from 'howler';

interface Santa {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
}

interface Gift {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
}

const catchSound = new Howl({
  src: ['/sounds/catch.mp3'],
  volume: 0.5
});

export const useGameState = (width: number, height: number) => {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'over'>('start');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isMuted, setIsMuted] = useState(false);
  const [santa, setSanta] = useState<Santa>({
    x: width / 2 - 40,
    y: height - 80,
    width: 80,
    height: 80,
    speed: 12, // Increased speed for snappier movement
  });
  const [gifts, setGifts] = useState<Gift[]>([]);

  // Handle keyboard input with improved responsiveness
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      
      if (e.key === 'ArrowLeft') {
        setSanta(prev => ({
          ...prev,
          x: Math.max(0, prev.x - prev.speed),
        }));
      }
      if (e.key === 'ArrowRight') {
        setSanta(prev => ({
          ...prev,
          x: Math.min(width - prev.width, prev.x + prev.speed),
        }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, width]);

  // Game timer
  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameState('over');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState]);

  // Spawn gifts with increasing difficulty
  useEffect(() => {
    if (gameState !== 'playing') return;

    const getDifficulty = () => {
      if (timeLeft <= 15) return 3; // Hard
      if (timeLeft <= 30) return 2; // Medium
      return 1; // Normal
    };

    const spawnInterval = setInterval(() => {
      const difficulty = getDifficulty();
      const baseSpeed = 2;
      const speedIncrease = difficulty * 1.5;
      const numberOfGifts = Math.min(3, 1 + Math.floor(difficulty));

      const newGifts = Array(numberOfGifts).fill(null).map(() => ({
        x: Math.random() * (width - 30),
        y: -30,
        width: 30,
        height: 30,
        speed: baseSpeed + speedIncrease + Math.random(),
      }));

      setGifts(prev => [...prev, ...newGifts]);
    }, 2000 / getDifficulty());

    return () => clearInterval(spawnInterval);
  }, [gameState, width, timeLeft]);

  // Move gifts and check collisions
  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameLoop = setInterval(() => {
      setGifts(prev => {
        const newGifts = prev.map(gift => ({
          ...gift,
          y: gift.y + gift.speed,
        }));

        // Check collisions and remove caught/missed gifts
        return newGifts.filter(gift => {
          // Check if gift is caught
          if (
            gift.x < santa.x + santa.width &&
            gift.x + gift.width > santa.x &&
            gift.y < santa.y + santa.height &&
            gift.y + gift.height > santa.y
          ) {
            if (!isMuted) {
              catchSound.play();
            }
            setScore(s => s + 1);
            return false;
          }

          // Check if gift is missed
          if (gift.y > height) {
            return false;
          }

          return true;
        });
      });
    }, 16);

    return () => clearInterval(gameLoop);
  }, [gameState, height, santa, isMuted]);

  const startGame = useCallback(() => {
    setGameState('playing');
    setScore(0);
    setTimeLeft(60);
    setGifts([]);
    setSanta(prev => ({
      ...prev,
      x: width / 2 - 40,
    }));
  }, [width]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  return {
    gameState,
    score,
    santa,
    gifts,
    timeLeft,
    isMuted,
    startGame,
    toggleMute,
  };
};