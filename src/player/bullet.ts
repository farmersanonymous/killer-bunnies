import { MeshBuilder, Mesh, Vector3, Color3, PBRMaterial } from 'babylonjs';
import { BabylonStore } from '../store/babylonStore';
import { CollisionGroup } from '../collision/collisionManager';
import { BaseCollidable } from '../collision/baseCollidable';

/**
 * A bullet that gets spawned by the Farmer.
 */
export class Bullet extends BaseCollidable {
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
    #_damage: number;

    /**
     * Constructor.
     * @param spawnPosition The position to spawn the bullet at.
     * @param speed The speed at which the bullet will travel. Scaled by delta time.
     * @param direction The direction the bullet will travel in.
     * @param damage The damage the bullet does.
     * @param timelimit The time in seconds before the bullet will dispose itself and disappear.
     */
    constructor(spawnPosition: Vector3, speed: number, direction: Vector3, damage: number, timelimit: number) {
        super(CollisionGroup.Bullet);
        
        this.#_disposeTime = BabylonStore.time + timelimit;
        this.#_speed = speed;
        this.#_direction = direction;
        this.#_damage = damage;

        // The mesh is a bullet and can collide with the environment or an enemy.
        this.#_mesh = MeshBuilder.CreateSphere('bullet', { diameter: 0.1 });
        this.#_mesh.position = spawnPosition;

        const collider = MeshBuilder.CreateSphere('collider', { diameter: 0.1 });
        collider.parent = this.#_mesh;
        collider.position.y = -0.8;
        collider.isVisible = false;
        super.registerMesh(collider);

        // Setup the material for the bullet.
        const bulletMaterial = new PBRMaterial('bulletMaterial', BabylonStore.scene);
        bulletMaterial.emissiveColor = Color3.Yellow();
        this.#_mesh.material = bulletMaterial;

        Bullet.onBulletCreated?.call(this, this);
    }

    /**
     * The damage the bullet does.
     * @returns The damage the bullet does.
     */
    public get damage(): number {
        return this.#_damage;
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
            this.#_mesh.translate(this.#_direction, this.#_speed * deltaTime);
        }
    }

    /**
     * Callback that will get fired when the bullet hits an enemy or the environment.
     */
    public onCollide(): void {
        Bullet.onBulletDisposed?.call(this, this);
        this.dispose();
    }

    /**
     * Releases all resources associated with the Bullet.
     */
    public dispose(): void {
        super.dispose();
        this.#_mesh.material.dispose();
        this.#_mesh.dispose();
    }
}