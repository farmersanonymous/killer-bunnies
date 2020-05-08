import { Vector3, ActionManager, HemisphericLight } from 'babylonjs';
import { BabylonStore } from './store/babylonStore';
import { Garden } from './environment/garden';
import { Farmer } from './player/farmer';

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

        BabylonStore.createCamera('mainCamera', new Vector3(-15, 100, 0), BabylonStore.scene);
        BabylonStore.camera.setTarget(Vector3.Zero());

        new HemisphericLight("light1", new Vector3(0, 1, 0), BabylonStore.scene);
        Garden.create('https://storage.googleapis.com/farmer-assets/garden/Environment.gltf');

        // Create the player.
        new Farmer();

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