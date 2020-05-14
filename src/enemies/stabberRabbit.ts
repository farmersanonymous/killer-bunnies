import { Mesh, MeshBuilder, Vector3 } from 'babylonjs';
import { Navigation } from '../gameplay/navigation';
import { Farmer } from '../player/farmer';

/**
 * The rabbit that will try and stab the farmer.
 */
export class StabberRabbit {
    /**
     * A callback that will get triggered when a rabbit has been created.
     */
    public static onRabbitCreated: (rabbit: StabberRabbit) => void;

    #_mesh: Mesh
    #_agent: number;

    /**
     * Constructor. The position that the rabbit will spawn at.
     */
    constructor(pos: Vector3) {
        this.#_mesh = MeshBuilder.CreateSphere('stabberRabbit', { diameter: 1 });
        this.#_mesh.position = pos;

        this.#_agent = Navigation.addAgent(pos, this.#_mesh);

        StabberRabbit.onRabbitCreated(this);
    }

    /**
     * Updates the rabbit every frame.
     * @param farmer The farmer (player) character.
     */
    public update(farmer: Farmer): void {
        Navigation.agentGoTo(this.#_agent, farmer.position);
    }

    /**
     * Release all resources associated with this StabberRabbit.
     */
    public dispose(): void {
        Navigation.removeAgent(this.#_agent);
        this.#_mesh.dispose();
    }
}