import { Mesh, MeshBuilder, Vector3, Angle, Vector2, Animation, TransformNode } from 'babylonjs';
import { Navigation } from '../gameplay/navigation';
import { Farmer } from '../player/farmer';
import { CollisionGroup } from '../collision/collisionManager';
import { BaseCollidable } from '../collision/baseCollidable';
import { BabylonStore } from '../store/babylonStore';
import { Config } from '../gameplay/config';

const RabbitAttackDistance = 3;

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

    #_root: TransformNode;
    #_mesh: Mesh;
    #_weapon: Mesh;
    #_agent: number;
    #_attacking = false;

    // Stats
    #_movementSpeed: number;
    #_damage: number;

    /**
     * Constructor. The position that the rabbit will spawn at.
     */
    constructor(pos: Vector3) {
        super(CollisionGroup.Enemy);

        this.#_movementSpeed = Config.stabberRabbit.speed;
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

        this.#_agent = Navigation.addAgent(pos, this.#_movementSpeed, this.#_root);

        StabberRabbit.onRabbitCreated(this);

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
     * Updates the rabbit every frame.
     * @param farmer The farmer (player) character.
     */
    public update(farmer: Farmer): void {
        Navigation.agentGoTo(this.#_agent, farmer.position);

        const dir = Navigation.getAgentVelocity(this.#_agent);

        this.#_root.rotation = new Vector3(0, -Angle.BetweenTwoPoints(Vector2.Zero(), new Vector2(dir.x, dir.z)).radians(), 0);

        if(!this.#_attacking && Vector3.Distance(farmer.position, this.#_root.position) < RabbitAttackDistance) {
            this.#_attacking = true;
            BabylonStore.scene.beginAnimation(this.#_weapon, 0, 60, false, 1, () => {
                BabylonStore.scene.beginAnimation(this.#_weapon, 60, 0, false, 1, () => {
                    this.#_attacking = false;
                });
            });
        }
    }

    /**
     * Callback that will get fired when the enemy hits a bullet.
     */
    public onCollide(): void {
        StabberRabbit.onRabbitDisposed(this);
        this.dispose();
    }

    /**
     * Release all resources associated with this StabberRabbit.
     */
    public dispose(): void {
        super.dispose();
        Navigation.removeAgent(this.#_agent);
        this.#_weapon.dispose();
        this.#_mesh.dispose();
    }
}