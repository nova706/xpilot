if (typeof(module) === "object") {
    var Class = require('../utilities/classFramework');
    var Bounding = require('./bounding');
}

/**
 * @Class BoundingArea
 * @Augments Bounding
 * Represents a Circular Bounding area
 */
var BoundingArea = Class.create(Bounding, function ($parent) {

    return {

        /**
         * Create a new BoundingArea
         * @param {Number} x X position
         * @param {Number} y Y Position
         * @param {Number} r Radius
         * @param group Hex code
         * @param mask Bitwise hex code
         */
        init: function (x, y, r, group, mask) {
            $parent.init.call(this, x, y, group, mask);
            this.r = r || 1;
        }

    };

});

if (typeof(module) === "object") {
    module.exports = BoundingArea;
}