if (typeof(module) === "object") {
    var Class = require('../utilities/classFramework');
    var Bounding = require('./bounding');
}

/**
 * @Class BoundingBox
 * @Augments Bounding
 * Represents a Rectangular Bounding area
 */
var BoundingBox = Class.create(Bounding, function ($parent) {

    return {

        /**
         * Create a new BoundingBox
         * @param {Number} x X position
         * @param {Number} y Y Position
         * @param {Number} w Width
         * @param {Number} h Height
         * @param group Hex code
         * @param mask Bitwise hex code
         */
        init: function (x, y, w, h, group, mask) {
            $parent.init.call(this, x, y, group, mask);

            this.w = w || 1;
            this.h = h || 1;
        }

    };

});

if (typeof(module) === "object") {
    module.exports = BoundingBox;
}