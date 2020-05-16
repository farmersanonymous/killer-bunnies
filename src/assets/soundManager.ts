import { Sound } from "babylonjs";
import { BabylonStore } from "../store/babylonStore";

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
    public static load(name: string, url: string): void {
        const sound = new Sound(name, url, BabylonStore.scene);
        this.sounds.set(name, sound);
    }
    /**
     * Plays a sound from a name that was passed in from 'load'.
     * @param name The name of the sound.
     * @param loop If the sound should loop or not. Default: false.
     */
    public static play(name: string, loop = false): void {
        const sound = this.sounds.get(name);
        sound.loop = loop;
        sound.play();
    }
}