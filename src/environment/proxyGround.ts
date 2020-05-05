import { MeshBuilder, PBRMaterial, Color3 } from 'babylonjs';
import { BabylonStore } from '../store/babylonStore';

/**
 * Proxy ground that will be used for the environment until the real ground is done.
 */
export class ProxyGround {
    /**
     * Constructor.
     * @param name The name of the ground to create.
     * @param width The width of the ground to create.
     * @param height The height of the ground to create.
     */
    constructor(name: string, width: number, height: number) {
        const mesh = MeshBuilder.CreateGround(name, { width, height });
        const groundMaterial = new PBRMaterial('groundMaterial', BabylonStore.scene);
        groundMaterial.emissiveColor = Color3.Green();
        mesh.material = groundMaterial;
    }
}