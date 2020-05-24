import { ExecuteCodeAction, ActionManager, GenericPad, GamepadManager, StickValues, Xbox360Pad, DualShockPad } from "babylonjs";
import { BabylonStore } from "../store/babylonStore";

/**
 * An Input helper class. This will hold on to and keep track of all input through mouse/keyboard, game pads, and touch.
 */
export class Input {
    /**
     * This callback will fire whenever any key/button is pressed.
     */
    public static onAnyDown: () => void;

    private static _isInit = false;
    private static _keyMap: Map<string, boolean> = new Map<string, boolean>();
    private static _prevMap: Map<string, boolean> = new Map<string, boolean>();
    private static genericPad: GenericPad = null;

    private constructor() { /** Static class. */ }

    /**
     * Initializes the input system.
     */
    public static init(): void {
        // Don't do anything if init gets called twice.
        if (this._isInit) {
            return;
        }

        // Action manager events for key presses.
        BabylonStore.scene.actionManager = new ActionManager(BabylonStore.scene);
        BabylonStore.scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, (evt) => {
            this.mapInput(evt.sourceEvent.key, evt.sourceEvent.type === 'keydown');
        }));
        BabylonStore.scene.actionManager.registerAction(new ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, (evt) => {
            this.mapInput(evt.sourceEvent.key, evt.sourceEvent.type === 'keydown');
        }));

        // Events that get triggered when any mouse button is clicked/released.
        BabylonStore.scene.onPointerDown = (evt): void => {
            this.mapInput('pointerDown', true && evt.pointerType === 'mouse' && evt.button === 0);
        };
        BabylonStore.scene.onPointerUp = (): void => {
            this.mapInput('pointerDown', false);
        };

        // Handle game pad management. We currently only support one game pad. Unplug the existing game pad in order to use a new one.
        const gamepadManager = new GamepadManager();
        gamepadManager.onGamepadConnectedObservable.add((gamepad) => {
            if (!this.genericPad) {
                this.genericPad = gamepad as GenericPad;
                if (this.genericPad instanceof Xbox360Pad || this.genericPad instanceof DualShockPad) {
                    this.genericPad.onButtonDownObservable.add(() => {
                        this.onAnyDown?.call(this);
                    });
                }
            }
        });
        gamepadManager.onGamepadDisconnectedObservable.add((gamepad) => {
            if (this.genericPad === gamepad) {
                this.genericPad = null;
            }
        });
        this._isInit = true;
    }

    /**
     * Detect if a key/button is down.
     * @param key The key/button to check.
     * @returns Returns true if the key/button is down, false if it is not.
     */
    public static isKeyDown(key: string): boolean {
        return this._keyMap.get(key);
    }

    /**
     * Detect if a key/button has been pressed.
     * @param key The key/button to check.
     * @returns Returns true if the key/button has been pressed this frame, false if it has not been pressed.
     */
    public static isKeyPressed(key: string): boolean {
        return this._keyMap.get(key) && !this._prevMap.get(key);
    }

    /**
     * Updates the input every frame.
     */
    public static update(): void {
        this._prevMap = new Map(this._keyMap);
    }

    /**
     * Detect if a controller is connected.
     * @returns Returns true if a controller is connected, false if it is not.
     */
    public static get isControllerConnected(): boolean {
        return this.genericPad != null;
    }
    /**
     * Gets the left stick values on the controller.
     * @returns The left stick values on the controller.
     */
    public static get controllerLeftStick(): StickValues {
        return this.genericPad.leftStick;
    }
    /**
     * Gets the right stick values on the controller.
     * @returns The right stick values on the controller.
     */
    public static get controllerRightStick(): StickValues {
        return this.genericPad.rightStick;
    }
    /**
     * Gets the right trigger value on the controller.
     * @returns The right trigger value on the controller.
     */
    public static get controllerRightTrigger(): number {
        if (this.genericPad instanceof Xbox360Pad || this.genericPad instanceof DualShockPad) {
            return this.genericPad.rightTrigger;
        }
        return 0;
    }
    /**
     * Gets the left trigger value on the controller.
     * @returns The left trigger value on the controller.
     */
    public static get controllerLeftTrigger(): number {
        if (this.genericPad instanceof Xbox360Pad || this.genericPad instanceof DualShockPad) {
            return this.genericPad.leftTrigger;
        }
        return 0;
    }

    private static mapInput(key: string, value: boolean): void {
        this._keyMap.set(key, value);
        this.onAnyDown?.call(this);
    }
}