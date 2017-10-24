if (typeof(module) === "object") {
    var Class = require('../utilities/classFramework');
    var Body = require('./body');
    var BoundingArea = require('./boundingArea');
    var Entity = require('./entity');
}

/**
 * @Class GravityWell
 * @Augments Entity
 * An entity that represents a gravitational force
 */
var GravityWell = Class.create(Entity, function ($parent) {

    return {

        /**
         * Creates a new Gravity Well
         * @param {Number} x X Position
         * @param {Number} y Y Position
         * @param {Number} m Mass
         * @param id The Entity ID
         */
        init: function (x, y, m, id) {
            $parent.init.call(this, x, y, 0, m, id);

            this.type = Entity.TYPE.GRAVITY_WELL;
            this.bounds = new BoundingArea(this.position.x, this.position.y, 200, 0x0002, 0x0001);
        },

        /**
         * Renders the sprite to a render target
         * @param target
         */
        render: function (target) {
            if (this.mass < 0) {
                this.sprite = new PIXI.Sprite(Textures.gravityWellPositive);
            } else {
                this.sprite = new PIXI.Sprite(Textures.gravityWellNegative);
            }
            this.sprite.anchor = new PIXI.Point(0.5, 0.5);
            this.sprite.position.x = this.position.x;
            this.sprite.position.y = this.position.y;

            target.addChild(this.sprite);
        },

        /**
         * Applies the gravitational force to a given Body
         * @param {Body} body
         */
        applyForce: function (body) {
            if (body instanceof Body) {
                var d = this.distanceTo(body);
                var f = this.mass * body.mass / (d * d);

                // Apply the max and min threshold for the force to avoid infinite acceleration
                f = Math.min(Math.max(f, -GravityWell.THRESHOLD), GravityWell.THRESHOLD);

                var a = Math.atan2((this.position.y - body.position.y), (this.position.x - body.position.x)) + (Math.PI / 2); // Why do I need to add 1/2 * PI
                var x = f * Math.sin(a);
                var y = f * Math.cos(a);
                body.applyForce(x, y);
            }
        }
    };

});

// Limits the gravitational force that can be applied.
GravityWell.THRESHOLD = 2000;

if (typeof(module) === "object") {
    module.exports = GravityWell;
}