import { Vector3, Angle, Vector2, TransformNode, Skeleton, Animation, Scalar, PBRMaterial, Color3 } from 'babylonjs';
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
import { RoundHandler, RoundType } from '../gameplay/roundHandler';
import { Carrot } from '../environment/carrot';
import { GUIManager } from '../ui/guiManager';
import { CarrotDrop } from '../droppable/carrotDrop';
import { SoundManager } from '../assets/soundManager';
import { MathUtil } from '../util/mathUtil';

const RabbitGatherDistance = 1;

/**
 * The state that the stabber rabbit is currently in.
 */
export enum NabberRabbitState {
    /**
     * The gather state. The rabbit will try to grab a carrot and get away.
     */
    Gather,
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
export class NabberRabbit extends BaseCollidable {
    private static _rabbits: NabberRabbit[] = [];

    #_maxHealth: number;
    #_health: number;
    #_spawnPosition: Vector3;
    #_state: NabberRabbitState;
    #_root: TransformNode;
    #_material: PBRMaterial;
    // #_weapon: Mesh;
    #_agent: number;
    #_gothit = false;
    #_animator: Animator;
    #_skeleton: Skeleton;
    #_deathTimer: number;
    #_target: TransformNode;
    #_hasCarrot: boolean;

    /**
     * Constructor. The position that the rabbit will spawn at.
     * @param pos The position to spawn the rabbit.
     * @param round The round handler.
     */
    constructor(pos: Vector3, round: RoundHandler) {
        super(CollisionGroup.Enemy);
        
        this.#_maxHealth = Config.nabberRabbit.health;
        this.#_health = this.#_maxHealth;

        this.#_spawnPosition = pos.clone();
        this.#_state = NabberRabbitState.Gather;
        this.#_hasCarrot = false;

        // The mesh is a player and can collide with the environment.
        const spawner = Spawner.getSpawner('Bunny');
        const instance = spawner.instantiate(true);
        this.#_root = instance.rootNodes[0];
        this.#_skeleton = instance.skeletons[0];
        this.#_root.position = pos;

        const mesh = this.#_root.getChildMeshes()[0];
        this.#_material = (mesh.material as PBRMaterial);
        this.#_material.albedoColor = new Color3(Scalar.RandomRange(221, 230) / 255, Scalar.RandomRange(155, 160) / 255, Scalar.RandomRange(24, 106) / 255);

        const bones = this.#_root.getChildTransformNodes(false, n => n.name.startsWith('Bunny_Ear_Scale_') || n.name.startsWith('Bunny_Eye_Scale_'));
        bones.forEach(b => {
            const rand = Scalar.RandomRange(.75, 1.5);
            b.scaling = Vector3.One().scale(rand);
        });

        this.#_animator = new Animator(instance.animationGroups);

        this.#_animator.play(AnimatorState.Spawn, false, () => {
            this.#_animator.play(AnimatorState.Run);
            this.#_agent = Navigation.addAgent(pos, Config.nabberRabbit.speed, this.#_root);
            super.registerMesh(mesh);

        });
        RadarManager.createBlip(this.#_root, BlipType.Stabber);
        NabberRabbit._rabbits.push(this);

        this.modifyDifficulty(round.getDifficultyModifier());
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
                this.#_agent = Navigation.addAgent(this.#_root.position, this.#_state === NabberRabbitState.Gather ? Config.nabberRabbit.speed : Config.nabberRabbit.retreatSpeed, this.#_root);
        }
    }

    /**
     * Updates the rabbit every frame.
     * @param farmer The farmer (player) character.
     * @param gui The gui manager for the game.
     * @param round The round handler.
     */
    public update(farmer: Farmer, gui: GUIManager, round: RoundHandler): void {
        if (this.#_state === NabberRabbitState.Gather) {
            // Hack fix. Weird bug where not all rabbits retreat properly. This is to force them to retreat.
            if (round.type === RoundType.Rest) {
                this.retreat();
            }
            else {
                if (!this.#_gothit) {
                    // Logic if nabber does not have a carrot.
                    // Set the Farmer as a target by default.
                    if (!this.#_target || this.#_target.isDisposed())
                        this.#_target = farmer.root;

                    // If on the farmer, try to focus on a carrot, if there is one.
                    if (this.#_target === farmer.root) {
                        const carrot = Carrot.getRandomCarrotTransform();
                        if(carrot)
                            this.#_target = carrot;
                    }
                    
                    // Navigate to the targets position in world spacce.
                    const worldMatrix = this.#_target.getWorldMatrix();
                    const worldPosition = worldMatrix.getRow(3).toVector3();
                    Navigation.agentGoTo(this.#_agent, worldPosition);

                    // If the target is not the farmer, try to nab the carrot.
                    if(this.#_target !== farmer.root)
                    {                        
                        if (Vector3.Distance(this.#_root.position, worldPosition) < RabbitGatherDistance) {
                            SoundManager.play(`Harvest${MathUtil.randomInt(1, 3)}`, { volume: 0.2 });
                            Carrot.disposeCarrotByTransform(this.#_target);
                            this.#_state = NabberRabbitState.Retreat;
                            this.#_hasCarrot = true;
                            gui.addPickIcon(this.getMesh(), 'CarrotFill', -50);
                        }
                    }
                }
            }
        }
        else if (this.#_state === NabberRabbitState.Retreat) {
            Navigation.agentGoTo(this.#_agent, this.#_spawnPosition);

            if (Vector3.Distance(this.#_spawnPosition, this.#_root.position) < 1) {
                this.dispose();
            }
        }
        else if (this.#_state === NabberRabbitState.Death) {
            gui.removePickIcon(this.getMesh());
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
     * Modifies the rabbit's health, damage, and speed based on a given value.
     * @param modifier Difficulty modifier used to calculate new values for the rabbit.
     */
    public modifyDifficulty(modifier: number): void {
        // Health
        this.#_maxHealth += (Config.nabberRabbit.health * modifier);

        // Speed
        const speed = Config.nabberRabbit.speed;
        Navigation.agentUpdateSpeed(this.#_agent, speed + (speed * modifier));
    }

    /**
     * Changes the rabbit state to retreat. It will go back to it's original spawn point and dispose itself.
     */
    public retreat(): void {
        if (this.#_state !== NabberRabbitState.Death) {
            this.#_state = NabberRabbitState.Retreat;
            Navigation.agentUpdateSpeed(this.#_agent, Config.nabberRabbit.retreatSpeed);
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
            // Drop the carrot on to the ground so it can be picked up.
            if(this.#_hasCarrot) {
                const worldMatrix = this.#_root.getWorldMatrix();
                const worldPosition = worldMatrix.getRow(3).toVector3();
                new CarrotDrop(worldPosition.add(Vector3.Up()));
            }

            if(this.#_state !== NabberRabbitState.Death) {
                SoundManager.play(`SquealDeath${MathUtil.randomInt(1, 2)}`, { volume: 0.2 });
            }

            this.#_state = NabberRabbitState.Death;
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
                this.#_agent = Navigation.addAgent(this.#_root.position, this.#_state === NabberRabbitState.Gather ? Config.nabberRabbit.speed : Config.nabberRabbit.retreatSpeed, this.#_root);
                this.#_gothit = false;
                if (this.#_state !== NabberRabbitState.Death)
                    this.#_animator.play(AnimatorState.Run);
            });

            SoundManager.play(`Squeal${MathUtil.randomInt(1, 4)}`, { volume: 0.2 });
        }
    }

    /**
     * Release all resources associated with this NabberRabbit.
     */
    public dispose(): void {
        super.dispose();
        Navigation.removeAgent(this.#_agent);
        RadarManager.removeBlip(this.#_root);

        // this.#_weapon.dispose();
        this.#_root.dispose();
        this.#_animator.dispose();
        this.#_skeleton.dispose();
        this.#_material.dispose();
        NabberRabbit._rabbits = NabberRabbit._rabbits.filter(rab => rab !== this);
    }

    /**
     * Updates all the rabbits.
     * @param farmer The farmer (player character).
     * @param gui The GUI for the game.
     * @param round The round handler.
     */
    public static updateAll(farmer: Farmer, gui: GUIManager, round: RoundHandler): void {
        for (let i = 0; i < this._rabbits.length; i++) {
            this._rabbits[i].update(farmer, gui, round);
        }
    }
    /**
     * Sets whether all the rabbits are disabled.
     * @param value True if the rabbits should be disabled, false otherwise.
     */
    public static disableAll(value: boolean): void {
        for (let i = 0; i < this._rabbits.length; i++) {
            this._rabbits[i].disabled = value;
        }
    }
    /**
     * Commands all the rabbits to retreat.
     */
    public static retreatAll(): void {
        for (let i = 0; i < this._rabbits.length; i++) {
            this._rabbits[i].retreat();
        }
    }
    /**
     * Disposes and releases all resources associated with all of the Rabbits.
     */
    public static disposeAll(): void {
        while (this._rabbits.length > 0) {
            this._rabbits[0].dispose();
        }
    }
}