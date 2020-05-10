import { Vector3, MeshBuilder, Mesh, PBRMaterial, Color3, Scalar } from "babylonjs";
import { CollisionGroup } from '../util/collisionGroup';
import { BabylonStore } from "../store/babylonStore";
import { Bullet } from "../player/bullet";

export class Burrow {
    #_mesh: Mesh;
    #_intervalHandle: NodeJS.Timeout;

    /**
     * Constructor.
     * @param position The position that the Burrow will be spawned at.
     * @param spawnFrequency The frequency at which enemies will spawn in the Burrow.
     * @param timeLimit The time in seconds before the Burrow will dispose itself and disappear.
     */
    constructor(position: Vector3, spawnFrequency: number, timeLimit: number) {
        // The mesh is a burrow and can collide with the player, enemy, or bullet. Will be hidden from the scene.
        this.#_mesh = MeshBuilder.CreateBox(name, { size: 2 });
        this.#_mesh.position = position;
        this.#_mesh.checkCollisions = true;
        this.#_mesh.collisionGroup = CollisionGroup.Player; // Temp until enemies spawn instead of bullets.
        this.#_mesh.collisionMask = CollisionGroup.Player | CollisionGroup.Enemy | CollisionGroup.Bullet;

        const burrowMaterial = new PBRMaterial('burrowMaterial', BabylonStore.scene);
        burrowMaterial.albedoColor = Color3.Gray();
        this.#_mesh.material = burrowMaterial;

        // Spawn enemies at a certain interval depending on the spawnFrequency.
        this.#_intervalHandle = setInterval(() => {
            // Spawning bullets in a random direction right now, as we don't have enemies.
            new Bullet(position.clone(), 20, new Vector3(Scalar.RandomRange(-1, 1), 0, Scalar.RandomRange(-1, 1)), 10);
        }, spawnFrequency * 1000);
        
        // Destroy the Burrow after a certain amount of time has passed.
        const timeout = setTimeout(() => {
            clearTimeout(timeout);
            this.dispose();
        }, timeLimit * 1000);
    }

    /**
     * Release all resources associated with the Burrow.
     */
    public dispose(): void {
        clearInterval(this.#_intervalHandle);
        this.#_mesh.material.dispose();
        this.#_mesh.dispose();
    }
}