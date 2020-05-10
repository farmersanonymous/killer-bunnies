import { MeshBuilder, PBRMaterial, Color3, Vector3, Mesh } from 'babylonjs';
import { BabylonStore } from '../store/babylonStore';
import { CollisionGroup } from '../util/collisionGroup';

/**
 * Proxy cube that will be used for collision detection testing.
 */
export class ProxyCube {
    #_mesh: Mesh;

    /**
     * Constructor.
     * @param name The name of the cube to create.
     * @param size The size of the cube to create. width = x, height = y, depth = z.
     */
    constructor(name: string, position: Vector3, size: Vector3) {
        // The mesh is an environment and can collide with the player, enemy, or bullet. Will be hidden from the scene.
        this.#_mesh = MeshBuilder.CreateBox(name, { width: size.x, height: size.y, depth: size.z });
        this.#_mesh.position = position;
        this.#_mesh.checkCollisions = true;
        this.#_mesh.collisionGroup = CollisionGroup.Environment;
        this.#_mesh.collisionMask = CollisionGroup.Player | CollisionGroup.Enemy | CollisionGroup.Bullet;
        this.#_mesh.isVisible = false;

        // Create a box material for the ProxyCube.
        const boxMaterial = new PBRMaterial('boxMaterial', BabylonStore.scene);
        boxMaterial.emissiveColor = Color3.White();
        this.#_mesh.material = boxMaterial;
    }

    /**
     * Release all resources associated with this ProxyCube.
     */
    public dispose(): void {
        this.#_mesh.material.dispose();
        this.#_mesh.dispose();
    }
}