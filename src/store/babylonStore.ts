import { Engine, Scene, UniversalCamera} from 'babylonjs';

/**
 * Stores Babylon references in one place so that they can be retreived from multiple classes.
 */
export class BabylonStore {
    private static _instance: BabylonStore = null;

    #_engine: Engine;
    #_scene: Scene;
    #_camera: UniversalCamera;   
    
    private constructor() {
        BabylonStore._instance = this;
    }

    /**
     * Creates a Babylon Engine.
     * @param args The arguments for the engine.
     */
    public static createEngine(...args: ConstructorParameters<typeof Engine>): void {
        this.getInstance().#_engine = new Engine(...args);
    }
    /**
     * Gets the created Babylon Engine.
     * @returns The Babylon Engine.
     */
    public static get engine(): Engine {
        return this.getInstance().#_engine;
    }
    /**
     * Disposes the Babylon Engine and sets the internal engine reference to null.
     */
    public static disposeEngine(): void {
        this.getInstance().#_engine.dispose();
        this.getInstance().#_engine = null;
    }

    /**
     * Creates a Babylon Scene.
     * @param args The arguments for the scene.
     */
    public static createScene(...args: ConstructorParameters<typeof Scene>): void {
        this.getInstance().#_scene = new Scene(...args);
    }
    /**
     * Gets the created Babylon scene.
     * @returns The Babylon Scene.
     */
    public static get scene(): Scene {
        return this.getInstance().#_scene;
    }
    /**
     * Disposes the Babylon Scene and sets the internal scene reference to null.
     */
    public static disposeScene(): void {
        this.getInstance().#_scene.dispose();
        this.getInstance().#_scene = null;
    }

    /**
     * Creates a Babylon camera.
     * @param args The arguments for the camera.
     */
    public static createCamera(...args: ConstructorParameters<typeof UniversalCamera>): void {
        this.getInstance().#_camera = new UniversalCamera(...args);
    }
    /**
     * Gets the created Babylon camera. This is the main camera of the scene.
     * @returns The Babylon Camera.
     */
    public static get camera(): UniversalCamera {
        return this.getInstance().#_camera;
    }
    /**
     * Disposes the Babylon Camera and sets the internal camera reference to null.
     */
    public static disposeCamera(): void {
        this.getInstance().#_camera.dispose();
        this.getInstance().#_camera = null;
    }

    private static getInstance(): BabylonStore {
        if(!this._instance) {
            this._instance = new BabylonStore();
        }

        return this._instance;
    }
}