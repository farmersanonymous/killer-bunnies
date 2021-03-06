import { Image } from 'babylonjs-gui';

/**
 * Manages all images that are needed for the game.
 */
export class ImageManager {
    private static images: Map<string, string> = new Map<string, string>();

    private constructor() { /** Static class */ }

    /**
     * Loads an image from a url.
     * @param name The name of the image. Needed to get the image later.
     * @param url The url of the image to load.
     */
    public static load(name: string, url: string): void {
        this.images.set(name, url);
    }
    /**
     * Returns a new image based on the name that was passed into 'load'.
     * @param name The name of the image to get.
     * @returns The image that is assigned to the specified name.
     */
    public static get(name: string): Image {
        const url = this.images.get(name);
        return new Image(name, url);
    }
}