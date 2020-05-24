import { Vector2, Vector3, Matrix, VirtualJoystick } from 'babylonjs';
import { BabylonStore } from '../store/babylonStore';
import { Farmer } from './farmer';
import { Input } from '../input/input';
import { BabylonObserverStore } from '../store/babylonObserverStore';

/**
 * Handles input for the player character.
 */
export class CharacterController {
    #_updateHandle: number;
    #_disabled = false;

    /**
     * Constructor.
     * @param player The player character that needs to be controlled. 
     */
    constructor(player: Farmer) {
        let leftJoystick: VirtualJoystick;
        let rightJoystick: VirtualJoystick;
        if (/Mobi/.test(navigator.userAgent)) {
            leftJoystick = new VirtualJoystick(true);
            rightJoystick = new VirtualJoystick(false)
        }

        let hasMoved = false;
        let hasFired = false;
        let hasFiredController = false;
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
                this.onFire?.call(this);
                hasFired = true;
            }
            else if (hasFired) {
                this.onFireEnd?.call(this);
                hasFired = false;
            }

            if (leftJoystick && leftJoystick.pressed) {
                if (leftJoystick.deltaPosition.x > 0.1 || leftJoystick.deltaPosition.x < 0.1) {
                    x = leftJoystick.deltaPosition.x;
                }
                if (leftJoystick.deltaPosition.y > 0.1 || leftJoystick.deltaPosition.y < 0.1) {
                    y = leftJoystick.deltaPosition.y;
                }
            }

            if (rightJoystick && rightJoystick.pressed) {
                if (rightJoystick.deltaPosition.x > 0.5 || rightJoystick.deltaPosition.x < 0.5 ||
                    rightJoystick.deltaPosition.y > 0.5 || rightJoystick.deltaPosition.y < 0.5) {
                    this.onRotate?.call(this, new Vector2(-rightJoystick.deltaPosition.x, rightJoystick.deltaPosition.y));
                    this.onFire?.call(this);
                    hasFiredController = true;
                }
                else if(hasFiredController) {
                    this.onFireEnd?.call(this);
                    hasFiredController = false;
                }
            }
            else if(hasFiredController) {
                this.onFireEnd?.call(this);
                hasFiredController = false;
            }

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
                    this.onFire?.call(this);
                    hasFiredController = true;
                }
                else if (hasFiredController) {
                    this.onFireEnd?.call(this);
                    hasFiredController = false;
                }

                // 0.5 is used to handle any quick twitches that happen when doing fast rotations, might need to tweak still.
                if (Input.controllerRightStick.x > 0.5 || Input.controllerRightStick.x < -0.5 ||
                    Input.controllerRightStick.y > 0.5 || Input.controllerRightStick.y < -0.5) {
                    this.onRotate?.call(this, new Vector2(-Input.controllerRightStick.x, -Input.controllerRightStick.y));
                }
            } else {
                // Handle rotation around the mouse position.
                const projectedFarmerPosition = Vector3.Project(player.position, Matrix.Identity(), BabylonStore.camera.getTransformationMatrix(), BabylonStore.camera.viewport);
                projectedFarmerPosition.x *= BabylonStore.engine.getRenderWidth();
                projectedFarmerPosition.y *= BabylonStore.engine.getRenderHeight();
    
                const dir = new Vector2(projectedFarmerPosition.x - BabylonStore.scene.pointerX, projectedFarmerPosition.y - BabylonStore.scene.pointerY);
                this.onRotate?.call(this, dir.normalize());
            }

            if (x != 0 || y != 0) {
                this.onMove?.call(this, new Vector2(x, y));
                hasMoved = true;
            }
            else if (hasMoved) {
                this.onMoveEnd?.call(this);
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