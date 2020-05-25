import { Spawner } from "../assets/spawner";
import { TransformNode, Vector3 } from "babylonjs";
import { Farmer } from "../player/farmer";
import { GUIManager } from "../ui/guiManager";

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
        this.#_pickable = false;

        Carrot._carrots.push(this);
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
            gui.addPickIcon(this.#_root.getChildMeshes()[0]);
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
        for(let i = 0; i < this._carrots.length; i++) {
            this._carrots[i].dispose();
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
}