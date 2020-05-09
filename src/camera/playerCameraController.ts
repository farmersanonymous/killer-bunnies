import { ArcRotateCamera } from 'babylonjs';
import { BabylonStore } from '../store/babylonStore';
import { Farmer } from '../player/farmer';

/**
 * Handles camera movement logic
 */
export class PlayerCameraController {
    #_camera: ArcRotateCamera;
    #_player: Farmer;

    constructor(player: Farmer) {
        this.#_player = player;

        this.initializeCamera();
    }

    private initializeCamera(): void {
        this.#_camera = BabylonStore.createCamera('mainCamera', 3.141592, 0.785398, 20, this.#_player.position, BabylonStore.scene, true);

        this.#_camera.lockedTarget = this.#_player.position;
        this.#_camera.speed = 0.5;
    }
}