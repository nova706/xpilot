/**
 * @Class Particle
 * Represents a particle emitted from a particle emitter
 */
var Particle = Class.create(function () {

    /**
     * Gets a random number between a range including 0 and negative numbers
     * @param {Number} min
     * @param {Number} max
     * @returns {Number} The random number
     */
    var getRandom = function (min, max) {
        max = (max || max === 0) ? max : 10;
        min = min || 0;
        return (Math.random() * (max - min + 1)) + min;
    };

    /**
     * Gets the slope between two points
     * @param {Number} x1
     * @param {Number} y1
     * @param {Number} x2
     * @param {Number} y2
     * @returns {number} The slope
     */
    var getSlope = function (x1, y1, x2, y2) {
        return (-y2 + y1) / (x2 - x1);
    };

    return {

        /**
         * Creates a particle that can be emitted
         * @param {Number} x X Position
         * @param {Number} y Y Position
         * @param {Object} options
         */
        init: function (x, y, options) {
            options = options || {};

            this.sprite = new PIXI.Sprite(options.texture || Textures.particle1);
            this.sprite.anchor = new PIXI.Point(0.5, 0.5);
            this.sprite.visible = false;
            this.sprite.tint = options.tint || 0xFFFFFF;
            this.sprite.rotation = getRandom(0, 7);

            this.alive = false;
            this.emitFrom = new Vector(x || 0, y || 0);
            this.emitVelocity = new Vector(0, 0);

            this.spread = options.spread || 20;
            this.velocityVariance = options.velocityVariance || 50;
            this.positionVariance = options.positionVariance || 5;
            this.maxLife = options.maxLife || 3;
            this.minLife = options.minLife || 0.5;

            this.startingAlpha = options.startingAlpha || 1;
            this.endingAlpha = options.endingAlpha || 0;
            this.startingScale = options.startingScale || 0.5;
            this.endingScale = options.endingScale || 0.4;

            this.lifeSpan = getRandom(this.minLife, this.maxLife);
            this.alphaSlope = getSlope(0, this.endingAlpha, this.lifeSpan, this.startingAlpha);
            this.scaleSlope = getSlope(0, this.endingScale, this.lifeSpan, this.startingScale);

            this.$rotationSpeed = getRandom(-0.01,0.01);
            this.$velocityVariance = new Vector();
            this.$starting = false;
            this.$velocity = new Vector(0, 0);
            this.$startTimer = null;
            this.$burst = false;

            this.restart();
            this.$currentLife = this.lifeSpan + 1;
        },

        /**
         * All particles are reused rather than creating new particles. This resets the particle so it can be reused by
         * the emitter.
         */
        restart: function () {
            this.$currentLife = 0;
            this.$velocity.from(this.emitVelocity);

            var spreadX = getRandom(-this.spread, this.spread);
            var spreadY = getRandom(-this.spread, this.spread);
            var velocityVariance = getRandom(-this.velocityVariance, this.velocityVariance);
            this.$velocityVariance.from(this.$velocity).normalize().multiplyScalar(velocityVariance);

            this.$velocity.add(this.$velocityVariance.x, -this.$velocityVariance.y);
            this.$velocity.add(spreadX, spreadY);

            this.sprite.position.x = this.emitFrom.x + getRandom(-this.positionVariance, this.positionVariance);
            this.sprite.position.y = this.emitFrom.y + getRandom(-this.positionVariance, this.positionVariance);
            this.sprite.scale.x = this.startingScale;
            this.sprite.scale.y = this.startingScale;
            this.sprite.alpha = this.startingAlpha;
        },

        /**
         * Set the position and velocity to emit from
         * @param {Number} x X Position
         * @param {Number} y Y Position
         * @param {Number} xV X Velocity
         * @param {Number} yV Y Velocity
         */
        update: function (x, y, xV, yV) {
            this.emitFrom.set(x, y);
            this.emitVelocity.set(xV, yV);
        },

        /**
         * Starts the particle loop. Once the particle "expires" it will be re-spawned until stop is called.
         * Each particle randomly starts so they appear sporadic rather than "bursting"
         */
        start: function () {
            if (!this.alive && !this.$starting) {
                this.$starting = true;
                var self = this;
                var delay = getRandom(0, this.lifeSpan * 500);
                this.$startTimer = setTimeout(function () {
                    self.alive = true;
                    self.$starting = false;
                }, delay);
            }
        },

        /**
         * Stops the particle loop. The particle will finish "dieing" and will not restart
         */
        stop: function () {
            clearTimeout(this.$startTimer);
            this.$starting = false;
            this.die();
        },

        /**
         * Immediately fires this particle from a position at a velocity
         * @param {Number} x X Position
         * @param {Number} y Y Position
         * @param {Number} xV X Velocity
         * @param {Number} yV Y Velocity
         */
        burst: function (x, y, xV, yV) {
            this.update(x, y, xV, yV);
            this.restart();
            this.alive = true;
            this.$burst = true;
        },

        /**
         * Expires the particle
         */
        die: function () {
            this.alive = false;
            this.$burst = false;
        },

        /**
         * Destroys and removes the particle from the stage
         */
        destroy: function () {
            this.die();

            if (this.sprite) {
                this.sprite.destroy();
                delete this.sprite;
            }
        },

        /**
         * The particle physics loop. Advances the particle properties (position, size, rotation, alpha)
         * @param {Number} dT The Delta time in milliseconds
         */
        tick: function (dT) {
            if (this.$currentLife < this.lifeSpan) {

                var s = dT / 1000;

                // "Age" the particle
                this.$currentLife += s;

                // update the visibility, position, alpha, scale and rotation
                this.sprite.visible = true;
                this.sprite.position.x += this.$velocity.x * s;
                this.sprite.position.y += this.$velocity.y * s;
                this.sprite.alpha = (this.alphaSlope * this.$currentLife) + this.startingAlpha;
                var scale = (this.scaleSlope * this.$currentLife) + this.startingScale;
                this.sprite.scale.x = scale;
                this.sprite.scale.y = scale;
                this.sprite.rotation += this.$rotationSpeed;

            } else if (this.alive && !this.$burst) {
                // If the emitter is still alive, and this is not in burst mode, re-spawn the particle
                this.restart();
            } else {
                // If the particle has "died" and should not be re-spawned, hide it
                this.sprite.visible = false;
            }
        }
    };

});