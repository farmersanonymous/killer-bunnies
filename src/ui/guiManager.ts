import { AdvancedDynamicTexture, TextBlock, Rectangle, Image, Control, Button, Slider, Ellipse } from 'babylonjs-gui';
import { PerformanceMonitor, Scalar, AbstractMesh, Vector2 } from 'babylonjs';
import { BabylonObserverStore } from '../store/babylonObserverStore';
import { ImageManager } from './imageManager';
import { Config } from '../gameplay/config';
import { BabylonStore } from '../store/babylonStore';
import { Farmer } from '../player/farmer';
import { SoundManager } from '../assets/soundManager';
import { Bullet } from '../player/bullet';
import { StabberRabbit } from '../enemies/stabberRabbit';
import { NabberRabbit } from '../enemies/nabberRabbit';
import { CarrotDrop } from '../droppable/carrotDrop';

const HEALTH_BAR_WIDTH = 262;

/**
 * Interface used to get a reference to the webkit full screen functions for Safari.
 */
interface SafariDocument {
    webkitExitFullscreen: () => Promise<void>;
    webkitFullscreenElement: HTMLElement;
}

/**
 * Interface used to get a reference to the webkit full screen functions for Safari.
 */
interface SafariElement {
    webkitRequestFullscreen: () => Promise<void>;
}

/**
 * Handles all the UI that gets displayed on the screen during the Game.
 */
export class GUIManager {
    #_dynamicTexture: AdvancedDynamicTexture;
    #_healthBar: Rectangle;
    #_nextRoundText: TextBlock;
    #_nextRoundPanel: Rectangle;
    #_nextRoundTimerPanel: Rectangle;
    #_roundNumberText: TextBlock;
    #_roundTimerText: TextBlock;
    #_carrotText: TextBlock;
    #_pausePanel: Rectangle;
    #_pausePanelOverlay: Rectangle;
    #_updateHandle: number;
    #_pickIcons: Map<AbstractMesh, Control> = new Map<AbstractMesh, Control>();
    #_carrots: Image[] = [];
    #_harvestSlider: Slider;
    #_harvestTimer: number;
    #_upgradePanel: Rectangle;

    #_leftStick: Ellipse;
    #_rightStick: Ellipse;

