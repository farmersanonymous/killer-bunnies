import { GUIManager } from '../ui/guiManager';
import { BabylonStore } from '../store/babylonStore';
import { Burrow } from '../environment/burrow';
import { Farmer } from '../player/farmer';
import { StabberRabbit } from '../enemies/stabberRabbit';
import { Garden } from '../environment/garden';
import { Config } from './config';
import { Carrot } from '../environment/carrot';
import { Vector3 } from 'babylonjs';
import { Input } from '../input/input';
import { NabberRabbit } from '../enemies/nabberRabbit';
import { CarrotDrop } from '../droppable/carrotDrop';

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

    #_upgrading: boolean;

    /**
     * Constructor.
     * @param guiManager The GUIManager instance used to update the round and round timer.
     */
    constructor(guiManager: GUIManager) {
        this.#_gui = guiManager;
        this.#_gui.setRound(this.#_round);

        this.#_burrowSpawnTimer = Config.burrow.randomSpawnFrequency();
        this.#_carrotSpawnTimer = Config.carrot.randomSpawnFrequency();

        this.#_upgrading = false;
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
            Burrow.updateAll();
        }
        else {
            if(Vector3.Distance(farmer.position, garden.harvestBasket.position) <= 5) {
                this.#_gui.addPickIcon(garden.harvestBasket, 'EKey');
                if(Input.isKeyPressed('e') && !this.upgrading) {
                    farmer.disabled = true;
                    this.#_upgrading = true;
                    this.#_gui.showUpgradeMenu(farmer, () => {
                        this.#_upgrading = false;
                        farmer.disabled = false;
                    });
                }
            }
            else {
                this.#_gui.removePickIcon(garden.harvestBasket);
            }
        }

        // Update all the carrots.
        Carrot.updateAll(farmer, this.#_gui);
        CarrotDrop.updateAll(farmer, this.#_gui);

        // Update all the rabbits.
        StabberRabbit.updateAll(farmer, this);
        NabberRabbit.updateAll(farmer, this.#_gui, this);

        if (this.#_time <= 0) {
            if (this.#_type === RoundType.Defend) {
                // Player builds up their defenses for the next Defend round.
                this.#_type = RoundType.Fortify;
                this.#_time = fortifyTime;
                this.#_burrowSpawnTimer = Config.burrow.randomSpawnFrequency();
                this.#_carrotSpawnTimer = Config.carrot.randomSpawnFrequency();
                
                this.#_gui.setRound(++this.#_round);
                StabberRabbit.retreatAll();
                NabberRabbit.retreatAll();
                Carrot.disposeAll();
                CarrotDrop.disposeAll();
                this.#_gui.clearFarmerCarrots();

                Burrow.disposeAll();
            } else {
                // Player defends the farm from spawning enemies.
                this.#_type = RoundType.Defend;
                this.#_time = defendTime;
                this.#_gui.removePickIcon(garden.harvestBasket);
                
                // Hides the upgrade panel in case it is still visible.
                if(this.#_gui.hideUpgradePanel()) {
                    farmer.disabled = false;
                    this.#_upgrading = false;
                }
            }
        }
    }

    /**
     * True if the round handler has the upgrading menu open.
     * @returns True if the upgrading menu is open.
     */
    public get upgrading(): boolean {
        return this.#_upgrading;
    }

    /**
     * The current round type.
     * @returns The current round type.
     */
    public get type(): RoundType {
        return this.#_type;
    }

    /**
     * Called when the game is paused.
     * @param paused True if the game is pause, false if it has been unpaused.
     */
    public onPause(paused: boolean): void {
        StabberRabbit.disableAll(paused);
        NabberRabbit.disableAll(paused);
        this.#_gui.paused = paused;
    }

    /**
     * Releases all resources associated with this RoundHandler.
     */
    public dispose(): void {
        StabberRabbit.disposeAll();
        NabberRabbit.disposeAll();
        Carrot.disposeAll();
        CarrotDrop.disposeAll();
        Burrow.disposeAll();
    }
}