import { Vector2, Vector3, Matrix } from 'babylonjs';
import { BabylonStore } from '../store/babylonStore';
import { Farmer } from './farmer';
import { Input } from '../util/input';

/**
 * Handles input for the player character.
 */
export class CharacterController {
    /**
     * Constructor.
     * @param player The player character that needs to be controlled. 
     */
    constructor(player: Farmer) {
        // Callback whenever the pointer has been moved. TODO: Figure out a better way to handle this. 
        // The player can move without moving the mouse, which won't update the rotation of the player.
        BabylonStore.scene.onPointerMove = (evt): void => {
            const projectedFarmerPosition = Vector3.Project(player.position, Matrix.Identity(), BabylonStore.scene.getTransformMatrix(), BabylonStore.camera.viewport);
            projectedFarmerPosition.x *= BabylonStore.engine.getRenderWidth();
            projectedFarmerPosition.y *= BabylonStore.engine.getRenderHeight();

            const dir = new Vector2(projectedFarmerPosition.x - evt.clientX, projectedFarmerPosition.y - evt.clientY);
            this.onRotate?.call(this, dir.normalize());
        }

        BabylonStore.scene.registerAfterRender(() => {
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
                player.fire();
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
                    player.fire();
                }

                // 0.5 is used to handle any quick twitches that happen when doing fast rotations, might need to tweak still.
                if (Input.controllerRightStick.x > 0.5 || Input.controllerRightStick.x < -0.5 ||
                    Input.controllerRightStick.y > 0.5 || Input.controllerRightStick.y < -0.5) {
                    this.onRotate?.call(this, new Vector2(-Input.controllerRightStick.x, -Input.controllerRightStick.y));
                }
            }

            if (x != 0 || y != 0) {
                this.onMove?.call(this, new Vector2(x, y));
            }
        });
    }

    /**
     * Event that will get fired whenever the controller is notified to move, based on the platform and device.
     */
    public onMove: (dir: Vector2) => void;
    /**
     * Event that will get fired whenever the controller is notified to rotate, based on the platform and device.
     */
    public onRotate: (dir: Vector2) => void;
}