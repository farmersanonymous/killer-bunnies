import { GUIManager } from '../ui/guiManager';
import { BabylonStore } from '../store/babylonStore';
import { Burrow } from '../environment/burrow';
import { Vector3, Scalar } from 'babylonjs';
import { Farmer } from '../player/farmer';
import { StabberRabbit } from '../enemies/stabberRabbit';

/**
 * Amount of time, in seconds, that the defense round goes for.
 */
const defendTime = 120

/**
 * Amount of time, in seconds, that the fortification round goes for.
 */
const fortifyTime = 30

/**
 * Types of rounds to switch between.
 */
export enum RoundType {
    Defend,
    Fortify
}

/**
 * Handles logic for switching between defense and forification rounds.
 */
export class RoundHandler {
    /**
     * The current round.
     */
    #_round = 1;

    /**
     * The amount of time to count down from.
     */
    #_time = 10;

    /**
     * The GUIManager instance used to update the round and round timer.
     */
    #_gui: GUIManager;

    /**
     * The current round type.
     */
    #_type = RoundType.Fortify;

    /**
     * How frequent the burrows will spawn. In seconds.
     */
    #_spawnFrequency = 5;

    /**
     * The current time left before the next burrow spawns.
     */
    #_spawnTimer = this.#_spawnFrequency;

    /**
     * A list of Burrows that have been created by the RoundHandler.
     */
    #_burrows: Burrow[] = [];

    #_rabbits: StabberRabbit[] = [];

    /**
     * Constructor.
     * @param guiManager The GUIManager instance used to update the round and round timer.
     */
    constructor(guiManager: GUIManager) {
        this.#_gui = guiManager;
        this.#_gui.setRound(this.#_round);

        Burrow.onBurrowCreated = (burrow: Burrow): void => {
            this.#_burrows.push(burrow);
        };
        Burrow.onBurrowDisposed = (burrow: Burrow): void => {
            this.#_burrows = this.#_burrows.filter(bur => bur !== burrow);
        };

        StabberRabbit.onRabbitCreated = (rabbit: StabberRabbit): void => {
            this.#_rabbits.push(rabbit);
        }
        StabberRabbit.onRabbitDisposed = (rabbit: StabberRabbit): void => {
            this.#_rabbits = this.#_rabbits.filter(rab => rab !== rabbit);
        }
    }

    /**
     * Formats the current round timer to a string.
     */
    private _getTimeString(): string {
        const seconds = Math.floor(this.#_time % 60)
        return Math.floor(this.#_time / 60) + ':' + (seconds < 10 ? '0' : '') + seconds;
    }

    /**
     * Updates the current round.
     */
    public update(farmer: Farmer): void {
        this.#_time -= BabylonStore.deltaTime;

        this.#_gui.setRoundTimer(this._getTimeString())

        // Spawn more burrows during the defend round.
        if(this.#_type === RoundType.Defend) {
            this.#_spawnTimer -= BabylonStore.deltaTime;
            if(this.#_spawnTimer <= 0) {
                new Burrow(new Vector3(Scalar.RandomRange(-20, 20), 1, Scalar.RandomRange(-30, 30)), Scalar.RandomRange(1, 5), Scalar.RandomRange(30, 60));
                this.#_spawnTimer = this.#_spawnFrequency;
            }
        }

        // Update all the burrows.
        for(let i = 0; i < this.#_burrows.length; i++) {
            this.#_burrows[i].update();
        }

        // Update all the rabbits.
        for(let i = 0; i < this.#_rabbits.length; i++) {
            this.#_rabbits[i].update(farmer);
        }

        if (this.#_time <= 0) {
            if (this.#_type === RoundType.Defend) {
                // Player builds up their defenses for the next Defend round.
                this.#_type = RoundType.Fortify;
                this.#_time = fortifyTime;
                this.#_spawnTimer = this.#_spawnFrequency;
                
                this.#_gui.setRound(++this.#_round);
                this.#_burrows.forEach(b => b.dispose());
                this.#_rabbits.forEach(r => r.dispose());
                this.#_burrows = [];
                this.#_rabbits = [];
                
            } else {
                // Player defends the farm from spawning enemies.
                this.#_type = RoundType.Defend;
                this.#_time = defendTime;
            }
        }
    }

    /**
     * Releases all resources associated with this RoundHandler.
     */
    public dispose(): void {
        this.#_burrows.forEach(b => b.dispose());
        this.#_rabbits.forEach(r => r.dispose());
    }
}