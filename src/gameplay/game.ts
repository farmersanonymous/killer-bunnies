import { Farmer } from '../player/farmer';
import { Garden } from '../environment/garden';
import { Bootstrap } from '../index';
import { GUIManager } from '../ui/guiManager';
import { RoundHandler } from './roundHandler';
import { Bullet } from '../player/bullet';
import { CollisionManager } from '../collision/collisionManager';
import { RadarManager } from '../ui/radar';
import { SoundManager } from '../assets/soundManager';
import { Input } from '../input/input';
import { BabylonStore } from '../store/babylonStore';
import { MathUtil } from '../util/mathUtil';

/**
 * Starts a Game. Each instance is it's own self contained Game and can be created and disposed at will.
 */
export class Game {
    #_player: Farmer;
    #_bullets: Bullet[] = [];
    #_garden: Garden;
    #_gui: GUIManager;
    #_roundHandler: RoundHandler;
    #_onGameOver: () => void;
    #_bootstrap: Bootstrap;
    #_paused: boolean;
    #_currentTrack: string;
    #_gameOverTimer = 5;
    

    /**
     * Constructor.
     * @param bootstrap The bootstrap instance that started the game.
     * @param onGameOver A callback that is fired when the game is over.
     */
    constructor(bootstrap: Bootstrap, onGameOver: () => void) {
        SoundManager.stop('Title');

        const playRandomMusic = (): void  => {    
            let musicTracks = [
                'Music1',
                'Music3',
                'Music2'
            ];
    
            if(this.#_currentTrack) 
                musicTracks = musicTracks.filter(t => t !== this.#_currentTrack);
    
            this.#_currentTrack = musicTracks[MathUtil.randomInt(0, musicTracks.length - 1)];
    
            SoundManager.play(this.#_currentTrack, {
                onEnd: playRandomMusic,
                volume: 0.1
            });
        }

        playRandomMusic();

        this.#_garden = new Garden();
        this.#_player = new Farmer();
        this.#_gui = new GUIManager();
        this.#_roundHandler = new RoundHandler(this.#_gui);
        this.#_onGameOver = onGameOver;
        this.#_bootstrap = bootstrap;

        Bullet.onBulletCreated = (bullet: Bullet): void => {
            this.#_bullets.push(bullet);
        };
        Bullet.onBulletDisposed = (bullet: Bullet): void => {
            this.#_bullets = this.#_bullets.filter(bul => bul !== bullet);
        };
        
        this.#_gui.onPauseButtonPressed = (): void => {
            this.#_paused = !this.#_paused;
            this.#_player.disabled = this.#_paused;
            this.#_garden.disabled = this.#_paused;
            this.#_roundHandler.onPause(this.#_paused);
        };
        window.addEventListener('blur', () => {
            if(!this.#_paused && !this.#_roundHandler.upgrading) {
                this.#_paused = true;
                this.#_player.disabled = this.#_paused;
                this.#_garden.disabled = this.#_paused;
                this.#_roundHandler.onPause(this.#_paused);
            }
            Input.flush();
        });
    }

    /**
     * Updates the game. Called once every frame.
     */
    public update(): void {
        if((Input.isKeyPressed('p') || Input.isKeyPressed('gamepadStart')) && !this.#_roundHandler.upgrading) {
            this.#_paused = !this.#_paused;
            this.#_player.disabled = this.#_paused;
            this.#_garden.disabled = this.#_paused;
            this.#_roundHandler.onPause(this.#_paused);
        }

        if(this.#_paused) {
            return;
        }

        if (this.#_player.health <= 0 && this.#_onGameOver) {
            this.#_gameOverTimer -= BabylonStore.deltaTime;
            if(this.#_gameOverTimer <= 0) {
                SoundManager.stop(this.#_currentTrack);
                this.#_onGameOver?.call(this.#_bootstrap);
            }
        }

        this.#_player.update(this.#_garden, this.#_gui, this.#_roundHandler);

        // Temporarily setting GUI values here. This will be fine if we only have player values, but if we need to
        // show anything per Enemy, then we will probably have to use callbacks for setting health, so it doesn't happen every frame.
        this.#_gui.setHealthValues(this.#_player.health, this.#_player.maxHealth);

        // Updates the bullets.
        for(let i = 0; i < this.#_bullets.length; i++) {
            this.#_bullets[i].update();
        }

        CollisionManager.update();

        // Updates the round.
        this.#_roundHandler.update(this.#_player, this.#_garden);
    }

    /**
     * Release all resources associated with this Game.
     */
    public dispose(): void {
        BabylonStore.scene.stopAllAnimations();

        Bullet.onBulletCreated = null;
        Bullet.onBulletDisposed = null;
        this.#_roundHandler.dispose();
        this.#_player.dispose();
        this.#_bullets.forEach(b => b.dispose());
        this.#_garden.dispose();
        this.#_gui.dispose();
        
        RadarManager.dispose();
    }
}