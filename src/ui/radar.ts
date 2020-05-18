import { Camera, Viewport, Vector3, Mesh, MeshBuilder, AbstractMesh, StandardMaterial, TransformNode, Color3, FreeCamera } from 'babylonjs'
import { BabylonStore } from '../store/babylonStore'
import { BabylonObserverStore } from '../store/babylonObserverStore';

/**
 * 
 */
class Radar {
    #_radar: FreeCamera;

    /**
     * 
     */
    constructor() {
        console.log("Hello");
        this.#_radar = new FreeCamera("radar", new Vector3(0, 10, 0), BabylonStore.scene);

        this.#_radar.rotation.y = 1.55
        this.#_radar.mode = Camera.ORTHOGRAPHIC_CAMERA;

        this.#_radar.setTarget(new Vector3(0.1,0.1,0.1));

        const size = 10;

        this.#_radar.orthoTop =  size;
        this.#_radar.orthoLeft = -size;
        this.#_radar.orthoBottom = -size;
        this.#_radar.orthoRight = size;

        this.#_radar.viewport = new Viewport(0.75, 0, 0.195, 0.18);

        BabylonStore.scene.activeCameras.push(BabylonStore.camera);

		this.#_radar.layerMask = 0x10000000
        BabylonStore.scene.activeCameras.push(this.#_radar);
    }

    /**
     * 
     */
    public set target(position: Vector3) {
        this.#_radar.setTarget(position);
    }

    /**
     * 
     * @param target 
     */
    public setTarget(target: AbstractMesh): void {
        this.#_radar.lockedTarget = target;
    }

    /**
     * 
     */
    public dispose(): void {
        this.#_radar.dispose();
    }
}

/**
 * 
 */
export enum BlipType {
    Player = 0,
    Enemy = 1
}

/**
 * 
 */
export class RadarManager {
    /**
     * 
     */
    #_radar: Radar = null;

    /**
     * 
     */
    #_enemyMaterial: StandardMaterial = null;

    /**
     * 
     */
    #_playerMaterial: StandardMaterial = null;

    /**
     * 
     */
    private static _instance: RadarManager = null;

    /**
     * 
     */
    #_blips: Map<TransformNode, Mesh> = new Map<TransformNode, Mesh>();
    
    /**
     * 
     */
    private constructor() {
        this.#_radar = new Radar();
        RadarManager._instance = this;
    }

    /**
     * 
     */
    private get enemyMaterial(): StandardMaterial {
        if (this.#_enemyMaterial == null) {
            this.#_enemyMaterial = new StandardMaterial('EnemyBlip', BabylonStore.scene);
            (this.#_enemyMaterial as StandardMaterial).diffuseColor = Color3.Red();
        }
        return this.#_enemyMaterial;
    }

    /**
     * 
     */
    private get playerMaterial(): StandardMaterial {
        if (this.#_playerMaterial == null) {
            this.#_playerMaterial = new StandardMaterial('PlayerBlip', BabylonStore.scene);
            (this.#_playerMaterial as StandardMaterial).diffuseColor = Color3.Green();
        }
        return this.#_playerMaterial;
    }

    /**
     * 
     * @param root 
     */
    public static CreateBlip(root: Mesh, blipType: BlipType): void {
        const blip = MeshBuilder.CreateSphere('Blip', {diameter: 2, segments: 32}, BabylonStore.scene);
        blip.layerMask = 0x10000000;

        switch (blipType) {
            case BlipType.Player:
                blip.material = this.getInstance().playerMaterial;
                break;
            case BlipType.Enemy:
                blip.material = this.getInstance().enemyMaterial;
                break;
        }
        
        BabylonObserverStore.registerBeforeRender(() => {
            blip.position = root.position
        });

        this.getInstance().#_blips.set(root, blip);
    }
    
    /**
     * 
     * @param root 
     */
    public static RemoveBlip(root: TransformNode): void {
        this.getInstance().#_blips.delete(root);
    }

    /**
     * 
     * @param target 
     */
    public static SetTarget(target: AbstractMesh): void {
        this.getInstance().#_radar.setTarget(target);
    }

    /**
     * Release all resources associated with this Game.
     */
    /*
     public dispose(): void {
        RadarManager._radar.dispose();
        //blips.forEach(b => b.dispose());
    }
    */

    /**
     * 
     */
    private static getInstance(): RadarManager {
        if(!this._instance) {
            this._instance = new RadarManager();
        }

        return this._instance;
    }
}