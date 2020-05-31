import { Vector3, TransformNode, Angle, HighlightLayer, Color3, Mesh, Vector2, Animation } from "babylonjs";
import { Spawner } from "../assets/spawner";
import { Farmer } from "../player/farmer";
import { GUIManager } from "../ui/guiManager";
import { BabylonStore } from "../store/babylonStore";

/**
 * A carrot that has been dropped on the ground! Can be picked up by the Farmer.
 */
export class CarrotDrop {
    private static _carrots: CarrotDrop[] = [];
    private static _highlighter: HighlightLayer;

    #_root: TransformNode;
    #_fleshMesh: Mesh;

    /**
     * Constructor.
     * @param position The position to spawn the drop.
     */
    constructor(position: Vector3) {
        if(!CarrotDrop._highlighter) {
            CarrotDrop._highlighter = new HighlightLayer('hl1', BabylonStore.scene);
        }

        const spawner = Spawner.getSpawner('Carrot');
        const instance = spawner.instantiate();
        this.#_root = instance.rootNodes[0];
        this.#_root.position = position;
        this.#_root.scaling = Vector3.One().scale(3);
        this.#_root.rotation = new Vector3(Angle.FromDegrees(90).radians(), 0, 0);
        this.#_root.computeWorldMatrix();
        this.#_fleshMesh = this.#_root.getChildMeshes(false, m => m.name === 'Flesh')[0] as Mesh;

        // Freeze world matrix after position is set.
        this.#_root.getChildMeshes().forEach(m => m.freezeWorldMatrix());

        CarrotDrop._highlighter.addMesh(this.#_fleshMesh, Color3.Yellow());

        CarrotDrop._carrots.push(this);

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
     * Updates the carrot every frame.
     * @param farmer The farmer (player character).
     * @param gui The GUI for the game.
     */
    public update(farmer: Farmer, gui: GUIManager): void {
        if(Vector2.Distance(new Vector2(this.#_root.position.x, this.#_root.position.z), new Vector2(farmer.position.x, farmer.position.z)) < 1) {
            if(gui.addFarmerCarrot()) {
                this.dispose();
            }
        }
    }
    /**
     * Release all resources associated with the Carrot.
     */
    public dispose(): void {
        CarrotDrop._highlighter.removeMesh(this.#_fleshMesh);
        this.#_root.dispose();
        CarrotDrop._carrots = CarrotDrop._carrots.filter(car => car !== this);
    }

    /**
     * Updates all the CarrotDrops.
     * @param farmer The farmer (player character).
     * @param gui The GUI for the game.
     */
    public static updateAll(farmer: Farmer, gui: GUIManager): void {
        for(let i = 0; i < this._carrots.length; i++) {
            this._carrots[i].update(farmer, gui);
        }
    }
    /**
     * Disposes and releases all resources associated with all of the CarrotDrops.
     */
    public static disposeAll(): void {
        while(this._carrots.length > 0) {
            this._carrots[0].dispose();
        }
    }
}