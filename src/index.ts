import { Vector3, ActionManager, HemisphericLight } from 'babylonjs';
import { BabylonStore } from './store/babylonStore';
import { Garden } from './environment/garden';
import { Farmer } from './player/farmer';
import { PlayerCameraController } from './camera/playerCameraController';

/**
 * The entrypoint for the game.
 */
export class Game {
    /**
     * Constructor.
     * @param canvas The canvas element used to initialize the Babylon engine.
     */
    constructor(canvas: HTMLCanvasElement) {
        BabylonStore.createEngine(canvas);

        BabylonStore.createScene(BabylonStore.engine);
        BabylonStore.scene.actionManager = new ActionManager(BabylonStore.scene);
        BabylonStore.scene.collisionsEnabled = true;

        new HemisphericLight("light1", new Vector3(0, 1, 0), BabylonStore.scene);
        Garden.create('https://storage.googleapis.com/farmer-assets/garden/Environment.gltf');

        // Create the player.
        const player = new Farmer();
        new PlayerCameraController(player);

        window.addEventListener('resize', () => {
            BabylonStore.engine.resize();
        });
    }

    /**
     * Runs the game loop.
     */
    public run(): void {
        BabylonStore.engine.runRenderLoop(() => {
            BabylonStore.scene.render();
        });
    }
}