import { Camera, Viewport, Mesh, MeshBuilder, StandardMaterial, TransformNode, Color3, Angle, ArcRotateCamera, Vector3 } from 'babylonjs'
import { BabylonStore } from '../store/babylonStore'
import { Spawner } from '../assets/spawner';

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

        const size = new Vector3(60, 0, 60);
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
    Stabber = 1,
    Nabber = 2,
    Burrow = 3,
    Carrot = 4,
    HeartDrop = 5,
    CarrotDrop = 6,
    Basket = 7
}

/**
 * Manager class for the in-game radar.
 */
export class RadarManager {
    #_radar: Radar = null;
    #_basketSpawner: Spawner;
    #_heartSpawner: Spawner;
    #_carrotSpawner: Spawner;
    #_playerMaterial: StandardMaterial = null;
    #_nabberMaterial: StandardMaterial = null;
    #_burrowMaterial: StandardMaterial = null;
    #_carrotMaterial: StandardMaterial = null;
    #_stabberMaterial: StandardMaterial = null;
    #_blips: Map<TransformNode, Mesh> = new Map<TransformNode, Mesh>();

    private static _instance: RadarManager = null;

    /**
     * Default Constructor.
     */
    private constructor() {
        this.#_radar = new Radar();
        RadarManager._instance = this;
    }

    private get carrotMesh(): Mesh {
        if (!this.#_carrotSpawner) {
            this.#_carrotSpawner = Spawner.getSpawner('Carrot');
        }

        const mesh = this.#_carrotSpawner.instantiate().rootNodes[0];
        mesh.getChildMeshes().forEach(element => { element.layerMask = 0x10000000; });
        mesh.name = 'CarrotBlip';
        return mesh as Mesh;
    }

    private get basketMesh(): Mesh {
        if (!this.#_basketSpawner) {
            this.#_basketSpawner = Spawner.getSpawner('Basket');
        }

        const mesh = this.#_basketSpawner.instantiate().rootNodes[0];
        mesh.getChildMeshes().forEach(element => { element.layerMask = 0x10000000; });
        mesh.name = 'BasketBlip';
        return mesh as Mesh;
    }

    private get heartMesh(): Mesh {
        if (!this.#_heartSpawner) {
            this.#_heartSpawner = Spawner.getSpawner('Heart');
        }

        const mesh = this.#_heartSpawner.instantiate().rootNodes[0].getChildMeshes()[0] as Mesh;
        mesh.name = 'HeartBlip';
        return mesh as Mesh;
    }

    private get stabberMaterial(): StandardMaterial {
        if (this.#_stabberMaterial == null) {
            this.#_stabberMaterial = new StandardMaterial('StabberBlip', BabylonStore.scene);
            this.#_stabberMaterial.disableLighting = true;
            this.#_stabberMaterial.emissiveColor = Color3.Magenta();
        }
        return this.#_stabberMaterial;
    }

    private get nabberMaterial(): StandardMaterial {
        if(this.#_nabberMaterial == null) {
            this.#_nabberMaterial = new StandardMaterial('NabberBlip', BabylonStore.scene);
            this.#_nabberMaterial.disableLighting = true;
            this.#_nabberMaterial.emissiveColor = new Color3(255 / 255, 162 / 255, 172 / 255);
        }
        return this.#_nabberMaterial;
    }

    private get burrowMaterial(): StandardMaterial {
        if(this.#_burrowMaterial == null) {
            this.#_burrowMaterial = new StandardMaterial('BurrowBlip', BabylonStore.scene);
            this.#_burrowMaterial.disableLighting = true;
            this.#_burrowMaterial.emissiveColor = Color3.Black();
        }
        return this.#_burrowMaterial;
    }

    private get carrotMaterial(): StandardMaterial {
        if(this.#_carrotMaterial == null) {
            this.#_carrotMaterial = new StandardMaterial('CarrotBlip', BabylonStore.scene);
            this.#_carrotMaterial.disableLighting = true;
            this.carrotMaterial.emissiveColor = new Color3(255 / 255, 165 / 255, 0);
        }
        return this.#_carrotMaterial;
    }

    private get playerMaterial(): StandardMaterial {
        if (this.#_playerMaterial == null) {
            this.#_playerMaterial = new StandardMaterial('PlayerBlip', BabylonStore.scene);
            this.#_playerMaterial.disableLighting = true;
            this.#_playerMaterial.emissiveColor = Color3.Yellow();
        }
        return this.#_playerMaterial;
    }
    
    /**
     * 
     * @param blipType 
     */
    private static getBlipMesh(blipType: BlipType): Mesh {
        if (blipType == BlipType.CarrotDrop) {
            const blip = this.getInstance().carrotMesh;
            blip.scaling = new Vector3(10, 5, 10);
            blip.rotation.x = Angle.FromDegrees(90).radians();
            return blip;
        } else if (blipType == BlipType.HeartDrop) {
            const blip = this.getInstance().heartMesh;
            blip.scaling = new Vector3(1.5, 1.5, 1.5);
            blip.rotation = new Vector3(Angle.FromDegrees(180).radians(), 
                                        Angle.FromDegrees(180).radians(),
                                        Angle.FromDegrees(90).radians());
            return blip;
        } else if (blipType == BlipType.Basket) {
            const blip = this.getInstance().basketMesh;
            blip.scaling = new Vector3(3, 3, 3);
            return blip;
        } else {
            const blip = MeshBuilder.CreateDisc('Blip', { radius: 1.25, sideOrientation: Mesh.DOUBLESIDE }, BabylonStore.scene);
            blip.rotation.x = Angle.FromDegrees(90).radians();

            switch (blipType) {
                case BlipType.Nabber:
                case BlipType.Carrot:
                case BlipType.Stabber:
                    blip.scaling = new Vector3(blip.scaling.x/2, blip.scaling.y/2, blip.scaling.z/2);
                    break;
            }
            return blip;
        }
    }

    /**
     * Creates a radar blip.
     * @param root The root TransformNode to associate with the new radar blip.
     * @param blipType The type of radar blip to create.
     */
    public static createBlip(root: TransformNode, blipType: BlipType): void {
        const blip = this.getBlipMesh(blipType);
        blip.layerMask = 0x10000000;

        switch (blipType) {
            case BlipType.Player:
                blip.material = this.getInstance().playerMaterial;
                break;
            case BlipType.Stabber:
                blip.material = this.getInstance().stabberMaterial;
                break;
            case BlipType.Nabber:
                blip.material = this.getInstance().nabberMaterial;
                break;
            case BlipType.Burrow:
                blip.material = this.getInstance().burrowMaterial;
                break;
            case BlipType.Carrot:
                blip.material = this.getInstance().carrotMaterial;
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
            const worldMatrix = root.getWorldMatrix();
            const worldPosition = worldMatrix.getRow(3);
            node.position = new Vector3(worldPosition.x, node.position.y, worldPosition.z);
        }
    }
    
    /**
     * Release all resources associated with this class.
     */
    public static dispose(): void {
        this.getInstance().#_radar.dispose();
        this.getInstance().nabberMaterial.dispose();
        this.getInstance().carrotMaterial.dispose();
        this.getInstance().burrowMaterial.dispose();
        this.getInstance().playerMaterial.dispose();
        this.getInstance().stabberMaterial.dispose();
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