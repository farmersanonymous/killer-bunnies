import { Vector2, Vector3, Angle, Scalar, TransformNode, Skeleton } from 'babylonjs';
import { CharacterController } from './characterController';
import { BabylonStore } from '../store/babylonStore';
import { Bullet } from './bullet';
import { Spawner } from '../assets/spawner';
import { PlayerCameraController } from '../camera/playerCameraController';
import { Navigation } from '../gameplay/navigation';
import { CollisionGroup } from '../collision/collisionManager';
import { BaseCollidable } from '../collision/baseCollidable';
import { Animator, AnimatorState } from '../animation/animator';
import { StabberRabbit } from '../enemies/stabberRabbit';
import { RadarManager, BlipType } from '../ui/radar'
import { Config } from '../gameplay/config';
import { Carrot } from '../environment/carrot';
import { Input } from '../input/input';
import { GUIManager } from '../ui/guiManager';
import { Garden } from '../environment/garden';
import { RoundHandler, RoundType } from '../gameplay/roundHandler';

/**
 * The playable Farmer character.
 */
export class Farmer extends BaseCollidable {
    #_controller: CharacterController;
    #_camera: PlayerCameraController;
    #_root: TransformNode;
    #_weaponRoot: TransformNode;
    #_gunCooldown = false;
    #_isMoving = false;
    #_isFiring = false;
    #_animator: Animator;
    #_weaponAnimator: Animator;
    #_skeleton: Skeleton;
    #_weaponSkeleton: Skeleton;
    #_hitTimer = 0.25;
    #_bulletSpawnPoint: TransformNode;

    // Stats
    // The max health of the Farmer. Current health will be reset at the beginning of each round to max health.
    #_maxHealth: number;
    // The amount of health the Farmer has.
    #_health: number;
    // How fast the Farmer will travel m/s.
    #_movementSpeed: number;
    // The amount of damage each bullet will do.
    #_weaponDamage: number;
    // How many seconds the bullets will last on screen before they are destroyed.
    #_weaponRange: number;
    // How fast the bullets will travel m/s.
    #_weaponSpeed: number;
    // The time it takes to complete a harvest.
    #_harvestTime: number;

    // Upgrade costs.
    #_healthCost: number;
    #_damageCost: number;
    #_harvestCost: number;
    #_speedCost: number;

    /**
     * Constructor.
     */
    public constructor() {
        super(CollisionGroup.Player);

        this.#_maxHealth = Config.player.health;
        this.#_health = this.#_maxHealth;
        this.#_movementSpeed = Config.player.speed;
        this.#_weaponDamage = Config.player.weaponDamage;
        this.#_weaponRange = Config.player.weaponRange;
        this.#_weaponSpeed = Config.player.weaponSpeed;
        this.#_harvestTime = Config.player.harvestTime;

        this.#_healthCost = Config.player.upgradeInitialCost;
        this.#_damageCost = Config.player.upgradeInitialCost;
        this.#_harvestCost = Config.player.upgradeInitialCost;
        this.#_speedCost = Config.player.upgradeInitialCost;

        // The mesh is a player and can collide with the environment.
        const spawner = Spawner.getSpawner('Farmer');
        const instance = spawner.instantiate();
        this.#_root = instance.rootNodes[0];
        this.#_skeleton = instance.skeletons[0];

        const weaponSpawner = Spawner.getSpawner('Corncobber');
        const weaponInstance = weaponSpawner.instantiate();
        this.#_weaponRoot = weaponInstance.rootNodes[0];
        this.#_weaponSkeleton = weaponInstance.skeletons[0];
        this.#_weaponRoot.parent = this.#_root.getChildTransformNodes(false, (n) => n.name === 'FarmerWeaponPoint')[0];
        this.#_weaponRoot.rotation = new Vector3(Angle.FromDegrees(270).radians(), 0, 0);
        this.#_bulletSpawnPoint = this.#_weaponRoot.getChildTransformNodes(false, n => n.name === 'BulletSpawnPoint')[0];

        super.registerMesh(this.#_root.getChildMeshes(true)[0]);

        this.#_animator = new Animator(instance.animationGroups);
        this.#_weaponAnimator = new Animator(weaponInstance.animationGroups);

        // Initialize the character controller and subscribe to the onMove, onFire, and onRotate events.
        this.#_controller = new CharacterController(this);
        this.#_controller.onMove = (dir): void => {
            const deltaTime = BabylonStore.engine.getDeltaTime() / 1000;
            const moveDir = new Vector3(dir.y, 0, dir.x).normalize().scale(this.movementSpeed * deltaTime);
            this.#_root.position = Navigation.getClosestPoint(this.#_root.position.add(moveDir));
            this.#_animator.play(AnimatorState.Run);
            this.#_isMoving = true;
        };
        this.#_controller.onMoveEnd = (): void => {
            this.#_isMoving = false;
        };

        this.#_controller.onFire = (): void => {
            this.#_isFiring = true;
            this.#_weaponAnimator.play(AnimatorState.Shoot)

            if (!this.#_isMoving) {
                this.#_animator.play(AnimatorState.Shoot);
            }

            if (this.#_gunCooldown) {
                return;
            }

