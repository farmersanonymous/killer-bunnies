import { Mesh, MeshBuilder, Vector3, Angle, Vector2 } from 'babylonjs';
import { Navigation } from '../gameplay/navigation';
import { Farmer } from '../player/farmer';
import { CollisionGroup } from '../collision/collisionManager';
import { BaseCollidable } from '../collision/baseCollidable';

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

    /**
     * Constructor. The position that the rabbit will spawn at.
     */
    constructor(pos: Vector3) {
        super(CollisionGroup.Enemy);

        this.#_mesh = MeshBuilder.CreateSphere('stabberRabbit', { diameter: 1 });
        this.#_mesh.position = pos;

        this.#_weapon = MeshBuilder.CreateBox('stabberRabbitWeapon', { width: 1, height: 0.25, depth: 0.25 });
        this.#_weapon.parent = this.#_mesh;
        this.#_weapon.position = this.#_weapon.position.subtract(this.#_weapon.right);

        super.registerMesh(this.mesh);
        super.registerMesh(this.#_weapon, 'weapon');

        this.#_agent = Navigation.addAgent(pos, this.#_mesh);

        StabberRabbit.onRabbitCreated(this);
    }

    public get mesh(): Mesh {
        return this.#_mesh;
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