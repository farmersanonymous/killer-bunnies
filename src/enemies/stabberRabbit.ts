import { Mesh, MeshBuilder, Vector3, Angle, Vector2, Animation, TransformNode } from 'babylonjs';
import { Navigation } from '../gameplay/navigation';
import { Farmer } from '../player/farmer';
import { CollisionGroup } from '../collision/collisionManager';
import { BaseCollidable } from '../collision/baseCollidable';
import { BabylonStore } from '../store/babylonStore';
import { RadarManager, BlipType } from '../ui/radar';
import { Config } from '../gameplay/config';
import { Bullet } from '../player/bullet';

const RabbitAttackDistance = 3;

/**
 * The state that the stabber rabbit is currently in.
 */
export enum StabberRabbitState {
    /**
     * The attack state. The rabbit will try to murder the Farmer.
     */
    Attack,
    /**
     * The retreat state. The rabbit will retreat to the burrow that it spawned from.
     */
    Retreat
}

/**
 * The rabbit that will try and stab the farmer.
 */
export class StabberRabbit extends BaseCollidable {
    /**
     * A callback that will get triggered when a rabbit has been created.
     */
    public static onRabbitCreated: (rabbit: StabberRabbit) => void;
    /**
     * A callback that will get triggered when a rabbit is about to be disposed.
     */
    public static onRabbitDisposed: (rabbit: StabberRabbit) => void;

    #_maxHealth: number;
    #_health: number;
    #_spawnPosition: Vector3;
    #_state: StabberRabbitState;
    #_root: TransformNode;
    #_mesh: Mesh;
    #_weapon: Mesh;
    #_agent: number;
    #_attacking = false;

    // Stats
    #_damage: number;

    /**
     * Constructor. The position that the rabbit will spawn at.
     */
    constructor(pos: Vector3) {
        super(CollisionGroup.Enemy);

        this.#_maxHealth = Config.stabberRabbit.health;
        this.#_health = this.#_maxHealth;

        this.#_spawnPosition = pos.clone();
        this.#_state = StabberRabbitState.Attack;
        this.#_damage = Config.stabberRabbit.damage;

        this.#_root = new TransformNode('rabbit');
        this.#_root.position = pos;
        this.#_mesh = MeshBuilder.CreateSphere('stabberRabbit', { diameter: 1 });
        this.#_mesh.position = new Vector3(0, 0.75, 0);
        this.#_mesh.parent = this.#_root;

        this.#_weapon = MeshBuilder.CreateBox('stabberRabbitWeapon', { width: 0.25, height: 1.5, depth: 0.25 });
        this.#_weapon.parent = this.#_mesh;
        this.#_weapon.position = this.#_weapon.position.subtract(this.#_weapon.right.scale(0.25));

        super.registerMesh(this.#_weapon);
        super.registerMesh(this.#_weapon, 'weapon');

        this.#_agent = Navigation.addAgent(pos, Config.stabberRabbit.speed, this.#_root);

        StabberRabbit.onRabbitCreated(this);
        
        RadarManager.createBlip(this.#_root, BlipType.Stabber);

        // Setup a temp animation for rabbit attack.
        const anim = new Animation('rabbitAttack', 'rotation.z', 60, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_RELATIVE);
        const keys = [];
        keys.push({
            frame: 0,
            value: 0
        });
        keys.push({
            frame: 60,
            value: Angle.FromDegrees(-90).radians()
        });
        anim.setKeys(keys);
        this.#_weapon.animations.push(anim);
    }

    /**
     * Checks if the stabber rabbit is attacking or not.
     * @returns If the stabber rabbit is attacking.
     */
    public get attacking(): boolean {
        return this.#_attacking;
    }

    /**
     * The amount of damage that the rabbit can do.
     * @returns The damage of the rabbit.
     */
    public get damage(): number {
        return this.#_damage;
    }

    /**
     * Sets whether this rabbit is currently disabled. It will pause all animations and will remove the agent from the navmesh.
     */
    public set disabled(value: boolean) {
        if(value)
            Navigation.removeAgent(this.#_agent);
        else
            this.#_agent = Navigation.addAgent(this.#_root.position, this.#_state === StabberRabbitState.Attack ? Config.stabberRabbit.speed : Config.stabberRabbit.retreatSpeed, this.#_root);
    }

    /**
     * Updates the rabbit every frame.
     * @param farmer The farmer (player) character.
     */
    public update(farmer: Farmer): void {
        if (this.#_state === StabberRabbitState.Attack) {
            Navigation.agentGoTo(this.#_agent, farmer.position);

            if (!this.#_attacking && Vector3.Distance(farmer.position, this.#_root.position) < RabbitAttackDistance) {
                this.#_attacking = true;
                BabylonStore.scene.beginAnimation(this.#_weapon, 0, 60, false, 1, () => {
                    BabylonStore.scene.beginAnimation(this.#_weapon, 60, 0, false, 1, () => {
                        this.#_attacking = false;
                    });
                });
            }
        }
        else if(this.#_state === StabberRabbitState.Retreat) {
            Navigation.agentGoTo(this.#_agent, this.#_spawnPosition);

            if (Vector3.Distance(this.#_spawnPosition, this.#_root.position) < 1) {
                StabberRabbit.onRabbitDisposed(this);
                this.dispose();
            }
        }

        const dir = Navigation.getAgentVelocity(this.#_agent);
        this.#_root.rotation = new Vector3(0, -Angle.BetweenTwoPoints(Vector2.Zero(), new Vector2(dir.x, dir.z)).radians(), 0);

        RadarManager.updateBlip(this.#_root);
    }

    /**
     * Modifies the rabbit's health, damage, and speed based on a given value.
     * @param modifier Difficulty modifier used to calculate new values for the rabbit.
     */
    public modifyDifficulty(modifier: number): void {
        // Damage
        this.#_damage += (Config.stabberRabbit.damage * modifier);

        // Health
        this.#_maxHealth += (Config.stabberRabbit.health * modifier);

        // Speed
        const speed = Config.stabberRabbit.speed;
        Navigation.agentUpdateSpeed(this.#_agent, speed + (speed * modifier));
    }

    /**
     * Changes the rabbit state to retreat. It will go back to it's original spawn point and dispose itself.
     */
    public retreat(): void {
        this.#_state = StabberRabbitState.Retreat;
        Navigation.agentUpdateSpeed(this.#_agent, Config.stabberRabbit.retreatSpeed);
    }

    /**
     * Callback that will get fired when the enemy hits a bullet.
     */
    public onCollide(collidable: BaseCollidable): void {
        if (collidable instanceof Bullet) {
            console.log(this.#_health, (this.#_maxHealth / 2));
            this.#_health -= (this.#_maxHealth / 2);

            if (this.#_health <= 0) {
                StabberRabbit.onRabbitDisposed(this);
                this.dispose();
            }
        }
    }

    /**
     * Release all resources associated with this StabberRabbit.
     */
    public dispose(): void {
        super.dispose();
        Navigation.removeAgent(this.#_agent);

        RadarManager.removeBlip(this.#_root);

        this.#_weapon.dispose();
        this.#_mesh.dispose();
    }
}