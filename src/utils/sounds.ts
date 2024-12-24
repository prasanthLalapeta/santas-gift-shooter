export const sounds = {
    shoot: new Audio('/sounds/shoot.mp3'),
    hit: new Audio('/sounds/hit.mp3'),
    combo: new Audio('/sounds/combo.mp3'),
    gameOver: new Audio('/sounds/game-over.mp3')
};

// Set volume for all sounds
Object.values(sounds).forEach(sound => {
    sound.volume = 0.3; // Adjust volume as needed
}); 