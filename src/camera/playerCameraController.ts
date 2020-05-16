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

    constructor(player: Farmer) {
        this.#_player = player;

        this._initializeCamera();

        // Update loop.
        this.#_updateHandle = BabylonObserverStore.registerBeforeRender(() => {
            const positiondifference = this.#_softTarget.subtract(this.#_player.position);

            const distance = positiondifference.length();

            const direction = positiondifference.normalize().multiplyByFloats(-1,0,-1);

            if (distance > this.#_targetRadius) {
                const deltaTime = BabylonStore.engine.getDeltaTime() / 1000;

                this.#_softTarget.set(this.#_softTarget.x + (direction.x * this.#_targetRadius * deltaTime), 0, this.#_softTarget.z + (direction.z * this.#_targetRadius * deltaTime));
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
        material.alpha = 0;
        this.#_mesh.material = material;

        BabylonStore.camera.lockedTarget = this.#_softTarget;
    }
}
