if (typeof(module) === "object") {
    var Class = require('../utilities/classFramework');
}

/**
 * @Class Bounding
 * Represents a collision zone
 */
var Bounding = Class.create(function () {

    return {

        /**
         * Create a new bounding instance
         * @param {Number} x X Position
         * @param {Number} y Y Position
         * @param group Hex code
         * @param mask Bitwise hex code
         */
        init: function (x, y, group, mask) {
            this.x = x || 0;
            this.y = y || 0;

            this.collisionGroup = group || 0x0000;
            this.collisionMask = mask || 0x0000;

            this.canCollide = true;
        }

    };

});

if (typeof(module) === "object") {
    module.exports = Bounding;
}