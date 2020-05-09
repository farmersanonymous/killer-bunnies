import { Mesh, Vector2, Vector3, Angle } from 'babylonjs';
import { CharacterController } from './characterController';
import { BabylonStore } from '../store/babylonStore';
import { Bullet } from './bullet';
import { CollisionGroup } from '../util/collisionGroup';
import { Spawner } from '../util/spawner';

/**
 * The playable Farmer character.
 */
export class Farmer {
    #_controller: CharacterController;
    #_mesh: Mesh;
    // Waiting for final gun mesh.
    // #_gun: Mesh;
    #_gunCooldown = false;

    /**
     * Constructor.
     */
    public constructor() {
        // The mesh is a player and can collide with the environment.
        const spawner = Spawner.getSpawner('Farmer');
        const instance = spawner.instantiate();
        this.#_mesh = instance.rootNodes[0].getChildMeshes(false)[0] as Mesh;
        this.#_mesh.checkCollisions = true;
        this.#_mesh.collisionGroup = CollisionGroup.Player;
        this.#_mesh.collisionMask = CollisionGroup.Environment;
        this.#_mesh.ellipsoid = new Vector3(1, 2, 1);

        // Initialize the character controller and subscribe to the onMove and onRotate methods.
        this.#_controller = new CharacterController(this);
        this.#_controller.onMove = (dir): void => {
            const deltaTime = BabylonStore.engine.getDeltaTime() / 1000;
            this.#_mesh.moveWithCollisions(new Vector3(-dir.x, 0, dir.y).scale(5 * deltaTime));
        };
        this.#_controller.onRotate = (dir): void => {
            // Rotation is off for some reason, don't really feal like looking into it, so subtracting 90 degrees in radians to offset.
            this.#_mesh.rotation = new Vector3(Angle.FromDegrees(90).radians(), -Angle.BetweenTwoPoints(Vector2.Zero(), dir).radians() + Angle.FromDegrees(90).radians(), 0);
        }
    }

    /**
     * Fires a bullet in the direction that the Farmer is facing. Will not fire if gun is on cooldown.
     */
    public fire(): void {
        if(this.#_gunCooldown) {
            return;
        }

        new Bullet(this.position.add(this.#_mesh.forward.scale(1.5)), 30, this.#_mesh.up, 5);
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