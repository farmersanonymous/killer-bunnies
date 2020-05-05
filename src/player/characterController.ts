import { ExecuteCodeAction, ActionManager, Vector2, Vector3, Matrix, GamepadManager, GenericPad } from 'babylonjs';
import { BabylonStore } from '../store/babylonStore';
import { Farmer } from './farmer';

/**
 * Handles input for the player character.
 */
export class CharacterController {
    /**
     * Constructor.
     * @param player The player character that needs to be controlled. 
     */
    constructor(player: Farmer) {
        // Registers keyboard presses.
        const keyMap: Map<string, boolean> = new Map<string, boolean>();
        BabylonStore.scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, (evt) => {
            keyMap.set(evt.sourceEvent.key, evt.sourceEvent.type === 'keydown');
        }));
        BabylonStore.scene.actionManager.registerAction(new ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, (evt) => {
            keyMap.set(evt.sourceEvent.key, evt.sourceEvent.type === 'keydown');
        }));

        // Callback whenever the pointer has been moved. TODO: Figure out a better way to handle this. 
        // The player can move without moving the mouse, which won't update the rotation of the player.
        BabylonStore.scene.onPointerMove = (evt): void => {
            const projectedFarmerPosition = Vector3.Project(player.position, Matrix.Identity(), BabylonStore.scene.getTransformMatrix(), BabylonStore.camera.viewport);
            projectedFarmerPosition.x *= BabylonStore.engine.getRenderWidth();
            projectedFarmerPosition.y *= BabylonStore.engine.getRenderHeight();

            const dir = new Vector2(projectedFarmerPosition.x - evt.clientX, projectedFarmerPosition.y - evt.clientY);
            this.onRotate?.call(this, dir.normalize());
        }

        // Checks if a game pad is connected.
        const gamepadManager = new GamepadManager();
        let genericPad: GenericPad;
        gamepadManager.onGamepadConnectedObservable.add((gamepad) => {
            genericPad = gamepad as GenericPad;
        });

        BabylonStore.scene.registerAfterRender(() => {
            let x = 0;
            let y = 0;
            if (keyMap.get('w') || keyMap.get('W')) {
                y += 1;
            }
            if (keyMap.get('a') || keyMap.get('A')) {
                x -= 1;
            }
            if (keyMap.get('s') || keyMap.get('S')) {
                y -= 1;
            }
            if (keyMap.get('d') || keyMap.get('D')) {
                x += 1;
            }

            // If a game pad exists, handle input.
            if (genericPad) {
                // 0.1 is used to provide an epsilon, as the stick is never truly at 0 and causes some jitterness.
                if (genericPad.leftStick.x > 0.1 || genericPad.leftStick.x < -0.1) {
                    x = genericPad.leftStick.x
                }
                if (genericPad.leftStick.y > 0.1 || genericPad.leftStick.y < -0.1) {
                    y = -genericPad.leftStick.y;
                }

                // 0.5 is used to handle any quick twitches that happen when doing fast rotations, might need to tweak still.
                if (genericPad.rightStick.x > 0.5 || genericPad.rightStick.x < -0.5 ||
                    genericPad.rightStick.y > 0.5 || genericPad.rightStick.y < -0.5) {
                    this.onRotate?.call(this, new Vector2(-genericPad.rightStick.x, -genericPad.rightStick.y));
                }
            }

            if (x != 0 || y != 0) {
                this.onMove?.call(this, new Vector2(x, y));
            }
        });
    }

    public onMove: (dir: Vector2) => void;
    public onRotate: (dir: Vector2) => void;
}