import { BabylonStore } from './babylonStore';

/**
 * Stores Babylon Observer references (such as onBeforeRender) in one place so that they can be retreived from multiple classes.
 */
export class BabylonObserverStore {
    private static _instance: BabylonObserverStore = null;

    #_onBeforeRenderFunctions: (() => void)[] = [];
    #_onAfterRenderFunctions: (() => void)[] = [];
    
    private constructor() {
        BabylonObserverStore._instance = this;
    }

    /**
     * Registers callbacks to 'scene.registerBeforeRender'. Needed in order to properly unregister the functions.
     * @param func The function to register.
     */
    public static registerBeforeRender(func: () => void): void {
        this.getInstance().#_onBeforeRenderFunctions.push(func);
        BabylonStore.scene.registerBeforeRender(func);
    }
    /**
     * Unregisters all the callbacks that were added with 'registerBeforeRender'.
     */
    public static clearBeforeRender(): void {
        this.getInstance().#_onBeforeRenderFunctions.forEach(f => BabylonStore.scene.unregisterBeforeRender(f));
        this.getInstance().#_onBeforeRenderFunctions = [];
    }

    /**
     * Registers callbacks to 'scene.registerAfterRender'. Needed in order to properly unregister the functions.
     * @param func The function to register.
     */
    public static registerAfterRender(func: () => void): void {
        this.getInstance().#_onAfterRenderFunctions.push(func);
        BabylonStore.scene.registerAfterRender(func);
    }
    /**
     * Unregisters all the callbacks that were added with 'registerAfterRender'.
     */
    public static clearAfterRender(): void {
        this.getInstance().#_onAfterRenderFunctions.forEach(f => BabylonStore.scene.unregisterAfterRender(f));
        this.getInstance().#_onAfterRenderFunctions = [];
    }

    private static getInstance(): BabylonObserverStore {
        if(!this._instance) {
            this._instance = new BabylonObserverStore();
        }

        return this._instance;
    }
}