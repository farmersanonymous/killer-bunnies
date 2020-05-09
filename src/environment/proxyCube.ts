import { MeshBuilder, PBRMaterial, Color3, Vector3 } from 'babylonjs';
import { BabylonStore } from '../store/babylonStore';
import { CollisionGroup } from '../util/collisionGroup';

/**
 * Proxy cube that will be used for collision detection testing.
 */
export class ProxyCube {
    /**
     * Constructor.
     * @param name The name of the cube to create.
     * @param size The size of the cube to create. width = x, height = y, depth = z.
     */
    constructor(name: string, position: Vector3, size: Vector3) {
        // The mesh is an environment and can collide with the player, enemy, or bullet. Will be hidden from the scene.
        const mesh = MeshBuilder.CreateBox(name, { width: size.x, height: size.y, depth: size.z });
        mesh.position = position;
        mesh.checkCollisions = true;
        mesh.collisionGroup = CollisionGroup.Environment;
        mesh.collisionMask = CollisionGroup.Player | CollisionGroup.Enemy | CollisionGroup.Bullet;
        mesh.isVisible = false;

        // Create a box material for the ProxyCube.
        const boxMaterial = new PBRMaterial('boxMaterial', BabylonStore.scene);
        boxMaterial.emissiveColor = Color3.White();
        mesh.material = boxMaterial;

        const colliderMesh = MeshBuilder.CreateIcoSphere('icotest', { radiusX: mesh.ellipsoid.x, radiusY: mesh.ellipsoid.y, radiusZ: mesh.ellipsoid.z }, BabylonStore.scene);
        colliderMesh.material = new PBRMaterial('colliderMesh', BabylonStore.scene);
        colliderMesh.material.wireframe = true;
        // colliderMesh.parent = mesh;
    }
}