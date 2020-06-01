import { Engine, Scene, ArcRotateCamera} from 'babylonjs';

/**
 * Stores Babylon references in one place so that they can be retreived from multiple classes.
 */
export class BabylonStore {
    private static _instance: BabylonStore = null;
    private static _time = 0;
    private static _deltaTime = 0;

    #_engine: Engine;
    #_scene: Scene;
    #_camera: ArcRotateCamera;   
    
    private constructor() {
        BabylonStore._instance = this;
    }

    /**
     * Returns true if running on mobile.
     */
    public static get isMobile(): boolean {
        return /Mobi/.test(navigator.userAgent);
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
    public static createCamera(...args: ConstructorParameters<typeof ArcRotateCamera>): void {
        this.getInstance().#_camera = new ArcRotateCamera(...args);
    }
    /**
     * Gets the created Babylon camera. This is the main camera of the scene.
     * @returns The Babylon Camera.
     */
    public static get camera(): ArcRotateCamera {
        return this.getInstance().#_camera;
    }
    /**
     * Disposes the Babylon Camera and sets the internal camera reference to null.
     */
    public static disposeCamera(): void {
        this.getInstance().#_camera.dispose();
        this.getInstance().#_camera = null;
    }

    /**
     * Updates the time values every frame.
     */
    public static update(): void {
        this._deltaTime = this.engine.getDeltaTime() / 1000;
        this._time += this._deltaTime;
    }

    /**
     * Resets the time value back to 0.
     */
    public static resetTime(): void {
        this._time = 0;
    }

    /**
     * The amount of time since the application has started, in seconds.
     * @returns The amount of time since the application has started.
     */
    public static get time(): number {
        return this._time;
    }
    /**
     * The amount of time that has passed this frame, in seconds.
     * @returns The amount of time that has passed this frame.
     */
    public static get deltaTime(): number {
        return this._deltaTime;
    }

    private static getInstance(): BabylonStore {
        if(!this._instance) {
            this._instance = new BabylonStore();
        }

        return this._instance;
    }
}