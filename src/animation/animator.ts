import { AnimationGroup, Scalar } from "babylonjs";

/**
 * Animator state that is used to store the current state of the animator.
 */
export enum AnimatorState {
    /**
     * The spawn animator state. Used by the Rabbit.
     */
    Spawn,
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
     * The attack animator state. Used by the Rabbits.
     */
    Attack,
    /**
     * The death animator state.
     */
    Death,
    /**
     * The Rabbit death animations. Will randomly choose 1 or 2.
     */
    RabbitDeath
}

/**
 * The animator that controls the animation groups of the imported meshes for the game.
 */
export class Animator {
    #_animations: Map<string, AnimationGroup> = new Map<string, AnimationGroup>();
    #_state: AnimatorState = null;
    #_isPlaying: boolean;

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

        this.#_isPlaying = false;

        // Play the idle animation by default.
        if(this.#_animations.has(this.stateToString(AnimatorState.Idle)))
            this.play(AnimatorState.Idle);
    }
    /**
     * Play an animation. This will stop the old animation and start the new one.
     * @param state The animator state animation to play.
     * @param loop If the animation should loop.
     * @param onEnd Callback that will trigger when the animation is finished playing.
     */
    public play(state: AnimatorState, loop = true, onEnd?: () => void): void {
        if(this.#_state === state) {
            return;
        }

        if(this.#_state != null) {
            this.#_animations.get(this.stateToString(this.#_state)).stop();
        }

        const animation = this.#_animations.get(this.stateToString(state));
        animation.play(loop);
        if(!loop) {
            animation.onAnimationEndObservable.add(() => {
                this.#_isPlaying = false;
                animation.onAnimationEndObservable.clear();
                onEnd?.();
            });
        }

        this.#_state = state;
        this.#_isPlaying = true;
    }

    /**
     * Pauses the current animation that is playing.
     * @param pause True if the animation is paused. False to resume.
     */
    public pause(pause: boolean): void {
        if(!this.#_isPlaying) {
            return;
        }

        const animation = this.#_animations.get(this.stateToString(this.#_state));
        if(pause)
            animation.pause();
        else
            animation.play();
    }

    /**
     * Releases all resources associated with this Animator.
     */
    public dispose(): void {
        this.#_animations.forEach(a => a.dispose());
    }

    private stateToString(state: AnimatorState): string {
        if(state === AnimatorState.Spawn) {
            return "Spawn"
        }
        else if(state === AnimatorState.Idle) {
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
        else if(state === AnimatorState.Attack) {
            return "Attack";
        }
        else if(state === AnimatorState.Death) {
            return "Death";
        }
        else if(state === AnimatorState.RabbitDeath) {
            return Scalar.RandomRange(0, 1) > 0.5 ? "Death01" : "Death02";
        }
        else {
            return null;
        }
    }
}