if (typeof(module) === "object") {
    var Class = require('./classFramework');
}

var Vector = Class.create(function () {

    return {

        init: function (x, y) {
            this.x = x || 0;
            this.y = y || 0;
        },

        set: function (x, y) {
            this.x = x || 0;
            this.y = y || 0;
            return this;
        },

        from: function (vector) {
            this.x = vector.x;
            this.y = vector.y;
            return this;
        },

        add: function (x, y) {
            if (arguments.length === 1 && x instanceof Vector) {
                this.x += x.x;
                this.y += x.y;
            } else {
                this.x += x;
                this.y += y;
            }
            return this;
        },

        subtract: function (x, y) {
            if (arguments.length === 1 && x instanceof Vector) {
                this.x -= x.x;
                this.y -= x.y;
            } else {
                this.x -= x;
                this.y -= y;
            }
            return this;
        },

        multiply: function (x, y) {
            if (arguments.length === 1 && x instanceof Vector) {
                this.x *= x.x;
                this.y *= x.y;
            } else {
                this.x *= x;
                this.y *= y;
            }
            return this;
        },

        multiplyScalar: function (v) {
            this.x *= v;
            this.y *= v;
            return this;
        },

        divide: function (x, y) {
            if (arguments.length === 1 && x instanceof Vector) {
                this.x /= x.x;
                this.y /= x.y;
            } else {
                this.x /= x;
                this.y /= y;
            }
            return this;
        },

        invert: function () {
            this.x *= -1;
            this.y *= -1;
            return this;
        },

        normalize: function () {
            var length = this.length();

            if (length === 0) {
                this.x = 0;
                this.y = 0;
            } else {
                this.divide(length, length);
            }

            return this;
        },

        zero: function () {
            this.x = 0;
            this.y = 0;
            return this;
        },

        rotate: function (angle) {
            var nx = (this.x * Math.cos(angle)) - (this.y * Math.sin(angle));
            var ny = (this.x * Math.sin(angle)) + (this.y * Math.cos(angle));
            this.x = nx;
            this.y = ny;
            return this;
        },

        rotateTo: function (angle) {
            return this.rotate(angle - this.angle());
        },

        lerp: function (x, y, t) {
            if (arguments.length === 2 && x instanceof Vector) {
                this.x = Vector.lerp(this.x, x.x, y);
                this.y = Vector.lerp(this.y, x.y, y);
            } else {
                this.x = Vector.lerp(this.x, x, t);
                this.y = Vector.lerp(this.y, y, t);
            }

            return this;
        },

        dot: function (vec2) {
            if (vec2) {
                return this.x * vec2.x + this.y * vec2.y;
            }
            return 0;
        },

        cross: function (vec2) {
            return (this.x * vec2.y ) - (this.y * vec2.x);
        },

        angle: function () {
            return Math.atan2(this.y, this.x);
        },

        lengthSq: function () {
            return this.x * this.x + this.y * this.y;
        },

        length: function () {
            return Math.sqrt(this.lengthSq());
        },

        isEqualTo: function (vec2) {
            return this.x === vec2.x && this.y === vec2.y;
        },

        clone: function () {
            return new Vector(this.x, this.y);
        }

    };

});

Vector.lerp = function (p, n, t) {
    var $t = Number(t);
    $t = (Math.max(0, Math.min(1, $t)));
    return (p + $t * (n - p));
};

if (typeof(module) === "object") {
    module.exports = Vector;
}