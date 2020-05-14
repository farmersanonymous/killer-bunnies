import { MeshBuilder, Mesh, Vector3, Color3, PBRMaterial } from 'babylonjs';
import { BabylonStore } from '../store/babylonStore';
import { CollisionGroup } from '../util/collisionGroup';

/**
 * A bullet that gets spawned by the Farmer.
 */
export class Bullet {
    /**
     * Callback that will get fired when a bullet has been created.
     */
    public static onBulletCreated: (bullet: Bullet) => void;
    /**
     * Callback that will get fired when a bullet is about to be disposed.
     */
    public static onBulletDisposed: (bullet: Bullet) => void;

    #_mesh: Mesh;
    #_disposeTime: number;
    #_direction: Vector3;
    #_speed: number;

    /**
     * Constructor.
     * @param spawnPosition The position to spawn the bullet at.
     * @param speed The speed at which the bullet will travel. Scaled by delta time.
     * @param direction The direction the bullet will travel in.
     * @param timelimit The time in seconds before the bullet will dispose itself and disappear.
     */
    constructor(spawnPosition: Vector3, speed: number, direction: Vector3, timelimit: number) {
        this.#_disposeTime = BabylonStore.time + timelimit;
        this.#_speed = speed;
        this.#_direction = direction;

        // The mesh is a bullet and can collide with the environment or an enemy.
        this.#_mesh = MeshBuilder.CreateSphere('bullet', { diameter: 1 });
        this.#_mesh.checkCollisions = true;
        this.#_mesh.collisionGroup = CollisionGroup.Bullet;
        this.#_mesh.collisionMask = CollisionGroup.Environment | CollisionGroup.Enemy;
        this.#_mesh.position = spawnPosition;
        this.#_mesh.isPickable = false;

        // Setup the material for the bullet.
        const bulletMaterial = new PBRMaterial('bulletMaterial', BabylonStore.scene);
        bulletMaterial.emissiveColor = Color3.Blue();
        this.#_mesh.material = bulletMaterial;
        
        // Destroy bullet if it hits another mesh.
        this.#_mesh.onCollideObservable.add(() => {
            Bullet.onBulletDisposed?.call(this, this);
            this.dispose();
        });

        Bullet.onBulletCreated?.call(this, this);
    }

    /**
     * Updates the Bullet every frame.
     */
    public update(): void {
        if(this.#_disposeTime <= BabylonStore.time) {
            Bullet.onBulletDisposed?.call(this, this);
            this.dispose();
        }
        else
        {
            const deltaTime = BabylonStore.engine.getDeltaTime() / 1000;
            this.#_mesh.moveWithCollisions(this.#_direction.scale(this.#_speed * deltaTime));
        }
    }

    /**
     * Releases all resources associated with the Bullet.
     */
    public dispose(): void {
        this.#_mesh.material.dispose();
        this.#_mesh.dispose();
    }
}