            const backward = this.#_root.forward.negate();
            new Bullet(this.#_bulletSpawnPoint.getWorldMatrix().getRow(3).toVector3(), this.weaponSpeed, backward, this.weaponRange);
            this.#_gunCooldown = true;
            window.setTimeout(() => {
                this.#_gunCooldown = false;
            }, 200);
        }
        this.#_controller.onFireEnd = (): void => {
            this.#_isFiring = false;
        }

        this.#_controller.onRotate = (dir): void => {
            this.#_root.rotation = new Vector3(0, -Angle.BetweenTwoPoints(Vector2.Zero(), dir).radians() - Angle.FromDegrees(200).radians(), 0);
        };

        // Initialize the camera.
        this.#_camera = new PlayerCameraController(this);

        //
        RadarManager.createBlip(this.#_root, BlipType.Player);
    }

    /**
     * Updates the Farmer every frame.
     * @param garden The garden (the environment).
     * @param gui The gui manager for the game.
     * @param round The round handler.
     */
    public update(garden: Garden, gui: GUIManager, round: RoundHandler): void {
        if (this.health <= 0) {
            this.#_animator.play(AnimatorState.Death, false);
            this.#_controller.disabled = true;
        }
        else {
            if (!this.#_isFiring) {
                this.#_weaponAnimator.play(AnimatorState.Idle);
                if (!this.#_isMoving && this.#_hitTimer <= 0) {
                    this.#_animator.play(AnimatorState.Idle);
                }
            }

            this.#_hitTimer -= BabylonStore.deltaTime;

            RadarManager.updateBlip(this.#_root);

            // Try to get carrot.
            const carrot = Carrot.getPickableCarrot();
            if(carrot && Input.isKeyPressed('e')) {
                if(gui.addFarmerCarrot()) {
                    carrot.dispose();
                }
            }

            // Detect if in proximity of harvest basket.
            let distance = Vector3.Distance(garden.harvestBasket.position, this.#_root.position);
            // If round is forify, make distance higher than requirement.
            if(round.type === RoundType.Rest)
                distance = 6;
            gui.updateHarvestTimer(this.getMesh(), distance, 5, this.#_harvestTime);
        }
    }

    /**
     * Callback that will get fired when the farmer is hit by an enemy weapon.
     * @param collidable The collidable of the weapon.
     */
    public onCollide(collidable: BaseCollidable): void {
        if (collidable instanceof StabberRabbit && collidable.attacking && this.#_hitTimer <= 0) {
            this.#_hitTimer = 0.25;
            this.#_health -= collidable.damage;
            this.#_animator.play(AnimatorState.TakeHit, false);
        }
    }

    /**
     * Release all resources associated with this Farmer.
     */
    public dispose(): void {
        super.dispose();

        RadarManager.removeBlip(this.#_root);

        this.#_controller.dispose();
        this.#_weaponSkeleton.dispose();
        this.#_skeleton.dispose();
        this.#_weaponAnimator.dispose();
        this.#_animator.dispose();
        this.#_weaponRoot.dispose();
        this.#_root.dispose();
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
     * The amount of time it takes to harvest the carrots into the basket.
     * @returns The harvest time.
     */
    public get harvestTime(): number {
        return this.#_harvestTime;
    }

    /**
     * The amount of carrots it takes to upgrade health.
     * @returns The amount of carrots to upgrade health.
     */
    public get healthCost(): number {
        return this.#_healthCost;
    }
    /**
     * The amount of carrots it takes to upgrade damage.
     * @returns The amount of carrots to upgrade damage.
     */
    public get damageCost(): number {
        return this.#_damageCost;
    }
    /**
     * The amount of carrots it takes to upgrade harvest speed.
     * @returns The amount of carrots to upgrade harvest speed.
     */
    public get harvestCost(): number {
        return this.#_harvestCost;
    }
    /**
     * The amount of carrots it takes to upgrade movement speed.
     * @returns The amount of carrots to upgrade movement speed.
     */
    public get speedCost(): number {
        return this.#_speedCost;
    }

    /**
     * Increase or decrease the current max health of the Farmer.
     * @param value The amount of max health to increase/decrease.
     */
    public modifyMaxHealth(value: number): void {
        this.#_maxHealth += value;
        this.#_healthCost += Config.player.upgradeIncrementCost;
        this.modifyHealth(value);
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
        this.#_speedCost += Config.player.upgradeIncrementCost;
    }
    /**
     * Increase or decrease the weapon damage of the Farmer.
     * @param value The amount of weapon damage to increase/decrease.
     */
    public modifyWeaponDamage(value: number): void {
        this.#_weaponDamage += value;
        this.#_damageCost += Config.player.upgradeIncrementCost;
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
     * Increase or decrease the harvest time of the Farmer.
     * @param value The amount of time to increase/decrease the harvest time by.
     */
    public modifyHarvestTime(value: number): void {
        this.#_harvestTime += value;
        this.#_harvestCost += Config.player.upgradeIncrementCost;
    }

    /**
     * The position of the Farmer.
     * @returns The position of the Farmer.
     */
    public get position(): Vector3 {
        return this.#_root.position;
    }

    /**
     * Sets whether this farmer is currently disabled. It will pause all animations and disable the controller for input.
     */
    public set disabled(value: boolean) {
        this.#_controller.disabled = value;
        this.#_animator.pause(value);
        this.#_weaponAnimator.pause(value);
    }
}