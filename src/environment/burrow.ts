import { Vector3, MeshBuilder, Mesh, PBRMaterial, Color3 } from "babylonjs";
import { BabylonStore } from "../store/babylonStore";
import { StabberRabbit } from "../enemies/stabberRabbit";
import { SoundManager } from "../assets/soundManager";

/**
 * The Burrow will control how often and the spawn position of the Rabbit enemies.
 */
export class Burrow {
    /**
     * Callback that will get fired when a burrow has been created.
     */
    public static onBurrowCreated: (burrow: Burrow) => void;
    /**
     * Callback that will get fired when a burrow is about to be disposed.
     */
    public static onBurrowDisposed: (burrow: Burrow) => void;

    #_mesh: Mesh;
    #_spawnFrequency: number;
    #_spawnTimer: number;
    #_disposeTime: number;

    /**
     * Constructor.
     * @param position The position that the Burrow will be spawned at.
     * @param spawnFrequency The frequency at which enemies will spawn in the Burrow.
     * @param timeLimit The time in seconds before the Burrow will dispose itself and disappear.
     */
    constructor(position: Vector3, spawnFrequency: number, timeLimit: number) {
        SoundManager.play("Burrow", {
            position: position
        });

        this.#_disposeTime = BabylonStore.time + timeLimit;
        this.#_spawnFrequency = this.#_spawnTimer = spawnFrequency;

        // The mesh is a burrow and can collide with the player, enemy, or bullet. Will be hidden from the scene.
        this.#_mesh = MeshBuilder.CreateBox(name, { size: 2 });
        this.#_mesh.position = position;

        const burrowMaterial = new PBRMaterial('burrowMaterial', BabylonStore.scene);
        burrowMaterial.albedoColor = Color3.Gray();
        this.#_mesh.material = burrowMaterial;

        Burrow.onBurrowCreated(this);
    }

    /**
     * Updates the Burrow every frame.
     */
    public update(): void {
        if(this.#_disposeTime < BabylonStore.time) {
            Burrow.onBurrowDisposed(this);
            this.dispose();
        }
        else {
            this.#_spawnTimer -= BabylonStore.deltaTime;
            if(this.#_spawnTimer <= 0) {
                new StabberRabbit(this.#_mesh.position.clone());
                this.#_spawnTimer = this.#_spawnFrequency;
            }
        }
    }

    /**
     * Release all resources associated with the Burrow.
     */
    public dispose(): void {
        this.#_mesh.material.dispose();
        this.#_mesh.dispose();
    }
}