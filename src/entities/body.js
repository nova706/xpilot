if (typeof(module) === "object") {
    var Class = require('../utilities/classFramework');
    var Entity = require('./entity');
    var Vector = require('../utilities/vector');
}

/**
 * @Class Body
 * @Augments Entity
 * Represents an object that has velocity and can have forces applied to it.
 */
var Body = Class.create(Entity, function ($parent) {

    return {

        /**
         * Creates a new body
         * @param {Number} x X Position
         * @param {Number} y Y Position
         * @param {Number} a Angle
         * @param {Number} m Mass
         * @param {Number} d Drag
         * @param id The Entity's ID
         */
        init: function (x, y, a, m, d, id) {
            $parent.init.call(this, x, y, a, m, id);

            this.type = Entity.TYPE.BODY;

            this.drag = d || 0.1;
            this.velocity = new Vector();
            this.acceleration = new Vector();
        },

        /**
         * Applies an acceleration force to an object (pixels per second^2)
         * @param {Number} x X Acceleration
         * @param {Number} y Y Acceleration
         */
        applyForce: function (x, y) {
            this.acceleration.add(x, y);
        },

        /**
         * Brings the Body to a rest
         */
        rest: function () {
            this.velocity.zero();
            this.acceleration.zero();
        },

        /**
         * Gets the state of the Body
         * @returns {Array}
         */
        getState: function () {
            var state = $parent.getState.call(this);
            state.push(this.drag, this.velocity.x, this.velocity.y, this.acceleration.x, this.acceleration.y);
            return state;
        },

        /**
         * Applies the server state to the body. This uses client prediction to guess where the server position is since
         * the time that the server processed the state.
         * @param {Array} state
         * @param {Number} sT Server time in milliseconds when the state was processed
         * @Override
         */
        applyState: function (state, sT) {
            // DO NOT CALL PARENT. This method is meant to override

            var currentTime = (new Date()).getTime();
            var lastTime = sT - this.$lastTick;
            var deltaTime = sT - currentTime;
            var timePoint = deltaTime / lastTime;

            // Seconds elapsed since the server has processed the input
            var s = (currentTime - this.$lastTick) / 1000;
            var aS = deltaTime / -1000;

            // Advance the client's position using the velocity and acceleration from the server
            var predictedX = this.position.x;
            var predictedY = this.position.y;
            var predictedVX = this.velocity.x;
            var predictedVY = this.velocity.y;

            // Advance the server's position using the velocity and acceleration from the server
            var adjustedX = state[2];
            var adjustedY = state[3];
            var adjustedVX = state[6];
            var adjustedVY = state[8];

            // Apply drag to the client server velocity predictions
            if (state[6] > 0) {
                predictedVX -= state[6] * state[7] * s;
                predictedVY -= state[6] * state[8] * s;
                adjustedVX -= state[6] * state[7] * aS;
                adjustedVY -= state[6] * state[8] * aS;
            }

            // Add the client acceleration to the client and server velocity predictions
            predictedVX += (state[9] * s);
            predictedVY += (state[10] * s);
            adjustedVX += (state[9] * aS);
            adjustedVY += (state[10] * aS);

            // Adjust the positions of the client and server predictions based on the predicted velocity and elapsed time
            predictedX += predictedVX * s / 2;
            predictedY += predictedVY * s / 2;
            adjustedX += adjustedVX * aS / 2;
            adjustedY += adjustedVY * aS / 2;

            // Interpolate the position between the last known server position and the client's predicted position
            var lerpX = Vector.lerp(state[2], predictedX, timePoint);
            var lerpY = Vector.lerp(state[3], predictedY, timePoint);

            // If the interpolated value is out of range of the server predicted value, use the server predicted value instead
            if (Math.abs(adjustedX - lerpX) > this.$lerpThreshold) {
                lerpX = adjustedX;
            }
            if (Math.abs(adjustedY - lerpY) > this.$lerpThreshold) {
                lerpY = adjustedY;
            }

            this.moveTo(lerpX, lerpY);
            this.rotateTo(state[4]);
            this.mass = state[5];

            this.drag = state[6];
            this.velocity.set(state[7], state[8]);
            this.acceleration.set(state[9], state[10]);
        },

        /**
         * The physics loop logic
         * @param {Number} dT Delta Time in milliseconds
         */
        tick: function (dT) {
            $parent.tick.apply(this, arguments);

            var s = dT / 1000;

            if (this.drag > 0) {
                this.velocity.subtract(this.drag * this.velocity.x * s, this.drag * this.velocity.y * s);
            }

            this.velocity.add(this.acceleration.x * s / 2, this.acceleration.y * s / 2);
            var x = this.velocity.x * s;
            var y = this.velocity.y * s;
            this.velocity.add(this.acceleration.x * s / 2, this.acceleration.y * s / 2);

            this.acceleration.zero();

            // Only move the body if its delta position is above the threshold
            if (Math.abs(x) > Body.MIN_VELOCITY_THRESHOLD || Math.abs(y) > Body.MIN_VELOCITY_THRESHOLD) {
                this.moveBy(x, -y);
            }
        }
    };

});

Body.MIN_VELOCITY_THRESHOLD = 0.05;

if (typeof(module) === "object") {
    module.exports = Body;
}