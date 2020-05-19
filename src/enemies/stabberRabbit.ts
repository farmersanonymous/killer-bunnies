import { Mesh, MeshBuilder, Vector3, Angle, Vector2, Animation } from 'babylonjs';
import { Navigation } from '../gameplay/navigation';
import { Farmer } from '../player/farmer';
import { CollisionGroup } from '../collision/collisionManager';
import { BaseCollidable } from '../collision/baseCollidable';
import { BabylonStore } from '../store/babylonStore';
import { RadarManager, BlipType } from '../ui/radar';

const RabbitAttackDistance = 3;
const RabbitAttackTime = 1;

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

    #_mesh: Mesh;
    #_weapon: Mesh;
    #_agent: number;
    #_attacking = false;
    #_attackingTimer = RabbitAttackTime;

    /**
     * Constructor. The position that the rabbit will spawn at.
     */
    constructor(pos: Vector3) {
        super(CollisionGroup.Enemy);

        this.#_mesh = MeshBuilder.CreateSphere('stabberRabbit', { diameter: 1 });
        this.#_mesh.position = pos;

        this.#_weapon = MeshBuilder.CreateBox('stabberRabbitWeapon', { width: 0.25, height: 1.5, depth: 0.25 });
        this.#_weapon.parent = this.#_mesh;
        this.#_weapon.position = this.#_weapon.position.subtract(this.#_weapon.right.scale(0.25));

        super.registerMesh(this.#_weapon);
        super.registerMesh(this.#_weapon, 'weapon');

        this.#_agent = Navigation.addAgent(pos, this.#_mesh);

        StabberRabbit.onRabbitCreated(this);
        
        //
        RadarManager.CreateBlip(this.#_mesh, BlipType.Enemy);

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

    public get attacking(): boolean {
        return this.#_attacking;
    }

    /**
     * Updates the rabbit every frame.
     * @param farmer The farmer (player) character.
     */
    public update(farmer: Farmer): void {
        Navigation.agentGoTo(this.#_agent, farmer.position);

        const dir = Navigation.getAgentVelocity(this.#_agent);
        // Rotation is off for some reason, don't really feal like looking into it, so subtracting 90 degrees in radians to offset.
        this.#_mesh.rotation = new Vector3(0, -Angle.BetweenTwoPoints(Vector2.Zero(), new Vector2(dir.x, dir.z)).radians() /*- Angle.FromDegrees(180).radians()*/, 0);

        if(!this.#_attacking && Vector3.Distance(farmer.position, this.#_mesh.position) < RabbitAttackDistance) {
            this.#_attackingTimer = RabbitAttackTime;
            this.#_attacking = true;
            BabylonStore.scene.beginAnimation(this.#_weapon, 0, 60, false, 1, () => {
                BabylonStore.scene.beginAnimation(this.#_weapon, 60, 0, false, 1, () => {
                    this.#_attacking = false;
                });
            });
        }

        RadarManager.updateBlip(this.#_mesh, BlipType.Enemy);
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

        //
        RadarManager.RemoveBlip(this.#_mesh);

        this.#_weapon.dispose();
        this.#_mesh.dispose();
    }
}