/**
 * The different collision groups that exist within the game. They are bit flags and must be equal to a power of 2.
 */
export enum CollisionGroup {
    /**
     * The Player flag.
     */
    Player = 1,
    /**
     * The Bullet flag.
     */
    Bullet = 2,
    /**
     * The Environment flag.
     */
    Environment = 4,
    /**
     * The Enemy flag.
     */
    Enemy = 8
}