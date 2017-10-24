/**
 * @Class IO
 * Handles communication to the web socket layer on the server
 */
var IO = {
    wss: null
};

/**
 * Connects to the web socket layer on the server.
 * @param {Function} callback Called when the connection has been opened
 */
IO.connect = function (callback) {
    var host = window.document.location.host.replace(/:.*/, '');
    this.ws = new WebSocket('ws://' + host + ':3000');

    this.ws.onopen = callback;
    this.ws.onerror = this.onError.bind(this);
    this.ws.onmessage = this.onMessage.bind(this);
};

/**
 * Sends a message to the server
 * @param {Messages} messageId The Message ID
 * @param {Object} data Data to be sent in the message
 */
IO.send = function (messageId, data) {
    if (this.ws.readyState === 1) {
        var message = {
            i: messageId,
            d: data,
            t: (new Date()).getTime()
        };
        message = JSON.stringify(message);

        this.ws.send(message);
    }
};

/**
 * Pings the server to ask it to respond with the current server state
 */
IO.getServerState = function () {
    this.send(Messages.SERVER_STATE);
};

/**
 * Handles client web socket errors
 * @param e Exception
 */
IO.onError = function (e) {
    console.log('WebSocket Error: ' + e);
};

/**
 * Handles server messages
 * @param e Event
 */
IO.onMessage = function (e) {
    if (!e.data) {
        return;
    }

    var data = JSON.parse(e.data);

    switch (data.i) {
    case Messages.GAME_STATE:
        MessageHandler.onGameState(data.d, data.t);
        break;
    case Messages.SERVER_STATE:
        MessageHandler.onServerState(data.d, data.t);
        break;
    case Messages.CLIENT_CONNECTED:
        MessageHandler.onClientConnected(data.d, data.t);
        break;
    case Messages.CLIENT_DISCONNECTED:
        MessageHandler.onClientDisconnected(data.d, data.t);
        break;
    case Messages.CLIENT_STATE:
        MessageHandler.onClientState(data.d, data.t);
        break;
    }
};