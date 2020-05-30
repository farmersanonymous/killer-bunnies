import { Spawner } from "../assets/spawner";
import { TransformNode, Vector3 } from "babylonjs";
import { Farmer } from "../player/farmer";
import { GUIManager } from "../ui/guiManager";
import { MathUtil } from "../util/mathUtil";

/**
 * The Carrot will be gatherable by the Farmer and Nabber rabbits. Used to purchase upgrades.
 */
export class Carrot {
    private static _carrots: Carrot[] = [];

    #_root: TransformNode;
    #_pickable: boolean;

    /**
     * Constructor.
     * @param parent The parent that the Carrot will be spawned at.
     */
    constructor(parent: TransformNode) {
        const spawner = Spawner.getSpawner('Carrot');
        const instance = spawner.instantiate();
        this.#_root = instance.rootNodes[0];
        this.#_root.parent = parent;
        this.#_root.scaling = Vector3.One().scale(3);
        this.root.position.y = 0.25;
        this.#_pickable = false;

        Carrot._carrots.push(this);
    }

    /**
     * Gets the root transform of the Carrot.
     * @returns The root transform of the Carrot.
     */
    public get root(): TransformNode {
        return this.#_root;
    }

    /**
     * Updates the carrot every frame.
     * @param farmer The farmer (player character).
     * @param gui The GUI for the game.
     */
    public update(farmer: Farmer, gui: GUIManager): void {
        const worldMatrix = this.#_root.getWorldMatrix();
        const pos = worldMatrix.getRow(3);
        this.#_pickable = Vector3.Distance(pos.toVector3(), farmer.position) < 1;
        if(this.#_pickable) {
            if(farmer.useMouse)
                gui.addPickIcon(this.#_root.getChildMeshes()[0], 'EKey');
            else
                gui.addPickIcon(this.root.getChildMeshes()[0], 'RBButton');
        }
        else {
            gui.removePickIcon(this.#_root.getChildMeshes()[0]);
        }
    }

    /**
     * Release all resources associated with the Carrot.
     */
    public dispose(): void {
        this.#_root.dispose();
        Carrot._carrots = Carrot._carrots.filter(car => car !== this);
    }

    /**
     * Updates all the carrots.
     * @param farmer The farmer (player character).
     * @param gui The GUI for the game.
     */
    public static updateAll(farmer: Farmer, gui: GUIManager): void {
        for(let i = 0; i < this._carrots.length; i++) {
            this._carrots[i].update(farmer, gui);
        }
    }
    /**
     * Disposes and releases all resources associated with all of the Carrots.
     */
    public static disposeAll(): void {
        while(this._carrots.length > 0) {
            this._carrots[0].dispose();
        }   
    }
    /**
     * Returns a carrot that is pickable. If there are no carrots that are in range of the player, returns undefined.
     * @returns The Carrot that is pickable.
     */
    public static getPickableCarrot(): Carrot {
        const pickableCarrots = this._carrots.filter(car => car.#_pickable);
        if(pickableCarrots.length > 0)
            return pickableCarrots[0];
        else
            return undefined;
    }
    /**
     * Returns a random carrot transform node.
     * @returns The transform node of the carrot to return.
     */
    public static getRandomCarrotTransform(): TransformNode {
        if(this._carrots.length === 0) {
            return undefined;
        }

        return this._carrots[MathUtil.randomInt(0, this._carrots.length - 1)].root;
    }
    /**
     * Disposes and releases all resources associated with the Carrot that was created with the passed in transform.
     * @param transform The transform that belongs to the Carrot to dispose.
     */
    public static disposeCarrotByTransform(transform: TransformNode): void {
        this._carrots.find(c => c.#_root === transform).dispose();
    }
}