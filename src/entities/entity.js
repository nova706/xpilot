if (typeof(module) === "object") {
    var Class = require('../utilities/classFramework');
    var EventEmitter = require('./eventEmitter');
    var Vector = require('../utilities/vector');
}

/**
 * @Class Entity
 * @Augments EventEmitter
 */
var Entity = Class.create(EventEmitter, function ($parent) {

    /**
     * Generates a unique ID
     * @returns {number}
     */
    var getId = function () {
        Entity.CURRENT_ID++;
        return Entity.CURRENT_ID;
    };

    return {

        /**
         * Creates a new Entity
         * @param {Number} x X Position
         * @param {Number} y Y Position
         * @param {Number} a Angle
         * @param {Number} m Mass
         * @param id The Entity ID
         */
        init: function (x, y, a, m, id) {
            $parent.init.call(this);

            this.$id = id || getId();
            this.type = Entity.TYPE.ENTITY;
            this.bounds = null;
            this.alive = true;
            this.type = null;

            x = this.isNum(x) ? x : 0;
            y = this.isNum(y) ? y : 0;
            a = this.isNum(a) ? a : 0;
            m = this.isNum(m) ? m : 1;

            this.position = {
                x: x,
                y: y
            };
            this.direction = a;
            this.startingPosition = {
                x: x,
                y: y
            };
            this.startingDirection = a;

            this.mass = m || 1;
            this.withstandForce = 0;

            this.$lastTick = 0;
            this.$lerpThreshold = 50;

            this.events.POSITION_CHANGED = "POSITION_CHANGED";
            this.events.DIRECTION_CHANGED = "DIRECTION_CHANGED";
            this.events.DESTROY = "DESTROY";
        },

        /**
         * Move the entity by a given amount
         * @param {Number} deltaX
         * @param {Number} deltaY
         */
        moveBy: function (deltaX, deltaY) {
            var moved = false;
            if (this.isNum(deltaX) && deltaX !== 0) {
                this.position.x += deltaX;
                moved = true;
            } else {
                deltaX = 0;
            }
            if (this.isNum(deltaY) && deltaY !== 0) {
                moved = true;
                this.position.y += deltaY;
            } else {
                deltaY = 0;
            }
            if (moved) {
                this.emit(this.events.POSITION_CHANGED, this.position, {x: deltaX, y: deltaY});
            }
        },

        /**
         * Move the entity to a new position
         * @param {Number} x
         * @param {Number} y
         */
        moveTo: function (x, y) {
            var moved = false;
            var deltaX = 0;
            var deltaY = 0;

            if (this.isNum(x) && x !== this.position.x) {
                moved = true;
                deltaX = x - this.position.x;
                this.position.x = x;
            }
            if (this.isNum(y) && y !== this.position.y) {
                moved = true;
                deltaY = y - this.position.y;
                this.position.y = y;
            }
            if (moved) {
                this.emit(this.events.POSITION_CHANGED, this.position, {x: deltaX, y: deltaY});
            }
        },

        /**
         * Rotate the entity bya given angle
         * @param {Number} delta Angle in radians
         */
        rotateBy: function (delta) {
            if (this.isNum(delta) && delta !== 0) {
                this.direction += delta;
                this.emit(this.events.DIRECTION_CHANGED, this.direction, delta);
            }
        },

        /**
         * Rotate the entity to point in a given direction
         * @param {Number} r Angle in radians
         */
        rotateTo: function (r) {
            var delta = 0;
            if (this.isNum(r) && r !== this.direction) {
                delta = r - this.direction;
                this.direction = r;
            }
            if (delta !== 0) {
                this.emit(this.events.DIRECTION_CHANGED, this.direction, delta);
            }
        },

        /**
         * Check if the value is a number
         * @param n
         * @returns {Boolean}
         */
        isNum: function (n) {
            return this.isInt(n) || this.isFloat(n);
        },

        /**
         * Check if the value is a integer
         * @param n
         * @returns {Boolean}
         */
        isInt: function (n) {
            return n === +n && n === (n | 0);
        },

        /**
         * Check if the value is a float
         * @param n
         * @returns {Boolean}
         */
        isFloat: function (n) {
            return n === +n && n !== (n | 0);
        },

        /**
         * Find the distance between entities
         * @param {Entity} entity
         * @returns {Number}
         */
        distanceTo: function (entity) {
            if (entity instanceof Entity) {
                var dX = entity.position.x - this.position.x;
                var dY = entity.position.y - this.position.y;
                return Math.sqrt(dX * dX + dY * dY);
            }
            return null;
        },

        /**
         * Return the state of the entity
         * @returns {Array}
         */
        getState: function () {
            return [this.$id, this.type, this.position.x, this.position.y, this.direction, this.mass];
        },

        /**
         * Apply the server state to the entity
         * @param {Array} state
         * @param {Number} sT Server time in milliseconds
         */
        applyState: function (state, sT) {
            var cT = (new Date()).getTime();
            var lT = sT - this.$lastTick;
            var dT = sT - cT;
            var timePoint = dT / lT;

            // Interpolate the position between the predicate server position and the client's current position
            var adjustedX = Vector.lerp(this.position.x, state[2], timePoint);
            var adjustedY = Vector.lerp(this.position.y, state[3], timePoint);

            // If the value is off from what the server suggests it should be by a certain threshold, use the raw server value.
            if (Math.abs(state[2] - adjustedX) > this.$lerpThreshold) {
                adjustedX = state[2];
            }
            if (Math.abs(state[3] - adjustedY) > this.$lerpThreshold) {
                adjustedY = state[3];
            }

            this.moveTo(adjustedX, adjustedY);
            this.rotateTo(state[4]);
            this.mass = state[5];
        },

        /**
         * Destroys the entity
         */
        destroy: function () {
            this.emit(this.events.DESTROY);
            $parent.destroy.call(this);
        },

        /**
         * Main physics loop logic
         */
        tick: function () {
            this.$lastTick = (new Date()).getTime();
        }
    };

});

Entity.CURRENT_ID = 0;

Entity.TYPE = {
    "ENTITY": "E",
    "BODY": "O",
    "BULLET": "B",
    "GRAVITY_WELL": "G",
    "SHIP": "S",
    "WALL": "W"
};

if (typeof(module) === "object") {
    module.exports = Entity;
}