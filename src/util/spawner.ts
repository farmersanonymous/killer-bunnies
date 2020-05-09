import { SceneLoader, AssetContainer, InstantiatedEntries } from "babylonjs";
import 'babylonjs-loaders';
import { BabylonStore } from '../store/babylonStore';

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
    public static async create(name: string, url: string, onProgress?: (progress: number) => { }): Promise<Spawner> {
        const assetContainer = await SceneLoader.LoadAssetContainerAsync(url, '', BabylonStore.scene, (evt) => {
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