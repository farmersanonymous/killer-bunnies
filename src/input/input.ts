import { ExecuteCodeAction, ActionManager, GenericPad, GamepadManager, StickValues, Xbox360Pad, DualShockPad, Vector2 } from "babylonjs";
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
    private static _touchPositions: Map<number, Vector2> = new Map<number, Vector2>();
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
        BabylonStore.scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, (evt) => {
            this.mapInput(evt.sourceEvent.key, evt.sourceEvent.type === 'keydown');
        }));

        // Events that get triggered when any mouse button is clicked/released.
        BabylonStore.scene.onPointerDown = (evt): void => {
            if(evt.pointerType === 'mouse')
                this.mapInput('pointerDown', true && evt.button === 0);
            else if(evt.pointerType === 'touch') {
                this.mapInput(`touch${evt.pointerId}`, true);
                this._touchPositions.set(evt.pointerId, new Vector2(evt.screenX, evt.screenY));
            }
        };
        BabylonStore.scene.onPointerUp = (evt): void => {
            if(evt.pointerType === 'mouse')
                this.mapInput('pointerDown', false);
            else if(evt.pointerType === 'touch') {
                this.mapInput(`touch${evt.pointerId}`, false);
                this._touchPositions.delete(evt.pointerId);
            }
        };
        BabylonStore.scene.onPointerMove = (evt): void => {
            this._touchPositions.set(evt.pointerId, new Vector2(evt.screenX, evt.screenY));
        }

        // Handle game pad management. We currently only support one game pad. Unplug the existing game pad in order to use a new one.
        const gamepadManager = new GamepadManager();
        gamepadManager.onGamepadConnectedObservable.add((gamepad) => {
            if (!this.genericPad) {
                this.genericPad = gamepad as GenericPad;
                if (this.genericPad instanceof Xbox360Pad || this.genericPad instanceof DualShockPad) {
                    this.genericPad.onButtonDownObservable.add(data => {
                        this.mapControllerInput(data, true);
                    });
                    this.genericPad.onButtonUpObservable.add(data => {
                        this.mapControllerInput(data, false);
                    });
                    this.genericPad.onPadDownObservable.add((data: number) => {
                        this.mapControllerInput(data, true);
                    });
                    this.genericPad.onPadUpObservable.add((data: number) => {
                        this.mapControllerInput(data, false);
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
     * Gets all fingers touching the touch screen.
     * @returns An array of all the finger ids touching the touch screen.
     */
    public static getTouches(): number[] {
        return [...this._keyMap].filter(k => k[0].startsWith('touch')).map(t => parseInt(t[0].replace('touch', '')));
    }
    /**
     * Gets the current position of a finger.
     * @param id The id of the touch event.
     * @returns The current position of a finger. Will return undefined if the id is not a touch event.
     */
    public static getTouchPosition(id: number): Vector2 {
        return this._touchPositions.get(id);
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
     * Flushes input and removes all key presses.
     */
    public static flush(): void {
        this._keyMap.clear();
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
        if(value) {
            this._keyMap.set(key, value);
            this.onAnyDown?.call(this);
        }
        else
            this._keyMap.delete(key);
    }

    private static mapControllerInput(data: number, value: boolean): void {
        // Xbox A Button
        if (data === 0)
            this.mapInput('gamepadA', value);
        // Xbox B Button
        else if (data === 1)
            this.mapInput('gamepadB', value);
        // Xbox X Button
        else if (data === 2)
            this.mapInput('gamepadX', value);
        // Xbox Y Button
        else if (data === 3)
            this.mapInput('gamepadY', value);
        // Xbox Left Bumper
        else if (data === 4)
            this.mapInput('gamepadLB', value);
        // Xbox Right Bumper
        else if (data === 5)
            this.mapInput('gamepadRB', value);
        // Xbox Select Button
        else if (data === 8)
            this.mapInput('gamepadSelect', value);
        // Xbox Start Button
        else if (data === 9)
            this.mapInput('gamepadStart', value);
        // Xbox Up Button
        else if(data === 12)
            this.mapInput('gamepadUP', value);
        // Xbox Down Button
        else if(data === 13)
            this.mapInput('gamepadDOWN', value);
        // Xbox Left Button
        else if(data === 14)
            this.mapInput('gamepadLEFT', value);
        // Xbox Right Button
        else if(data === 15)
            this.mapInput('gamepadRIGHT', value);
    }
}