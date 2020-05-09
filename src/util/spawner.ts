import { SceneLoader, AssetContainer, InstantiatedEntries } from "babylonjs";
import 'babylonjs-loaders';
import { BabylonStore } from '../store/babylonStore';

/**
 * A GLTFFile interface. Used to deserialize a GLTF JSON string.
 */
interface GLTFFile {
    /**
     * A list of buffers that will need to be downloaded.
     */
    buffers: GLTFBuffer[];
}

/**
 * A GLTFBuffer interface. Used to deserialize a GLTF JSON string.
 */
interface GLTFBuffer {
    /**
     * The uri for the buffer that needs to be downloaded.
     */
    uri: string;
    /**
     * The byte length of the buffer. Used for calculating total download size.
     */
    byteLength: number;
}

/**
 * Controlls spawning imported assets.
 */
export class Spawner {
    #_assetContainer: AssetContainer;

    private static spawners: Map<string, Spawner> = new Map<string, Spawner>();

    /**
     * Constructor. Private. Create instances from the 'create' static function.
     * @param name The name of the spawner.
     * @param assetContainer The asset container that will be used to spawn every instance.
     */
    private constructor(name: string, assetContainer: AssetContainer) {
        this.#_assetContainer = assetContainer;
        Spawner.spawners.set(name, this);
    }

    /**
     * Instantiate a new instance from the asset container.
     * @returns The InstantiatedEntries returned from the asset container instantiation.
     */
    public instantiate(): InstantiatedEntries {
        return this.#_assetContainer.instantiateModelsToScene();
    }

    /**
     * Creates a spawner. This will be used to keep track of an imported asset that can be instantiated multiple times.
     * @param name The name of the spawner.
     * @param url The url for where the asset is located.
     * @param onProgress An optional progress callback that will return a number between 0 and 1.
     * @returns A promise that will return a Spawner when it resolves.
     */
    public static async create(name: string, url: string, onProgress?: (progress: number) => void): Promise<Spawner> {
        // Babylon doesn't have very good progress reporting. It only reports loaded/total of each file, but 
        // there is no way to determine total amount of files or the total amount of bytes that need to be downloaded
        // ahead of time. So we download the GLTF manually, read it's buffer contents, and use that for total download
        // size needed.
        const gltfRequest = new XMLHttpRequest();
        gltfRequest.open('GET', url);
        gltfRequest.send();
        const gltfData: string = await new Promise((resolve) => {
            gltfRequest.onload = (): void => {
                resolve(gltfRequest.responseText);
            };
        });
        const gltf: GLTFFile = JSON.parse(gltfData);
        const byteLengths = gltf.buffers.map(b => b.byteLength);
        byteLengths.push(parseInt(gltfRequest.getResponseHeader('content-length')));
        const totalBuffer: number = byteLengths.reduce((acc: number, curr: number) => { return acc + curr; });

        // Load an asset container from the server. We now have the total buffer size, so it's just a matter
        // of calculating the total percentage based on each file that gets downloaded. When loaded and total
        // are the same, we can assume that the next file is ready to be downloaded.
        let currentBuffer = 0;
        const assetContainer = await SceneLoader.LoadAssetContainerAsync(url, '', BabylonStore.scene, (evt) => {
            onProgress?.call(this, (currentBuffer + evt.loaded) / totalBuffer);
            if(evt.loaded === evt.total) {
                currentBuffer += evt.loaded;
            }
        });
        return new Spawner(name, assetContainer);
    }
    /**
     * Gets a spawner by name.
     * @param name The name of the spawner to get.
     * @returns The Spawner with the name specified.
     */
    public static getSpawner(name: string): Spawner {
        return this.spawners.get(name);
    }
}