import { Vector3, ActionManager } from 'babylonjs';
import { BabylonStore } from './store/babylonStore';
import { ProxyGround } from './environment/proxyGround';
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

        BabylonStore.createCamera('mainCamera', new Vector3(0, 15, -5), BabylonStore.scene);
        BabylonStore.camera.setTarget(Vector3.Zero());

        new ProxyGround('ground', 20, 20);
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