import { SceneLoader, Vector3 } from 'babylonjs';
import 'babylonjs-loaders';
import { ProxyCube } from '../environment/proxyCube';

/**
 * Tha main Garden scene.
 */
export class Garden {
    /**
     * Constructor. Private. Only created through the 'create' factory method.
     */
    private constructor() {
        new ProxyCube('cube1', new Vector3(26, 0, 0), new Vector3(1, 1, 200));
        new ProxyCube('cube2', new Vector3(0, 0, 37), new Vector3(100, 1, 1));
        new ProxyCube('cube3', new Vector3(-26, 0, 0), new Vector3(1, 1, 200));
        new ProxyCube('cube4', new Vector3(0, 0, -35), new Vector3(100, 1, 1));
    }

    /**
     * Creates a garden object from the url.
     * @param url The url of the Garden.
     * @returns A Promise that, when resolved, will return a Garden object.
     */
    public static async create(url: string): Promise<Garden> {
        await SceneLoader.ImportMeshAsync('', url);
        return new Garden();
    }
}