if (typeof(module) === "object") {
    var Class = require('../utilities/classFramework');
    var BoundingBox = require('./boundingBox');
    var Entity = require('./entity');
    var Vector = require('../utilities/vector');
}

/**
 * @Class Wall
 * @Augments Entity
 * Represents a wall
 */
var Wall = Class.create(Entity, function ($parent) {

    return {

        /**
         *
         * @param {Number} x X Position
         * @param {Number} y Y Position
         * @param {Wall.WALL_TYPE} [wallType=Wall.WALL_TYPE.SOLID]
         * @param id The Entity ID
         */
        init: function (x, y, wallType, id) {
            $parent.init.call(this, x, y, 0, 0, id);

            this.type = Entity.TYPE.WALL;
            this.bounds = new BoundingBox(this.position.x, this.position.y, 40, 40, 0x0006, 0x0001 | 0x0004);
            this.wallType = wallType || Wall.WALL_TYPE.SOLID;
        },

        /**
         * Renders the wall sprite to a target
         * @param target
         */
        render: function (target) {
            this.sprite = new PIXI.Sprite(Textures.wall1);
            this.sprite.position.x = this.position.x;
            this.sprite.position.y = this.position.y;

            target.addChild(this.sprite);
        },

        /**
         * Gets the normal vector of collision
         * @param entity
         * @returns {Vector} The normal vector of collision
         */
        getCollisionPlane: function (entity) {
            var x = 0;
            var y = 0;

            var yD = (this.position.y - entity.position.y);
            if (yD <= 0 && yD >= -40) {
                x = (this.position.x < entity.position.x) ? 1 : -1;
            } else {
                y = (this.position.y < entity.position.y) ? -1 : 1;
            }

            return new Vector(x, y);
        }
    };

});

Wall.WALL_TYPE = {
    SOLID: 0,
    NW: 1,
    NE: 2,
    SE: 3,
    SW: 4
};

if (typeof(module) === "object") {
    module.exports = Wall;
}