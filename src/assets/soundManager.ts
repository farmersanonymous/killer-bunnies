import { Sound, Vector3 } from "babylonjs";
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
}

/**
 * Handles loading and playing music and sfx for the game.
 */
export class SoundManager {
    private static sounds: Map<string, Sound> = new Map<string, Sound>();

    private constructor() { /** Static class */ }

    /**
     * Loads a sound from a url.
     * @param name The name of the sound. Needed for playback after it's loaded.
     * @param url The url of the sound to load.
     */
    public static load(name: string, url: string): Promise<void> {
        return new Promise((resolve) => {
            const sound = new Sound(name, url, BabylonStore.scene, () => {
                resolve();
            });
            this.sounds.set(name, sound);
        });
    }
    /**
     * Plays a sound from a name that was passed in from 'load'.
     * @param name The name of the sound.
     * @param loop If the sound should loop or not. Default: false.
     */
    public static play(name: string, options?: SoundOptions): void {
        options = options || { };

        const sound = this.sounds.get(name);
        sound.loop = options.loop || false;
        sound.spatialSound = options.position ? true : false;
        sound.setPosition(options.position || Vector3.Zero());
        sound.play();
    }
    /**
     * Stops a sound from a name that was passed in from 'load'.
     * @param name The name of the sound.
     */
    public static stop(name: string): void {
        const sound = this.sounds.get(name);
        sound.stop();
    }
}