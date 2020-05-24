import { GUIManager } from '../ui/guiManager';
import { BabylonStore } from '../store/babylonStore';
import { Burrow } from '../environment/burrow';
import { Farmer } from '../player/farmer';
import { StabberRabbit } from '../enemies/stabberRabbit';
import { Garden } from '../environment/garden';
import { Config } from './config';
import { Carrot } from '../environment/carrot';

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
     * The current time left before the next burrow spawns.
     */
    #_burrowSpawnTimer: number;

    /**
     * The current time left before the next carrot spawns.
     */
    #_carrotSpawnTimer: number;

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

        this.#_burrowSpawnTimer = Config.burrow.randomSpawnFrequency();
        this.#_carrotSpawnTimer = Config.carrot.randomSpawnFrequency();

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
    public update(farmer: Farmer, garden: Garden): void {
        this.#_time -= BabylonStore.deltaTime;

        this.#_gui.setRoundTimer(this._getTimeString())

        // Spawn more burrows during the defend round.
        if(this.#_type === RoundType.Defend) {
            this.#_burrowSpawnTimer -= BabylonStore.deltaTime;
            this.#_carrotSpawnTimer -= BabylonStore.deltaTime;

            if(this.#_burrowSpawnTimer <= 0) {
                new Burrow(garden.getRandomBurrowNode());
                this.#_burrowSpawnTimer = Config.burrow.randomSpawnFrequency();
            }

            if(this.#_carrotSpawnTimer <= 0) {
                new Carrot(garden.getRandomCarrotNode());
                this.#_carrotSpawnTimer = Config.carrot.randomSpawnFrequency();
            }

            // Update all the burrows.
            for(let i = 0; i < this.#_burrows.length; i++) {
                this.#_burrows[i].update();
            }
        }
        else {
            if(this.#_rabbits.length === 0 && this.#_burrows.length > 0) {
                this.#_burrows.forEach(b => b.dispose());
                this.#_burrows = [];
            }
        }

        // Update all the carrots.
        Carrot.updateAll(farmer, this.#_gui);

        // Update all the rabbits.
        for(let i = 0; i < this.#_rabbits.length; i++) {
            this.#_rabbits[i].update(farmer);
        }

        if (this.#_time <= 0) {
            if (this.#_type === RoundType.Defend) {
                // Player builds up their defenses for the next Defend round.
                this.#_type = RoundType.Fortify;
                this.#_time = fortifyTime;
                this.#_burrowSpawnTimer = Config.burrow.randomSpawnFrequency();
                this.#_carrotSpawnTimer = Config.carrot.randomSpawnFrequency();
                
                this.#_gui.setRound(++this.#_round);
                this.#_rabbits.forEach(r => r.retreat());
                
            } else {
                // Player defends the farm from spawning enemies.
                this.#_type = RoundType.Defend;
                this.#_time = defendTime;
            }
        }
    }

    /**
     * Called when the game is paused.
     * @param paused True if the game is pause, false if it has been unpaused.
     */
    public onPause(paused: boolean): void {
        this.#_rabbits.forEach(r => r.disabled = paused);
        this.#_gui.paused = paused;
    }

    /**
     * Releases all resources associated with this RoundHandler.
     */
    public dispose(): void {
        Burrow.onBurrowCreated = null;
        Burrow.onBurrowDisposed = null;
        StabberRabbit.onRabbitCreated = null;
        StabberRabbit.onRabbitDisposed = null;
        this.#_burrows.forEach(b => b.dispose());
        this.#_rabbits.forEach(r => r.dispose());
        Carrot.disposeAll();
    }
}