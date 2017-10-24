/**
 * @Class Message Handler
 * Handles messages sent from the server
 */
var MessageHandler = {};

/**
 * When the game state is sent by the server, update all client entities.
 * @param {Array} state State data
 * @param {Number} sT Server time when the state was processed
 */
MessageHandler.onGameState = function (state, sT) {
    World.applyState(state, sT);
};

/**
 * When the server sends the state, load the map and start the loop
 * @param {{map: String}} d
 */
MessageHandler.onServerState = function (d) {
    World.loadMap("maps/" + d.map + "/map.json");
    World.start();
};

/**
 * Handle client connection. Ships are automatically added when they are processed in the game state
 * @param id The ID of the client
 */
MessageHandler.onClientConnected = function (id) {
    console.log("Client Connected", id);
};

/**
 * Handle client disconnect. Ensure that the client player and ship have been removed.
 * @param id The ID of the client
 */
MessageHandler.onClientDisconnected = function (id) {
    console.log("Client Disconnected", id);
    World.removePlayer(id);
};

/**
 * When the server returns the client state message, it means connection was successful. Add the player to the world.
 * @param id The ID of the player
 */
MessageHandler.onClientState = function (id) {
    World.addPlayer(id, true);
};