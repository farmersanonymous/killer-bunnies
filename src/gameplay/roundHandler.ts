import { GUIManager } from '../ui/guiManager';
import { BabylonStore } from '../store/babylonStore';
import { Burrow } from '../environment/burrow';
import { Vector3, Scalar } from 'babylonjs';

/**
 * Amount of time, in seconds, that the defense round goes for.
 */
const defendTime = 120

/**
 * Amount of time, in seconds, that the fortification round goes for.
 */
const fortifyTime = 60

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
    #_time = fortifyTime;

    /**
     * The GUIManager instance used to update the round and round timer.
     */
    #_gui: GUIManager;

    /**
     * The current round type.
     */
    #_type = RoundType.Fortify;

    /**
     * The handle to the interval timer for spawning Burrows.
     */
    #_spawningInterval: NodeJS.Timer;

    /**
     * A list of Burrows that have been created by the RoundHandler.
     */
    #_burrows: Burrow[] = [];

    /**
     * Constructor.
     * @param guiManager The GUIManager instance used to update the round and round timer.
     */
    constructor(guiManager: GUIManager) {
        this.#_gui = guiManager;
        this.#_gui.setRound(this.#_round);
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
    public update(): void {
        this.#_time -= BabylonStore.engine.getDeltaTime() / 1000

        this.#_gui.setRoundTimer(this._getTimeString())
  
        if (this.#_time <= 0) {
            if (this.#_type == RoundType.Defend) {
                // Player builds up their defenses for the next Defend round.
                this.#_type = RoundType.Fortify;
                this.#_time = fortifyTime;
                
                this.#_gui.setRound(++this.#_round);
                this.#_burrows.forEach(b => b.dispose());
                this.#_burrows = [];
                clearTimeout(this.#_spawningInterval);
                
            } else {
                // Player defends the farm from spawning enemies.
                this.#_type = RoundType.Defend;
                this.#_time = defendTime;

                // Temporary spawning code. Will spawn a Burrow every five second randomly throughout the map.
                this.#_spawningInterval = setInterval(() => {
                    this.#_burrows.push(new Burrow(new Vector3(Scalar.RandomRange(-20, 20), 1, Scalar.RandomRange(-30, 30)), Scalar.RandomRange(1, 5), Scalar.RandomRange(30, 60)));
                }, 5000);
            }
        }
    }
}