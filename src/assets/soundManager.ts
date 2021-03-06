import { Sound, Vector3, Engine } from "babylonjs";
import { BabylonStore } from "../store/babylonStore";

/**
 * Options to apply when playing a sound.
 */
export class SoundOptions {
    /**
     * Loops the sound.
     */
    loop?: boolean;
    /**
     * The position in space to apply the sound.
     */
    position?: Vector3;
    /**
     * The volume to use for the sound.
     */
    volume?: number;
    /**
     * The callback to trigger when the sound has finished.
     */
    onEnd?: () => void;
}

/**
 * Handles loading and playing music and sfx for the game.
 */
export class SoundManager {
    private static _sounds: Map<string, Sound> = new Map<string, Sound>();

    private constructor() { /** Static class */ }

    /**
     * Loads a sound from a url.
     * @param name The name of the sound. Needed for playback after it's loaded.
     * @param url The url of the sound to load.
     * @returns A promise that will resolve when the sound has been loaded.
     */
    public static load(name: string, url: string): Promise<void> {
        return new Promise((resolve) => {
            const sound = new Sound(name, url, BabylonStore.scene, () => {
                resolve();
            });
            this._sounds.set(name, sound);
        });
    }
    /**
     * Plays a sound from a name that was passed in from 'load'.
     * @param name The name of the sound.
     * @param loop If the sound should loop or not. Default: false.
     */
    public static play(name: string, options?: SoundOptions): void {
        if (!Engine.audioEngine.unlocked) {
            return;
        }
        options = options || {};

        const sound = this._sounds.get(name);
        sound.loop = options.loop || false;
        sound.spatialSound = options.position ? true : false;
        sound.setPosition(options.position || Vector3.Zero());
        if (options.onEnd) {
            sound.onEndedObservable.clear();
            sound.onEndedObservable.add(() => {
                options?.onEnd();
            });
        }
        if (options.volume !== undefined)
            sound.setVolume(options.volume);
        sound.play();
    }
    /**
     * Checks to see if a sound is currently playing.
     * @param name The name of the sound to check.
     * @returns A boolean indicating if the sound is currently playing.
     */
    public static isPlaying(name: string): boolean {
        const sound = this._sounds.get(name);
        return sound.isPlaying;
    }
    /**
     * Stops a sound from a name that was passed in from 'load'.
     * @param name The name of the sound.
     */
    public static stop(name: string): void {
        if (!Engine.audioEngine.unlocked) {
            return;
        }

        const sound = this._sounds.get(name);
        sound.stop();
    }
}