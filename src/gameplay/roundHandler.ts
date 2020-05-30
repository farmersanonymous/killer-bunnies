import { GUIManager } from '../ui/guiManager';
import { BabylonStore } from '../store/babylonStore';
import { Burrow } from '../environment/burrow';
import { Farmer } from '../player/farmer';
import { StabberRabbit } from '../enemies/stabberRabbit';
import { Garden } from '../environment/garden';
import { Config } from './config';
import { Carrot } from '../environment/carrot';
import { Vector3, Vector2 } from 'babylonjs';
import { Input } from '../input/input';
import { NabberRabbit } from '../enemies/nabberRabbit';
import { CarrotDrop } from '../droppable/carrotDrop';
import { Button, Vector2WithInfo } from 'babylonjs-gui';
import { HeartDrop } from '../droppable/heartDrop';
import { SoundManager } from '../assets/soundManager';

/**
 * Amount of time, in seconds, that the rest round goes for.
 */
const restTime = 30;

/**
 * Amount of time, in seconds, that the defense round goes for.
 */
const defendTime = 120;

/**
 * Types of rounds to switch between.
 */
export enum RoundType {
    Rest,
    Defend
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
    #_time = 0;

    /**
     * The GUIManager instance used to update the round and round timer.
     */
    #_gui: GUIManager;

    /**
     * The current round type.
     */
    #_type = RoundType.Rest;

    /**
     * The current time left before the next burrow spawns.
     */
    #_burrowSpawnTimer: number;

    /**
     * The current time left before the next carrot spawns.
     */
    #_carrotSpawnTimer: number;

    #_upgrading: boolean;
    #_upgradeButtons: Button[];

    /**
     * Constructor.
     * @param guiManager The GUIManager instance used to update the round and round timer.
     */
    constructor(guiManager: GUIManager) {
        this.#_gui = guiManager;
        this.#_gui.setRound(this.#_round);
        this.#_gui.setRoundTimer(this._getTimeString(defendTime));

        this.#_burrowSpawnTimer = Config.burrow.randomSpawnFrequency();
        this.#_carrotSpawnTimer = Config.carrot.randomSpawnFrequency();

        this.#_upgrading = false;
    }

    /**
     * Formats the current round timer to a string.
     */
    private _getTimeString(time: number): string {
        const seconds = Math.floor(time % 60)
        return Math.floor(time / 60) + ':' + (seconds < 10 ? '0' : '') + seconds;
    }

    /**
     * Formats the current round timer to a string.
     */
    private _getNextRoundTimeString(time: number): string {
        return 'Next Round In: ' + this._getTimeString(time);
    }

    /**
     * Returns a difficulty modifier, on the current round, used to manipulate values in the game.
     */
    public getDifficultyModifier(): number {
        return 0.25 * (this.#_round - 1);
    }
    
    /**
     * Updates the current round.
     */
    public update(farmer: Farmer, garden: Garden): void {
        // Spawn more burrows during the defend round.
        if(this.#_type === RoundType.Defend) {
            this.#_burrowSpawnTimer -= BabylonStore.deltaTime;
            this.#_carrotSpawnTimer -= BabylonStore.deltaTime;

            if(this.#_burrowSpawnTimer <= 0) {
                new Burrow(garden.getRandomBurrowNode(), this);
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
                if(farmer.useMouse)
                    this.#_gui.addPickIcon(garden.harvestBasket, 'EKey');
                else
                    this.#_gui.addPickIcon(garden.harvestBasket, 'AButton');
                if((Input.isKeyPressed('e') || Input.isKeyPressed('gamepadA')) && !this.upgrading) {
                    farmer.disabled = true;
                    this.#_upgrading = true;
                    this.#_upgradeButtons = this.#_gui.showUpgradeMenu(farmer, () => {
                        this.#_upgrading = false;
                        farmer.disabled = false;
                    });
                }

                if(this.upgrading) {
                    // Upgrade health if the up button is pressed.
                    if(Input.isKeyPressed('gamepadUP')) {
                        this.#_upgradeButtons[0].onPointerClickObservable.notifyObservers(new Vector2WithInfo(Vector2.Zero()));
                    }
                    // Upgrade damage if the left button is pressed.
                    if(Input.isKeyPressed('gamepadLEFT')) {
                        this.#_upgradeButtons[1].onPointerClickObservable.notifyObservers(new Vector2WithInfo(Vector2.Zero()));
                    }
                    // Upgrade harvest speed if the right button is pressed.
                    if(Input.isKeyPressed('gamepadRIGHT')) {
                        this.#_upgradeButtons[2].onPointerClickObservable.notifyObservers(new Vector2WithInfo(Vector2.Zero()));
                    }
                    // Upgrade move speed if the down button is pressed.
                    if(Input.isKeyPressed('gamepadDOWN')) {
                        this.#_upgradeButtons[3].onPointerClickObservable.notifyObservers(new Vector2WithInfo(Vector2.Zero()));
                    }
                    // Close the menu if the B button is pressed.
                    if(Input.isKeyPressed('gamepadB')) {
                        this.#_upgradeButtons[4].onPointerClickObservable.notifyObservers(new Vector2WithInfo(Vector2.Zero()));
                    }
                }
            }
            else {
                this.#_gui.removePickIcon(garden.harvestBasket);
            }
        }

        // Update all the carrots.
        Carrot.updateAll(farmer);
        CarrotDrop.updateAll(farmer, this.#_gui);
        HeartDrop.updateAll(farmer);

        // Update all the rabbits.
        StabberRabbit.updateAll(farmer, this);
        NabberRabbit.updateAll(farmer, this.#_gui, this);

        this.#_time -= BabylonStore.deltaTime;
        if (this.#_type === RoundType.Defend) {
            this.#_gui.setRoundTimer(this._getTimeString(this.#_time))
        } else {
            this.#_gui.setNextRoundTimer(this._getNextRoundTimeString(this.#_time))
        }

        if (this.#_time <= 0) {
            if (this.#_type === RoundType.Defend) {
                SoundManager.play('Siren');

                this.#_gui.enableNextRoundTimer(true);

                this.#_gui.setRoundTimer(this._getTimeString(defendTime));

                // Player builds up their defenses for the next Defend round.
                this.#_time = restTime;
                this.#_type = RoundType.Rest;
                this.#_burrowSpawnTimer = Config.burrow.randomSpawnFrequency();
                this.#_carrotSpawnTimer = Config.carrot.randomSpawnFrequency();
                
                this.#_gui.setRound(++this.#_round);
                StabberRabbit.retreatAll();
                NabberRabbit.retreatAll();
                Carrot.disposeAll();
                CarrotDrop.disposeAll();
                HeartDrop.disposeAll();
                this.#_gui.clearFarmerCarrots();

                Burrow.disposeAll();
            } else {
                this.#_gui.enableNextRoundTimer(false);

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
        HeartDrop.disposeAll();
        Burrow.disposeAll();
    }
}