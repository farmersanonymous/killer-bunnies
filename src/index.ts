import { Vector3, HemisphericLight, DefaultLoadingScreen, SceneLoader } from 'babylonjs';
import { BabylonStore } from './store/babylonStore';
import { Loader } from './util/loader';
import { Input } from './util/input';
import { Farmer } from './player/farmer';

/**
 * Callback that will get triggered when the loading screen is to show. Also shows progress through a progress bar.
 */
function showLoadingScreenCallback(): void {
    // If splashDiv exists, reset the splash to default.
    let splashDiv = document.getElementById('splashDiv');
    if(splashDiv) {
        splashDiv.style.opacity = '1';
        return;
    }

    // The full screen splash image that will be shown.
    splashDiv = document.createElement('div');
    splashDiv.id = 'splashDiv';
    splashDiv.style.backgroundColor = 'white';
    splashDiv.style.opacity = '1';
    splashDiv.style.transition = 'opacity 1.5s ease';
    splashDiv.style.pointerEvents = 'none';
    splashDiv.style.background = 'url(https://storage.googleapis.com/farmer-assets/splashScreen/1/splash.jpg) no-repeat';
    splashDiv.style.width = '100%';
    splashDiv.style.height = '100%';
    splashDiv.style.backgroundSize = 'cover';

    // The progress bar. Consists of two divs, a border and the fill color.
    const borderBarDiv = document.createElement('div');
    borderBarDiv.id = 'borderBarDiv';
    borderBarDiv.className = 'w3-border w3-center';
    borderBarDiv.style.position = 'fixed';
    borderBarDiv.style.bottom = '25px';
    borderBarDiv.style.left = '50%';
    borderBarDiv.style.margin = '0 auto';
    borderBarDiv.style.transform = 'translate(-50%, -50%)';
    borderBarDiv.style.width = '60%';
    const progressBarDiv = document.createElement('div');
    progressBarDiv.id = 'progressBarDiv';
    progressBarDiv.className = 'w3-blue';
    progressBarDiv.style.width = '0%';
    progressBarDiv.style.height = '24px';
    progressBarDiv.innerHTML = '0%';
    borderBarDiv.appendChild(progressBarDiv);
    splashDiv.appendChild(borderBarDiv);

    // Text to display after progress is done. Hidden at first.
    const anyKeyDiv = document.createElement('div');
    anyKeyDiv.id = 'anyKeyDiv';
    anyKeyDiv.className = 'w3-center';
    anyKeyDiv.style.position = 'fixed';
    anyKeyDiv.style.bottom = '25px';
    anyKeyDiv.style.left = '50%';
    anyKeyDiv.style.margin = '0 auto';
    anyKeyDiv.style.transform = 'translate(-50%, -50%)';
    anyKeyDiv.style.width = '60%';
    anyKeyDiv.style.color = 'white';
    anyKeyDiv.style.display = 'none';
    anyKeyDiv.innerHTML = "Press any key to continue";
    splashDiv.appendChild(anyKeyDiv);

    document.body.appendChild(splashDiv);
}
/**
 * Callback that will get triggered when the loading screen is to hide. Will turn the opacity of the splash screen to 0. Does a transition.
 */
function hideLoadingScreenCallback(): void {
    const splashDiv = document.getElementById('splashDiv');
    splashDiv.style.opacity = '0';
}

/**
 * Bootstraps and initializes all the processes that are required in order to start the game.
 */
export class Bootstrap {
    #_render = false;

    /**
     * Constructor.
     * @param canvas The canvas element used to initialize the Babylon engine.
     */
    constructor(canvas: HTMLCanvasElement) {
        // Create the Babylon Engine.
        BabylonStore.createEngine(canvas);

        // Create the Babylon Scene. Enable collisions and make sure to use right-handed (OpenGL) coordinate system.
        BabylonStore.createScene(BabylonStore.engine);
        BabylonStore.scene.collisionsEnabled = true;
        BabylonStore.scene.useRightHandedSystem = true;

        // Create a default light for the scene. A light is needed for the PBR materials that we will be downloading later.
        new HemisphericLight("light1", new Vector3(0, 1, 0), BabylonStore.scene);

        // Loading screen in. Override the default loading screen logic and display it.
        SceneLoader.ShowLoadingScreen = false;
        DefaultLoadingScreen.prototype.displayLoadingUI = showLoadingScreenCallback;
        DefaultLoadingScreen.prototype.hideLoadingUI = hideLoadingScreenCallback;
        BabylonStore.engine.displayLoadingUI();

        // Initialilze the input system. Used for mouse/keyboard, gamepad, and touch.
        Input.init();
        
        // Adds the files that need to be downloaded into the loader.
        Loader.addDownload('Farmer', 'https://storage.googleapis.com/farmer-assets/farmer/2/Farmer_high.gltf');
        Loader.addDownload('Garden', 'https://storage.googleapis.com/farmer-assets/garden/Environment.gltf');

        // Start the download process. Callback will trigger on progress updates.
        Loader.startDownload((progress: number) => {
            const fullProgress = `${(progress * 100).toFixed(2)}%`;
            const progressBarDiv = document.getElementById('progressBarDiv');
            progressBarDiv.innerHTML = fullProgress;
            progressBarDiv.style.width = fullProgress;
        }).then(() => {
            // Turn on the any key text that displays at the bottom of the loading screen while turning off the progress bar.
            const anyKeyDiv = document.getElementById('anyKeyDiv');
            anyKeyDiv.style.display = '';
            const borderBarDiv = document.getElementById('borderBarDiv');
            borderBarDiv.style.display = 'none';
            new Farmer();
            console.log(BabylonStore.scene.actionManager);
            // Callback that will get triggered when any key/button/finger (mouse/keyboard, gamepad, or touch) is pressed down.
            Input.onAnyDown = (): void => {
                console.log("ANY KEY!");
                this.#_render = true;
                BabylonStore.engine.hideLoadingUI();
                // Input.onAnyDown = null;
            }
        });

        // Event listener to resize the engine when the window is resized.
        window.addEventListener('resize', () => {
            if(this.#_render) {
                BabylonStore.engine.resize();
            }
        });
    }

    /**
     * Runs the game loop.
     */
    public run(): void {
        // Runs the render loop for the Babylon Engine. We only have one scene, so render that.
        BabylonStore.engine.runRenderLoop(() => {
            if(this.#_render) {
                BabylonStore.scene.render();
            }
        });
    }
}