import React, { useState, useEffect, useRef } from 'react';
import GameCanvas from './GameCanvas';
import Snow from '../Snow';
import Clouds from '../Clouds';

const Game: React.FC = () => {
    // Add start menu state first
    const [gameStarted, setGameStarted] = useState(false);

    // Replace fixed dimensions with window size
    const [dimensions, setDimensions] = useState(() => ({
        width: window.innerWidth,
        height: window.innerHeight
    }));

    // Add window resize handler
    useEffect(() => {
        const handleResize = () => {
            setDimensions({
                width: window.innerWidth,
                height: window.innerHeight
            });
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(60);
    const gameStartTimeRef = useRef(Date.now());

    // Update santa's initial position for full screen
    const [santa, setSanta] = useState({
        x: window.innerWidth / 2,
        y: window.innerHeight - 100, // Keep santa above bottom
        width: 60,
        height: 60,
        speed: 12, // Increased speed for larger screen
        isMoving: false,
        direction: 'right' as 'left' | 'right',
    });

    // Add bullet interface
    interface Bullet {
        x: number;
        y: number;
        speed: number;
    }

    const [bullets, setBullets] = useState<Bullet[]>([]);
    const [totalGifts, setTotalGifts] = useState(0);
    const [gifts, setGifts] = useState<Array<{
        x: number;
        y: number;
        width: number;
        height: number;
        speed: number;
        hit: boolean;
    }>>([]);

    // Add new state for combo and effects
    const [combo, setCombo] = useState(0);
    const [lastHitTime, setLastHitTime] = useState(0);
    const [scorePopups, setScorePopups] = useState<Array<{
        x: number;
        y: number;
        score: number;
        time: number;
    }>>([]);

    // Create gift with more variety
    const createGift = () => ({
        x: Math.random() * (dimensions.width - 40),
        y: -50,
        width: 40,
        height: 40,
        speed: 2 + Math.random(), // Random speed variation
        hit: false,
        color: ['#FF0000', '#00FF00', '#0000FF', '#FFD700'][Math.floor(Math.random() * 4)], // Random colors
        health: Math.random() < 0.2 ? 2 : 1, // 20% chance of requiring 2 hits
        points: Math.random() < 0.1 ? 3 : 1 // 10% chance of being worth 3 points
    });

    // Initialize gifts when game starts
    useEffect(() => {
        if (gameStarted) {
            setGifts([createGift()]);
        }
    }, [gameStarted]);

    // Game update loop
    useEffect(() => {
        if (!gameStarted) return;

        let frameId: number;
        const currentTime = Date.now();

        const updateGame = () => {
            // Update bullets with trails
            setBullets(prev => prev
                .filter(bullet => bullet.y > 0)
                .map(bullet => ({
                    ...bullet,
                    y: bullet.y - bullet.speed,
                    trail: [...bullet.trail, { x: bullet.x, y: bullet.y }]
                        .slice(-5)
                }))
            );

            // Update gifts and check collisions
            setGifts(prev => {
                return prev.map(gift => {
                    if (gift.hit) return gift;

                    const newY = gift.y + gift.speed;

                    // Check bullet collisions
                    const hitByBullet = bullets.some(bullet => (
                        bullet.x >= gift.x &&
                        bullet.x <= gift.x + gift.width &&
                        bullet.y <= newY + gift.height &&
                        bullet.y >= newY
                    ));

                    if (hitByBullet) {
                        // Handle combo system
                        const timeSinceLastHit = currentTime - lastHitTime;
                        const newCombo = timeSinceLastHit < 1000 ? combo + 1 : 1;
                        setCombo(newCombo);
                        setLastHitTime(currentTime);

                        // Calculate score with combo
                        const basePoints = gift.points || 1; // Default to 1 if points not set
                        const comboBonus = Math.floor(newCombo / 3); // Bonus point every 3 hits in combo
                        const totalPoints = basePoints + comboBonus;

                        setScore(s => s + totalPoints);

                        // Add score popup with correct points
                        setScorePopups(prev => [...prev, {
                            x: gift.x + gift.width / 2,
                            y: newY,
                            score: basePoints, // Show base points in popup
                            time: currentTime
                        }]);

                        // Handle multi-hit gifts
                        if (gift.health > 1) {
                            return { ...gift, health: gift.health - 1 };
                        }

                        return { ...gift, hit: true };
                    }

                    return { ...gift, y: newY };
                }).filter(gift => gift.y < dimensions.height + 50);
            });

            // Clean up old score popups
            setScorePopups(prev =>
                prev.filter(popup => currentTime - popup.time < 1000)
            );

            frameId = requestAnimationFrame(updateGame);
        };

        frameId = requestAnimationFrame(updateGame);
        return () => cancelAnimationFrame(frameId);
    }, [gameStarted, dimensions.height, bullets, combo, lastHitTime]);

    // Spawn new gifts periodically
    useEffect(() => {
        if (!gameStarted || timeLeft <= 0 || totalGifts >= 150) return;

        const spawnInterval = setInterval(() => {
            setTotalGifts(prev => prev + 1);
            setGifts(prev => [...prev, createGift()]);
        }, 800); // Spawn every 800ms

        return () => clearInterval(spawnInterval);
    }, [gameStarted, timeLeft, totalGifts]);

    // Handle shooting with sound
    const shoot = () => {
        const newBullet = {
            x: santa.x + santa.width / 2,
            y: santa.y,
            speed: 10,
            trail: [] as Array<{ x: number, y: number }>
        };
        setBullets(prev => [...prev, newBullet]);
    };

    // Add shooting controls
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                shoot();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [santa.x]);

    // Update keyboard controls with smoother movement
    useEffect(() => {
        let isMovingLeft = false;
        let isMovingRight = false;
        let moveInterval: number | null = null;

        const updatePosition = () => {
            setSanta(prev => {
                let newX = prev.x;
                if (isMovingLeft) newX = Math.max(0, prev.x - prev.speed);
                if (isMovingRight) newX = Math.min(dimensions.width - prev.width, prev.x + prev.speed);

                return {
                    ...prev,
                    x: newX,
                    isMoving: isMovingLeft || isMovingRight,
                    direction: isMovingLeft ? 'left' : isMovingRight ? 'right' : prev.direction
                };
            });
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.repeat) return; // Prevent key repeat

            switch (e.key) {
                case 'ArrowLeft':
                case 'a':
                    isMovingLeft = true;
                    break;
                case 'ArrowRight':
                case 'd':
                    isMovingRight = true;
                    break;
            }

            if (!moveInterval) {
                moveInterval = window.setInterval(updatePosition, 16);
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'ArrowLeft':
                case 'a':
                    isMovingLeft = false;
                    break;
                case 'ArrowRight':
                case 'd':
                    isMovingRight = false;
                    break;
            }

            if (!isMovingLeft && !isMovingRight && moveInterval) {
                clearInterval(moveInterval);
                moveInterval = null;
                setSanta(prev => ({ ...prev, isMoving: false }));
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            if (moveInterval) clearInterval(moveInterval);
        };
    }, [dimensions.width]);

    // Update Santa position when window resizes
    useEffect(() => {
        setSanta(prev => ({
            ...prev,
            x: Math.min(dimensions.width - prev.width, dimensions.width / 2),
            y: dimensions.height - 80,
        }));
    }, [dimensions]);

    // Game timer
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 0) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Add touch controls
    const [moveInterval, setMoveInterval] = useState<NodeJS.Timeout | null>(null);
    const [touchSide, setTouchSide] = useState<'left' | 'right' | null>(null);

    const startMoving = (side: 'left' | 'right') => {
        setTouchSide(side);
        if (moveInterval) return;

        const interval = setInterval(() => {
            setSanta(prev => {
                let newX = prev.x;
                const moveAmount = prev.speed * 1.2; // Slightly faster for mobile

                if (side === 'left') {
                    newX = Math.max(0, prev.x - moveAmount);
                } else {
                    newX = Math.min(dimensions.width - prev.width, prev.x + moveAmount);
                }

                return {
                    ...prev,
                    x: newX,
                    isMoving: true,
                    direction: side
                };
            });
        }, 16);

        setMoveInterval(interval);
    };

    const stopMoving = () => {
        if (moveInterval) {
            clearInterval(moveInterval);
            setMoveInterval(null);
        }
        setTouchSide(null);
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (moveInterval) {
                clearInterval(moveInterval);
            }
        };
    }, [moveInterval]);

    if (!gameStarted) {
        return (
            <div className="fixed inset-0 bg-gradient-to-b from-[#2C3639] via-[#3F4E4F] to-[#2C3639] flex items-center justify-center p-4">
                <Snow />

                {/* Stars background */}
                <div className="absolute inset-0">
                    <div className="stars"></div>
                    <div className="stars2"></div>
                    <div className="stars3"></div>
                </div>

                <div className="bg-[#2C3639]/80 backdrop-blur-md p-4 sm:p-8 md:p-12 rounded-3xl shadow-xl border border-[#A27B5C]/30 text-center w-full max-w-2xl mx-4">
                    <div className="animate-float mb-6 sm:mb-8 relative">
                        <span className="text-6xl sm:text-8xl filter drop-shadow-glow">🎅</span>
                        <div className="absolute -inset-4 bg-white/10 rounded-full blur-xl animate-pulse"></div>
                    </div>
                    <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r 
                                 from-[#DCD7C9] to-[#A27B5C] mb-6 sm:mb-8 animate-glow">
                        Santa's Gift Shooter
                    </h1>
                    <div className="bg-[#3F4E4F]/50 backdrop-blur-sm rounded-xl p-4 sm:p-8 mb-6 sm:mb-8 text-white
                                  border border-[#A27B5C]/20 shadow-lg transform hover:scale-[1.02] transition-all">
                        <h2 className="text-2xl sm:text-3xl font-semibold mb-4 sm:mb-6 text-[#DCD7C9]">How to Play</h2>
                        <div className="space-y-3 sm:space-y-4 text-lg">
                            <p className="flex items-center justify-center gap-2 sm:gap-3 text-base sm:text-xl">
                                <span className="px-3 py-1 sm:px-4 sm:py-2 bg-[#2C3639]/80 rounded-lg border border-[#A27B5C]/30">←/→</span>
                                <span className="text-[#DCD7C9]">or</span>
                                <span className="px-3 py-1 sm:px-4 sm:py-2 bg-[#2C3639]/80 rounded-lg border border-[#A27B5C]/30">A/D</span>
                                <span className="text-[#DCD7C9]">to move</span>
                            </p>
                            <p className="flex items-center justify-center gap-2 sm:gap-3 text-base sm:text-xl">
                                <span className="px-4 py-1 sm:px-6 sm:py-2 bg-[#2C3639]/80 rounded-lg border border-[#A27B5C]/30">SPACE</span>
                                <span className="text-[#DCD7C9]">to shoot</span>
                            </p>
                            <p className="text-base sm:text-xl text-[#DCD7C9] mt-4 sm:mt-6">
                                <span className="text-2xl">🎁</span> Shoot the gifts to score points!
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setGameStarted(true)}
                        className="relative group bg-gradient-to-r from-[#A27B5C] to-[#DCD7C9] 
                                 px-8 sm:px-16 py-4 sm:py-6 rounded-xl text-xl sm:text-3xl font-bold text-white
                                 transition-all duration-300 transform hover:scale-105
                                 hover:shadow-[0_0_40px_rgba(220,215,201,0.4)]
                                 active:scale-95"
                    >
                        <span className="absolute inset-0 bg-gradient-to-r from-[#DCD7C9] to-[#A27B5C] 
                                        rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                        <span className="relative flex items-center gap-2 sm:gap-3">
                            <span className="text-xl sm:text-2xl">🎮</span>
                            Start Game
                        </span>
                    </button>
                    <div className="mt-6 text-[#DCD7C9]/60 text-sm">
                        Built with ❤️ by{' '}
                        <a
                            href="https://x.com/heylalapeta"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#DCD7C9] hover:text-[#A27B5C] transition-colors"
                        >
                            @heylalapeta
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-gradient-to-b from-[#2C3639] via-[#3F4E4F] to-[#2C3639]">
            <div className="relative w-full h-full">
                <Snow />
                <Clouds />

                {/* Score Display - improved design */}
                <div className="absolute top-4 left-0 right-0 z-10 px-4">
                    <div className="max-w-md mx-auto flex flex-row justify-between items-start gap-4">
                        <div className="bg-[#2C3639]/80 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-[#A27B5C]/30">
                            <div className="flex items-center gap-3">
                                <span className="text-4xl">🎁</span>
                                <div>
                                    <p className="text-[#DCD7C9]/60 text-sm uppercase tracking-wider mb-1">Score</p>
                                    <p className="text-4xl font-bold text-[#DCD7C9]">{score}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-[#2C3639]/80 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-[#A27B5C]/30">
                            <div className="flex items-center gap-3">
                                <span className="text-4xl">⏱️</span>
                                <div>
                                    <p className="text-[#DCD7C9]/60 text-sm uppercase tracking-wider mb-1">Time Left</p>
                                    <p className="text-4xl font-bold text-[#DCD7C9]">{timeLeft}s</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Combo display - centered below score cards */}
                    {combo > 1 && Date.now() - lastHitTime < 1000 && (
                        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-4">
                            <div className="bg-[#2C3639]/80 backdrop-blur-md px-6 py-2 rounded-full 
                                          shadow-lg border border-[#A27B5C]/30">
                                <p className="text-2xl font-bold text-[#DCD7C9] animate-pulse">
                                    x{combo} Combo!
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Mobile Controls */}
                <div className="fixed bottom-8 left-0 right-0 z-10 flex justify-between px-8 sm:hidden">
                    {/* Left Move Button */}
                    <button
                        className="bg-[#2C3639]/80 backdrop-blur-md p-6 rounded-full shadow-lg border border-[#A27B5C]/30
                                 active:scale-95 transition-transform touch-none"
                        onTouchStart={() => startMoving('left')}
                        onTouchEnd={stopMoving}
                    >
                        <span className="text-3xl">👈</span>
                    </button>

                    {/* Shoot Button */}
                    <button
                        className="bg-[#2C3639]/80 backdrop-blur-md p-6 rounded-full shadow-lg border border-[#A27B5C]/30
                                 active:scale-95 transition-transform touch-none"
                        onTouchStart={shoot}
                    >
                        <span className="text-3xl">🎯</span>
                    </button>

                    {/* Right Move Button */}
                    <button
                        className="bg-[#2C3639]/80 backdrop-blur-md p-6 rounded-full shadow-lg border border-[#A27B5C]/30
                                 active:scale-95 transition-transform touch-none"
                        onTouchStart={() => startMoving('right')}
                        onTouchEnd={stopMoving}
                    >
                        <span className="text-3xl">👉</span>
                    </button>
                </div>

                {/* Game canvas */}
                <GameCanvas
                    width={dimensions.width}
                    height={dimensions.height}
                    santa={santa}
                    gifts={gifts}
                    bullets={bullets}
                    combo={combo}
                    lastHitTime={lastHitTime}
                    scorePopups={scorePopups}
                />

                {/* Game Over Screen */}
                {timeLeft === 0 && (
                    <div className="fixed inset-0 bg-[#2C3639]/90 backdrop-blur-md flex items-center justify-center z-20 p-4">
                        <div className="bg-[#2C3639]/80 backdrop-blur-md p-6 sm:p-8 md:p-12 rounded-3xl shadow-xl border border-[#A27B5C]/30 text-center w-full max-w-lg mx-4">
                            <div className="animate-float mb-4 sm:mb-6 relative">
                                <span className="text-5xl sm:text-7xl filter drop-shadow-glow">🎄</span>
                                <div className="absolute -inset-4 bg-white/10 rounded-full blur-xl animate-pulse"></div>
                            </div>
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r 
                                         from-[#DCD7C9] to-[#A27B5C] mb-6 sm:mb-8 animate-glow">Game Over!</h2>
                            <div className="bg-[#3F4E4F]/50 backdrop-blur-sm rounded-xl p-6 sm:p-8 mb-6 sm:mb-8
                                          border border-[#A27B5C]/20 shadow-lg transform hover:scale-[1.02] transition-all">
                                <p className="text-[#DCD7C9]/60 text-xs sm:text-sm uppercase tracking-wider mb-1">Final Score</p>
                                <p className="text-4xl sm:text-5xl font-bold text-[#DCD7C9] animate-pulse">{score}</p>
                                {/* Add score celebration effect */}
                                <div className="absolute -inset-1 bg-gradient-to-r from-[#DCD7C9]/0 via-[#DCD7C9]/10 to-[#DCD7C9]/0
                                              animate-shine pointer-events-none"></div>
                            </div>
                            <button
                                onClick={() => window.location.reload()}
                                className="relative group bg-gradient-to-r from-[#A27B5C] to-[#DCD7C9] 
                                         px-8 sm:px-16 py-4 sm:py-6 rounded-xl text-xl sm:text-3xl font-bold text-white
                                         transition-all duration-300 transform hover:scale-105
                                         hover:shadow-[0_0_40px_rgba(220,215,201,0.4)]
                                         active:scale-95"
                            >
                                <span className="absolute inset-0 bg-gradient-to-r from-[#DCD7C9] to-[#A27B5C] 
                                                rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                                <span className="relative flex items-center gap-2 sm:gap-3">
                                    <span className="text-xl sm:text-2xl">🎮</span>
                                    Play Again
                                </span>
                            </button>
                            <div className="mt-6 text-[#DCD7C9]/60 text-sm">
                                Built with ❤️ by{' '}
                                <a
                                    href="https://x.com/heylalapeta"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#DCD7C9] hover:text-[#A27B5C] transition-colors"
                                >
                                    @heylalapeta
                                </a>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Game; 