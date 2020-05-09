import { Farmer } from './player/farmer';
import { Garden } from './environment/garden';

export class Game {
    #_player: Farmer;
    #_garden: Garden;

    constructor() {
        this.#_player = new Farmer();
        this.#_garden = new Garden();
    }
}