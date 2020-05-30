/**
 * Provides Math utility functions.
 */
export class MathUtil {
    private constructor() { /** Private Class */ }

    /**
     * Generates a random integer between min and max.
     * @param min The minimum number to use.
     * @param max The maximum number to use.
     * @returns Returns a number between min and max.
     */
    public static randomInt(min: number, max: number): number {
        const newMin = Math.ceil(min);
        const newMax  = Math.floor(max);
        return Math.floor(Math.random() * (newMax - newMin + 1)) + newMin;
    }
}