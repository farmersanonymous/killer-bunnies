import { AbstractMesh } from "babylonjs";
import { CollisionManager, CollisionGroup } from "./collisionManager";

/**
 * Abstract class that can handles registering meshes to the collision manager.
 */
export abstract class BaseCollidable {
    #_group: CollisionGroup;
    #_meshes: Map<string, AbstractMesh> = new Map<string, AbstractMesh>();

    /**
     * Constructor.
     * @param group The collision group that this collidable belongs to.
     */
    constructor(group: CollisionGroup) {
        this.#_group = group;
        CollisionManager.register(this.#_group, this);
    }

    /**
     * Registers a mesh to the collidable.
     * @param mesh The mesh to register.
     * @param name The name to use to identify the mesh. Defaults to 'default'.
     */
    public registerMesh(mesh: AbstractMesh, name = 'default'): void {
        this.#_meshes.set(name, mesh);
    }
    /**
     * Gets a mesh that belongs to the collidable.
     * @param name The name to use to identify the mesh. Defaults to 'default'.
     * @returns An AbstractMesh.
     */
    public getMesh(name = 'default'): AbstractMesh {
        return this.#_meshes.get(name);
    }
    /**
     * Gets all the meshes that belong to the collidable.
     * @returns A list of AbstraceMeshes.
     */
    public getMeshes(): AbstractMesh[] {
        return [...this.#_meshes.values()];
    }
    /**
     * Releases all resources associated with the BaseCollidable.
     */
    public dispose(): void {
        CollisionManager.deregister(this.#_group, this);
    }

    /**
     * Callback that will get fired when things collide.
     * @param collidable The collidable that collided with this collidable.
     */
    public onCollide(collidable: BaseCollidable): void {
        /** Override to get callbacks on collision. */
        collidable;
    }
}