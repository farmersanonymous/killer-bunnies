import { MeshBuilder, Color3, PBRMaterial, Vector3, Mesh } from 'babylonjs';
import { BabylonStore } from '../store/babylonStore';
import { Farmer } from '../player/farmer';
import { BabylonObserverStore } from '../store/babylonObserverStore';

/**
 * Handles camera movement logic
 */
export class PlayerCameraController {
    #_player: Farmer;
    #_softTarget: Vector3;
    #_targetRadius = 5;
    #_mesh: Mesh;
    #_updateHandle: number;
    #_velocity: number;

    constructor(player: Farmer) {
        this.#_player = player;

        this.#_velocity = 0;

        this._initializeCamera();

        // Update loop.
        this.#_updateHandle = BabylonObserverStore.registerBeforeRender(() => {
            const positiondifference = this.#_softTarget.subtract(this.#_player.position);

            const distance = positiondifference.length();

            const acceleration = 0.05;

            const maxVelocity = 1;

            if (distance > this.#_targetRadius) {

                this.#_velocity += acceleration;

                if (this.#_velocity >= maxVelocity) {
                    this.#_velocity = maxVelocity;
                }

            } else {
                this.#_velocity -= acceleration;

                if (this.#_velocity <= 0) {
                    this.#_velocity = 0;
                }
            }

            if (this.#_velocity > 0) {

                const deltaTime = BabylonStore.engine.getDeltaTime() / 1000;

                const pos = Vector3.Lerp(this.#_softTarget, this.#_player.position, this.#_velocity * deltaTime);

                this.#_softTarget.set(pos.x, 0, pos.z);
            }
        });
    }

    /**
     * Release all resources associated with this PlayerCameraController.
     */
    public dispose(): void {
        BabylonObserverStore.deregisterBeforeRender(this.#_updateHandle);
        this.#_mesh.material.dispose();
        this.#_mesh.dispose();
    }

    private _initializeCamera(): void {

        this.#_softTarget = new Vector3(this.#_player.position.x, this.#_player.position.y, this.#_player.position.z);

        this.#_mesh = MeshBuilder.CreateCylinder('target', { height: 0.5, diameter: this.#_targetRadius * 2 });
        this.#_mesh.checkCollisions = false;
        this.#_mesh.position = this.#_softTarget;
        const material = new PBRMaterial('targetMaterial', BabylonStore.scene);
        material.emissiveColor = Color3.Green();
        material.alpha = 0.5;
        this.#_mesh.material = material;
        //this.#_mesh.isVisible = false;

        BabylonStore.camera.lockedTarget = this.#_softTarget;
    }
}
