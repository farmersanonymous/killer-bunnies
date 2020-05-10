
import { BabylonStore } from '../store/babylonStore';

/**
 * 
 */
const defendTime = 60

/**
 * 
 */
const fortifyTime = 30

/**
 * 
 */
export enum RoundType {
    Defend,
    Fortify
}

/**
 * 
 */
export class RoundHandler {
    /**
     * 
     */
    #_time = 0;

    /**
     * 
     */
    #_type = RoundType.Fortify;

    /**
     * 
     */
    constructor() {
        BabylonStore.scene.registerBeforeRender(() => {
            this.update();
        })
    }

    /**
     * 
     */
    public update(): void {
        this.#_time += BabylonStore.engine.getDeltaTime() / 1000

        switch(this.#_type) {
            case RoundType.Defend: {
                // Player defends the farm from spawning enemies.
                if (this.#_time >= defendTime) {
                    this.#_type = RoundType.Fortify;
                    this.#_time = 0;
                }
                break; 
            }
            case RoundType.Fortify: {
                // Player builds up their defenses for the next Defend round.
                if (this.#_time >= fortifyTime) {
                    this.#_type = RoundType.Defend;
                    this.#_time = 0;
                }
                break; 
            }
        }
    }
}