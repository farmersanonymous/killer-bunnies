import { BabylonStore } from './babylonStore';

/**
 * Stores Babylon Observer references (such as onBeforeRender) in one place so that they can be retreived from multiple classes.
 */
export class BabylonObserverStore {
    private static _instance: BabylonObserverStore = null;

    #_count = 0;
    #_onBeforeRenderFunctions: Map<number, () => void> = new Map<number, () => void>();
    #_onAfterRenderFunctions: Map<number, (() => void)> = new Map<number, () => void>();
    
    private constructor() {
        BabylonObserverStore._instance = this;
    }

    /**
     * Registers callbacks to 'scene.registerBeforeRender'. Needed in order to properly unregister the functions.
     * @param func The function to register.
     * @returns The handle to the callback for deregistering.
     */
    public static registerBeforeRender(func: () => void): number {
        const instance = this.getInstance();
        instance.#_onBeforeRenderFunctions.set(instance.#_count, func);
        BabylonStore.scene.registerBeforeRender(func);
        return instance.#_count++;
    }
    /**
     * Deregisters the callback that was registered with 'registerBeforeRender'. Takes in a handle that is returned from that function.
     * @param handle The handle for the callback to deregister.
     */
    public static deregisterBeforeRender(handle: number): void {
        const instance = this.getInstance();
        BabylonStore.scene.unregisterBeforeRender(instance.#_onBeforeRenderFunctions.get(handle));
        instance.#_onBeforeRenderFunctions.delete(handle);
    }

    /**
     * Registers callbacks to 'scene.registerAfterRender'. Needed in order to properly unregister the functions.
     * @param func The function to register.
     * @returns The handle to the callback for deregistering.
     */
    public static registerAfterRender(func: () => void): number {
        const instance = this.getInstance();
        instance.#_onAfterRenderFunctions.set(instance.#_count, func);
        BabylonStore.scene.registerAfterRender(func);
        return instance.#_count++;
    }
    /**
     * Deregisters the callback that was registered with 'registerAfterRender'. Takes in a handle that is returned from that function.
     * @param handle The handle for the callback to deregister.
     */
    public static deregisterAfterRender(handle: number): void {
        const instance = this.getInstance();
        BabylonStore.scene.unregisterBeforeRender(instance.#_onBeforeRenderFunctions.get(handle));
        instance.#_onBeforeRenderFunctions.delete(handle);
    }

    private static getInstance(): BabylonObserverStore {
        if(!this._instance) {
            this._instance = new BabylonObserverStore();
        }

        return this._instance;
    }
}