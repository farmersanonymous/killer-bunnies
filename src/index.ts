import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, MeshBuilder } from 'babylonjs';

export class Game {
    #_engine: Engine;
    #_scene: Scene;

    constructor(canvas: HTMLCanvasElement) {
        this.#_engine = new Engine(canvas);
        this.#_scene = new Scene(this.#_engine);
        const camera = new ArcRotateCamera('MainCamera', 0, 0, 5, new Vector3(0, 0, 0), this.#_scene);
        camera.attachControl(canvas, false);
        
        new HemisphericLight('BasicLight', new Vector3(0, 1, 0), this.#_scene);
        const box = MeshBuilder.CreateBox('box', { });
        box.position.y = 1;

        window.addEventListener('resize', () => {
            this.#_engine.resize();
        });
    }

    public run(): void {
        this.#_engine.runRenderLoop(() => {
            this.#_scene.render();
        });
    }
}