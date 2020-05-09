import { ArcRotateCamera, MeshBuilder, Color3, PBRMaterial, Vector3 } from 'babylonjs';
import { BabylonStore } from '../store/babylonStore';
import { Farmer } from '../player/farmer';

/**
 * Handles camera movement logic
 */
export class PlayerCameraController {
    #_camera: ArcRotateCamera;
    #_player: Farmer;
    #_softTarget: Vector3;
    #_targetRadius = 5;

    constructor(player: Farmer) {
        this.#_player = player;

        this._initializeCamera();

        // Update loop.
        BabylonStore.scene.registerBeforeRender(() => {
            const positiondifference = this.#_softTarget.subtract(this.#_player.position);

            const distance = positiondifference.length();

            const direction = positiondifference.normalize().multiplyByFloats(-1,0,-1);

            if (distance > this.#_targetRadius) {
                const deltaTime = BabylonStore.engine.getDeltaTime() / 1000;

                this.#_softTarget.set(this.#_softTarget.x + (direction.x * this.#_targetRadius * deltaTime), 0, this.#_softTarget.z + (direction.z * this.#_targetRadius * deltaTime));
            }
        });
    }

    private _initializeCamera(): void {

        this.#_softTarget = new Vector3(this.#_player.position.x, this.#_player.position.y, this.#_player.position.z);

        const mesh = MeshBuilder.CreateCylinder('target', { height: 0.5, diameter: this.#_targetRadius * 2 });
        mesh.checkCollisions = false;
        mesh.position = this.#_softTarget;
        const material = new PBRMaterial('targetMaterial', BabylonStore.scene);
        material.emissiveColor = Color3.Green();
        material.alpha = 0.5;
        mesh.material = material;

        this.#_camera = BabylonStore.createCamera('mainCamera', 3.141592, 0.785398, 20, this.#_player.position, BabylonStore.scene, true);

        this.#_camera.lockedTarget = this.#_softTarget;
    }
}