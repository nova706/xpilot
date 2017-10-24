var Class = require('../utilities/classFramework');
var Messages = require('../classes/messages');
var State = require('./state');

/**
 * @Class MessageHandler
 */
module.exports = Class.create(function () {

    return {

        /**
         * Initializes a message handler for a given client
         * @param {IOConnection} ioConnection
         */
        init: function (ioConnection) {
            this.ioConnection = ioConnection;
        },

        /**
         * Handles when the client requests game state
         * @param {Object} d Data
         */
        onGameState: function (d) {
            console.log("Game State", d);
        },

        /**
         * Handles when the client requests Server state
         */
        onServerState: function () {
            this.ioConnection.send(Messages.SERVER_STATE, State.getState());
        },

        /**
         * Handles client connection
         * @param id The Client ID
         */
        onClientConnected: function (id) {
            console.log("Client Connected", id);
        },

        /**
         * Handles client disconnection
         * @param id The Client ID
         */
        onClientDisconnected: function (id) {
            console.log("Client Disconnected", id);
        },

        /**
         * Handles client state representing input from a client
         * @param {Input} input The input from the client
         * @param {Number} cT Client time in milliseconds when the input was sent
         */
        onClientState: function (input, cT) {
            this.ioConnection.ship.applyInput(input, cT);
        }
    };

});