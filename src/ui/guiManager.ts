import { AdvancedDynamicTexture, Slider, Control, TextBlock } from 'babylonjs-gui';
import { PerformanceMonitor } from 'babylonjs';
import { BabylonObserverStore } from '../store/babylonObserverStore';

/**
 * Handles all the UI that gets displayed on the screen during the Game.
 */
export class GUIManager {
    #_dynamicTexture: AdvancedDynamicTexture;
    #_healthSlider: Slider;
    #_roundNumberText: TextBlock;
    #_roundTimerText: TextBlock;
    #_updateHandle: number;

    /**
     * Constructor.
     */
    constructor() {
        this.#_dynamicTexture = AdvancedDynamicTexture.CreateFullscreenUI('UI');

        this.#_healthSlider = new Slider('Health');
        this.#_healthSlider.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.#_healthSlider.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this.#_healthSlider.height = "20px";
        this.#_healthSlider.width = "200px";
        this.#_healthSlider.displayThumb = false;
        this.#_healthSlider.color = 'red';
        this.#_dynamicTexture.addControl(this.#_healthSlider);

        this.#_roundNumberText = new TextBlock('RoundNumber', 'Round: 1');
        this.#_roundNumberText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.#_roundNumberText.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this.#_roundNumberText.height = "40px";
        this.#_roundNumberText.width = "200px";
        this.#_roundNumberText.top = "30px";
        this.#_dynamicTexture.addControl(this.#_roundNumberText);

        this.#_roundTimerText = new TextBlock('RoundTimer', 'Time: 0:00');
        this.#_roundTimerText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.#_roundTimerText.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this.#_roundTimerText.height = "40px";
        this.#_roundTimerText.width = "200px";
        this.#_roundTimerText.top = "80px";
        this.#_dynamicTexture.addControl(this.#_roundTimerText);

        const fpsText = new TextBlock('FPS', 'FPS: 0');
        fpsText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        fpsText.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        fpsText.height = "40px";
        fpsText.width = "200px";
        fpsText.top = "130px";
        this.#_dynamicTexture.addControl(fpsText);

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
        this.#_healthSlider.minimum = 0;
        this.#_healthSlider.maximum = max;
        this.#_healthSlider.value = current;
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
        this.#_roundTimerText.text = "Time: " + time;
    }

    /**
     * Release all resources associated with this GUIManager.
     */
    public dispose(): void {
        BabylonObserverStore.deregisterAfterRender(this.#_updateHandle);
        this.#_healthSlider.dispose();
        this.#_roundNumberText.dispose();
        this.#_roundTimerText.dispose();
        this.#_dynamicTexture.dispose();
    }
}