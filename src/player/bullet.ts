import { MeshBuilder, Mesh, Vector3, Color3, PBRMaterial } from 'babylonjs';
import { BabylonStore } from '../store/babylonStore';
import { CollisionGroup } from '../util/collisionGroup';

/**
 * A bullet that gets spawned by the Farmer.
 */
export class Bullet {
    #_mesh: Mesh;
    #_timeout: number;

    /**
     * Constructor.
     * @param spawnPosition The position to spawn the bullet at.
     * @param speed The speed at which the bullet will travel. Scaled by delta time.
     * @param direction The direction the bullet will travel in.
     * @param timelimit The time in seconds before the bullet will dispose itself and disappear.
     */
    constructor(spawnPosition: Vector3, speed: number, direction: Vector3, timelimit: number) {
        // The mesh is a bullet and can collide with the environment or an enemy.
        this.#_mesh = MeshBuilder.CreateSphere('bullet', { diameter: 1 });
        this.#_mesh.checkCollisions = true;
        this.#_mesh.collisionGroup = CollisionGroup.Bullet;
        this.#_mesh.collisionMask = CollisionGroup.Environment | CollisionGroup.Enemy;
        this.#_mesh.position = spawnPosition;

        // Setup the material for the bullet.
        const bulletMaterial = new PBRMaterial('bulletMaterial', BabylonStore.scene);
        bulletMaterial.emissiveColor = Color3.Blue();
        this.#_mesh.material = bulletMaterial;

        // Destroy bullet if it hits the timelimit.
        this.#_timeout = window.setTimeout(() => {
            this.#_mesh.dispose();
            bulletMaterial.dispose();
        }, timelimit * 1000);
        
        // Update loop.
        BabylonStore.scene.registerBeforeRender(() => {
            const deltaTime = BabylonStore.engine.getDeltaTime() / 1000;
            this.#_mesh.moveWithCollisions(direction.scale(speed * deltaTime));
        });
        
        // Destroy bullet if it hits another mesh.
        this.#_mesh.onCollideObservable.add(() => {
            window.clearTimeout(this.#_timeout);
            this.#_mesh.dispose();
            bulletMaterial.dispose();
        });
    }
}