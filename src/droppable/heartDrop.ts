import { HighlightLayer, TransformNode, Vector3, Mesh, Color3, Animation, Vector2 } from "babylonjs";
import { BabylonStore } from "../store/babylonStore";
import { Spawner } from "../assets/spawner";
import { Farmer } from "../player/farmer";

/**
 * A header that has been dropped on the ground! When the Farmer walks near it, it will heal him.
 */
export class HeartDrop {
    private static _hearts: HeartDrop[] = [];
    private static _highlighter: HighlightLayer;

    #_root: TransformNode;
    #_heart: Mesh;

    /**
     * Constructor.
     * @param position The position to spawn the drop.
     */
    constructor(position: Vector3) {
        if(!HeartDrop._highlighter) {
            HeartDrop._highlighter = new HighlightLayer('hl2', BabylonStore.scene);
        }

        const spawner = Spawner.getSpawner('Heart');
        const instance = spawner.instantiate();
        this.#_root = instance.rootNodes[0];
        this.#_root.position = position;
        this.#_root.scaling = this.#_root.scaling.scale(0.5);
        this.#_heart = this.#_root.getChildMeshes()[0] as Mesh;

        HeartDrop._highlighter.addMesh(this.#_heart, Color3.Yellow());

        HeartDrop._hearts.push(this);

        const animation = new Animation('carrotDrop', 'position.y', 30, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE);
        const keys = [
            {
                frame: 0,
                value: this.#_root.position.y
            },
            {
                frame: 30,
                value: this.#_root.position.y - 0.5
            },
            {
                frame: 60,
                value: this.#_root.position.y
            }
        ];
        animation.setKeys(keys);
        this.#_root.animations.push(animation);
        BabylonStore.scene.beginAnimation(this.#_root, 0, 60, true);
    }

    /**
     * Updates the heart every frame.
     * @param farmer The farmer (player character).
     */
    public update(farmer: Farmer): void {
        if(Vector2.Distance(new Vector2(this.#_root.position.x, this.#_root.position.z), new Vector2(farmer.position.x, farmer.position.z)) < 1) {
            farmer.modifyHealth(10);
            this.dispose();
        }
    }

    /**
     * Release all resources associated with the Heart.
     */
    public dispose(): void {
        HeartDrop._highlighter.removeMesh(this.#_heart);
        this.#_root.dispose();
        HeartDrop._hearts = HeartDrop._hearts.filter(h => h !== this);
    }

    /**
     * Updates all the HeartDrops.
     * @param farmer The farmer (player character).
     */
    public static updateAll(farmer: Farmer): void {
        for(let i =0; i < this._hearts.length; i++)
            this._hearts[i].update(farmer);
    }

    /**
     * Disposes and releases all resources associated with all of the HeartDrops.
     */
    public static disposeAll(): void {
        while(this._hearts.length > 0) {
            this._hearts[0].dispose();
        }
    }
}