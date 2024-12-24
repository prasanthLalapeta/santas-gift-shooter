import { defaultSounds } from './defaultSounds';

class SoundManager {
    private static instance: SoundManager;
    private sounds: Map<string, HTMLAudioElement>;
    private isMuted: boolean = false;

    private constructor() {
        this.sounds = new Map();
        this.initializeSounds();
    }

    public static getInstance(): SoundManager {
        if (!SoundManager.instance) {
            SoundManager.instance = new SoundManager();
        }
        return SoundManager.instance;
    }

    private initializeSounds() {
        this.addSound('shoot', '/sounds/shoot.mp3');
        this.addSound('hit', '/sounds/hit.mp3');
        this.addSound('combo', '/sounds/combo.mp3');
        this.addSound('gameOver', '/sounds/game-over.mp3');
    }

    private addSound(name: string, path: string) {
        try {
            const audio = new Audio(path);
            audio.preload = 'auto';
            audio.volume = 0.3;
            this.sounds.set(name, audio);
        } catch (error) {
            console.warn(`Error adding sound: ${name}`, error);
        }
    }

    public play(soundName: string) {
        if (this.isMuted) return;

        const sound = this.sounds.get(soundName);
        if (sound) {
            sound.currentTime = 0;  // Reset the sound to start
            sound.play().catch(error => console.warn('Error playing sound:', error));
        }
    }

    public toggleMute() {
        this.isMuted = !this.isMuted;
        return this.isMuted;
    }
}

export default SoundManager; 