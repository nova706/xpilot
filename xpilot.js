var IO = require('./src/server/io');
var State = require('./src/server/state');
var World = require('./src/classes/world');
var express = require('express');
var app = express();

app.use(express.static(__dirname + '/src'));
app.use('/maps', express.static(__dirname + '/maps'));
app.use('/assets', express.static(__dirname + '/assets'));

var server = app.listen(3000, function () {
    console.log('Example app listening on port 3000');

    IO.init(server);

    World.init(IO, 45, false);

    State.setMap("testMap");
    State.setGameType(State.GAME_TYPE.DEATHMATCH);
    State.startGame();

    World.loadMap(State.currentMap);
    World.start();
});