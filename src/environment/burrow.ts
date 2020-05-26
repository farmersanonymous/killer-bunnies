import { TransformNode, Scalar } from "babylonjs";
import { BabylonStore } from "../store/babylonStore";
import { StabberRabbit } from "../enemies/stabberRabbit";
import { SoundManager } from "../assets/soundManager";
import { Spawner } from "../assets/spawner";
import { Config } from "../gameplay/config";
import { NabberRabbit } from "../enemies/nabberRabbit";

/**
 * The Burrow will control how often and the spawn position of the Rabbit enemies.
 */
export class Burrow {
    private static _burrows: Burrow[] = [];

    #_root: TransformNode;
    #_spawnTimer: number;
    #_disposeTime: number;

    /**
     * Constructor.
     * @param parent The parent that the Burrow will be spawned at.
     */
    constructor(parent: TransformNode) {
        SoundManager.play("Burrow", {
            position: parent.position
        });

         const spawner = Spawner.getSpawner('Burrow');
         const instance = spawner.instantiate();
         this.#_root = instance.rootNodes[0];
         this.#_root.parent = parent;

        this.#_disposeTime = BabylonStore.time + Config.burrow.randomTimeLimit();
        this.#_spawnTimer = Config.burrow.randomRabbitSpawnFrequency();

        Burrow._burrows.push(this);
    }

    /**
     * Updates the Burrow every frame.
     */
    public update(): void {
        if(this.#_disposeTime < BabylonStore.time) {
            this.dispose();
        }
        else {
            this.#_spawnTimer -= BabylonStore.deltaTime;
            if(this.#_spawnTimer <= 0) {
                const rand = Scalar.RandomRange(0, 1);
                if(rand <= Config.burrow.nabberSpawnRatio)
                    new NabberRabbit((this.#_root.parent as TransformNode).position.clone());
                else
                    new StabberRabbit((this.#_root.parent as TransformNode).position.clone());
                this.#_spawnTimer = Config.burrow.randomRabbitSpawnFrequency();
            }
        }
    }

    /**
     * Release all resources associated with the Burrow.
     */
    public dispose(): void {
        this.#_root.dispose();
        Burrow._burrows = Burrow._burrows.filter(bur => bur !== this);
    }

    /**
     * Updates all the burrows.
     */
    public static updateAll(): void {
        for(let i = 0; i < this._burrows.length; i++) {
            this._burrows[i].update();
        }
    }
    /**
     * Disposes and releases all resources associated with all of the Burrows.
     */
    public static disposeAll(): void {
        while(this._burrows.length > 0) {
            this._burrows[0].dispose();
        }
    }
}