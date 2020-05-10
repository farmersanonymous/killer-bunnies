import { Farmer } from './player/farmer';
import { Garden } from './environment/garden';
import { Bootstrap } from './index';
import { BabylonObserverStore } from './store/babylonObserverStore';
import { GUIManager } from './ui/guiManager';
import { RoundHandler } from './gameplay/round';

/**
 * Starts a Game. Each instance is it's own self contained Game and can be created and disposed at will.
 */
export class Game {
    #_player: Farmer;
    #_garden: Garden;
    #_gui: GUIManager;
    #_roundHandler: RoundHandler;

    /**
     * Constructor.
     * @param bootstrap The bootstrap instance that started the game.
     * @param onGameOver A callback that is fired when the game is over.
     */
    constructor(bootstrap: Bootstrap, onGameOver: () => void) {
        this.#_player = new Farmer();
        this.#_garden = new Garden();
        this.#_gui = new GUIManager();
        this.#_roundHandler = new RoundHandler(this.#_gui);

        // Temporary Game Loop test. Since we do not have any way to die, you can move around in the scene for 30 seconds before you "die" and get sent back to the splash screen.
        const interval = setInterval(() => {
            this.#_player.modifyHealth(-1);
        }, 250);

        // Checks to see if the player's health hits 0. If it does, it's GAME OVER!!!
        BabylonObserverStore.registerBeforeRender(() => {
            if (this.#_player.health <= 0) {
                //clearInterval(interval);
                onGameOver?.call(bootstrap);
            }

            // Temporarily setting GUI values here. This will be fine if we only have player values, but if we need to
            // show anything per Enemy, then we will probably have to use callbacks for setting health, so it doesn't happen every frame.
            this.#_gui.setHealthValues(this.#_player.health, this.#_player.maxHealth);

            // TODO: Impliment phases.
            this.#_roundHandler.update();
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
        this.#_gui.dispose();
    }
}