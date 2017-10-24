if (typeof(module) === "object") {
    var Class = require('../utilities/classFramework');
    var Body = require('./body');
    var BoundingBox = require('./boundingBox');
    var Entity = require('./entity');
}

/**
 * @Class Bullet
 * @Augments Body
 */
var Bullet = Class.create(Body, function ($parent) {

    /**
     * Updates the sprite representing the bullet with the new position
     */
    var updateClientPosition = function () {
        if (this.sprite) {
            this.sprite.position.x = this.position.x;
            this.sprite.position.y = this.position.y;
        }
    };

    /**
     * Update the bounding area with the position
     */
    var updateBounds = function () {
        this.bounds.x = this.position.x;
        this.bounds.y = this.position.y;
    };

    return {

        /**
         * Creates a new bullet
         * @param {Number} x X Position
         * @param {Number} y Y Position
         * @param {Number} a Angle
         * @param {Number} vX X Velocity
         * @param {Number} vY Y Velocity
         * @param id The Entity ID
         */
        init: function (x, y, a, vX, vY, id) {
            $parent.init.call(this, x, y, a, 2, 0, id);

            this.type = Entity.TYPE.BULLET;
            this.mass = 2;
            this.bounds = new BoundingBox(this.position.x, this.position.y, 2, 2, 0x0004, 0xFFFF);
            this.maxLife = 3;
            this.direction = a;

            this.$currentLife = 0;

            this.velocity.x = vX || 0;
            this.velocity.y = vY || 0;
        },

        /**
         * Renders the bullet's sprite on a target
         * @param target
         */
        render: function (target) {
            this.renderTarget = target;
            this.sprite = new PIXI.Sprite(Textures.particle3);
            this.sprite.scale.x = 0.7;
            this.sprite.scale.y = 0.7;
            this.sprite.anchor = new PIXI.Point(0.5, 0.5);
            this.sprite.position.x = this.position.x;
            this.sprite.position.y = this.position.y;
            this.sprite.rotation = this.direction;

            target.addChild(this.sprite);
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
         * Destroys the bullet
         */
        destroy: function () {
            this.rest();

            if (this.alive && this.renderTarget) {
                this.renderTarget.removeChild(this.sprite);
                this.sprite.destroy();
            }
            this.alive = false;

            $parent.destroy.call(this);
        },

        /**
         * Physics loop logic. Age the bullet until it reaches its max life, then destroy it
         * @param {Number} dT Delta Time in milliseconds
         */
        tick: function (dT) {
            if (this.alive) {
                $parent.tick.apply(this, arguments);
                if (this.$currentLife > this.maxLife) {
                    this.destroy();
                }
                this.$currentLife += dT / 1000;
            }
        }
    };

});

if (typeof(module) === "object") {
    module.exports = Bullet;
}