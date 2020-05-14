import { Mesh, MeshBuilder, Vector3, AbstractMesh } from 'babylonjs';
import { Navigation } from '../gameplay/navigation';
import { Farmer } from '../player/farmer';
import { CollisionGroup } from '../util/collisionGroup';

/**
 * The rabbit that will try and stab the farmer.
 */
export class StabberRabbit {
    /**
     * A callback that will get triggered when a rabbit has been created.
     */
    public static onRabbitCreated: (rabbit: StabberRabbit) => void;
    /**
     * A callback that will get triggered when a rabbit is about to be disposed.
     */
    public static onRabbitDisposed: (rabbit: StabberRabbit) => void;

    private static rabbitMap: Map<AbstractMesh, StabberRabbit> = new Map<Mesh, StabberRabbit>();

    #_mesh: Mesh
    #_agent: number;

    /**
     * Constructor. The position that the rabbit will spawn at.
     */
    constructor(pos: Vector3) {
        this.#_mesh = MeshBuilder.CreateSphere('stabberRabbit', { diameter: 1 });
        this.#_mesh.position = pos;
        this.#_mesh.checkCollisions = true;
        this.#_mesh.collisionGroup = CollisionGroup.Enemy;
        this.#_mesh.collisionMask = CollisionGroup.Bullet;
        this.#_mesh.isPickable = false;
        this.#_mesh.state

        this.#_agent = Navigation.addAgent(pos, this.#_mesh);

        StabberRabbit.rabbitMap.set(this.#_mesh, this);
        StabberRabbit.onRabbitCreated(this);
    }

    /**
     * Updates the rabbit every frame.
     * @param farmer The farmer (player) character.
     */
    public update(farmer: Farmer): void {
        Navigation.agentGoTo(this.#_agent, farmer.position);
        this.#_mesh.moveWithCollisions(Vector3.ZeroReadOnly);
    }

    /**
     * Triggered when a bullet hits the rabbit.
     */
    public onHit(): void {
        StabberRabbit.onRabbitDisposed(this);
        this.dispose();
    }

    /**
     * Release all resources associated with this StabberRabbit.
     */
    public dispose(): void {
        Navigation.removeAgent(this.#_agent);
        StabberRabbit.rabbitMap.delete(this.#_mesh);
        this.#_mesh.dispose();
    }

    /**
     * Gets the Rabbit instance by it's mesh.
     * @param mesh The mesh that is attached to the rabbit.
     * @returns The Rabbit instance.
     */
    public static getRabbitByMesh(mesh: AbstractMesh): StabberRabbit {
        return this.rabbitMap.get(mesh);
    }
}