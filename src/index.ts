import { Vector3, ActionManager, HemisphericLight } from 'babylonjs';
import { BabylonStore } from './store/babylonStore';
import { Spawner } from './util/spawner';
import { Garden } from './environment/garden';
import { Farmer } from './player/farmer';
import { PlayerCameraController } from './camera/playerCameraController';

import { RoundHandler } from './gameplay/round'

/**
 * The entrypoint for the game.
 */
export class Game {
    #_render = false;
    #_rounds: RoundHandler;

    /**
     * Constructor.
     * @param canvas The canvas element used to initialize the Babylon engine.
     */
    constructor(canvas: HTMLCanvasElement) {
        BabylonStore.createEngine(canvas);

        BabylonStore.createScene(BabylonStore.engine);
        BabylonStore.scene.actionManager = new ActionManager(BabylonStore.scene);
        BabylonStore.scene.collisionsEnabled = true;
        BabylonStore.scene.useRightHandedSystem = true;

        new HemisphericLight("light1", new Vector3(0, 1, 0), BabylonStore.scene);
        Spawner.create('Garden', 'https://storage.googleapis.com/farmer-assets/garden/Environment.gltf').then(() => {
            new Garden();
        });

        // Create the player.
        Spawner.create('Farmer', 'https://storage.googleapis.com/farmer-assets/farmer/2/Farmer_high.gltf').then(() => {
            const player = new Farmer();
            new PlayerCameraController(player);
            this.#_render = true;
        });

        window.addEventListener('resize', () => {
            if(this.#_render) {
                BabylonStore.engine.resize();
            }
        });

        this.#_rounds = new RoundHandler();
    }

    /**
     * Runs the game loop.
     */
    public run(): void {
        BabylonStore.engine.runRenderLoop(() => {
            if(this.#_render) {
                BabylonStore.scene.render();
            }
        });
    }
}