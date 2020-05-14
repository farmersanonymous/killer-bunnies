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
    /**
     * A list of buffer views (textures) that will be downloaded.
     */
    bufferViews: GLTFBuffer[];
}

/**
 * A GLTFBuffer interface. Used to deserialize a GLTF JSON string.
 */
interface GLTFBuffer {
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
        return this.#_assetContainer.instantiateModelsToScene((name) => name);
    }

    /**
     * Creates a spawner. This will be used to keep track of an imported asset that can be instantiated multiple times.
     * @param name The name of the spawner.
     * @param url The url for where the asset is located.
     * @param onProgress An optional progress callback that will return a number between 0 and 1.
     * @returns A promise that will return a Spawner when it resolves.
     */
    public static async create(name: string, url: string, onProgress?: (progress: number) => void): Promise<Spawner> {
        // Load an asset container from the server. The first file that gets downloaded is always the gltf JSON file.
        // We skip calling progress on that, as we don't know the full size of the download yet. Once the gltf file is
        // downloaded, we can call onProgress, as the progress will now be accurate.
        let gltfLoaded = false;
        const assetContainer = await SceneLoader.LoadAssetContainerAsync(url, '', BabylonStore.scene, (evt) => {
            if(!gltfLoaded) {
                if(evt.loaded === evt.total) {
                    gltfLoaded = true;
                }
                return;
            }

            onProgress?.call(this, evt.loaded / evt.total);
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