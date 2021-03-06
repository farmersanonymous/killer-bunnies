import { Vector2, Vector3, Matrix } from 'babylonjs';
import { BabylonStore } from '../store/babylonStore';
import { Farmer } from './farmer';
import { Input } from '../input/input';
import { BabylonObserverStore } from '../store/babylonObserverStore';
import { GUIManager } from '../ui/guiManager';

/**
 * Handles input for the player character.
 */
export class CharacterController {
    #_updateHandle: number;
    #_disabled = false;
    #_useMouse = false;

    /**
     * Constructor.
     * @param player The player character that needs to be controlled. 
     */
    constructor(player: Farmer) {
        let hasMoved = false;
        let hasFired = false;
        let hasFiredController = false;

        // Virtual controllers.
        let virtualControllerMove: Vector2 = undefined;
        let virtualControllerRotate: Vector2 = undefined;
        GUIManager.onLeftStickMove = (dir): void => {
            virtualControllerMove = dir;
            if(dir === undefined) {
                this.onMoveEnd?.();
            }
        }

        GUIManager.onRightStickMove = (dir): void => {
            virtualControllerRotate = dir;
            if(dir === undefined) {
                this.onFireEnd?.();
            }
        }

        this.#_updateHandle = BabylonObserverStore.registerAfterRender(() => {
            if (this.#_disabled) {
                return;
            }

            let x = 0;
            let y = 0;
            if (Input.isKeyDown('w') || Input.isKeyDown('W')) {
                y += 1;
            }
            if (Input.isKeyDown('a') || Input.isKeyDown('A')) {
                x -= 1;
            }
            if (Input.isKeyDown('s') || Input.isKeyDown('S')) {
                y -= 1;
            }
            if (Input.isKeyDown('d') || Input.isKeyDown('D')) {
                x += 1;
            }
            if (Input.isKeyDown('pointerDown')) {
                // Spawn bullet.
                this.onFire?.();
                hasFired = true;
            }
            else if (hasFired) {
                this.onFireEnd?.();
                hasFired = false;
            }

            // Enables the useMouse flag to override joystick movement if the mouse has been interacted with.
            BabylonStore.scene.onPointerObservable.add(() => {
                if (this.#_disabled) {
                    return;
                }
                this.#_useMouse = true;
            });

            // If a game pad exists, handle input.
            if (Input.isControllerConnected) {
                // 0.1 is used to provide an epsilon, as the stick is never truly at 0 and causes some jitterness.
                if (Input.controllerLeftStick.x > 0.1 || Input.controllerLeftStick.x < -0.1) {
                    x = Input.controllerLeftStick.x
                }
                if (Input.controllerLeftStick.y > 0.1 || Input.controllerLeftStick.y < -0.1) {
                    y = -Input.controllerLeftStick.y;
                }

                if (Input.controllerRightTrigger > 0.5) {
                    this.onFire?.();
                    hasFiredController = true;
                }
                else if (hasFiredController) {
                    this.onFireEnd?.();
                    hasFiredController = false;
                }

                // 0.5 is used to handle any quick twitches that happen when doing fast rotations, might need to tweak still.
                if (Input.controllerRightStick.x > 0.5 || Input.controllerRightStick.x < -0.5 ||
                    Input.controllerRightStick.y > 0.5 || Input.controllerRightStick.y < -0.5) {
                    this.onRotate?.(new Vector2(-Input.controllerRightStick.x, -Input.controllerRightStick.y));
                    this.#_useMouse = false;
                }
            }

            if (this.#_useMouse) {
                // Handle rotation around the mouse position.
                const projectedFarmerPosition = Vector3.Project(player.position, Matrix.Identity(), BabylonStore.camera.getTransformationMatrix(), BabylonStore.camera.viewport);
                projectedFarmerPosition.x *= BabylonStore.engine.getRenderWidth();
                projectedFarmerPosition.y *= BabylonStore.engine.getRenderHeight();

                const dir = new Vector2(projectedFarmerPosition.x - BabylonStore.scene.pointerX, projectedFarmerPosition.y - BabylonStore.scene.pointerY);
                this.onRotate?.(dir.normalize());
            }

            if(virtualControllerMove) {
                x = virtualControllerMove.x;
                y = virtualControllerMove.y;
            }

            if(virtualControllerRotate) {
                this.onRotate?.(virtualControllerRotate);
                this.onFire?.();
            }

            if (x != 0 || y != 0) {
                this.onMove?.(new Vector2(x, y));
                hasMoved = true;
            }
            else if (hasMoved) {
                this.onMoveEnd?.();
                hasMoved = false;
            }
        });
    }

    /**
     * Disables the input of the controller.
     */
    public get disabled(): boolean {
        return this.#_disabled;
    }
    public set disabled(value: boolean) {
        this.#_disabled = value;
    }

    /**
     * Releases all resources associated with this CharacterController.
     */
    public dispose(): void {
        this.onMove = null;
        this.onMoveEnd = null;
        this.onRotate = null;
        this.onFire = null;
        this.onFireEnd = null;

        BabylonObserverStore.deregisterAfterRender(this.#_updateHandle);
    }

    /**
     * Returns true if the mouse should be used. If it is false, then a controller is being used.
     * @returns True if a mouse is being used, false if a controller is being used.
     */
    public get useMouse(): boolean {
        return this.#_useMouse;
    }

    /**
     * Event that will get fired whenever the controller is notified to move, based on the platform and device.
     */
    public onMove: (dir: Vector2) => void;
    /**
     * Event that will get fired the frame after the controller stops moving.
     */
    public onMoveEnd: () => void;
    /**
     * Event that will get fired whenever the controller is notified to rotate, based on the platform and device.
     */
    public onRotate: (dir: Vector2) => void;
    /**
     * Event that will get fired when the farmer needs to fire his weapon.
     */
    public onFire: () => void;
    /**
     * Event that will get fired when the farmer needs to stop firing his weapon.
     */
    public onFireEnd: () => void;
}