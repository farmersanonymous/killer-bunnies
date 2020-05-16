import { AnimationGroup } from "babylonjs";

/**
 * Animator state that is used to store the current state of the animator.
 */
export enum AnimatorState {
    /**
     * The idle animator state.
     */
    Idle,
    /**
     * The run animator state.
     */
    Run,
    /**
     * The take hit animator state.
     */
    TakeHit,
    /**
     * The shoot animator state. Used by the player.
     */
    Shoot,
    /**
     * The death animator state.
     */
    Death
}

/**
 * The animator that controls the animation groups of the imported meshes for the game.
 */
export class Animator {
    #_animations: Map<string, AnimationGroup> = new Map<string, AnimationGroup>();
    #_state: AnimatorState = null;

    /**
     * Constructor.
     * @param animations The animations that can be controlled by the animator.
     * @param blendingSpeed The speed of the animations when  blending between animations.
     */
    constructor(animations: AnimationGroup[], blendingSpeed = 0.1) {
        // Enable animation blending for all the animations within the animation groups.
        for(let i = 0; i < animations.length; i++) {
            for(let j = 0; j < animations[i].targetedAnimations.length; j++) {
                const animation = animations[i].targetedAnimations[j].animation;
                animation.enableBlending = true;
                animation.blendingSpeed = blendingSpeed;
            }
        }

        // Need to set the weights for all the animations, as well as split the animations into a map for easy access by name.
        animations.forEach(anim => {
            anim.setWeightForAllAnimatables(0.5);
            this.#_animations.set(anim.name, anim);
        });

        // Play the idle animation by default.
        this.play(AnimatorState.Idle);
    }
    /**
     * Play an animation. This will stop the old animation and start the new one.
     * @param state The animator state animation to play.
     * @param loop If the animation should loop.
     */
    public play(state: AnimatorState, loop = true): void {
        if(this.#_state === state) {
            return;
        }

        if(this.#_state != null) {
            this.#_animations.get(this.stateToString(this.#_state)).stop();
        }

        this.#_animations.get(this.stateToString(state)).play(loop);

        this.#_state = state;
    }

    private stateToString(state: AnimatorState): string {
        if(state === AnimatorState.Idle) {
            return "Idle";
        }
        else if(state === AnimatorState.Run) {
            return "Run";
        }
        else if(state === AnimatorState.TakeHit) {
            return "TakeHit";
        }
        else if(state === AnimatorState.Shoot) {
            return "Shoot";
        }
        else if(state === AnimatorState.Death) {
            return "Death";
        }
        else {
            return null;
        }
    }
}