import { Spawner } from './spawner';
import { Scalar } from 'babylonjs';
import { SoundManager } from './soundManager';

/**
 * A LoadObject interface. This is used to keep track of all the downloads that get added through 'addDownload'.
 */
interface LoaderObject {
    /**
     * The name of the object to download.
     */
    name: string;
    /**
     * The type of loaded asset.
     */
    type: LoaderType;
    /**
     * The url of the object to download.
     */
    url: string;
}

/**
 * The type of asset to load.
 */
export enum LoaderType {
    /**
     * A 3D art asset.
     */
    Art,
    /**
     * A sound asset.
     */
    Sound
}

/**
 * Downloads and keeps track of progress of all assets for initial loading.
 */
export class Loader {
    private static downloads: LoaderObject[] = [];

    private constructor() { /** Static Class. */ }

    /**
     * Add a download object to the list. It will be downloaded once 'startDownload' gets called.
     * @param name The name of the download. This will be tracked in the Spawner and once the download is complete,
     * can be accessed by 'Spawner.getSpawner'.
     * @param type The type of download asset.
     * @param url The url for where to download the resources from.
     */
    public static addDownload(name: string, type: LoaderType, url: string): void {
        this.downloads.push({
            name: name,
            url: url,
            type: type
        });
    }

    /**
     * Starts the download process. Will return a progress update between 0 and 1.
     * @param onProgress A callback that will get triggered with updated progress. Returns a value between 0 and 1.
     * @returns A promise that will resolve once the download is finished.
     */
    public static async startDownload(onProgress: (progress: number) => void): Promise<void> {
        for (let i = 0; i < this.downloads.length; i++) {
            if (this.downloads[i].type === LoaderType.Art) {
                await Spawner.create(this.downloads[i].name, this.downloads[i].url, (spawnerProgress: number) => {
                    onProgress(Scalar.Lerp(0, 1, (spawnerProgress + i) / this.downloads.length));
                });
            }
            else if(this.downloads[i].type === LoaderType.Sound) {
                await SoundManager.load(this.downloads[i].name, this.downloads[i].url);
                onProgress(Scalar.Lerp(0, 1, (i+1) / this.downloads.length));
            }
        }
    }
}