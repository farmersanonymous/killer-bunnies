import { RecastJSPlugin, Mesh, Vector3, ICrowd, TransformNode } from 'babylonjs';
import { BabylonStore } from '../store/babylonStore';

/**
 * A Navigation utility class that will handle generating and interacting with the NavMesh. It will also handle AI agents moving around the map.
 */
export class Navigation {
    private static _plugin: RecastJSPlugin;
    private static _crowd: ICrowd;

    private constructor() { /* Static class */ }

    /**
     * Initializes the NavMesh.
     * @param meshes The meshes that will be used to generate the NavMesh.
     */
    public static init(meshes: Mesh[]): void {
        this._plugin = new RecastJSPlugin();

        this._plugin.createNavMesh(meshes, {
            cs: 0.2,
            ch: 0.1,
            walkableSlopeAngle: 90,
            walkableHeight: 1,
            walkableClimb: 1,
            walkableRadius: 1,
            maxEdgeLen: 12.,
            maxSimplificationError: 1.3,
            minRegionArea: 8,
            mergeRegionArea: 20,
            maxVertsPerPoly: 6,
            detailSampleDist: 6,
            detailSampleMaxError: 1,
        });

        this._crowd = this._plugin.createCrowd(200, 1, BabylonStore.scene);

    }

    /**
     * Gets the closest point from the position that exists on the NavMesh.
     * @param position The original position that is being looked for.
     * @returns The position on the NavMesh that is closest to the passed in position.
     */
    public static getClosestPoint(position: Vector3): Vector3 {
        return this._plugin.getClosestPoint(position)
    }
    /**
     * Adds an agent to the NavMesh. Will be able to move around the map in a Crowd AI way.
     * @param pos The position to spawn the agent at.
     * @param transform The transform that will be used to move the agent around the map.
     * @returns The agent identifier.
     */
    public static addAgent(pos: Vector3, transform: TransformNode): number {
        return this._crowd.addAgent(this._plugin.getClosestPoint(pos), {
            radius: 0.1,
            height: 0.2,
            maxAcceleration: 4.0,
            maxSpeed: 4,
            collisionQueryRange: 1,
            pathOptimizationRange: 0.0,
            separationWeight: 1.0
        }, transform);
    }
    /**
     * Removes the agent from the NavMesh.
     * @param agent The agent identifier to remove.
     */
    public static removeAgent(agent: number): void {
        this._crowd.removeAgent(agent);
    }
    /**
     * Tells the agent to travel to a location within the NavMesh.
     * @param agent The agent identifier.
     * @param pos The position to travel to. Will be clamped to a position within the NavMesh.
     */
    public static agentGoTo(agent: number, pos: Vector3): void {
        this._crowd.agentGoto(agent, this._plugin.getClosestPoint(pos));
    }
}