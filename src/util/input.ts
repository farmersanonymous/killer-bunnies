import { ExecuteCodeAction, ActionManager, GenericPad, GamepadManager, StickValues, Xbox360Pad, DualShockPad } from "babylonjs";
import { BabylonStore } from "../store/babylonStore";

export class Input {
    public static onAnyDown: () => void;

    private static _isInit = false;
    private static _keyMap: Map<string, boolean> = new Map<string, boolean>();
    private static genericPad: GenericPad = null;

    private constructor() { /** Static class. */ }
    
    public static init(): void {
        if(this._isInit) {
            return;
        }
        BabylonStore.scene.actionManager = new ActionManager(BabylonStore.scene);
        BabylonStore.scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, (evt) => {
            this.mapInput(evt.sourceEvent.key, evt.sourceEvent.type === 'keydown');
        }));
        BabylonStore.scene.actionManager.registerAction(new ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, (evt) => {
            this.mapInput(evt.sourceEvent.key, evt.sourceEvent.type === 'keydown');
        }));
        BabylonStore.scene.onPointerDown = (evt): void => {
            this.mapInput('pointerDown', true && evt.pointerType === 'mouse' && evt.button === 0);
        };
        BabylonStore.scene.onPointerUp = (): void => {
            this.mapInput('pointerDown', false);
        };

        const gamepadManager = new GamepadManager();
        gamepadManager.onGamepadConnectedObservable.add((gamepad) => {
            this.genericPad = gamepad as GenericPad;
            if(this.genericPad instanceof Xbox360Pad || this.genericPad instanceof DualShockPad) {
                this.genericPad.onButtonDownObservable.add((evt) => {
                    console.log(evt);
                });
            }
        });
        gamepadManager.onGamepadDisconnectedObservable.add((gamepad) => {
            if(this.genericPad === gamepad) {
                this.genericPad = null;
            }
        });
        this._isInit = true;
    }

    public static isKeyDown(key: string): boolean {
        return this._keyMap.get(key);
    }
    public static get isControllerConnected(): boolean {
        return this.genericPad != null;
    }

    public static get controllerLeftStick(): StickValues {
        return this.genericPad.leftStick;
    }
    public static get controllerRightStick(): StickValues {
        return this.genericPad.rightStick;
    }
    public static get controllerRightTrigger(): number {
        if(this.genericPad instanceof Xbox360Pad || this.genericPad instanceof DualShockPad) {
            return this.genericPad.rightTrigger;
        }
        return 0;
    }
    public static get controllerLeftTrigger(): number {
        if(this.genericPad instanceof Xbox360Pad || this.genericPad instanceof DualShockPad) {
            return this.genericPad.leftTrigger;
        }
        return 0;
    }

    private static mapInput(key: string, value: boolean): void {
        console.log("map input");
        this._keyMap.set(key, value);
        this.onAnyDown?.call(this);
    }
}