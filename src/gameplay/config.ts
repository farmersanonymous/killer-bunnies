/**
 * A range data structure with min and max numbers.
 */
export interface ConfigRange {
    /**
     * The minimum range.
     */
    min: number;
    /**
     * The maximum range.
     */
    max: number;
}

/**
 * An individual asset that needs to be loaded.
 */
export interface ConfigAssetData {
    /**
     * The name of the asset to load.
     */
    name: string;
    /**
     * The type of asset to load.
     */
    type: string;
    /**
     * The url to the location where the asset can be loaded from.
     */
    url: string;
}

/**
 * Settings that can be changed on the player.
 */
export interface ConfigPlayerData {
    /**
     * The health of the player.
     */
    health: number;
    /**
     * The movemement speed of the player.
     */
    speed: number;
    /**
     * The amount of damage the bullets do.
     */
    weaponDamage: number;
    /**
     * The time that the bullets can fly before disappearing.
     */
    weaponRange: number;
    /**
     * How fast the bullets will travel.
     */
    weaponSpeed: number;
}

/**
 * Settings that can be changed on the burrow
 */
export interface ConfigBurrowData {
    /**
     * Spawn frequency of the burrow. Set min/max range. Random.
     */
    spawnFrequency: ConfigRange;
    /**
     * Time limit before the burrow will despawn. Set min/max range. Random.
     */
    timeLimit: ConfigRange;
    /**
     * How often a rabbit gets spawned from the burrow. Set min/max range. Random.
     */
    rabbitSpawnFrequency: ConfigRange;
}

/**
 * Settings that can be changed on the stabber rabbit.
 */
export interface StabberRabbitConfigData {
    /**
     * Stabber rabbit damage
     */
    damage: number;
    /**
     * Stabber rabbit speed
     */
    speed: number;
    /**
     * Stabber rabbit retreat speed
     */
    retreatSpeed: number;
}

/**
 * The config data.
 */
export interface ConfigData {
    /**
     * The assets of the config data.
     */
    assets: ConfigAssetData[];
    /**
     * Player data
     */
    player: ConfigPlayerData;
    /**
     * Burrow data
     */
    burrow: ConfigBurrowData;
    /**
     * Stabber rabbit data
     */
    stabberRabbit: StabberRabbitConfigData;
}

/**
 * Stores and manages config data associated with the game.
 */
export class Config {
    private static _config: ConfigData;

    private constructor() { /** Static class */ }

    /**
     * Initializes the config data with the raw JSON string.
     * @param config The raw JSON string to use for the config data.
     */
    public static init(config: string): void {
        this._config = JSON.parse(config);
    }

    /**
     * Gets the asset data that was stored in the config file.
     * @returns The asset data that was stored in the config file.
     */
    public static get assets(): ConfigAssetData[] {
        return this._config.assets;
    }
    /**
     * Gets the player data that was stored in the config file.
     * @returns The player data that was stored in the config file.
     */
    public static get player(): ConfigPlayerData {
        return this._config.player;
    }
    /**
     * Gets the burrow data that was stored in the config file.
     * @returns The burrow data that was stored in the config file.
     */
    public static get burrow(): ConfigBurrowData {
        return this._config.burrow;
    }
    /**
     * Gets the stabber rabbit data that was stored in the config file.
     * @returns The stabber rabbit data that was stored in the config file.
     */
    public static get stabberRabbit(): StabberRabbitConfigData {
        return this._config.stabberRabbit;
    }
}