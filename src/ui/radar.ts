import { Camera, Viewport, Mesh, MeshBuilder, StandardMaterial, TransformNode, Color3, Angle, ArcRotateCamera, Vector3 } from 'babylonjs'
import { BabylonStore } from '../store/babylonStore'

/**
 * Camera and Mesh used to display radar.
 */
class Radar {
    #_background: Mesh;
    #_radar: ArcRotateCamera;

    /**
     * Default Constructor.
     */
    constructor() {
        this.#_radar = new ArcRotateCamera("radar", Angle.FromDegrees(180).radians(), Angle.FromDegrees(0).radians(), 50, undefined, BabylonStore.scene);
        this.#_radar.mode = Camera.ORTHOGRAPHIC_CAMERA;

        const garden = BabylonStore.scene.getNodeByName('Ground') as Mesh;
        const size = garden.getBoundingInfo().boundingBox.extendSize;

        this.#_radar.orthoTop =  size.z/2;
        this.#_radar.orthoLeft = -(size.x+20)/2;
        this.#_radar.orthoBottom = -size.z/2;
        this.#_radar.orthoRight = (size.x+20)/2;

        this.#_radar.viewport = new Viewport(0.78, 0.78, 0.195, 0.21);

        this.#_radar.layerMask = 0x10000000;
        BabylonStore.scene.activeCameras.push(this.#_radar);

        const backgroundMaterial: StandardMaterial = new StandardMaterial('backgroundMat', BabylonStore.scene);
        backgroundMaterial.alpha = 0.1;
        backgroundMaterial.disableLighting = true
        backgroundMaterial.diffuseColor = Color3.Gray();

        this.#_background = Mesh.CreateGround("background", size.x, size.z+20, 2, BabylonStore.scene);
        this.#_background.material = backgroundMaterial;
        this.#_background.layerMask = 0x10000000;
    }

    /**
     * Release all resources associated with this class.
     */
    public dispose(): void {
        this.#_radar.dispose();
        this.#_background.dispose();
    }
}

/**
 * Types of radar blips that can be created.
 */
export enum BlipType {
    Player = 0,
    Stabber = 1
}

/**
 * Manager class for the in-game radar.
 */
export class RadarManager {
    #_radar: Radar = null;
    #_enemyMaterial: StandardMaterial = null;
    #_playerMaterial: StandardMaterial = null;
    #_blips: Map<TransformNode, Mesh> = new Map<TransformNode, Mesh>();
    
    private static _instance: RadarManager = null;

    /**
     * Default Constructor.
     */
    private constructor() {
        this.#_radar = new Radar();
        RadarManager._instance = this;
    }

    /**
     * Material used for enemy radar blips.
     */
    private get enemyMaterial(): StandardMaterial {
        if (this.#_enemyMaterial == null) {
            this.#_enemyMaterial = new StandardMaterial('EnemyBlip', BabylonStore.scene);
            this.#_enemyMaterial.disableLighting = true;
            this.#_enemyMaterial.emissiveColor = Color3.Red();
        }
        return this.#_enemyMaterial;
    }

    /**
     * Material used for the player radar blip.
     */
    private get playerMaterial(): StandardMaterial {
        if (this.#_playerMaterial == null) {
            this.#_playerMaterial = new StandardMaterial('PlayerBlip', BabylonStore.scene);
            this.#_playerMaterial.disableLighting = true;
            this.#_playerMaterial.emissiveColor = Color3.Yellow();
        }
        return this.#_playerMaterial;
    }
    
    /**
     * Creates a radar blip.
     * @param root The root TransformNode to associate with the new radar blip.
     * @param blipType The type of radar blip to create.
     */
    public static createBlip(root: TransformNode, blipType: BlipType): void {
        const blip = MeshBuilder.CreateDisc('Blip', { radius: 1.25, sideOrientation: Mesh.DOUBLESIDE }, BabylonStore.scene);
        blip.rotation.x = Angle.FromDegrees(90).radians()
        blip.layerMask = 0x10000000;

        switch (blipType) {
            case BlipType.Player:
                blip.material = this.getInstance().playerMaterial;
                break;
            case BlipType.Stabber:
                blip.scaling = new Vector3(blip.scaling.x/2, blip.scaling.y/2, blip.scaling.z/2);
                blip.material = this.getInstance().enemyMaterial;
                break;
        }

        this.getInstance().#_blips.set(root, blip);
    }

    /**
     * Removes an instance of a blip.
     * @param root The root TransformNode associated with a blip.
     */
    public static removeBlip(root: TransformNode): void {
        if(this.getInstance().#_blips.has(root)) {
            this.getInstance().#_blips.get(root).dispose();
            this.getInstance().#_blips.delete(root);
        }
    }

    /**
     * Update function for radar blips.
     * @param root The root TransformNode to retrieve the position from.
     */
    public static updateBlip(root: TransformNode): void {
        const node = this.getInstance().#_blips.get(root);
        if (node != null) {
            node.position = new Vector3(root.position.x, node.position.y, root.position.z)
        }
    }
    
    /**
     * Release all resources associated with this class.
     */
    public static dispose(): void {
        this.getInstance().#_radar.dispose();
        this.getInstance().#_enemyMaterial.dispose();
        this.getInstance().#_playerMaterial.dispose();
        this.getInstance().#_blips.forEach(b => b.dispose());

        this._instance = null;
    }

    /**
     * Gets the active instance of the RadarManager.
     */
    private static getInstance(): RadarManager {
        if(!this._instance) {
            this._instance = new RadarManager();
        }

        return this._instance;
    }
}