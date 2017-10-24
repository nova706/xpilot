if (typeof(module) === "object") {
    var Bounding = require('../entities/bounding');
    var BoundingBox = require('../entities/boundingBox');
    var BoundingArea = require('../entities/boundingArea');
}

/**
 * @Class CollisionDetection
 * Detects collisions between two Bounding instances
 */
var CollisionDetection = {

    /**
     * Test to see if two Bounding instances have collided
     * @param {Bounding|BoundingArea|BoundingBox} a
     * @param {Bounding|BoundingArea|BoundingBox} b
     * @returns {boolean} True if the two have collided
     */
    test: function (a, b) {

        // Only bounding areas can collide.
        if (!(a instanceof Bounding) || !(b instanceof Bounding)) {
            return false;
        }

        // Bounding areas can be conditionally set to ignore collisions. Check if this flag is set.
        if (!a.canCollide || !b.canCollide) {
            return false;
        }

        // Check based on the bounding group and mask if the two objects should be allowed to collide.
        if ((a.collisionMask & b.collisionGroup) === 0 && (a.collisionGroup & b.collisionMask) === 0) {
            return false;
        }

        var aIsBox = a instanceof BoundingBox;
        var bIsBox = b instanceof BoundingBox;

        if (aIsBox && bIsBox) {
            return this.boxCollisionTest(a, b);
        }
        if (aIsBox && !bIsBox) {
            return this.boxAreaCollisionTest(b, a);
        }
        if (!aIsBox && !bIsBox) {
            return this.areaCollisionTest(a, b);
        }
        if (!aIsBox && bIsBox) {
            return this.boxAreaCollisionTest(a, b);
        }
    },

    /**
     * Test if two BoundingBox instances have collided
     * @param {BoundingBox} b1
     * @param {BoundingBox} b2
     * @returns {boolean} True, if the boxes have collided
     */
    boxCollisionTest: function (b1, b2) {
        return !!(b1.x < b2.x + b2.w &&
        b1.x + b1.w > b2.x &&
        b1.y < b2.y + b2.h &&
        b1.h + b1.y > b2.y);
    },

    /**
     * Test if two BoundingArea instances have collided
     * @param {BoundingArea} a1
     * @param {BoundingArea} a2
     * @returns {boolean} True, if the areas have collided
     */
    areaCollisionTest: function (a1, a2) {
        var dx = a1.x - a2.x;
        var dy = a1.y - a2.y;
        var distance = Math.sqrt(dx * dx + dy * dy);
        return distance < a1.r + a2.r;
    },

    /**
     * Test if a BoundingArea instance has collided with a BoundingBox instance
     * @param {BoundingArea} a
     * @param {BoundingBox} b
     * @returns {boolean} True, if the two have collided
     */
    boxAreaCollisionTest: function (a, b) {
        var distX = Math.abs(a.x - b.x - b.w / 2);
        var distY = Math.abs(a.y - b.y - b.h / 2);

        if (distX > (b.w / 2 + a.r)) {
            return false;
        }
        if (distY > (b.h / 2 + a.r)) {
            return false;
        }

        if (distX <= (b.w / 2)) {
            return true;
        }
        if (distY <= (b.h / 2)) {
            return true;
        }

        var dx = distX - b.w / 2;
        var dy = distY - b.h / 2;
        return (dx * dx + dy * dy <= (a.r * a.r));
    }

};

if (typeof(module) === "object") {
    module.exports = CollisionDetection;
}