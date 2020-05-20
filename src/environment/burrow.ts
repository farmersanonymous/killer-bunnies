import { TransformNode } from "babylonjs";
import { BabylonStore } from "../store/babylonStore";
import { StabberRabbit } from "../enemies/stabberRabbit";
import { SoundManager } from "../assets/soundManager";
import { Spawner } from "../assets/spawner";

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

    #_root: TransformNode;
    #_spawnFrequency: number;
    #_spawnTimer: number;
    #_disposeTime: number;

    /**
     * Constructor.
     * @param position The position that the Burrow will be spawned at.
     * @param spawnFrequency The frequency at which enemies will spawn in the Burrow.
     * @param timeLimit The time in seconds before the Burrow will dispose itself and disappear.
     */
    constructor(parent: TransformNode, spawnFrequency: number, timeLimit: number) {
        SoundManager.play("Burrow", {
            position: parent.position
        });

         const spawner = Spawner.getSpawner('Burrow');
         const instance = spawner.instantiate();
         this.#_root = instance.rootNodes[0];
         this.#_root.parent = parent;

        this.#_disposeTime = BabylonStore.time + timeLimit;
        this.#_spawnFrequency = this.#_spawnTimer = spawnFrequency;

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
                new StabberRabbit((this.#_root.parent as TransformNode).position.clone());
                this.#_spawnTimer = this.#_spawnFrequency;
            }
        }
    }

    /**
     * Release all resources associated with the Burrow.
     */
    public dispose(): void {
        this.#_root.dispose();
    }
}