    /**
     * Constructor.
     */
    constructor() {
        this.#_dynamicTexture = AdvancedDynamicTexture.CreateFullscreenUI('UI');
        // this.#_dynamicTexture.renderAtIdealSize = true;
        this.#_dynamicTexture.idealWidth = 1200;

        /**
         * The player health bar.
         */

        const healthRect = new Rectangle();
        healthRect.thickness = 3;
        healthRect.color = "#2b1d0e";
        healthRect.background = "#654321";
        healthRect.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        healthRect.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        healthRect.top = 20;
        healthRect.left = 20;
        healthRect.widthInPixels = 300;
        healthRect.heightInPixels = 40;
        healthRect.cornerRadius = 50;
        this.#_dynamicTexture.addControl(healthRect);

        const healthBackground = new Rectangle();
        healthBackground.thickness = 3;
        healthBackground.color = "black";
        healthBackground.background = "black";
        healthBackground.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        healthBackground.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        healthBackground.top = 27.5;
        healthBackground.left = 50;
        healthBackground.widthInPixels = HEALTH_BAR_WIDTH;
        healthBackground.heightInPixels = 25;
        healthBackground.cornerRadius = 50;
        this.#_dynamicTexture.addControl(healthBackground);

        this.#_healthBar = new Rectangle();
        this.#_healthBar.thickness = 3;
        this.#_healthBar.color = "#8b0000";
        this.#_healthBar.background = "#8b0000";
        this.#_healthBar.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.#_healthBar.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this.#_healthBar.top = 27.5;
        this.#_healthBar.left = 50;
        this.#_healthBar.widthInPixels = HEALTH_BAR_WIDTH;
        this.#_healthBar.heightInPixels = 25;
        this.#_healthBar.cornerRadius = 50;
        this.#_dynamicTexture.addControl(this.#_healthBar);

        const heartBackground = new Rectangle();
        heartBackground.thickness = 3;
        heartBackground.color = "#2b1d0e";
        heartBackground.background = "#654321";
        heartBackground.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        heartBackground.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        heartBackground.top = 5;
        heartBackground.left = 5;
        heartBackground.widthInPixels = 55;
        heartBackground.heightInPixels = 55;
        heartBackground.cornerRadius = 100;
        this.#_dynamicTexture.addControl(heartBackground);

        const heart = ImageManager.get('Heart');
        heart.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        heart.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        heart.widthInPixels = 40;
        heart.heightInPixels = 40;
        heart.left = 12.5;
        heart.top = 12.5;
        this.#_dynamicTexture.addControl(heart);

        for (let i = 0; i < 5; i++) {
            const carrotempty = ImageManager.get('CarrotEmpty');
            carrotempty.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
            carrotempty.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
            carrotempty.widthInPixels = 48;
            carrotempty.heightInPixels = 48;
            carrotempty.left = 25 + (i * 60);
            carrotempty.top = 65;
            this.#_dynamicTexture.addControl(carrotempty);
        }

        /**
         * Timer for the period in between rounds.
         */
        this.#_nextRoundPanel = new Rectangle();
        this.#_nextRoundPanel.thickness = 3;
        this.#_nextRoundPanel.color = "#2b1d0e";
        this.#_nextRoundPanel.background = "#654321";
        this.#_nextRoundPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.#_nextRoundPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this.#_nextRoundPanel.top = 110;
        this.#_nextRoundPanel.widthInPixels = 240;
        this.#_nextRoundPanel.heightInPixels = 65;
        this.#_nextRoundPanel.cornerRadius = 5;
        this.#_dynamicTexture.addControl(this.#_nextRoundPanel);

        this.#_nextRoundTimerPanel = new Rectangle();
        this.#_nextRoundTimerPanel.thickness = 3;
        this.#_nextRoundTimerPanel.color = "black";
        this.#_nextRoundTimerPanel.background = "#2b1d0e";
        this.#_nextRoundTimerPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.#_nextRoundTimerPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this.#_nextRoundTimerPanel.top = 125;
        this.#_nextRoundTimerPanel.left = 0;
        this.#_nextRoundTimerPanel.widthInPixels = 220;
        this.#_nextRoundTimerPanel.heightInPixels = 40;
        this.#_nextRoundTimerPanel.cornerRadius = 5;
        this.#_dynamicTexture.addControl(this.#_nextRoundTimerPanel);

        this.#_nextRoundText = new TextBlock('NextRoundNumber', 'Next Round In: 0:00');
        this.#_nextRoundText.color = "white";
        this.#_nextRoundText.fontFamily = "ActionMan";
        this.#_nextRoundText.fontSize = "20px";
        this.#_nextRoundText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.#_nextRoundText.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this.#_nextRoundText.heightInPixels = 40;
        this.#_nextRoundText.left = 0;
        this.#_nextRoundText.top = 120;
        this.#_dynamicTexture.addControl(this.#_nextRoundText);

        /**
         * The round panel, with timer and total carrots.
         */

        const mainPanel = new Rectangle();
        mainPanel.thickness = 3;
        mainPanel.color = "#2b1d0e";
        mainPanel.background = "#654321";
        mainPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        mainPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        mainPanel.top = -10;
        mainPanel.widthInPixels = 300;
        mainPanel.heightInPixels = 125;
        mainPanel.cornerRadius = 5;
        this.#_dynamicTexture.addControl(mainPanel);

        const roundPanel = new Rectangle();
        roundPanel.thickness = 3;
        roundPanel.color = "black";
        roundPanel.background = "#2b1d0e";
        roundPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        roundPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        roundPanel.top = 20;
        roundPanel.left = 0;
        roundPanel.widthInPixels = 220;
        roundPanel.heightInPixels = 40;
        roundPanel.cornerRadius = 5;
        this.#_dynamicTexture.addControl(roundPanel);

        const timerPanel = new Rectangle();
        timerPanel.thickness = 3;
        timerPanel.color = "black";
        timerPanel.background = "#2b1d0e";
        timerPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        timerPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        timerPanel.top = 70;
        timerPanel.left = -60;
        timerPanel.widthInPixels = 100;
        timerPanel.heightInPixels = 30;
        timerPanel.cornerRadius = 5;
        this.#_dynamicTexture.addControl(timerPanel);

        const carrotPanel = new Rectangle();
        carrotPanel.thickness = 3;
        carrotPanel.color = "black";
        carrotPanel.background = "#2b1d0e";
        carrotPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        carrotPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        carrotPanel.top = 70;
        carrotPanel.left = 60;
        carrotPanel.widthInPixels = 100;
        carrotPanel.heightInPixels = 30;
        carrotPanel.cornerRadius = 5;
        this.#_dynamicTexture.addControl(carrotPanel);

        const timerIcon = ImageManager.get('Timer');
        timerIcon.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        timerIcon.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        timerIcon.heightInPixels = 20;
        timerIcon.widthInPixels = 20;
        timerIcon.left = -80;
        timerIcon.top = 75;
        this.#_dynamicTexture.addControl(timerIcon);

        const carrotIcon = ImageManager.get('CarrotBasket');
        carrotIcon.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        carrotIcon.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        carrotIcon.heightInPixels = 20;
        carrotIcon.widthInPixels = 30;
        carrotIcon.left = 50;
        carrotIcon.top = 75;
        this.#_dynamicTexture.addControl(carrotIcon);

        this.#_roundNumberText = new TextBlock('RoundNumber', 'Round: 1');
        this.#_roundNumberText.color = "white";
        this.#_roundNumberText.fontFamily = "ActionMan";
        this.#_roundNumberText.fontSize = "30px";
        this.#_roundNumberText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.#_roundNumberText.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this.#_roundNumberText.heightInPixels = 40;
        this.#_roundNumberText.left = 0;
        this.#_roundNumberText.top = 15;
        this.#_dynamicTexture.addControl(this.#_roundNumberText);

        this.#_roundTimerText = new TextBlock('RoundTimer', '0:00');
        this.#_roundTimerText.color = "white";
        this.#_roundTimerText.fontFamily = "ActionMan";
        this.#_roundTimerText.fontSize = "16px";
        this.#_roundTimerText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.#_roundTimerText.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this.#_roundTimerText.heightInPixels = 30;
        this.#_roundTimerText.width = 100;
        this.#_roundTimerText.left = -50;
        this.#_roundTimerText.top = 65;
        this.#_dynamicTexture.addControl(this.#_roundTimerText);

        this.#_carrotText = new TextBlock('CarrotCount', '0');
        this.#_carrotText.color = "white";
        this.#_carrotText.fontFamily = "ActionMan";
        this.#_carrotText.fontSize = "16px";
        this.#_carrotText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.#_carrotText.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this.#_carrotText.top = 65;
        this.#_carrotText.left = 80;
        this.#_carrotText.widthInPixels = 100;
        this.#_carrotText.heightInPixels = 30;
        this.#_dynamicTexture.addControl(this.#_carrotText);

        /**
         * The fullscreen button
         */

        const fullscreenButton = new Button('Fullscreen Button');
        fullscreenButton.thickness = 3;
        fullscreenButton.color = "#2b1d0e";
        fullscreenButton.background = "#654321";
        fullscreenButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        fullscreenButton.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        fullscreenButton.top = -20;
        fullscreenButton.left = -20;
        fullscreenButton.widthInPixels = 50;
        fullscreenButton.heightInPixels = 50;
        fullscreenButton.cornerRadius = 50;
        this.#_dynamicTexture.addControl(fullscreenButton);

        const fullscreenImage = ImageManager.get('Fullscreen');
        fullscreenImage.width = "80%";
        fullscreenImage.stretch = Image.STRETCH_UNIFORM;
        fullscreenImage.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        fullscreenImage.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        fullscreenButton.addControl(fullscreenImage);

        fullscreenButton.onPointerClickObservable.add(() => {
            const safariDocument = document as unknown as SafariDocument;
            if (!document.fullscreenElement && !safariDocument.webkitFullscreenElement) {
                if (document.body.requestFullscreen)
                    document.body.requestFullscreen();
                else {
                    const safariElement = document.body as unknown as SafariElement;
                    if (safariElement && safariElement.webkitRequestFullscreen)
                        safariElement.webkitRequestFullscreen();
                }
            }
            else {
                if (document.exitFullscreen)
                    document.exitFullscreen();
                else {
                    if (safariDocument && safariDocument.webkitExitFullscreen)
                        safariDocument.webkitExitFullscreen();
                }
            }
        });

        /**
         * The pause button
         */

        const pauseButton = new Button('PauseButton');
        pauseButton.thickness = 3;
        pauseButton.color = "#2b1d0e";
        pauseButton.background = "#654321";
        pauseButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        pauseButton.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        pauseButton.top = -20;
        pauseButton.left = 20;
        pauseButton.widthInPixels = 50;
        pauseButton.heightInPixels = 50;
        pauseButton.cornerRadius = 50;
        this.#_dynamicTexture.addControl(pauseButton);

        const pauseImage = ImageManager.get('Pause');
        pauseImage.width = "80%";
        pauseImage.stretch = Image.STRETCH_UNIFORM;
        pauseImage.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        pauseImage.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        pauseButton.addControl(pauseImage);

        pauseButton.onPointerClickObservable.add(() => {
            this.onPauseButtonPressed?.();
        });

        /**
         * Setup pause panel, but don't add to advanced texture.
         */

        this.#_pausePanel = new Rectangle('PausePanel');
        this.#_pausePanel.color = 'black';
        this.#_pausePanel.background = 'black';
        this.#_pausePanel.alpha = 0.5;
        this.#_pausePanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.#_pausePanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        this.#_pausePanel.width = "100%";
        this.#_pausePanel.height = "100%";

        this.#_pausePanelOverlay = new Rectangle('PausePanelOverlay');
        this.#_pausePanelOverlay.color = 'transparent';
        this.#_pausePanelOverlay.background = 'transparent';
        this.#_pausePanelOverlay.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.#_pausePanelOverlay.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        this.#_pausePanelOverlay.width = "100%";
        this.#_pausePanelOverlay.height = "100%";

        const pauseText = new TextBlock('PauseText', "PAUSED");
        pauseText.color = "white";
        pauseText.fontFamily = "ActionMan";
        pauseText.fontSize = "100px";
        pauseText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        pauseText.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        pauseText.heightInPixels = 150;
        pauseText.top = -120;
        this.#_pausePanelOverlay.addControl(pauseText);

        const playButton = new Button('PlayButton');
        playButton.thickness = 3;
        playButton.color = "#2b1d0e";
        playButton.background = "#654321";
        playButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        playButton.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        playButton.top = 0;
        playButton.left = 0;
        playButton.widthInPixels = 100;
        playButton.heightInPixels = 100;
        playButton.cornerRadius = 50;
        this.#_pausePanelOverlay.addControl(playButton);

        const playImage = ImageManager.get('Play');
        playImage.width = "80%";
        playImage.stretch = Image.STRETCH_UNIFORM;
        playImage.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        playImage.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        playButton.addControl(playImage);

        playButton.onPointerClickObservable.add(() => {
            this.onPauseButtonPressed?.();
        });

        /**
         * Dev UI. Will turn off for release.
         */

        if (Config.dev) {
            const inspectorButton = new Button('InspectorButton');
            inspectorButton.thickness = 3;
            inspectorButton.color = "#2b1d0e";
            inspectorButton.background = "#654321";
            inspectorButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
            inspectorButton.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
            inspectorButton.top = 165;
            inspectorButton.left = 20;
            inspectorButton.widthInPixels = 100;
            inspectorButton.heightInPixels = 25;
            inspectorButton.cornerRadius = 5;
            this.#_dynamicTexture.addControl(inspectorButton);

            const inspectorText = new TextBlock('InspectorText', 'Inspector');
            inspectorText.color = "white";
            inspectorText.fontFamily = "ActionMan";
            inspectorText.fontSize = "14px";
            inspectorText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
            inspectorText.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
            inspectorText.widthInPixels = 100;
            inspectorText.heightInPixels = 25;
            inspectorButton.addControl(inspectorText);

            inspectorButton.onPointerClickObservable.add(() => {
                if (BabylonStore.scene.debugLayer.isVisible())
                    BabylonStore.scene.debugLayer.hide();
                else
                    BabylonStore.scene.debugLayer.show({ embedMode: true });
            });

            const fpsText = new TextBlock('FPS', "");
            fpsText.color = 'white';
            fpsText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
            fpsText.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
            fpsText.top = 200;
            fpsText.left = 20;
            fpsText.widthInPixels = 100;
            fpsText.heightInPixels = 30;
            this.#_dynamicTexture.addControl(fpsText);

            const performanceMonitor = new PerformanceMonitor();
            this.#_updateHandle = BabylonObserverStore.registerAfterRender(() => {
                performanceMonitor.sampleFrame();
                fpsText.text = 'FPS: ' + performanceMonitor.averageFPS.toFixed(0);
            });
        }

        const sideJoystickOffset = 150;
        const bottomJoystickOffset = -50;
        function makeThumbArea(name: string, thickness: number, color: string, background: string): Ellipse {
            const rect = new Ellipse();
            rect.name = name;
            rect.thickness = thickness;
            rect.color = color;
            rect.background = background;
            rect.paddingLeft = "0px";
            rect.paddingRight = "0px";
            rect.paddingTop = "0px";
            rect.paddingBottom = "0px";
            return rect;
        }

        if (BabylonStore.isMobile) {
            const ui2 = AdvancedDynamicTexture.CreateFullscreenUI('UI2');

            const leftStick = makeThumbArea("leftThumb", 2, "blue", null);
            leftStick.height = "150px";
            leftStick.width = "150px";
            leftStick.isPointerBlocker = true;
            leftStick.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
            leftStick.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
            leftStick.alpha = 0.4;
            leftStick.left = sideJoystickOffset;
            leftStick.top = bottomJoystickOffset;

            const leftInnerThumbContainer = makeThumbArea("leftInnterThumb", 4, "blue", null);
            leftInnerThumbContainer.height = "40px";
            leftInnerThumbContainer.width = "40px";
            leftInnerThumbContainer.isPointerBlocker = true;
            leftInnerThumbContainer.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
            leftInnerThumbContainer.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;

            const leftPuck = makeThumbArea("leftPuck", 0, "blue", "blue");
            leftPuck.height = "20px";
            leftPuck.width = "20px";
            leftPuck.isPointerBlocker = true;
            leftPuck.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
            leftPuck.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;

            let leftIsDown = false;
            leftStick.onPointerDownObservable.add(function (coordinates) {
                leftPuck.isVisible = true;
                const left = coordinates.x - (leftStick._currentMeasure.width * .5) - sideJoystickOffset;
                leftPuck.left = left;
                const top = BabylonStore.engine.getRenderHeight() - coordinates.y - (leftStick._currentMeasure.height * .5) + bottomJoystickOffset;
                leftPuck.top = top * -1;
                leftIsDown = true;
                leftStick.alpha = 0.9;
                GUIManager.onLeftStickMove?.(new Vector2(left, top).normalize());
            });

            leftStick.onPointerUpObservable.add(function () {
                leftIsDown = false;
                leftPuck.isVisible = false;
                leftStick.alpha = 0.4;
                GUIManager.onLeftStickMove?.(undefined);
            });


            leftStick.onPointerMoveObservable.add(function (coordinates) {
                if (leftIsDown) {
                    const xAddPos = coordinates.x - (leftStick._currentMeasure.width * .5) - sideJoystickOffset;
                    const yAddPos = BabylonStore.engine.getRenderHeight() - coordinates.y - (leftStick._currentMeasure.height * .5) + bottomJoystickOffset;
                    const left = xAddPos;
                    const top = yAddPos * -1;
                    leftPuck.left = left;
                    leftPuck.top = top;

                    GUIManager.onLeftStickMove?.(new Vector2(left, top * -1).normalize());
                }
            });

            ui2.addControl(leftStick);
            leftStick.addControl(leftInnerThumbContainer);
            leftStick.addControl(leftPuck);

            const rightStick = makeThumbArea("rightThumb", 2, "red", null);
            rightStick.height = "150px";
            rightStick.width = "150px";
            rightStick.isPointerBlocker = true;
            rightStick.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
            rightStick.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
            rightStick.alpha = 0.4;
            rightStick.left = -sideJoystickOffset;
            rightStick.top = bottomJoystickOffset;

            const rightInnerThumbContainer = makeThumbArea("rightInnterThumb", 4, "red", null);
            rightInnerThumbContainer.height = "40px";
            rightInnerThumbContainer.width = "40px";
            rightInnerThumbContainer.isPointerBlocker = true;
            rightInnerThumbContainer.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
            rightInnerThumbContainer.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;

            const rightPuck = makeThumbArea("rightPuck", 0, "red", "red");
            rightPuck.height = "20px";
            rightPuck.width = "20px";
            rightPuck.isPointerBlocker = true;
            rightPuck.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
            rightPuck.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
            rightPuck.isVisible = false;

            let rightIsDown = false;
            rightStick.onPointerDownObservable.add(function (coordinates) {
                console.log(coordinates);
                rightPuck.isVisible = true;
                const left = BabylonStore.engine.getRenderWidth() - coordinates.x - (rightStick._currentMeasure.width * .5) - sideJoystickOffset;
                rightPuck.left = left * -1;
                const top = BabylonStore.engine.getRenderHeight() - coordinates.y - (rightStick._currentMeasure.height * .5) + bottomJoystickOffset;
                rightPuck.top = top * -1;
                rightIsDown = true;
                rightStick.alpha = 0.9;
                GUIManager.onRightStickMove?.(new Vector2(left, top).normalize());
            });

            rightStick.onPointerUpObservable.add(function () {
                rightIsDown = false;
                rightPuck.isVisible = false;
                rightStick.alpha = 0.4;
                GUIManager.onRightStickMove?.(undefined);
            });

            rightStick.onPointerMoveObservable.add(function (coordinates) {
                if (rightIsDown) {
                    const xAddRot = BabylonStore.engine.getRenderWidth() - coordinates.x - (rightStick._currentMeasure.width * .5) - sideJoystickOffset;
                    const yAddRot = BabylonStore.engine.getRenderHeight() - coordinates.y - (rightStick._currentMeasure.height * .5) + bottomJoystickOffset;
                    const left = xAddRot * -1;
                    const top = yAddRot * -1;
                    rightPuck.left = left;
                    rightPuck.top = top;

                    GUIManager.onRightStickMove?.(new Vector2(left * -1, top * -1).normalize());
                }
            });

            ui2.addControl(rightStick);
            rightStick.addControl(rightInnerThumbContainer);
            rightStick.addControl(rightPuck);

            this.#_leftStick = leftStick;
            this.#_rightStick = rightStick;
        }
    }

    /**
     * Shows the pause menu.
     */
    public set paused(value: boolean) {
        if (value) {
            this.#_dynamicTexture.addControl(this.#_pausePanel);
            this.#_dynamicTexture.addControl(this.#_pausePanelOverlay);
        }
        else {
            this.#_dynamicTexture.removeControl(this.#_pausePanel);
            this.#_dynamicTexture.removeControl(this.#_pausePanelOverlay);
        }

        if(this.#_leftStick && this.#_rightStick) {
            this.#_leftStick.isVisible = !value;
            this.#_rightStick.isVisible = !value;
        }
    }

    /**
     * Sets the current and max health of the gui indicating the player health.
     * @param current The current health value of the player.
     * @param max The max health value of the player.
     */
    public setHealthValues(current: number, max: number): void {
        const value = Scalar.Lerp(0, HEALTH_BAR_WIDTH, current / max);
        this.#_healthBar.widthInPixels = value;
    }
    /**
     * Sets the current round number.
     * @param round The current round.
     */
    public setRound(round: number): void {
        this.#_roundNumberText.text = "Round: " + round;
    }
    /**
     * Sets the time left in the current round.
     * @param time The time left in the round.
     */
    public setRoundTimer(time: string): void {
        this.#_roundTimerText.text = time;
    }
    /**
     * Sets the time left until the next round.
     * @param time The time left until the next round.
     */
    public setNextRoundTimer(time: string): void {
        this.#_nextRoundText.text = time;
    }
    /**
     * Sets whether or not the next round timer is showing.
     * @param enable Whether the next round timer should be showing.
     */
    public enableNextRoundTimer(enable: boolean): void {
        const alpha = enable ? 1 : 0
        this.#_nextRoundText.alpha = alpha;
        this.#_nextRoundPanel.alpha = alpha;
        this.#_nextRoundTimerPanel.alpha = alpha;
    }
    /**
     * Adds a pick icon to the gui manager and attaches it to a mesh.
     * @param mesh The mesh to attach the pick icon to.
     * @param imageName The name of the image to use for the icon.
     * @param offset The offset y in pixels.
     * @param callback Callback in the casse of imageName === tap, for mobile.
     */
    public addPickIcon(mesh: AbstractMesh, imageName: string, offset = -100, callback?: () => void): void {
        if (this.#_pickIcons.has(mesh)) {
            return;
        }

        // For mobile. Not the best way to do it, but running out of time.
        if (imageName === 'TAP') {
            const button = new Button();
            button.thickness = 3;
            button.color = "#2b1d0e";
            button.background = "#654321";
            button.widthInPixels = 120;
            button.heightInPixels = 65;
            button.cornerRadius = 5;
            button.onPointerClickObservable.add(() => {
                callback?.();
            });
            this.#_dynamicTexture.addControl(button);

            const text = new TextBlock('TAP', imageName);
            text.color = 'white';
            text.fontFamily = 'ActionMan';
            text.fontSize = '32px';
            text.widthInPixels = 100;
            text.heightInPixels = 32;
            button.addControl(text);

            button.linkWithMesh(mesh);
            button.linkOffsetYInPixels = offset;
            mesh.onDisposeObservable.add(() => {
                this.removePickIcon(mesh);
            });
            this.#_pickIcons.set(mesh, button);
        }
        else {
            const image = ImageManager.get(imageName);
            image.widthInPixels = 32;
            image.heightInPixels = 32;
            this.#_dynamicTexture.addControl(image);
            image.linkWithMesh(mesh);
            image.linkOffsetYInPixels = offset;
            mesh.onDisposeObservable.add(() => {
                this.removePickIcon(mesh);
            });
            this.#_pickIcons.set(mesh, image);
        }
    }
    /**
     * Removes the pick icon from the gui manager.
     * @param mesh The mesh to remove the pick icon from.
     */
    public removePickIcon(mesh: AbstractMesh): void {
        const image = this.#_pickIcons.get(mesh);
        if (image) {
            this.#_dynamicTexture.removeControl(image);
            this.#_pickIcons.delete(mesh);
            image.dispose();
        }
    }

    /**
     * Attempts to add a carrot to the Farmer inventory. He can only carry 5.
     * @returns Return true if the carrot was added. False if it was not.
     */
    public addFarmerCarrot(): boolean {
        if (this.#_carrots.length === 5) {
            return false;
        }

        const carrotfill = ImageManager.get('CarrotFill');
        carrotfill.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        carrotfill.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        carrotfill.widthInPixels = 48;
        carrotfill.heightInPixels = 48;
        carrotfill.left = 25 + (this.#_carrots.length * 60);
        carrotfill.top = 65;
        this.#_dynamicTexture.addControl(carrotfill);
        this.#_carrots.push(carrotfill);
        return true;
    }

    /**
     * Clears all the farmer carrots from the gui.
     */
    public clearFarmerCarrots(): void {
        this.#_carrots.forEach(c => c.dispose());
        this.#_carrots = [];
    }

    /**
     * Updates the Harvest timer. It will start/continue a progress bar if the Farmer is in range. 
     * If the Farmer goes out of range before the timer finishes, then the timer will get canceled.
     * @param mesh The Farmer mesh that will get linked to the slider.
     * @param distance The distance the Farmer is away from the harvest basket.
     * @param requirement The distance the Farmer has to be from the harvest basket in order for the timer to continue.
     * @param time The time it takes for the harvest of one carrot.
     */
    public updateHarvestTimer(mesh: AbstractMesh, distance: number, requirement: number, time: number): void {
        // Don't do anything if the Farmer has no carrots!
        if (this.#_carrots.length === 0) {
            if (this.#_harvestSlider) {
                this.#_dynamicTexture.removeControl(this.#_harvestSlider);
                this.#_harvestSlider.dispose();
                this.#_harvestSlider = null;
            }
            return;
        }

        time = time * this.#_carrots.length;

        if (distance <= requirement) {
            if (!this.#_harvestSlider) {
                this.#_harvestSlider = new Slider('HarvestSlider');
                this.#_harvestSlider.background = "black";
                this.#_harvestSlider.color = "yellow";
                this.#_harvestSlider.widthInPixels = 100;
                this.#_harvestSlider.heightInPixels = 20;
                this.#_harvestSlider.minimum = 0;
                this.#_harvestSlider.maximum = 100;
                this.#_harvestSlider.value = 0;
                this.#_harvestSlider.displayThumb = false;
                this.#_dynamicTexture.addControl(this.#_harvestSlider);
                this.#_harvestSlider.linkWithMesh(mesh);
                this.#_harvestSlider.linkOffsetYInPixels = -100;
                this.#_harvestTimer = 0;
            }

            this.#_harvestTimer += BabylonStore.deltaTime;
            const ratio = this.#_harvestTimer / time;
            this.#_harvestSlider.value = Scalar.Lerp(this.#_harvestSlider.minimum, this.#_harvestSlider.maximum, ratio);

            if (ratio >= 1) {
                // Increase carrot count on harvest.
                this.#_carrotText.text = (parseInt(this.#_carrotText.text) + this.#_carrots.length).toString();

                this.#_carrots.forEach(c => {
                    this.#_dynamicTexture.removeControl(c);
                    c.dispose();
                });
                this.#_carrots = [];
                this.#_dynamicTexture.removeControl(this.#_harvestSlider);
                this.#_harvestSlider.dispose();
                this.#_harvestSlider = null;
            }
        }
        else if (this.#_harvestSlider) {
            this.#_dynamicTexture.removeControl(this.#_harvestSlider);
            this.#_harvestSlider.dispose();
            this.#_harvestSlider = null;
        }

        return undefined;
    }

    /**
     * Shows the game over screen.
     * @param round The round that the game ended on.
     * @param callback Function that will get called when main menu button is clicked.
     */
    public showGameOverScreen(round: number, callback: () => void): void {
        // Turn off controller when viewing game over screen.
        if (BabylonStore.isMobile) {
            this.#_rightStick.isVisible = false;
            this.#_leftStick.isVisible = false;
        }

        const panel = new Rectangle();
        panel.thickness = 3;
        panel.color = "#2b1d0e";
        panel.background = "#654321";
        panel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        panel.widthInPixels = 400;
        panel.heightInPixels = 400;
        panel.cornerRadius = 5;
        this.#_dynamicTexture.addControl(panel);

        const gameOverText = new TextBlock('GameOver', 'GAME OVER');
        gameOverText.color = "white";
        gameOverText.fontFamily = "ActionMan";
        gameOverText.fontSize = "45px";
        gameOverText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        gameOverText.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        gameOverText.heightInPixels = 50;
        gameOverText.left = 0;
        gameOverText.top = 15;
        panel.addControl(gameOverText);

        const roundText = new TextBlock('Round', 'You made it to round...');
        roundText.color = "white";
        roundText.fontFamily = "ActionMan";
        roundText.fontSize = "25px";
        roundText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        roundText.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        roundText.heightInPixels = 40;
        roundText.left = 0;
        roundText.top = 55;
        panel.addControl(roundText);

        const roundText2 = new TextBlock('Round', round.toString());
        roundText2.color = "white";
        roundText2.fontFamily = "ActionMan";
        roundText2.fontSize = "80px";
        roundText2.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        roundText2.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        roundText2.heightInPixels = 100;
        roundText2.left = 0;
        roundText2.top = 80;
        panel.addControl(roundText2);

        const timeText = new TextBlock('TimeText', `Lasted for`);
        timeText.color = "white";
        timeText.fontFamily = "ActionMan";
        timeText.fontSize = "15px";
        timeText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        timeText.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        timeText.heightInPixels = 20;
        timeText.left = -100;
        timeText.top = 200;
        panel.addControl(timeText);

        const timeCount = new TextBlock('TimeCount', BabylonStore.time.toFixed(0) + ' seconds');
        timeCount.color = "white";
        timeCount.fontFamily = "ActionMan";
        timeCount.fontSize = "15px";
        timeCount.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        timeCount.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        timeCount.heightInPixels = 20;
        timeCount.left = 100;
        timeCount.top = 200;
        panel.addControl(timeCount);

        const bulletText = new TextBlock('BulletText', `Corn Kernels Shot`);
        bulletText.color = "white";
        bulletText.fontFamily = "ActionMan";
        bulletText.fontSize = "15px";
        bulletText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        bulletText.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        bulletText.heightInPixels = 20;
        bulletText.left = -100;
        bulletText.top = 220;
        panel.addControl(bulletText);

        const bulletCount = new TextBlock('BulletText', Bullet.bulletCount.toString());
        bulletCount.color = "white";
        bulletCount.fontFamily = "ActionMan";
        bulletCount.fontSize = "15px";
        bulletCount.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        bulletCount.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        bulletCount.heightInPixels = 20;
        bulletCount.left = 100;
        bulletCount.top = 220;
        panel.addControl(bulletCount);

        const bunnyText = new TextBlock('BunnyText', `Bunnies Killed`);
        bunnyText.color = "white";
        bunnyText.fontFamily = "ActionMan";
        bunnyText.fontSize = "15px";
        bunnyText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        bunnyText.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        bunnyText.heightInPixels = 20;
        bunnyText.left = -100;
        bunnyText.top = 240;
        panel.addControl(bunnyText);

        const bunnyKilled = new TextBlock('BunnyKilled', (StabberRabbit.rabbitCount + NabberRabbit.rabbitCount).toString());
        bunnyKilled.color = "white";
        bunnyKilled.fontFamily = "ActionMan";
        bunnyKilled.fontSize = "15px";
        bunnyKilled.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        bunnyKilled.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        bunnyKilled.heightInPixels = 20;
        bunnyKilled.left = 100;
        bunnyKilled.top = 240;
        panel.addControl(bunnyKilled);

        const carrotStolenText = new TextBlock('CarrotStolen', `Carrots Taken`);
        carrotStolenText.color = "white";
        carrotStolenText.fontFamily = "ActionMan";
        carrotStolenText.fontSize = "15px";
        carrotStolenText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        carrotStolenText.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        carrotStolenText.heightInPixels = 20;
        carrotStolenText.left = -100;
        carrotStolenText.top = 260;
        panel.addControl(carrotStolenText);

        const carrotText = new TextBlock('CarrotText', NabberRabbit.carrotCount.toString());
        carrotText.color = "white";
        carrotText.fontFamily = "ActionMan";
        carrotText.fontSize = "15px";
        carrotText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        carrotText.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        carrotText.heightInPixels = 20;
        carrotText.left = 100;
        carrotText.top = 260;
        panel.addControl(carrotText);

        const carrotGatheredText = new TextBlock('CarrotGathered', `Carrots Gathered`);
        carrotGatheredText.color = "white";
        carrotGatheredText.fontFamily = "ActionMan";
        carrotGatheredText.fontSize = "15px";
        carrotGatheredText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        carrotGatheredText.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        carrotGatheredText.heightInPixels = 20;
        carrotGatheredText.left = -100;
        carrotGatheredText.top = 280;
        panel.addControl(carrotGatheredText);

        const carrotText2 = new TextBlock('CarrotText2', (Farmer.carrotCount + CarrotDrop.carrotCount).toString());
        carrotText2.color = "white";
        carrotText2.fontFamily = "ActionMan";
        carrotText2.fontSize = "15px";
        carrotText2.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        carrotText2.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        carrotText2.heightInPixels = 20;
        carrotText2.left = 100;
        carrotText2.top = 280;
        panel.addControl(carrotText2);

        const closeButton = Button.CreateSimpleButton('CloseButton', 'Main Menu');
        closeButton.color = 'white';
        closeButton.fontSize = '18px';
        closeButton.fontFamily = "ActionMan";
        closeButton.background = "#2b1d0e";
        closeButton.widthInPixels = 120;
        closeButton.heightInPixels = 32;
        closeButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        closeButton.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        closeButton.cornerRadius = 50;
        closeButton.left = 0;
        closeButton.top = 330;
        panel.addControl(closeButton);

        closeButton.onPointerClickObservable.add(() => {
            SoundManager.play('Select');
            callback?.();
        });
    }

    /**
     * Shows the upgrade menu.
     * @param farmer The farmer (player character).
     * @param onClose A callback that will be triggered when the menu closes.
     * @returns Returns the five buttons in this order: health, damage, harvest, move speed, close.
     */
    public showUpgradeMenu(farmer: Farmer, onClose: () => void): Button[] {
        let totalCarrots = parseInt(this.#_carrotText.text);
        onClose;
        this.#_dynamicTexture.addControl(this.#_pausePanel);

        // Turn off controller when viewing upgrades.
        if (BabylonStore.isMobile) {
            this.#_rightStick.isVisible = false;
            this.#_leftStick.isVisible = false;
        }

        this.#_upgradePanel = new Rectangle();
        this.#_upgradePanel.thickness = 3;
        this.#_upgradePanel.color = "#2b1d0e";
        this.#_upgradePanel.background = "#654321";
        this.#_upgradePanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.#_upgradePanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        this.#_upgradePanel.widthInPixels = 500;
        this.#_upgradePanel.heightInPixels = 600;
        this.#_upgradePanel.cornerRadius = 5;
        this.#_dynamicTexture.addControl(this.#_upgradePanel);

        const carrotPanel = new Rectangle();
        carrotPanel.thickness = 3;
        carrotPanel.color = "black";
        carrotPanel.background = "#2b1d0e";
        carrotPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        carrotPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        carrotPanel.top = 70;
        carrotPanel.left = 150;
        carrotPanel.widthInPixels = 100;
        carrotPanel.heightInPixels = 30;
        carrotPanel.cornerRadius = 5;
        this.#_upgradePanel.addControl(carrotPanel);

        const carrotIcon = ImageManager.get('CarrotBasket');
        carrotIcon.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        carrotIcon.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        carrotIcon.heightInPixels = 20;
        carrotIcon.widthInPixels = 30;
        carrotIcon.left = 140;
        carrotIcon.top = 75;
        this.#_upgradePanel.addControl(carrotIcon);

        const carrotText = new TextBlock('CarrotCount', totalCarrots.toString());
        carrotText.color = "white";
        carrotText.fontFamily = "ActionMan";
        carrotText.fontSize = "16px";
        carrotText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        carrotText.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        carrotText.top = 69;
        carrotText.left = 170;
        carrotText.widthInPixels = 100;
        carrotText.heightInPixels = 30;
        this.#_upgradePanel.addControl(carrotText);

        const upgradeTitle = new TextBlock('UpgradeTitle', 'Upgrade');
        upgradeTitle.color = "white";
        upgradeTitle.fontFamily = "ActionMan";
        upgradeTitle.fontSize = "48px";
        upgradeTitle.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        upgradeTitle.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        upgradeTitle.top = 5;
        upgradeTitle.widthInPixels = 250;
        upgradeTitle.heightInPixels = 50;
        this.#_upgradePanel.addControl(upgradeTitle);

        const healthButton = new Button();
        healthButton.thickness = 3;
        healthButton.color = "black";
        healthButton.background = "#2b1d0e";
        healthButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        healthButton.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        healthButton.top = -150;
        healthButton.left = 0;
        healthButton.widthInPixels = 150;
        healthButton.heightInPixels = 150;
        healthButton.cornerRadius = 5;
        this.#_upgradePanel.addControl(healthButton);

        const healthTitle = new TextBlock('HealthTitle', 'Health');
        healthTitle.color = "white";
        healthTitle.fontFamily = "ActionMan";
        healthTitle.fontSize = "24px";
        healthTitle.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        healthTitle.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        healthTitle.top = 10;
        healthTitle.widthInPixels = 150;
        healthTitle.heightInPixels = 50;
        healthButton.addControl(healthTitle);

        const currentHealthText = new TextBlock('CurrentHealth', farmer.maxHealth.toString());
        currentHealthText.color = "white";
        currentHealthText.fontFamily = "ActionMan";
        currentHealthText.fontSize = "18px";
        currentHealthText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        currentHealthText.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        currentHealthText.left = -40;
        currentHealthText.heightInPixels = 25;
        healthButton.addControl(currentHealthText);

        const middleHealthIcon = ImageManager.get('Arrow');
        middleHealthIcon.widthInPixels = 40;
        middleHealthIcon.heightInPixels = 40;
        middleHealthIcon.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        middleHealthIcon.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        healthButton.addControl(middleHealthIcon);

        const healthCost = new TextBlock('HealthCost', farmer.healthCost.toString());
        healthCost.color = "white";
        healthCost.fontFamily = "ActionMan";
        healthCost.fontSize = "12px";
        healthCost.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        healthCost.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        healthCost.left = -7;
        healthCost.heightInPixels = 25;
        healthButton.addControl(healthCost);

        const healthCarrot = ImageManager.get('CarrotFill');
        healthCarrot.widthInPixels = 12;
        healthCarrot.heightInPixels = 12;
        healthCarrot.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        healthCarrot.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        healthCarrot.left = 7;
        healthButton.addControl(healthCarrot);

        const noHealthIcon = ImageManager.get('CircleNo');
        noHealthIcon.widthInPixels = 40;
        noHealthIcon.heightInPixels = 40;
        noHealthIcon.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        noHealthIcon.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        healthButton.addControl(noHealthIcon);

        const newHealthText = new TextBlock('NewHealth', (farmer.maxHealth + Config.player.upgradeHealth).toString());
        newHealthText.color = "green";
        newHealthText.fontFamily = "ActionMan";
        newHealthText.fontSize = "18px";
        newHealthText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        newHealthText.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        newHealthText.left = 40;
        newHealthText.heightInPixels = 25;
        healthButton.addControl(newHealthText);

        const healthIcon = ImageManager.get("Heart");
        healthIcon.widthInPixels = 32;
        healthIcon.heightInPixels = 32;
        healthIcon.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        healthIcon.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        healthIcon.top = -10;
        healthButton.addControl(healthIcon);

        const damageButton = new Button();
        damageButton.thickness = 3;
        damageButton.color = "black";
        damageButton.background = "#2b1d0e";
        damageButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        damageButton.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        damageButton.top = 25;
        damageButton.left = -90;
        damageButton.widthInPixels = 150;
        damageButton.heightInPixels = 150;
        damageButton.cornerRadius = 5;
        this.#_upgradePanel.addControl(damageButton);

        const damageTitle = new TextBlock('DamageTitle', 'Damage');
        damageTitle.color = "white";
        damageTitle.fontFamily = "ActionMan";
        damageTitle.fontSize = "24px";
        damageTitle.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        damageTitle.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        damageTitle.top = 5;
        damageTitle.widthInPixels = 150;
        damageTitle.heightInPixels = 50;
        damageButton.addControl(damageTitle);

        const currentDamageText = new TextBlock('CurrentDamage', farmer.weaponDamage.toString());
        currentDamageText.color = "white";
        currentDamageText.fontFamily = "ActionMan";
        currentDamageText.fontSize = "18px";
        currentDamageText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        currentDamageText.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        currentDamageText.left = -40;
        currentDamageText.heightInPixels = 25;
        damageButton.addControl(currentDamageText);

        const middleDamageIcon = ImageManager.get('Arrow');
        middleDamageIcon.widthInPixels = 40;
        middleDamageIcon.heightInPixels = 40;
        middleDamageIcon.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        middleDamageIcon.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        damageButton.addControl(middleDamageIcon);

        const damageCost = new TextBlock('DamageCost', farmer.damageCost.toString());
        damageCost.color = "white";
        damageCost.fontFamily = "ActionMan";
        damageCost.fontSize = "12px";
        damageCost.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        damageCost.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        damageCost.left = -7;
        damageCost.heightInPixels = 25;
        damageButton.addControl(damageCost);

        const damageCarrot = ImageManager.get('CarrotFill');
        damageCarrot.widthInPixels = 12;
        damageCarrot.heightInPixels = 12;
        damageCarrot.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        damageCarrot.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        damageCarrot.left = 7;
        damageButton.addControl(damageCarrot);

        const noDamageIcon = ImageManager.get('CircleNo');
        noDamageIcon.widthInPixels = 40;
        noDamageIcon.heightInPixels = 40;
        noDamageIcon.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        noDamageIcon.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        damageButton.addControl(noDamageIcon);

        const newDamageText = new TextBlock('NewDamage', (farmer.weaponDamage + Config.player.upgradeDamage).toString());
        newDamageText.color = "green";
        newDamageText.fontFamily = "ActionMan";
        newDamageText.fontSize = "18px";
        newDamageText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        newDamageText.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        newDamageText.left = 40;
        newDamageText.heightInPixels = 25;
        damageButton.addControl(newDamageText);

        const damageIcon = ImageManager.get("CorncobberIcon");
        damageIcon.widthInPixels = 32;
        damageIcon.heightInPixels = 32;
        damageIcon.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        damageIcon.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        damageIcon.top = -10;
        damageButton.addControl(damageIcon);

        const harvestButton = new Button();
        harvestButton.thickness = 3;
        harvestButton.color = "black";
        harvestButton.background = "#2b1d0e";
        harvestButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        harvestButton.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        harvestButton.top = 25;
        harvestButton.left = 90;
        harvestButton.widthInPixels = 150;
        harvestButton.heightInPixels = 150;
        harvestButton.cornerRadius = 5;
        this.#_upgradePanel.addControl(harvestButton);

        const harvestTitle = new TextBlock('HarvestTitle', 'Harvest Speed');
        harvestTitle.color = "white";
        harvestTitle.fontFamily = "ActionMan";
        harvestTitle.fontSize = "20px";
        harvestTitle.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        harvestTitle.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        harvestTitle.top = 5;
        harvestTitle.widthInPixels = 150;
        harvestTitle.heightInPixels = 50;
        harvestButton.addControl(harvestTitle);

        const currentHarvestText = new TextBlock('CurrentHarvest', farmer.harvestTime.toString());
        currentHarvestText.color = "white";
        currentHarvestText.fontFamily = "ActionMan";
        currentHarvestText.fontSize = "18px";
        currentHarvestText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        currentHarvestText.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        currentHarvestText.left = -40;
        currentHarvestText.heightInPixels = 25;
        harvestButton.addControl(currentHarvestText);

        const middleHarvestIcon = ImageManager.get('Arrow');
        middleHarvestIcon.widthInPixels = 40;
        middleHarvestIcon.heightInPixels = 40;
        middleHarvestIcon.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        middleHarvestIcon.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        harvestButton.addControl(middleHarvestIcon);

        const harvestCost = new TextBlock('HarvestCost', farmer.harvestCost.toString());
        harvestCost.color = "white";
        harvestCost.fontFamily = "ActionMan";
        harvestCost.fontSize = "12px";
        harvestCost.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        harvestCost.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        harvestCost.left = -7;
        harvestCost.heightInPixels = 25;
        harvestButton.addControl(harvestCost);

        const harvestCarrot = ImageManager.get('CarrotFill');
        harvestCarrot.widthInPixels = 12;
        harvestCarrot.heightInPixels = 12;
        harvestCarrot.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        harvestCarrot.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        harvestCarrot.left = 7;
        harvestButton.addControl(harvestCarrot);

        const noHarvestIcon = ImageManager.get('CircleNo');
        noHarvestIcon.widthInPixels = 40;
        noHarvestIcon.heightInPixels = 40;
        noHarvestIcon.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        noHarvestIcon.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        harvestButton.addControl(noHarvestIcon);

        const newHarvestText = new TextBlock('NewHarvest', (farmer.harvestTime + Config.player.upgradeHarvest).toString());
        newHarvestText.color = "green";
        newHarvestText.fontFamily = "ActionMan";
        newHarvestText.fontSize = "18px";
        newHarvestText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        newHarvestText.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        newHarvestText.left = 40;
        newHarvestText.heightInPixels = 25;
        harvestButton.addControl(newHarvestText);

        const harvestIcon = ImageManager.get("CarrotBasket");
        harvestIcon.widthInPixels = 42;
        harvestIcon.heightInPixels = 32;
        harvestIcon.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        harvestIcon.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        harvestIcon.top = -10;
        harvestButton.addControl(harvestIcon);

        const moveSpeedButton = new Button();
        moveSpeedButton.thickness = 3;
        moveSpeedButton.color = "black";
        moveSpeedButton.background = "#2b1d0e";
        moveSpeedButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        moveSpeedButton.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        moveSpeedButton.top = 200;
        moveSpeedButton.left = 0;
        moveSpeedButton.widthInPixels = 150;
        moveSpeedButton.heightInPixels = 150;
        moveSpeedButton.cornerRadius = 5;
        this.#_upgradePanel.addControl(moveSpeedButton);

        const moveSpeedTitle = new TextBlock('MoveSpeedTitle', 'Move Speed');
        moveSpeedTitle.color = "white";
        moveSpeedTitle.fontFamily = "ActionMan";
        moveSpeedTitle.fontSize = "24px";
        moveSpeedTitle.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        moveSpeedTitle.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        moveSpeedTitle.top = 5;
        moveSpeedTitle.widthInPixels = 150;
        moveSpeedTitle.heightInPixels = 50;
        moveSpeedButton.addControl(moveSpeedTitle);

        const currentMoveSpeedText = new TextBlock('CurrentMoveSpeed', farmer.movementSpeed.toString());
        currentMoveSpeedText.color = "white";
        currentMoveSpeedText.fontFamily = "ActionMan";
        currentMoveSpeedText.fontSize = "18px";
        currentMoveSpeedText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        currentMoveSpeedText.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        currentMoveSpeedText.left = -40;
        currentMoveSpeedText.heightInPixels = 25;
        moveSpeedButton.addControl(currentMoveSpeedText);

        const middleMoveSpeedIcon = ImageManager.get('Arrow');
        middleMoveSpeedIcon.widthInPixels = 40;
        middleMoveSpeedIcon.heightInPixels = 40;
        middleMoveSpeedIcon.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        middleMoveSpeedIcon.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        moveSpeedButton.addControl(middleMoveSpeedIcon);

        const moveSpeedCost = new TextBlock('MoveSpeedCost', farmer.speedCost.toString());
        moveSpeedCost.color = "white";
        moveSpeedCost.fontFamily = "ActionMan";
        moveSpeedCost.fontSize = "12px";
        moveSpeedCost.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        moveSpeedCost.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        moveSpeedCost.left = -7;
        moveSpeedCost.heightInPixels = 25;
        moveSpeedButton.addControl(moveSpeedCost);

        const moveSpeedCarrot = ImageManager.get('CarrotFill');
        moveSpeedCarrot.widthInPixels = 12;
        moveSpeedCarrot.heightInPixels = 12;
        moveSpeedCarrot.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        moveSpeedCarrot.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        moveSpeedCarrot.left = 7;
        moveSpeedButton.addControl(moveSpeedCarrot);

        const noMoveSpeedIcon = ImageManager.get('CircleNo');
        noMoveSpeedIcon.widthInPixels = 40;
        noMoveSpeedIcon.heightInPixels = 40;
        noMoveSpeedIcon.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        noMoveSpeedIcon.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        moveSpeedButton.addControl(noMoveSpeedIcon);

        const newMoveSpeedText = new TextBlock('NewMoveSpeed', (farmer.movementSpeed + Config.player.upgradeSpeed).toString());
        newMoveSpeedText.color = "green";
        newMoveSpeedText.fontFamily = "ActionMan";
        newMoveSpeedText.fontSize = "18px";
        newMoveSpeedText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        newMoveSpeedText.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        newMoveSpeedText.left = 40;
        newMoveSpeedText.heightInPixels = 25;
        moveSpeedButton.addControl(newMoveSpeedText);

        const moveSpeedIcon = ImageManager.get("Boots");
        moveSpeedIcon.widthInPixels = 32;
        moveSpeedIcon.heightInPixels = 32;
        moveSpeedIcon.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        moveSpeedIcon.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        moveSpeedIcon.top = -10;
        moveSpeedButton.addControl(moveSpeedIcon);

        const closeButton = Button.CreateSimpleButton('CloseButton', 'X');
        closeButton.color = "black";
        closeButton.background = "#2b1d0e";
        closeButton.widthInPixels = 32;
        closeButton.heightInPixels = 32;
        closeButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        closeButton.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        closeButton.cornerRadius = 50;
        this.#_upgradePanel.addControl(closeButton);

        // Add UI for controller.
        if (!farmer.useMouse && !BabylonStore.isMobile) {
            // B Button to close.
            const bButton = ImageManager.get('BButton');
            bButton.widthInPixels = 32;
            bButton.heightInPixels = 32;
            bButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
            bButton.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
            closeButton.addControl(bButton);

            // Up Button for Health.
            const upButton = ImageManager.get('UpButton');
            upButton.widthInPixels = 24;
            upButton.heightInPixels = 24;
            upButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
            upButton.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
            healthButton.addControl(upButton);

            // Left Button for Damage.
            const leftButton = ImageManager.get('LeftButton');
            leftButton.widthInPixels = 24;
            leftButton.heightInPixels = 24;
            leftButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
            leftButton.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
            damageButton.addControl(leftButton);

            // Right Button for Harvest.
            const rightButton = ImageManager.get('RightButton');
            rightButton.widthInPixels = 24;
            rightButton.heightInPixels = 24;
            rightButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
            rightButton.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
            harvestButton.addControl(rightButton);

            // Down Button for Move Speed.
            const downButton = ImageManager.get('DownButton');
            downButton.widthInPixels = 24;
            downButton.heightInPixels = 24;
            downButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
            downButton.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
            moveSpeedButton.addControl(downButton);
        }

        function updateSingleUpgrade(button: Button, currText: TextBlock, newText: TextBlock, costText: TextBlock, noIcon: Image, value: number, upgrade: number, cost: number, fixed: number): void {
            button.isEnabled = totalCarrots >= cost;
            noIcon.isVisible = !button.isEnabled;
            currText.text = value.toFixed(fixed);
            newText.text = (value + upgrade).toFixed(fixed);
            costText.text = cost.toFixed(fixed);
        }

        function updateUpgrades(): void {
            carrotText.text = totalCarrots.toString();
            updateSingleUpgrade(healthButton, currentHealthText, newHealthText, healthCost, noHealthIcon, farmer.maxHealth, Config.player.upgradeHealth, farmer.healthCost, 0);
            updateSingleUpgrade(damageButton, currentDamageText, newDamageText, damageCost, noDamageIcon, farmer.weaponDamage, Config.player.upgradeDamage, farmer.damageCost, 0);
            updateSingleUpgrade(harvestButton, currentHarvestText, newHarvestText, harvestCost, noHarvestIcon, farmer.harvestTime, Config.player.upgradeHarvest, farmer.harvestCost, 1);
            updateSingleUpgrade(moveSpeedButton, currentMoveSpeedText, newMoveSpeedText, moveSpeedCost, noMoveSpeedIcon, farmer.movementSpeed, Config.player.upgradeSpeed, farmer.speedCost, 1);
        }
        healthButton.onPointerClickObservable.add(() => {
            if (!healthButton.isEnabled)
                return;

            SoundManager.play('Select');
            totalCarrots -= farmer.healthCost;
            farmer.modifyMaxHealth(Config.player.upgradeHealth);
            updateUpgrades();
        });
        damageButton.onPointerClickObservable.add(() => {
            if (!damageButton.isEnabled)
                return;

            SoundManager.play('Select');
            totalCarrots -= farmer.damageCost;
            farmer.modifyWeaponDamage(Config.player.upgradeDamage);
            updateUpgrades();
        });
        harvestButton.onPointerClickObservable.add(() => {
            if (!harvestButton.isEnabled)
                return;

            SoundManager.play('Select');
            totalCarrots -= farmer.harvestCost;
            farmer.modifyHarvestTime(Config.player.upgradeHarvest);
            updateUpgrades();
        });
        moveSpeedButton.onPointerClickObservable.add(() => {
            if (!moveSpeedButton.isEnabled)
                return;

            SoundManager.play('Select');
            totalCarrots -= farmer.speedCost;
            farmer.modifyMovementSpeed(Config.player.upgradeSpeed);
            updateUpgrades();
        });
        closeButton.onPointerClickObservable.add(() => {
            SoundManager.play('Select');
            this.hideUpgradePanel();
            onClose?.();
        });

        SoundManager.play('OpenUpgrade');
        updateUpgrades();

        return [healthButton, damageButton, harvestButton, moveSpeedButton, closeButton];
    }

    /**
     * Hides the upgrade panel.
     * @returns True if the upgrade panel was hidden, false if it wasn't being shown.
     */
    public hideUpgradePanel(): boolean {
        if (this.#_upgradePanel) {
            // Turn on controller when hiding upgrades.
            if (BabylonStore.isMobile) {
                this.#_rightStick.isVisible = true;
                this.#_leftStick.isVisible = true;
            }

            const textControl = this.#_upgradePanel.getChildByName('CarrotCount') as TextBlock;
            this.#_carrotText.text = textControl.text;
            this.#_dynamicTexture.removeControl(this.#_upgradePanel);
            this.#_dynamicTexture.removeControl(this.#_pausePanel);
            this.#_upgradePanel.dispose();
            this.#_upgradePanel = null;
            return true;
        }
    }

    /**
     * Release all resources associated with this GUIManager.
     */
    public dispose(): void {
        BabylonObserverStore.deregisterAfterRender(this.#_updateHandle);
        this.#_dynamicTexture.dispose();
    }

    /**
     * An event that gets triggered whenever the pause button in the corner gets pressed.
     */
    public onPauseButtonPressed: () => void;
    /**
     * An event that gets triggered when the left virtual controller stick is moved. For mobile.
     */
    public static onLeftStickMove: (dir: Vector2) => void;
    /**
     * An event that gets triggered when the right virtual controller stick is moved. For mobile.
     */
    public static onRightStickMove: (dir: Vector2) => void;
}