if (typeof(module) === "object") {
    var Q = require('../lib/q/q');
    var GravityWell = require('../entities/gravityWell');
    var Wall = require('../entities/wall');
}

/**
 * @Class MapGenerator
 * Loads and generates maps. This adds map objects to the world.
 */
var MapGenerator = {};

/**
 * Initialize the generator with the world which should render the map
 * @param {World} world
 */
MapGenerator.init = function (world) {
    this.world = world;
};

/**
 * Loads a map by a given name
 * @param {String} mapName The name of the map to load
 * @returns {exports.pending.promise|*|defer.promise|promise|Q.promise} A promise resolved once the load is complete.
 */
MapGenerator.loadMap = function (mapName) {
    var dfd = Q.defer();

    // If this is on the client, perform an XHTMLHttpRequest to get the map JSON.
    if (this.world.isClient) {
        var self = this;
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState === 4) {
                if (xmlhttp.status === 200) {
                    var map = JSON.parse(xmlhttp.responseText);
                    dfd.notify(MapGenerator.LOADING_STAGE);
                    self.onLoad.call(self, map, dfd);
                }
                // TODO: Handle Failure
            }
        };
        xmlhttp.open("GET", mapName, true);
        xmlhttp.send();

        // Otherwise, use Node to require the JSON file.
    } else {
        var map = require('../../maps/' + mapName + '/map.json');
        this.onLoad(map, dfd);
    }

    return dfd.promise;
};

/**
 * Loads the map into the world.
 *
 * Multiple background elements can be applied to create a parallax effect
 *
 * @param {{background: Object, walls: Array, gravityWells: Array}} map The object representing the map JSON
 * @param {defer} dfd
 */
MapGenerator.onLoad = function (map, dfd) {

    // If this is the client, set the visual elements of the map
    if (this.world.isClient) {
        this.world.renderer.backgroundColor = map.background.color;

        // Create the grid texture. This texture moves at the same rate as the camera
        if (map.background.grid) {
            var gridTexture = PIXI.Texture.fromImage(map.background.grid);
            this.grid = new PIXI.extras.TilingSprite(gridTexture, this.world.renderer.width, this.world.renderer.height);
        }

        // Create the near texture and offset it to avoid seams. This texture moves slightly slower than the camera
        if (map.background.near) {
            var nearTexture = PIXI.Texture.fromImage(map.background.near);
            this.near = new PIXI.extras.TilingSprite(nearTexture, this.world.renderer.width, this.world.renderer.height);
            this.near.tilePosition = new PIXI.Point(200, 200);
        }

        // Create the mid texture and offset it to avoid seams. This texture moves much slower than the camera
        if (map.background.mid) {
            var midTexture = PIXI.Texture.fromImage(map.background.mid);
            this.mid = new PIXI.extras.TilingSprite(midTexture, this.world.renderer.width, this.world.renderer.height);
            this.mid.tilePosition = new PIXI.Point(500, 500);
        }

        // Create the far texture. This texture does not move with the camera
        if (map.background.far) {
            var farTexture = PIXI.Texture.fromImage(map.background.far);
            this.far = new PIXI.extras.TilingSprite(farTexture, this.world.renderer.width, this.world.renderer.height);
        }

        // Add the background elements to the scene
        this.world.background.removeChildren();
        if (this.near) {
            this.world.background.addChild(this.near);
        }
        if (this.mid) {
            this.world.background.addChild(this.mid);
        }
        if (this.far) {
            this.world.background.addChild(this.far);
        }
        if (this.grid) {
            this.world.background.addChild(this.grid);
        }
    }

    // Load Walls and other map objects into the World
    var i;

    if (map.walls) {
        var wallDef;
        var wall;
        for (i = 0; i < map.walls.length; i++) {
            wallDef = map.walls[i];
            wall = new Wall(wallDef[0], wallDef[1], wallDef[2]);
            this.world.trackCollisions(wall);
            if (this.world.isClient) {
                wall.render(this.world.gameStage);
            }
        }
    }

    if (map.gravityWells) {
        var gravityWellDef;
        var gravityWell;
        for (i = 0; i < map.gravityWells.length; i++) {
            gravityWellDef = map.gravityWells[i];
            gravityWell = new GravityWell(gravityWellDef[0], gravityWellDef[1], gravityWellDef[2]);
            this.world.trackCollisions(gravityWell);
            if (this.world.isClient) {
                gravityWell.render(this.world.gameStage);
            }
        }
    }

    dfd.resolve();
};

/**
 * When the game stage moves (the camera), move the background elements to create the parallax effect
 * @param {{x: Number, y: Number}} delta The delta of the position change of the stage
 */
MapGenerator.updateBackgroundElements = function (delta) {
    if (this.near) {
        this.near.tilePosition.x += delta.x / 3;
        this.near.tilePosition.y += delta.y / 3;
    }
    if (this.mid) {
        this.mid.tilePosition.x += delta.x / 4;
        this.mid.tilePosition.y += delta.y / 4;
    }
    if (this.grid) {
        this.grid.tilePosition.x += delta.x;
        this.grid.tilePosition.y += delta.y;
    }
};

MapGenerator.LOADING_STAGE = {
    "FETCHING": 0,
    "LOADING_TEXTURES": 1
};

if (typeof(module) === "object") {
    module.exports = MapGenerator;
}