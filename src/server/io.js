var Class = require('../utilities/classFramework');
var WebSocketServer = require('ws').Server;
var IOConnection = require('./ioConnection');

/**
 * @Class IO
 * Sends and receives Web Socket Messages
 */
var IO = {};

/**
 * Initializes the web socket connection
 * @param server The express server
 */
IO.init = function (server) {
    this.wss = new WebSocketServer({server: server});
    this.wss.on('connection', function (connection) {
        return new IOConnection(this, connection);
    }.bind(this));
};

/**
 *
 * @param {Messages} messageId
 * @param {Object} data
 * @param ignore
 */
IO.broadcast = function (messageId, data, ignore) {
    var message = {
        i: messageId,
        d: data,
        t: (new Date()).getTime()
    };
    message = JSON.stringify(message);

    this.wss.clients.forEach(function each(client) {
        if (client.readyState === 1 && client.id !== ignore) {
            client.send(message);
        }
    });
};

module.exports = IO;