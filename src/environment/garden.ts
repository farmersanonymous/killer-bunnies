import { TransformNode, Mesh, MeshBuilder } from 'babylonjs';
import { Spawner } from '../assets/spawner';
import { Navigation } from '../gameplay/navigation';
import { CollisionGroup } from '../collision/collisionGroup';

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
        this.#_ground.isVisible = false;

        const colliders = this.#_rootNodes.map(n => n.getChildMeshes(false, m => m.name.startsWith('Collider'))).reduce((acc, val) => acc.concat(val), []);
        colliders.forEach(c => {
            c.checkCollisions = true;
            c.collisionGroup = CollisionGroup.Environment;
            c.collisionMask = CollisionGroup.Bullet;
            
            c.isVisible = false;
        });
        colliders.push(this.#_ground);

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