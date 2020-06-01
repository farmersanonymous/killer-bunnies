# killer-bunnies

A game built to submit to a [Game Jam](https://itch.io/jam/gamedevtv-community-jam). This is a top-down twin stick shooter game with rogue-like elements. The goal is to protect your farm at all costs from the wildlife and other dangers. The theme of the Game Jam is “Time”. We incorporate time through the time it takes to get through each round of enemies. Each round will last a certain amount of time. This time can be reduced through gathering and collecting vegetables. Between each round, the player will have a short period of time where they can add upgrades. There is no end objective and the game will go on until you get overrun. The game is built using BabylonJS.

## Dependencies

* npm (packaged with [Node.js](https://nodejs.org/en/))
* [Visual Studio Code](https://code.visualstudio.com/) (optional)

## Getting Started

1. After you clone, make sure that you are on the develop branch.
2. At the root of the project directory, type the command `npm install` in the console.
3. Next type `npm run start`.
4. Open up your browser and go to the url: `localhost:3700`. It will hot reload with any changes made on the index.html or in the src directory.
5. (Optional) In order to test the webpack build chain manually, type `npm run build`.

## Deployments

Continuous Deployments are setup for triggers when a Pull Request is created or when a commit is pushed on the develop branch. When that happens, that commit will be webpacked and deployed to the Google Cloud Platform.

To access the latest build from develop, go here: https://storage.googleapis.com/farmer-hosting/branches/develop/index.html

To access any pull request build, go here https://storage.googleapis.com/farmer-hosting/prs/xxx/index.html where xxx is the pull request number.
