import { Farmer } from './player/farmer';
import { Garden } from './environment/garden';
import { Bootstrap } from './index';
import { BabylonObserverStore } from './store/babylonObserverStore';

/**
 * Starts a Game. Each instance is it's own self contained Game and can be created and disposed at will.
 */
export class Game {
    #_player: Farmer;
    #_garden: Garden;

    /**
     * Constructor.
     * @param bootstrap The bootstrap instance that started the game.
     * @param onGameOver A callback that is fired when the game is over.
     */
    constructor(bootstrap: Bootstrap, onGameOver: () => void) {
        this.#_player = new Farmer();
        this.#_garden = new Garden();

        // Temporary Game Loop test. Since we do not have any way to die, you can move around in the scene for 30 seconds before you "die" and get sent back to the splash screen.
        setTimeout(() => {
            this.#_player.modifyHealth(-100);
        }, 30000);

        // Checks to see if the player's health hits 0. If it does, it's GAME OVER!!!
        BabylonObserverStore.registerBeforeRender(() => {
            if (this.#_player.health <= 0) {
                onGameOver?.call(bootstrap);
            }
        });
    }

    /**
     * Release all resources associated with this Game.
     */
    public dispose(): void {
        BabylonObserverStore.clearBeforeRender();
        BabylonObserverStore.clearAfterRender();
        this.#_player.dispose();
        this.#_garden.dispose();
    }
}