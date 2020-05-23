import { AdvancedDynamicTexture, TextBlock, Rectangle, Image, Control } from 'babylonjs-gui';
import { PerformanceMonitor, Scalar } from 'babylonjs';
import { BabylonObserverStore } from '../store/babylonObserverStore';
import { ImageManager } from './imageManager';

const HEALTH_BAR_WIDTH = 262;

/**
 * Handles all the UI that gets displayed on the screen during the Game.
 */
export class GUIManager {
    #_dynamicTexture: AdvancedDynamicTexture;
    #_healthBar: Rectangle;
    #_roundNumberText: TextBlock;
    #_roundTimerText: TextBlock;
    #_carrotText: TextBlock;
    #_updateHandle: number;
    #_carrots: Image[] = [];

    /**
     * Constructor.
     */
    constructor() {
        this.#_dynamicTexture = AdvancedDynamicTexture.CreateFullscreenUI('UI');
        this.#_dynamicTexture.idealWidth = 1200;

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

        for(let i = 0; i < 5; i++) {
            const carrotempty = ImageManager.get('CarrotEmpty');
            carrotempty.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
            carrotempty.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
            carrotempty.widthInPixels = 48;
            carrotempty.heightInPixels = 48;
            carrotempty.left = 25 + (i * 60);
            carrotempty.top = 65;
            this.#_dynamicTexture.addControl(carrotempty);
        }    

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

        const carrotIcon = ImageManager.get('CarrotFill');
        carrotIcon.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        carrotIcon.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        carrotIcon.heightInPixels = 20;
        carrotIcon.widthInPixels = 20;
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
        this.#_roundNumberText.top = 19;
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
        this.#_roundTimerText.top = 69;
        this.#_dynamicTexture.addControl(this.#_roundTimerText);

        this.#_carrotText = new TextBlock('CarrotCount', '0');
        this.#_carrotText.color = "white";
        this.#_carrotText.fontFamily = "ActionMan";
        this.#_carrotText.fontSize = "16px";
        this.#_carrotText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.#_carrotText.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this.#_carrotText.top = 69;
        this.#_carrotText.left = 80;
        this.#_carrotText.widthInPixels = 100;
        this.#_carrotText.heightInPixels = 30;
        this.#_dynamicTexture.addControl(this.#_carrotText);

        const fpsText = new TextBlock('FPS', "");
        fpsText.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        fpsText.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        fpsText.top = 70;
        fpsText.left = 75;
        fpsText.widthInPixels = 100;
        fpsText.heightInPixels = 30;

        const performanceMonitor = new PerformanceMonitor();
        this.#_updateHandle = BabylonObserverStore.registerAfterRender(() => {
            performanceMonitor.sampleFrame();
            fpsText.text = 'FPS: ' + performanceMonitor.averageFPS.toFixed(0);
        });
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
     * Release all resources associated with this GUIManager.
     */
    public dispose(): void {
        BabylonObserverStore.deregisterAfterRender(this.#_updateHandle);
        this.#_dynamicTexture.dispose();
    }
}