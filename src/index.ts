import { Vector3, ActionManager } from 'babylonjs';
import { BabylonStore } from './store/babylonStore';
import { ProxyGround } from './environment/proxyGround';
import { Farmer } from './player/farmer';
import { ProxyCube } from './environment/proxyCube';

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

        BabylonStore.createCamera('mainCamera', new Vector3(0, 15, -5), BabylonStore.scene);
        BabylonStore.camera.setTarget(Vector3.Zero());

        // Pre-proxy environment.
        new ProxyGround('ground', 20, 20);
        new ProxyCube('cube1', new Vector3(5, 0, 5), 1);
        new ProxyCube('cube2', new Vector3(-5, 0, 5), 1);
        new ProxyCube('cube3', new Vector3(-5, 0, -5), 1);
        new ProxyCube('cube4', new Vector3(5, 0, -5), 1);

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