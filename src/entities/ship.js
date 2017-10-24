if (typeof(module) === "object") {
    var Class = require('../utilities/classFramework');

    var Body = require('./body');
    var BoundingArea = require('./boundingArea');
    var Entity = require('./entity');
    var Vector = require('../utilities/vector');

    var Bullet = require('./bullet');
}

/**
 * @Class Ship
 * @Augments Body
 * A Ship entity
 */
var Ship = Class.create(Body, function ($parent) {

    var emitterRotation = new Vector(0, 5);
    var bulletRotation = new Vector(0, 20);

    /**
     * Updates the sprite and emitters when the position changes
     */
    var updateClientPosition = function () {
        if (this.sprite) {
            this.sprite.position.x = this.position.x;
            this.sprite.position.y = this.position.y;
            this.sprite.rotation = this.direction;

            emitterRotation.rotateTo(this.direction + (Math.PI / 2));
            this.emitter.position.x = this.position.x + emitterRotation.x;
            this.emitter.position.y = this.position.y + emitterRotation.y;

            this.explosionEmitter.position.x = this.position.x;
            this.explosionEmitter.position.y = this.position.y;
        }
    };

    /**
     * Update the bounding area when the position changes
     */
    var updateBounds = function () {
        this.bounds.x = this.position.x;
        this.bounds.y = this.position.y;
    };

    return {

        /**
         * Creates a new ship
         * @param {Number} x X Position
         * @param {Number} y Y Position
         * @param id The Entity ID
         */
        init: function (x, y, id) {
            $parent.init.call(this, x, y, 0, 4, 0.1, id);

            this.type = Entity.TYPE.SHIP;

            this.respawnTime = 3000;
            this.thrustVelocity = 120;
            this.fireRate = 200;
            this.bulletVelocity = 400;
            this.withstandForce = 7000;

            this.bounds = new BoundingArea(this.position.x, this.position.y, 15, 0x0001, 0xFFFF);

            this.$thrusting = false;
            this.$reloadTime = (new Date()).getTime();
            this.$bulletVelocity = new Vector();
            this.$respawnTimer = null;

            this.events.SPAWN_BULLET = "SPAWN_BULLET";
        },

        /**
         * Render the sprite and emitters to a target
         * @param target
         */
        render: function (target) {
            this.renderTarget = target;
            this.sprite = new PIXI.Sprite(Textures.ship2);
            this.sprite.anchor = new PIXI.Point(0.5, 0.5);
            this.sprite.position.x = this.position.x;
            this.sprite.position.y = this.position.y;

            this.emitter = new ParticleEmitter(this.position.x, this.position.y + 0.5, {
                startingAlpha: 1,
                endingAlpha: 0.2,
                startingScale: 0.15,
                endingScale: 0.05,
                spread: 10,
                velocityVariance: 0,
                maxLife: 3,
                maxParticles: 200,
                tint: 0xf8eca8
            });

            this.explosionEmitter = new ParticleEmitter(this.position.x, this.position.y, {
                texture: Textures.particle2,
                startingAlpha: 0.5,
                startingScale: 1,
                endingScale: 0.5,
                spread: 80,
                maxLife: 5,
                maxParticles: 400,
                tint: 0xb2ffff
            });

            target.addChild(this.explosionEmitter.container);
            target.addChild(this.emitter.container);
            target.addChild(this.sprite);
        },

        /**
         * Apply thrust to the ship
         */
        applyThrust: function () {
            var x = this.thrustVelocity * Math.sin(this.direction);
            var y = this.thrustVelocity * Math.cos(this.direction);
            this.applyForce(x, y);
            if (this.emitter) {
                this.emitter.emitting = true;
                this.emitter.velocity.set(-x / 2, y / 2);
            }
        },

        /**
         * Spawns a bullet
         */
        spawnBullet: function () {
            this.$bulletVelocity.set(0, this.bulletVelocity).rotateTo(this.direction + (Math.PI / 2)).add(-this.velocity.x, this.velocity.y);

            bulletRotation.rotateTo(this.direction - (Math.PI / 2));
            var x = this.position.x + bulletRotation.x;
            var y = this.position.y + bulletRotation.y;

            var bullet = new Bullet(x, y, this.direction, -this.$bulletVelocity.x, this.$bulletVelocity.y);

            if (this.renderTarget) {
                bullet.render(this.renderTarget);
            }

            this.emit(this.events.SPAWN_BULLET, bullet);
        },

        /**
         * Shoots bullets on regular intervals
         */
        shoot: function () {
            var now = (new Date()).getTime();
            if (this.$reloadTime < now) {
                this.spawnBullet();
                this.$reloadTime = now + this.fireRate;
            }
        },

        /**
         * @Override
         */
        moveBy: function (deltaX, deltaY) {
            $parent.moveBy.apply(this, arguments);
            updateBounds.call(this);
            updateClientPosition.call(this);
        },

        /**
         * @Override
         */
        moveTo: function (x, y) {
            $parent.moveTo.apply(this, arguments);
            updateBounds.call(this);
            updateClientPosition.call(this);
        },

        /**
         * @Override
         */
        rotateBy: function (radians) {
            $parent.rotateBy.apply(this, arguments);
            updateClientPosition.call(this);
        },

        /**
         * @Override
         */
        rotateTo: function (radians) {
            $parent.rotateTo.apply(this, arguments);
            updateClientPosition.call(this);
        },

        /**
         * Respawn the ship
         */
        respawn: function () {
            clearTimeout(this.$respawnTimer);
            this.rest();
            this.moveTo(this.startingPosition.x, this.startingPosition.y);
            this.rotateTo(this.startingDirection);

            if (this.sprite) {
                this.sprite.visible = true;
            }

            this.drag = 0.1;
            this.bounds.canCollide = true;
            this.alive = true;
        },

        /**
         * Destroy the ship and cause it to explode
         */
        die: function () {
            if (this.alive) {

                this.alive = false;
                this.$thrusting = false;
                this.drag = 0.5;

                this.bounds.canCollide = false;

                if (this.sprite) {
                    this.emitter.emitting = false;

                    this.explosionEmitter.velocity.set(this.velocity.x, -this.velocity.y);
                    this.explosionEmitter.position.x = this.position.x;
                    this.explosionEmitter.position.y = this.position.y;
                    this.explosionEmitter.burst();

                    this.sprite.visible = false;
                } else {
                    var self = this;
                    this.$respawnTimer = setTimeout(function () {
                        self.respawn();
                    }, this.respawnTime);
                }
            }
        },

        /**
         * Gets the ship's state
         * @returns {Array}
         */
        getState: function () {
            var state = $parent.getState.call(this);
            state.push(this.alive ? 1 : 0, this.$thrusting ? 1 : 0);
            return state;
        },

        /**
         * Applies the server state
         * @param {Array} state
         * @param {Number} sT Server time in milliseconds when the state was processed
         */
        applyState: function (state, sT) {
            var alive = (state[11] === 1);

            // Only need to interpolate position if the ship is not destroyed
            if (alive) {
                $parent.applyState.call(this, state, sT);
            }

            if (alive) {
                if (this.sprite) {
                    this.sprite.visible = true;
                }

                this.drag = 0.1;
                this.bounds.canCollide = true;
                this.alive = true;
            }
            if (this.alive !== alive && alive === false) {
                this.die();
            }

            this.$thrusting = (state[12] === 1);
        },

        /**
         * Applies input from the client to the ship
         * @param {Input} input
         * @param {Number} cT Client time when the input was sent
         */
        applyInput: function (input, cT) {
            this.input = input;
        },

        /**
         * Destroys the ship, its sprite and emitters
         */
        destroy: function () {
            this.rest();

            if (this.sprite) {
                this.renderTarget.removeChild(this.sprite);
                this.renderTarget.removeChild(this.emitter.container);
                this.renderTarget.removeChild(this.explosionEmitter.container);

                this.emitter.destroy();
                this.explosionEmitter.destroy();
                this.sprite.destroy();

                delete this.emitter;
                delete this.explosionEmitter;
                delete this.sprite;
            }

            $parent.destroy.call(this);
        },

        /**
         * Physics loop logic
         * @param {Number} dT Delta time in milliseconds
         */
        tick: function (dT) {
            $parent.tick.apply(this, arguments);

            if (this.alive && this.input) {
                if (this.input.left && !this.input.right) {
                    this.rotateBy(-0.15);
                } else if (this.input.right && !this.input.left) {
                    this.rotateBy(0.15);
                }

                if (this.input.up) {
                    this.applyThrust();
                    this.$thrusting = true;
                } else {
                    this.$thrusting = false;
                }

                if (this.input.space) {
                    this.shoot();
                }
            }

            if (this.emitter) {
                this.emitter.emitting = this.$thrusting;
                this.emitter.tick(dT);
                this.explosionEmitter.tick(dT);
            }
        }
    };

});

if (typeof(module) === "object") {
    module.exports = Ship;
}