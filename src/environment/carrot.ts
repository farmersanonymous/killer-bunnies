import { Spawner } from "../assets/spawner";
import { TransformNode } from "babylonjs";

/**
 * The Carrot will be gatherable by the Farmer and Nabber rabbits. Used to purchase upgrades.
 */
export class Carrot {
    #_root: TransformNode;

    /**
     * Constructor.
     * @param parent The parent that the Carrot will be spawned at.
     */
    constructor(parent: TransformNode) {
        const spawner = Spawner.getSpawner('Carrot');
        const instance = spawner.instantiate();
        this.#_root = instance.rootNodes[0];
        this.#_root.parent = parent;
    }
    /**
     * Release all resources associated with the Carrot.
     */
    public dispose(): void {
        this.#_root.dispose();
    }
}