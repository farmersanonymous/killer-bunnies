import { MeshBuilder, Mesh, Vector2, Vector3, Color3, PBRMaterial, Angle, Space } from 'babylonjs';
import { CharacterController } from './characterController';
import { BabylonStore } from '../store/babylonStore';
import { Bullet } from './bullet';

/**
 * The playable Farmer character.
 */
export class Farmer {
    #_controller: CharacterController;
    #_mesh: Mesh;
    #_gun: Mesh;
    #_gunCooldown = false;

    /**
     * Constructor.
     */
    constructor() {
        // Proxy meshes. Probably even pre-proxy, I mean...they're primitives...
        this.#_mesh = MeshBuilder.CreateCylinder('Farmer', { });
        this.#_gun = MeshBuilder.CreateCylinder('Gun', { diameter: 0.25, height: 1 });
        this.#_gun.translate(Vector3.Forward(), 1);
        this.#_gun.addRotation(Angle.FromDegrees(90).radians(), 0, 0);
        this.#_gun.parent = this.#_mesh;

        // Setup the material for the farmer.
        const farmerMaterial = new PBRMaterial('farmerMaterial', BabylonStore.scene);
        farmerMaterial.emissiveColor = Color3.Blue();
        this.#_mesh.material = farmerMaterial;

        // Setup the material for the farmer's gun.
        const farmerGunMaterial = new PBRMaterial('farmerGunMaterial', BabylonStore.scene);
        farmerGunMaterial.emissiveColor = Color3.Purple();
        this.#_gun.material = farmerGunMaterial;

        // Initialize the character controller and subscribe to the onMove and onRotate methods.
        this.#_controller = new CharacterController(this);
        this.#_controller.onMove = (dir): void => {
            const deltaTime = BabylonStore.engine.getDeltaTime() / 1000;
            this.#_mesh.translate(new Vector3(dir.x * deltaTime * 5, 0, dir.y * deltaTime * 5), 1, Space.WORLD);
        };
        this.#_controller.onRotate = (dir): void => {
            // Rotation is off for some reason, don't really feal like looking into it, so subtracting 90 degrees in radians to offset.
            this.#_mesh.rotation = new Vector3(0, Angle.BetweenTwoPoints(Vector2.Zero(), dir).radians() - 1.5708, 0);
        }
    }

    /**
     * Fires a bullet in the direction that the Farmer is facing. Will not fire if gun is on cooldown.
     */
    public fire(): void {
        if(this.#_gunCooldown) {
            return;
        }

        new Bullet(this.position.add(this.#_mesh.forward.scale(1.5)), 20, this.#_mesh.forward, 5);
        this.#_gunCooldown = true;
        window.setTimeout(() => {
            this.#_gunCooldown = false;
        }, 250);
    }

    /**
     * The position of the Farmer.
     * @returns The position of the Farmer.
     */
    public get position(): Vector3 {
        return this.#_mesh.position;
    }
}