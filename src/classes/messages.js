/**
 * @Class Messages
 * Enum for determining which message type was sent or is to be sent
 */
var Messages = {
    GAME_STATE: 0,
    SERVER_STATE: 1,
    CLIENT_CONNECTED: 2,
    CLIENT_DISCONNECTED: 3,
    CLIENT_STATE: 4
};

if (typeof(module) === "object") {
    module.exports = Messages;
}