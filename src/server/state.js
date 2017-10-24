/**
 * @Class State
 * Represents the Server State
 */
var State = {
    currentTime: (new Date()).getTime(),
    gameDuration: 60 * 15 * 1000, // 15 min in milliseconds
    lobbyDuration: 30 * 1000, // 30 seconds in milliseconds
    votingDuration: 20 * 1000, // 20 seconds in milliseconds

    lobbyTime: 0,
    gameTime: 0,
    currentMap: null,
    currentGameType: null,
    inLobby: true
};

State.GAME_TYPE = {
    "DEATHMATCH": "DEATHMATCH"
};

/**
 * Returns the game state as an object
 */
State.getState = function () {
    return {
        time: this.currentTime,
        gameType: this.currentGameType,
        map: this.currentMap,
        inLobby: this.inLobby,
        lobbyTime: this.lobbyTime,
        gameTime: this.gameTime
    };
};

/**
 * Sets the map
 * @param {String} mapName
 */
State.setMap = function (mapName) {
    this.currentMap = mapName;
};

/**
 * Sets the game type
 * @param {State.GAME_TYPE} gameType
 */
State.setGameType = function (gameType) {
    this.currentGameType = gameType;
};

/**
 * Starts the game
 */
State.startGame = function () {
    this.inLobby = false;
    this.lobbyTime = 0;
};

/**
 * Advances game time
 */
State.tick = function () {
    this.currentTime = (new Date()).getTime();
};

module.exports = State;