import { TransformNode, Mesh, MeshBuilder } from 'babylonjs';
import { Spawner } from '../assets/spawner';
import { Navigation } from '../gameplay/navigation';
import { BaseCollidable } from '../collision/baseCollidable';
import { CollisionGroup } from '../collision/collisionManager';

/**
 * Tha main Garden scene.
 */
export class Garden extends BaseCollidable {
    #_rootNodes: TransformNode[];
    #_ground: Mesh;

    /**
     * Constructor.
     */
    public constructor() {
        super(CollisionGroup.Environment);

        const spawner = Spawner.getSpawner('Garden');
        this.#_rootNodes = spawner.instantiate().rootNodes;

        this.#_ground = MeshBuilder.CreateGround('Ground', {
            width: 100,
            height: 100
        });
        this.#_ground.isVisible = false;

        const colliders = this.#_rootNodes.map(n => n.getChildMeshes(false, m => m.name.startsWith('Collider'))).reduce((acc, val) => acc.concat(val), []);
        colliders.forEach(c => {            
            c.isVisible = false;
            super.registerMesh(c, c.name);
        });
        colliders.push(this.#_ground);

        Navigation.init(colliders as Mesh[]);
    }

    /**
     * Release all resources associated with this Garden.
     */
    public dispose(): void {
        super.dispose();
        this.#_ground.dispose();
        this.#_rootNodes.forEach(n => n.dispose());
    }
}