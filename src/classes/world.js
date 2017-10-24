if (typeof(module) === "object") {
    var CollisionDetection = require('./collisionDetection');
    var CollisionSolver = require('./collisionSolver');
    var Entity = require('../entities/entity');
    var Loop = require('../utilities/loop');
    var MapGenerator = require('./mapGenerator');
    var Messages = require('./messages');

    var Ship = require('../entities/ship');
    var Bullet = require('../entities/bullet');
}

/**
 * @Class World
 * Represents the Game world. This runs the loops and tracks entities and collisions and players.
 */
var World = {

    /**
     * Initializes the game world
     * @param {Object} io The IO class for communicating
     * @param {Number} fps The Frames per second to run the world in
     * @param {Boolean} isClient If true, this world is being run on the client
     */
    init: function (io, fps, isClient) {
        this.io = io;
        this.isClient = isClient;

        // If this is the client, set up the rendering stage
        if (this.isClient) {
            var w = window,
                e = document.documentElement,
                g = document.getElementsByTagName('body')[0],
                x = w.innerWidth || e.clientWidth || g.clientWidth,
                y = w.innerHeight || e.clientHeight || g.clientHeight;

            this.renderer = PIXI.autoDetectRenderer(x, y, {resolution: 1});
            this.stage = new PIXI.Container();
            this.background = new PIXI.Container();
            this.gameStage = new PIXI.Container();
            this.stage.addChild(this.background);
            this.stage.addChild(this.gameStage);

            this.clientPlayer = null;
            this.$trackingEntity = null;

            document.getElementById("renderContainer").appendChild(this.renderer.view);
        }

        // Track entities, collision entities and players
        this.entities = {};
        this.collidables = [];
        this.players = {};

        // Initialize the loop
        Loop.init(fps, this.isClient);

        // Initialize the Map Generator
        MapGenerator.init(this);
    },

    /**
     * Start the Game loop
     */
    start: function () {
        Loop.start(this.tick.bind(this));
    },

    /**
     * Stop the game loop
     */
    stop: function () {
        Loop.stop();
    },

    /**
     * Displays FPS stats to the client
     */
    appendStats: function () {
        if (this.isClient) {
            var stats = new Stats();
            Loop.trackStats(stats);
            stats.setMode(0); // 0: fps, 1: ms, 2: mb
            stats.domElement.style.position = 'absolute';
            stats.domElement.style.left = '0px';
            stats.domElement.style.top = '0px';
            document.body.appendChild(stats.domElement);
        }
    },

    /**
     * Loads a map by name
     * @param {String} mapName
     * @returns {exports.pending.promise|*|defer.promise|promise|Q.promise}
     */
    loadMap: function (mapName) {
        return MapGenerator.loadMap(mapName);
    },

    /**
     * Gets the current state of each tracked entity to be sent to the client.
     * @returns {Array} An array representing the state of each entity
     */
    getGameState: function () {
        var state = [];
        var id;
        for (id in this.entities) {
            if (this.entities.hasOwnProperty(id)) {
                state.push(this.entities[id].getState());
            }
        }
        return state;
    },

    /**
     * Applies the state as sent by the server to the client entities.
     * @param {Array} state The game state
     * @param {Number} sT The server time when the state was sent in milliseconds
     */
    applyState: function (state, sT) {
        if (this.isClient) {
            var cT = (new Date()).getTime();
            var dT = cT - sT;

            var i;
            var x;
            var y;
            var bullet;
            var newPlayer;
            var bulletListener = function () {
                World.stopTrackingCollisions(this);
                World.removeEntity(this);
            };

            for (i = 0; i < state.length; i++) {
                if (this.entities[state[i][0]]) {

                    // Update entities. Do not update bullets since they are constant velocity
                    if (state[i][1] !== Entity.TYPE.BULLET) {
                        this.entities[state[i][0]].applyState(state[i], sT);
                    }

                } else {

                    // Spawn any new bullets
                    if (state[i][1] === Entity.TYPE.BULLET) {
                        x = state[i][2] + (state[i][7] * dT / 1000);
                        y = state[i][3] + (state[i][8] * dT / 1000);
                        bullet = new Bullet(x, y, state[i][4], state[i][7], state[i][8], state[i][0]);
                        bullet.render(this.gameStage);
                        this.addEntity(bullet);
                        this.trackCollisions(bullet);
                        bullet.on(bullet.events.DESTROY, bulletListener.bind(bullet.$id));
                    }

                    if (state[i][1] === Entity.TYPE.SHIP) {
                        newPlayer = this.addPlayer(state[i][0]);
                        newPlayer.applyState(state[1], sT);
                    }
                }
            }
        }
    },

    /**
     * Adds a player to the world
     * @param id The ID of the player
     * @param {Boolean} isClientPlayer If true, this is the client's player and it should be tracked by the camera
     * @returns {Ship} The ship that represents the player
     */
    addPlayer: function (id, isClientPlayer) {
        var ship = new Ship(0, 0, id);

        // If an ID was not provided, set it here.
        id = id || ship.$id;

        this.players[id] = ship;

        this.trackCollisions(ship);
        this.addEntity(ship);

        ship.on(ship.events.SPAWN_BULLET, function (bullet) {
            World.trackCollisions(bullet);
            World.addEntity(bullet);
            bullet.on(bullet.events.DESTROY, function () {
                World.stopTrackingCollisions(bullet.$id);
                World.removeEntity(bullet.$id);
            });
        });
        ship.on(ship.events.DESTROY, function () {
            World.stopTrackingCollisions(ship.$id);
            World.removeEntity(ship.$id);
        });

        if (this.isClient) {
            ship.render(this.gameStage);

            if (isClientPlayer === true) {
                this.clientPlayer = ship;
                this.trackPlayer(id);
            }
        }

        return ship;
    },

    /**
     * Removes a player from the world
     * @param id The ID of the player
     */
    removePlayer: function (id) {
        var ship = this.players[id];
        if (ship) {
            ship.destroy();
        }
        delete this.players[id];
    },

    /**
     * Tracks a player with the camera
     * @param id The ID of the player
     */
    trackPlayer: function (id) {
        if (this.isClient && this.players[id]) {
            this.$trackingEntity = this.players[id];
        }
    },

    /**
     * Tracks an entity. This advances the entity's physics each frame
     * @param {Entity} entity
     */
    addEntity: function (entity) {
        if (entity instanceof Entity) {
            this.entities[entity.$id] = entity;
        }
    },

    /**
     * Stops tracking an entity
     * @param id The ID of the Entity
     */
    removeEntity: function (id) {
        if (id) {
            delete this.entities[id];
        }
    },

    /**
     * Tracks when this entity collides with another entity
     * @param {Entity} entity
     */
    trackCollisions: function (entity) {
        if (entity instanceof Entity && entity.bounds) {
            this.collidables.push(entity);
        }
    },

    /**
     * Stops tracking collisions for a given Entity
     * @param id The ID of the Entity
     */
    stopTrackingCollisions: function (id) {
        var i;
        for (i = 0; i < this.collidables.length; i++) {
            if (this.collidables[i].$id === id) {
                this.collidables.splice(i, 1);
                break;
            }
        }
    },

    /**
     * The frame logic for the loop.
     * @param {Number} dT Delta time in milliseconds since the last frame
     * @param {Boolean} physicsLoop True if this is within the physics loop. False if within the rendering loop.
     */
    tick: function (dT, physicsLoop) {

        // Only check collisions and advance entity physics if within the physics loop
        if (physicsLoop) {

            // Advance all world entities
            var id;
            for (id in this.entities) {
                if (this.entities.hasOwnProperty(id)) {
                    this.entities[id].tick(dT);
                }
            }

            // Track Collisions
            if (this.collidables.length > 1) {
                var a;
                var b;

                // Test every item against every other item to see if there are collisions.
                for (a = 0; a < this.collidables.length; a++) {
                    if (this.collidables[a].bounds.canCollide) {
                        for (b = a + 1; b < this.collidables.length; b++) {
                            if (a !== b) {
                                if (CollisionDetection.test(this.collidables[a].bounds, this.collidables[b].bounds)) {

                                    // A collision was detected, determine the outcome of the collision.
                                    // Only allow "terminal" results if this is on the server (should not show
                                    // explosions until the server says something exploded)
                                    CollisionSolver.solve(this.collidables[a], this.collidables[b], !this.isClient);
                                }
                            }
                        }
                    }
                }
            }

            // If this is the client, send the client input state to the server. If this is the server, send the game
            // state to all the clients
            if (this.isClient) {
                this.io.send(Messages.CLIENT_STATE, Input);
            } else {
                this.io.broadcast(Messages.GAME_STATE, this.getGameState());
            }
        }

        // If an entity is currently being tracked, move the camera and update the background
        if (this.$trackingEntity) {
            var w = this.renderer.width;
            var h = this.renderer.height;

            var oldPosX = World.gameStage.position.x;
            var oldPosY = World.gameStage.position.y;
            this.gameStage.position.x = (w/2) - this.$trackingEntity.position.x;
            this.gameStage.position.y = (h/2) - this.$trackingEntity.position.y;
            MapGenerator.updateBackgroundElements({x: this.gameStage.position.x - oldPosX, y: this.gameStage.position.y - oldPosY});
        }

        // If this is the client, render the scene
        if (this.isClient) {
            this.renderer.render(this.stage);
        }
    }
};

if (typeof(module) === "object") {
    module.exports = World;
}