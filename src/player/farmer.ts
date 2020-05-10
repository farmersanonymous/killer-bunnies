import { Mesh, Vector2, Vector3, Angle, Scalar } from 'babylonjs';
import { CharacterController } from './characterController';
import { BabylonStore } from '../store/babylonStore';
import { Bullet } from './bullet';
import { CollisionGroup } from '../util/collisionGroup';
import { Spawner } from '../util/spawner';
import { PlayerCameraController } from '../camera/playerCameraController';

/**
 * The playable Farmer character.
 */
export class Farmer {
    #_controller: CharacterController;
    #_camera: PlayerCameraController;
    #_mesh: Mesh;
    // Waiting for final gun mesh.
    // #_gun: Mesh;
    #_gunCooldown = false;

    // Stats
    // The max health of the Farmer. Current health will be reset at the beginning of each round to max health.
    #_maxHealth = 100;
    // The amount of health the Farmer has.
    #_health = this.#_maxHealth;
    // How fast the Farmer will travel m/s.
    #_movementSpeed = 5;
    // The amount of damage each bullet will do.
    #_weaponDamage = 10;
    // How many seconds the bullets will last on screen before they are destroyed.
    #_weaponRange = 5;
    // How fast the bullets will travel m/s.
    #_weaponSpeed = 20;

    /**
     * Constructor.
     */
    public constructor() {
        // The mesh is a player and can collide with the environment.
        const spawner = Spawner.getSpawner('Farmer');
        const instance = spawner.instantiate();
        this.#_mesh = instance.rootNodes[0].getChildMeshes(false)[0] as Mesh;
        this.#_mesh.checkCollisions = true;
        this.#_mesh.collisionGroup = CollisionGroup.Player;
        this.#_mesh.collisionMask = CollisionGroup.Environment;
        this.#_mesh.ellipsoid = new Vector3(1, 2, 1);

        // Initialize the character controller and subscribe to the onMove and onRotate methods.
        this.#_controller = new CharacterController(this);
        this.#_controller.onMove = (dir): void => {
            const deltaTime = BabylonStore.engine.getDeltaTime() / 1000;
            this.#_mesh.moveWithCollisions(new Vector3(dir.y, 0, dir.x).scale(this.movementSpeed * deltaTime));
        };
        this.#_controller.onRotate = (dir): void => {
            // Rotation is off for some reason, don't really feal like looking into it, so subtracting 90 degrees in radians to offset.
            this.#_mesh.rotation = new Vector3(Angle.FromDegrees(90).radians(), -Angle.BetweenTwoPoints(Vector2.Zero(), dir).radians() - Angle.FromDegrees(180).radians(), 0);
        }
        // Initialize the camera.
        this.#_camera = new PlayerCameraController(this);
    }

    /**
     * Fires a bullet in the direction that the Farmer is facing. Will not fire if gun is on cooldown.
     */
    public fire(): void {
        if(this.#_gunCooldown) {
            return;
        }

        new Bullet(this.position.add(this.#_mesh.forward.scale(1.5)), this.weaponSpeed, this.#_mesh.up, this.weaponRange);
        this.#_gunCooldown = true;
        window.setTimeout(() => {
            this.#_gunCooldown = false;
        }, 250);
    }

    /**
     * Release all resources associated with this Farmer.
     */
    public dispose(): void {
        this.#_mesh.dispose();
        this.#_camera.dispose();
    }

    /**
     * The maximum amount of health the Farmer can have. The Farmer's health gets reset to maxHealth at the end of each round.
     * @returns The max health of the Farmer.
     */
    public get maxHealth(): number {
        return this.#_maxHealth;
    }
    /**
     * The amount of health the Farmer has. If his health reaches 0, it's game over!
     * @returns The health of the Farmer.
     */
    public get health(): number {
        return this.#_health;
    }
    /**
     * The movement speed of the Farmer in m/s.
     * @returns The movement speed of the Farmer.
     */
    public get movementSpeed(): number {
        return this.#_movementSpeed;
    }
    /**
     * The amount of damage each bullet will do to an enemy.
     * @returns The amount of damage each bullet will do.
     */
    public get weaponDamage(): number {
        return this.#_weaponDamage;
    }
    /**
     * How many seconds the bullets will last on screen before they are destroyed.
     * @returns The amount of seconds each bullet will last on screen.
     */
    public get weaponRange(): number {
        return this.#_weaponRange;
    }
    /**
     * How fast each bullet will travel in m/s.
     * @returns The speed at which each bullet will travel.
     */
    public get weaponSpeed(): number {
        return this.#_weaponSpeed;
    }

    /**
     * Increase or decrease the current max health of the Farmer.
     * @param value The amount of max health to increase/decrease.
     */
    public modifyMaxHealth(value: number): void {
        this.#_maxHealth += value;
        this.modifyHealth(this.health);
    }
    /**
     * Increase or decrease the current health of the Farmer.
     * @param value The amount of health to increase/decrease.
     */
    public modifyHealth(value: number): void {
        this.#_health = Scalar.Clamp(this.#_health + value, 0, this.maxHealth);
    }
    /**
     * Increase or decrease the movement speed of the Farmer.
     * @param value The amount of movement speed to increase/decrease.
     */
    public modifyMovementSpeed(value: number): void {
        this.#_movementSpeed += value;
    }
    /**
     * Increase or decrease the weapon damage of the Farmer.
     * @param value The amount of weapon damage to increase/decrease.
     */
    public modifyWeaponDamage(value: number): void {
        this.#_weaponDamage += value;
    }
    /**
     * Increase or decrease the weapon range of the Farmer.
     * @param value The amount of weapon range to increease/decrease.
     */
    public modifyWeaponRange(value: number): void {
        this.#_weaponRange += value;
    }
    /**
     * Increase or decrease the weapon speed of the Farmer.
     * @param value The amount of weapon speed to increase/decrease.
     */
    public modifyWeaponSpeed(value: number): void {
        this.#_weaponSpeed += value;
    }

    /**
     * The position of the Farmer.
     * @returns The position of the Farmer.
     */
    public get position(): Vector3 {
        return this.#_mesh.position;
    }
}