import { Vector3, HemisphericLight, DefaultLoadingScreen, SceneLoader } from 'babylonjs';
import { BabylonStore } from './store/babylonStore';
import { Loader, LoaderType } from './assets/loader';
import { Input } from './input/input';
import { Game } from './gameplay/game';
import { BabylonObserverStore } from './store/babylonObserverStore';
import { CollisionManager } from './collision/collisionManager';
import { SoundManager } from './assets/soundManager';
import { Config } from './gameplay/config';

/**
 * Callback that will get triggered when the loading screen is to show. Also shows progress through a progress bar.
 */
function showLoadingScreenCallback(): void {
    // If splashDiv exists, reset the splash to default.
    let splashDiv = document.getElementById('splashDiv');
    if (splashDiv) {
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
    #_game: Game;
    #_canvas: HTMLCanvasElement;

    /**
     * Constructor.
     * @param canvas The canvas element used to initialize the Babylon engine.
     * @param config The configuration data that will be used for setting the data parameters.
     */
    constructor(canvas: HTMLCanvasElement, config: string) {
        Config.init(config);

        // Create the Babylon Engine. Need to set the opacity to '0' or '1' in order to show the splash screen, otherwise Babylon likes to freak out.
        BabylonStore.createEngine(canvas, true, { preserveDrawingBuffer: true });
        this.#_canvas = canvas;
        this.#_canvas.style.opacity = '0';

        // Create the Babylon Scene. Enable collisions and make sure to use right-handed (OpenGL) coordinate system.
        BabylonStore.createScene(BabylonStore.engine);
        BabylonStore.scene.collisionsEnabled = true;
        BabylonStore.scene.useRightHandedSystem = true;

        // This is the title sound so it needs to load as soon as possible.
        SoundManager.load('Title', 'https://storage.googleapis.com/farmer-assets/sound/meadowlark_daniel-simion.mp3').then(() => {
            SoundManager.play('Title', {
                loop: true
            })
        });

        // Creates the main camera.
        BabylonStore.createCamera('mainCamera', 3.141592, 0.785398, 20, Vector3.Zero(), BabylonStore.scene, true);
        BabylonStore.scene.activeCameras.push(BabylonStore.camera);
        BabylonStore.scene.cameraToUseForPointers = BabylonStore.camera;

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
        Config.assets.forEach(a => {
            if(a.type === 'art')
                Loader.addDownload(a.name, LoaderType.Art, a.url);
            else if(a.type === 'sound')
                Loader.addDownload(a.name, LoaderType.Sound, a.url);
            else if(a.type === 'image')
                Loader.addDownload(a.name, LoaderType.Image, a.url);
        });

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

            // Checks for any button/key input for getting passed the splash screen.
            Input.onAnyDown = (): void => {
                this.#_game = new Game(this, this._onGameOver);
                BabylonStore.engine.hideLoadingUI();
                Input.onAnyDown = null;
                this.#_canvas.style.opacity = '1';
            }
        });

        // Event listener to resize the engine when the window is resized.
        window.addEventListener('resize', () => {
            if (this.#_canvas.style.display != 'none') {
                BabylonStore.engine.resize();
            }
        });

        CollisionManager.init();
    }

    /**
     * Runs the game loop.
     */
    public run(): void {
        // Runs the update loop for the Babylon Engine. Will update the game if it exists.
        BabylonObserverStore.registerBeforeRender(() => {
            BabylonStore.update();
            if(this.#_game) {
                this.#_game.update();
            }

            // Update the input at the end of the frame.
            Input.update();
        });

        // Runs the render loop for the Babylon Engine. We only have one scene, so render that.
        BabylonStore.engine.runRenderLoop(() => {
            if (this.#_canvas.style.display != 'none') {
                BabylonStore.scene.render();
            }
        });
    }

    private _onGameOver(): void {
        // Removes the old game and gets ready to start the next one.
        this.#_game.dispose();
        this.#_game = null;
        this.#_canvas.style.opacity = '0';
        SoundManager.stop('Music');
        SoundManager.play('Title');

        // Show splash screen and wait 3 seconds before allowing input again.
        BabylonStore.engine.displayLoadingUI();
        setTimeout(() => {
            Input.onAnyDown = (): void => {
                this.#_game = new Game(this, this._onGameOver);
                BabylonStore.engine.hideLoadingUI();
                Input.onAnyDown = null;
                this.#_canvas.style.opacity = '1';
            }
        }, 3000)
    }
}