import { Spawner } from './spawner';
import { Scalar } from 'babylonjs';

interface LoaderObject {
    name: string;
    url: string;
}

/**
 * Downloads and keeps track of progress of all assets for initial loading.
 */
export class Loader {
    private static downloads: LoaderObject[] = [];

    private constructor() { /** Static Class. */ }

    public static addDownload(name: string, url: string): void {
        this.downloads.push({
            name: name,
            url: url
        });
    }

    public static async startDownload(onProgress: (progress: number) => void): Promise<void> {
        for(let i = 0; i < this.downloads.length; i++) {
            await Spawner.create(this.downloads[i].name, this.downloads[i].url, (spawnerProgress: number) => {
                onProgress(Scalar.Lerp(0, 1, (spawnerProgress + i) / this.downloads.length));
            });
        }

        console.log('DONE!');
    }
}