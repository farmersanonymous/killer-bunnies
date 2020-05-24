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
    #_burrowSpawnPoints: TransformNode[] = [];
    #_carrotSpawnPoints: TransformNode[] = [];

    /**
     * Constructor.
     */
    public constructor() {
        super(CollisionGroup.Environment);

        const gardenSpawner = Spawner.getSpawner('Garden');
        this.#_rootNodes = gardenSpawner.instantiate().rootNodes;
        const burrowParent = this.#_rootNodes[0].getChildTransformNodes(false, n => n.name === 'SpawnPoints_Burrows' );
        this.#_burrowSpawnPoints = burrowParent[0].getChildTransformNodes();
        const carrotParent = this.#_rootNodes[0].getChildTransformNodes(false, n => n.name === 'SpawnPoints_Plants');
        this.#_carrotSpawnPoints = carrotParent[0].getChildTransformNodes();

        const wellSpawner = Spawner.getSpawner('Well');
        wellSpawner.instantiate();

        const meteoriteSpawner = Spawner.getSpawner('Meteorite');
        meteoriteSpawner.instantiate();

        this.#_ground = MeshBuilder.CreateGround('Ground', {
            width: 100,
            height: 100
        });
        this.#_ground.isVisible = false;

        // Remove old nodes from garden.

        const colliders = this.#_rootNodes[0].getChildMeshes(false, m => m.name.startsWith('Collider'));
        colliders.forEach(c => {            
            c.isVisible = false;
            super.registerMesh(c, c.name);
        });

        const navMesh = this.#_rootNodes[0].getChildMeshes(false, m => m.name === 'GroundNavMesh');
        Navigation.init(navMesh as Mesh[]);
    }

    /**
     * Gets a random burrow node.
     * @returns The TransformNode that is a spawn point for a burrow.
     */
    public getRandomBurrowNode(): TransformNode {
        let node: TransformNode;
        while(!node || node.getChildMeshes().length != 0) {
            // Generates a random integer to pass into burrow spawn points array.
            const min = 0;
            const max = Math.floor(this.#_burrowSpawnPoints.length - 1);
            const randInt = Math.floor(Math.random() * (max - min + 1)) + min;
            node = this.#_burrowSpawnPoints[randInt];
        }
        return node;
    }

    /**
     * Gets a random carrot node.
     * @returns The TransformNode that is a spawn point for a carrot.
     */
    public getRandomCarrotNode(): TransformNode {
        let node: TransformNode;
        while(!node || node.getChildMeshes().length != 0) {
            // Generates a random integer to pass into carrot spawn points array.
            const min = 0;
            const max = Math.floor(this.#_carrotSpawnPoints.length - 1);
            const randInt = Math.floor(Math.random() * (max - min + 1)) + min;
            node = this.#_carrotSpawnPoints[randInt];
        }
        return node;
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