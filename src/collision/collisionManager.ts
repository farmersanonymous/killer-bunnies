import { BaseCollidable } from "./baseCollidable";

/**
 * The different collision groups that exist within the game.
 */
export enum CollisionGroup {
    /**
     * The Player flag.
     */
    Player,
    /**
     * The Bullet flag.
     */
    Bullet,
    /**
     * The Environment flag.
     */
    Environment,
    /**
     * The Enemy flag.
     */
    Enemy,
    /**
     * The Enemy Weapon flag.
     */
    EnemyWeapon
}

/**
 * Handles all collision within the game. Babylons internal collision system wasn't optimized for lots of things on the screen.
 */
export class CollisionManager {
    private static collidables: Map<CollisionGroup, BaseCollidable[]> = new Map<CollisionGroup, BaseCollidable[]>();

    private constructor() { /** Static class */ }

    /**
     * Initializes the collision system.
     */
    public static init(): void {
        this.collidables.set(CollisionGroup.Player, []);
        this.collidables.set(CollisionGroup.Bullet, []);
        this.collidables.set(CollisionGroup.Environment, []);
        this.collidables.set(CollisionGroup.Enemy, []);
        this.collidables.set(CollisionGroup.EnemyWeapon, []);
    }
    /**
     * Registers a collidable to the collision system.
     * @param group The collision group the collidable belongs to.
     * @param collidable The collidable that will be registered.
     */
    public static register(group: CollisionGroup, collidable: BaseCollidable): void {
        const arr = this.collidables.get(group);
        arr.push(collidable);
        this.collidables.set(group, arr);
    }
    /**
     * Deregisters a collidable from the collision system. It will no longer get collision updates.
     * @param group The collision group of the collidable to deregister.
     * @param collidable The collidable that will be deregistered.
     */
    public static deregister(group: CollisionGroup, collidable: BaseCollidable): void {
        let arr = this.collidables.get(group);
        arr = arr.filter(c => c !== collidable);
        this.collidables.set(group, arr);
    }
    /**
     * Updates the collision manager. Should be called once per frame.
     */
    public static update(): void {
        // Player can get damaged by rabbit weapon.
        const players = this.collidables.get(CollisionGroup.Player);
        for(let i = 0; i < players.length; i++) {
            const player = players[i];
            const enemies = this.collidables.get(CollisionGroup.Enemy);
            for(let j = 0; j < enemies.length; j++) {
                const weaponMesh = enemies[i].getMesh('weapon');
                if(player.getMesh().intersectsMesh(weaponMesh)) {
                    player.onCollide(enemies[i]);
                }
            }
        }

        // Bullets can damage rabbits and will get destroyed by the environment.
        const bullets = this.collidables.get(CollisionGroup.Bullet);
        for(let i = 0; i < bullets.length; i++) {
            const bullet = bullets[i];
            let hitEnv = false;
            
            // Handle collision with the environment.
            const environment = this.collidables.get(CollisionGroup.Environment);
            for(let j = 0; j < environment.length; j++) {
                const meshes = environment[j].getMeshes();
                for(let k = 0; k < meshes.length; k++) {
                    if(bullet.getMesh().intersectsMesh(meshes[k])) {
                        bullet.onCollide(environment[j]);
                        hitEnv = true;
                        break;
                    }
                }
            }

            // Handles collision with the enemies.
            if(!hitEnv) {
                const enemies = this.collidables.get(CollisionGroup.Enemy);
                for(let j = 0; j < enemies.length; j++) {
                    const enemyMesh = enemies[j].getMesh();
                    if(bullet.getMesh().intersectsMesh(enemyMesh)) {
                        bullet.onCollide(enemies[j]);
                        enemies[j].onCollide(bullet);
                        break;
                    }
                }
            }
        }
    }
}