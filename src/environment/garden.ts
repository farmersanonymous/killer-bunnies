import { Vector3, TransformNode } from 'babylonjs';
import { ProxyCube } from '../environment/proxyCube';
import { Spawner } from '../util/spawner';

/**
 * Tha main Garden scene.
 */
export class Garden {
    #_rootNodes: TransformNode[];
    #_proxyCubes: ProxyCube[] = [];

    /**
     * Constructor.
     */
    public constructor() {
        const spawner = Spawner.getSpawner('Garden');
        this.#_rootNodes = spawner.instantiate().rootNodes;

        this.#_proxyCubes.push(new ProxyCube('cube1', new Vector3(26, 0, 0), new Vector3(1, 1, 200)));
        this.#_proxyCubes.push(new ProxyCube('cube2', new Vector3(0, 0, 37), new Vector3(100, 1, 1)));
        this.#_proxyCubes.push(new ProxyCube('cube3', new Vector3(-26, 0, 0), new Vector3(1, 1, 200)));
        this.#_proxyCubes.push(new ProxyCube('cube4', new Vector3(0, 0, -35), new Vector3(100, 1, 1)));
    }

    /**
     * Release all resources associated with this Garden.
     */
    public dispose(): void {
        this.#_rootNodes.forEach(n => n.dispose());
        this.#_proxyCubes.forEach(c => c.dispose());
    }
}