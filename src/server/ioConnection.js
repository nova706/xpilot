var Class = require('../utilities/classFramework');
var Messages = require('../classes/messages');
var MessageHandler = require('./messageHandler');
var World = require('../classes/world');

/**
 * @Class IOConnection
 * Represents a single client connection
 */
module.exports = Class.create(function () {

    return {

        /**
         * Initializes a client connection
         * @param {IO} io Communication channel to all clients
         * @param connection Web Socket client
         */
        init: function (io, connection) {
            this.io = io;
            this.connection = connection;
            this.messageHandler = new MessageHandler(this);

            this.connection.on('message', this.onMessage.bind(this));
            this.connection.on('close', this.destroy.bind(this));

            this.ship = World.addPlayer();
            this.playerId = this.ship.$id;
            this.connection.id = this.playerId;

            console.log('Client Connected');
            this.send(Messages.CLIENT_STATE, this.playerId);
            this.io.broadcast(Messages.CLIENT_CONNECTED, this.playerId, this.connection.id);
        },

        /**
         * Handles messages from the client
         * @param {Object} data The message data
         */
        onMessage: function (data) {
            if (!data) {
                return;
            }

            data = JSON.parse(data);

            switch (data.i) {
            case Messages.GAME_STATE:
                this.messageHandler.onGameState(data.d, data.t);
                break;
            case Messages.SERVER_STATE:
                this.messageHandler.onServerState(data.d, data.t);
                break;
            case Messages.CLIENT_CONNECTED:
                this.messageHandler.onClientConnected(data.d, data.t);
                break;
            case Messages.CLIENT_DISCONNECTED:
                this.messageHandler.onClientDisconnected(data.d, data.t);
                break;
            case Messages.CLIENT_STATE:
                this.messageHandler.onClientState(data.d, data.t);
                break;
            }
        },

        /**
         * Sends a message to the client
         * @param {Messages} messageId
         * @param {Object} data Data to send in the message
         */
        send: function (messageId, data) {
            var message = {
                i: messageId,
                d: data,
                t: (new Date()).getTime()
            };
            message = JSON.stringify(message);
            
            this.connection.send(message);
        },

        /**
         * Destroys the client connection
         */
        destroy: function () {
            console.log('Client Disconnected');
            this.io.broadcast(Messages.CLIENT_DISCONNECTED, this.playerId, this.connection.id);
            World.removePlayer(this.playerId);
        }

    };

});