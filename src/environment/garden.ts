import { Vector3 } from 'babylonjs';
import { ProxyCube } from '../environment/proxyCube';
import { Spawner } from '../util/spawner';

/**
 * Tha main Garden scene.
 */
export class Garden {
    /**
     * Constructor.
     */
    public constructor() {
        const spawner = Spawner.getSpawner('Garden');
        spawner.instantiate();

        new ProxyCube('cube1', new Vector3(26, 0, 0), new Vector3(1, 1, 200));
        new ProxyCube('cube2', new Vector3(0, 0, 37), new Vector3(100, 1, 1));
        new ProxyCube('cube3', new Vector3(-26, 0, 0), new Vector3(1, 1, 200));
        new ProxyCube('cube4', new Vector3(0, 0, -35), new Vector3(100, 1, 1));
    }
}