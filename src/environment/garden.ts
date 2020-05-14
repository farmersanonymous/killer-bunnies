import { TransformNode, Mesh, MeshBuilder } from 'babylonjs';
import { Spawner } from '../util/spawner';
import { Navigation } from '../gameplay/navigation';

/**
 * Tha main Garden scene.
 */
export class Garden {
    #_rootNodes: TransformNode[];
    #_ground: Mesh;

    /**
     * Constructor.
     */
    public constructor() {
        const spawner = Spawner.getSpawner('Garden');
        this.#_rootNodes = spawner.instantiate().rootNodes;

        this.#_ground = MeshBuilder.CreateGround('Ground', {
            width: 100,
            height: 100
        });        

        const colliders = this.#_rootNodes.map(n => n.getChildMeshes(false, m => m.name.startsWith('Collider'))).reduce((acc, val) => acc.concat(val), []);
        colliders.push(this.#_ground);
        colliders.forEach(c => {
            c.isVisible = false;
        });

        Navigation.init(colliders as Mesh[]);
    }

    /**
     * Release all resources associated with this Garden.
     */
    public dispose(): void {
        this.#_ground.dispose();
        this.#_rootNodes.forEach(n => n.dispose());
    }
}