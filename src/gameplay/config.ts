import { Scalar } from "babylonjs";

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
    /**
     * The amount of time it takes to complete a harvest.
     */
    harvestTime: number;
    /**
     * The amount of health increase when upgraded.
     */
    upgradeHealth: number;
    /**
     * The amount of damage increase when upgraded.
     */
    upgradeDamage: number;
    /**
     * The reduced amount of time it takes to harvest carrots to the basket when upgraded.
     */
    upgradeHarvest: number;
    /**
     * The amount to increase speed by when upgraded.
     */
    upgradeSpeed: number;
    /**
     * The amount of carrots upgrades will initially cost.
     */
    upgradeInitialCost: number;
    /**
     * The amount that an upgrade will increase in cost by, when purchased.
     */
    upgradeIncrementCost: number;
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
    /**
     * The chances that a nabber is spawned instead of a stabber. Value between 0 and 1.
     */
    nabberSpawnRatio: number;
    /**
     * Gets a random spawn frequency between min and max range.
     * @returns The random spawn frequency.
     */
    randomSpawnFrequency(): number;
    /**
     * Gets a random time limit between min and max range.
     * @returns The random time limit.
     */
    randomTimeLimit(): number;
    /**
     * Gets a random rabbit spawn frequency between min and max range.
     * @returns The random rabbit spawn frequency.
     */
    randomRabbitSpawnFrequency(): number;
}

/**
 * Settings that can be changed on the stabber rabbit.
 */
export interface StabberRabbitConfigData {
    /**
<<<<<<< HEAD
     * Stabber rabbit health
=======
     * How often a rabbit gets spawned from the burrow. Set min/max range. Random.
     */
    spawnFrequency: ConfigRange;
    /**
     * Stabber rabbit speed
>>>>>>> ff4fe2277bc3233a5c4cd576b5c5e9912b4d21af
     */
    speed: number;
    /**
     * Stabber rabbit damage
     */
    damage: number;
    /**
     * The health of the rabbit.
     */
    health: number;
    /**
     * Stabber rabbit retreat speed
     */
    retreatSpeed: number;
}

/**
 * Settings that can be changed on the nabber rabbit.
 */
export interface NabberRabbitConfigData {
    /**
     * Nabber rabbit health
     */
    health: number;
    /**
     * Nabber rabbit speed
     */
    speed: number;
    /**
     * Nabber rabbit retreat speed
     */
    retreatSpeed: number;
}

/**
 * Settings that can be changed on the carrot.
 */
export interface CarrotConfigData {
    /**
     * How often a carrot gets spawned in the garden. Set min/max range. Random.
     */
    spawnFrequency: ConfigRange;
    /**
     * Gets a random carrot spawn frequency between min and max range.
     * @returns The random carrot spawn frequency.
     */
    randomSpawnFrequency(): number;
}

/**
 * The config data.
 */
export interface ConfigData {
    /**
     * True if game is in dev mode, with extra options.
     */
    dev: boolean;
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
    /**
     * Nabber rabbit data
     */
    nabberRabbit: NabberRabbitConfigData;
    /**
     * Carrot data
     */
    carrot: CarrotConfigData;
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

        this._config.burrow.randomSpawnFrequency = (): number => {
            return Scalar.RandomRange(this.burrow.spawnFrequency.min, this.burrow.spawnFrequency.max);
        };
        this._config.burrow.randomTimeLimit = (): number => {
            return Scalar.RandomRange(this.burrow.timeLimit.min, this.burrow.timeLimit.max);
        }
        this._config.burrow.randomRabbitSpawnFrequency = (): number => {
            return Scalar.RandomRange(this.burrow.rabbitSpawnFrequency.min, this.burrow.rabbitSpawnFrequency.max);
        }
        this._config.carrot.randomSpawnFrequency = (): number => {
            return Scalar.RandomRange(this.carrot.spawnFrequency.min, this.carrot.spawnFrequency.max);
        }
    }

    /**
     * Gets whether the game is in dev mode.
     * @returns True if the game is in dev mode, false if it is not.
     */
    public static get dev(): boolean {
        return this._config.dev;
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
    /**
     * Gets the nabber rabbit data that was stored in the config file.
     * @returns The nabber rabbit data that was stored in the config file.
     */
    public static get nabberRabbit(): NabberRabbitConfigData {
        return this._config.nabberRabbit;
    }
    /**
     * Gets the carrot data that was stored in the config file.
     * @returns The carrot data that was stored in the config file.
     */
    public static get carrot(): CarrotConfigData {
        return this._config.carrot;
    }
}