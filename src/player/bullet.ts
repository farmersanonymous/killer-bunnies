import { MeshBuilder, Mesh, Vector3, Color3, PBRMaterial } from 'babylonjs';
import { BabylonStore } from '../store/babylonStore';

/**
 * A bullet that gets spawned by the Farmer.
 */
export class Bullet {
    #_mesh: Mesh;

    /**
     * Constructor.
     */
    constructor(spawnPosition: Vector3, speed: number, direction: Vector3, timelimit: number) {
        this.#_mesh = MeshBuilder.CreateSphere('Bullet', { diameter: 0.15 });
        this.#_mesh.position = spawnPosition;

        BabylonStore.scene.registerBeforeRender(() => {
            const deltaTime = BabylonStore.engine.getDeltaTime() / 1000;
            this.#_mesh.translate(direction.scale(deltaTime), speed);
        });

        // Setup the material for the bullet.
        const bulletMaterial = new PBRMaterial('bulletMaterial', BabylonStore.scene);
        bulletMaterial.emissiveColor = Color3.Blue();
        this.#_mesh.material = bulletMaterial;

        window.setTimeout(() => {
            this.#_mesh.dispose();
            bulletMaterial.dispose();
        }, timelimit * 1000);
    }
}