import { Vector3, Angle, Vector2, TransformNode, Skeleton, Animation, MeshBuilder, Scalar } from 'babylonjs';
import { Navigation } from '../gameplay/navigation';
import { Farmer } from '../player/farmer';
import { CollisionGroup } from '../collision/collisionManager';
import { BaseCollidable } from '../collision/baseCollidable';
import { RadarManager, BlipType } from '../ui/radar';
import { Config } from '../gameplay/config';
import { Animator, AnimatorState } from '../animation/animator';
import { Spawner } from '../assets/spawner';
import { BabylonStore } from '../store/babylonStore';
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
    Retreat,
    /**
     * The death state. The rabbit will decompose after 5 seconds.
     */
    Death
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

    #_spawnPosition: Vector3;
    #_state: StabberRabbitState;
    #_root: TransformNode;
    // #_weapon: Mesh;
    #_agent: number;
    #_attacking = false;
    #_gothit = false;
    #_animator: Animator;
    #_skeleton: Skeleton;
    #_deathTimer: number;

    // Stats
    #_health: number;
    #_damage: number;

    /**
     * Constructor. The position that the rabbit will spawn at.
     */
    constructor(pos: Vector3) {
        super(CollisionGroup.Enemy);

        this.#_spawnPosition = pos.clone();
        this.#_state = StabberRabbitState.Attack;
        this.#_health = Config.stabberRabbit.health;
        this.#_damage = Config.stabberRabbit.damage;

        // The mesh is a player and can collide with the environment.
        const spawner = Spawner.getSpawner('Bunny');
        const instance = spawner.instantiate();
        this.#_root = instance.rootNodes[0];
        this.#_skeleton = instance.skeletons[0];
        this.#_root.position = pos;

        /**
         * Bunny_Ear_Scale_L
         * Bunny_Ear_Scale_R
         * Bunny_Eye_Scale_L
         * Bunny_Eye_Scale_R
         */
        const bones = this.#_root.getChildTransformNodes(false, n => n.name.startsWith('Bunny_Ear_Scale_') || n.name.startsWith('Bunny_Eye_Scale_'));
        bones.forEach(b => {
            const rand = Scalar.RandomRange(.75, 1.5);
            b.scaling = Vector3.One().scale(rand);
        });

        const weaponPoint = this.#_root.getChildTransformNodes(false, n => n.name === 'WeaponPoint')[0];
        const collider = MeshBuilder.CreateBox('collider', { width: 0.5, height: 1.5, depth: 0.5 });
        collider.parent = weaponPoint;
        collider.position = weaponPoint.forward.scale(0.75);
        collider.isVisible = false;
        super.registerMesh(collider, 'weapon');

        this.#_animator = new Animator(instance.animationGroups);

        this.#_animator.play(AnimatorState.Spawn, false, () => {
            if(this.#_state === StabberRabbitState.Retreat) {
                this.dispose();
            }
            else {
                this.#_animator.play(AnimatorState.Run);
                this.#_agent = Navigation.addAgent(pos, Config.stabberRabbit.speed, this.#_root);
                super.registerMesh(this.#_root.getChildMeshes()[0]);
                StabberRabbit.onRabbitCreated(this);
                RadarManager.createBlip(this.#_root, BlipType.Stabber);
            }
        });
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
        this.#_animator.pause(value);

        if (this.#_agent !== undefined) {
            if (value)
                Navigation.removeAgent(this.#_agent);
            else
                this.#_agent = Navigation.addAgent(this.#_root.position, this.#_state === StabberRabbitState.Attack ? Config.stabberRabbit.speed : Config.stabberRabbit.retreatSpeed, this.#_root);
        }
    }

    /**
     * Updates the rabbit every frame.
     * @param farmer The farmer (player) character.
     */
    public update(farmer: Farmer): void {
        if (this.#_state === StabberRabbitState.Attack) {
            if (!this.#_gothit) {
                if (!this.attacking) {
                    Navigation.agentGoTo(this.#_agent, farmer.position);
                }

                if (!this.#_attacking && farmer.health > 0 && Vector3.Distance(farmer.position, this.#_root.position) < RabbitAttackDistance) {
                    this.#_attacking = true;
                    this.#_animator.play(AnimatorState.Attack, false, () => {
                        this.#_attacking = false;
                        if (this.#_state !== StabberRabbitState.Death && !this.#_gothit)
                            this.#_animator.play(AnimatorState.Run);
                    });
                }
            }
        }
        else if (this.#_state === StabberRabbitState.Retreat) {
            Navigation.agentGoTo(this.#_agent, this.#_spawnPosition);

            if (Vector3.Distance(this.#_spawnPosition, this.#_root.position) < 1) {
                StabberRabbit.onRabbitDisposed(this);
                this.dispose();
            }
        }
        else if (this.#_state === StabberRabbitState.Death) {
            this.#_deathTimer += BabylonStore.deltaTime;
            if (this.#_deathTimer >= 5) {
                // So the timer won't go off again.
                this.#_deathTimer = -100;
                const animation = new Animation("animateDeath", "position.y", 30, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT);
                const keys = [
                    {
                        frame: 0,
                        value: this.#_root.position.y
                    },
                    {
                        frame: 30,
                        value: this.#_root.position.y - 2
                    }
                ];
                animation.setKeys(keys);
                this.#_root.animations.push(animation);
                BabylonStore.scene.beginAnimation(this.#_root, 0, 30, false, 1, () => {
                    StabberRabbit.onRabbitDisposed(this);
                    this.dispose();
                });
            }
        }

        const dir = Navigation.getAgentVelocity(this.#_agent);
        if (dir)
            this.#_root.rotation = new Vector3(0, -Angle.BetweenTwoPoints(Vector2.Zero(), new Vector2(dir.x, dir.z)).radians() + Angle.FromDegrees(90).radians(), 0);

        RadarManager.updateBlip(this.#_root);
    }

    /**
     * Changes the rabbit state to retreat. It will go back to it's original spawn point and dispose itself.
     */
    public retreat(): void {
        if (this.#_state !== StabberRabbitState.Death) {
            this.#_state = StabberRabbitState.Retreat;
            Navigation.agentUpdateSpeed(this.#_agent, Config.stabberRabbit.retreatSpeed);
        }
    }

    /**
     * Callback that will get fired when the enemy hits a bullet.
     * @param collidable The collidable that hit the rabbit.
     */
    public onCollide(collidable: BaseCollidable): void {
        const bullet = collidable as Bullet;
        this.#_health -= bullet.damage;

        if (this.#_health <= 0) {
            this.#_state = StabberRabbitState.Death;
            Navigation.removeAgent(this.#_agent);
            this.#_agent = undefined;
            super.dispose();
            RadarManager.removeBlip(this.#_root);
            this.#_animator.play(AnimatorState.RabbitDeath, false, () => {
                this.#_deathTimer = 0;
            });
        }
        else {
            this.#_gothit = true;
            Navigation.removeAgent(this.#_agent);
            this.#_agent = undefined;
            this.#_animator.play(AnimatorState.TakeHit, false, () => {
                this.#_agent = Navigation.addAgent(this.#_root.position, this.#_state === StabberRabbitState.Attack ? Config.stabberRabbit.speed : Config.stabberRabbit.retreatSpeed, this.#_root);
                this.#_gothit = false;
                if (this.#_state !== StabberRabbitState.Death)
                    this.#_animator.play(AnimatorState.Run);
            });
        }
    }

    /**
     * Release all resources associated with this StabberRabbit.
     */
    public dispose(): void {
        super.dispose();
        Navigation.removeAgent(this.#_agent);
        RadarManager.removeBlip(this.#_root);

        // this.#_weapon.dispose();
        this.#_root.dispose();
        this.#_animator.dispose();
        this.#_skeleton.dispose();
    }
}