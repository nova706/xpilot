if (typeof(module) === "object") {
    var Entity = require('../entities/entity');
    var Vector = require('../utilities/vector');
}

/**
 * @Class CollisionSolver
 * Determines the result when two entities have collided
 */
var CollisionSolver = {

    /**
     * Determines the result when two entities have collided
     * @param {Entity} a
     * @param {Entity} b
     * @param {Boolean} terminal If the result should have terminal results (ie: destroy the ship)
     */
    solve: function (a, b, terminal) {
        if (!(a instanceof Entity) || !(b instanceof Entity)) {
            return;
        }

        if (a.type === Entity.TYPE.SHIP) {
            this.solveShipCollision(a, b, terminal);
        } else if (b.type === Entity.TYPE.SHIP) {
            this.solveShipCollision(b, a, terminal);
        } else if (a.type === Entity.TYPE.BULLET) {
            this.solveBulletCollision(a, b, terminal);
        } else if (b.type === Entity.TYPE.BULLET) {
            this.solveBulletCollision(b, a, terminal);
        }

    },

    /**
     * Determine the result when a bullet collides with another entity
     * @param {Bullet} a
     * @param {Ship|GravityWell|Wall} b
     * @param {Boolean} terminal If the result should have terminal results (ie: destroy the ship)
     */
    solveBulletCollision: function (a, b, terminal) {

        // If the bullet has collided with a ship, the bullet and ship should be destroyed
        if (b.type === Entity.TYPE.SHIP) {
            a.destroy();
            if (terminal) {
                b.die();
            }

            // If the bullet has "collided" with a gravity well, the gravity well should apply a gravitational force to
            // the bullet.
        } else if (b.type === Entity.TYPE.GRAVITY_WELL) {
            b.applyForce(a);

            // If the bullet has collided with a wall it should be destroyed.
        } else if (b.type === Entity.TYPE.WALL) {
            a.destroy();
        }
    },

    /**
     * Determine the result when a ship collides with another entity
     * @param {Ship} a
     * @param {Ship|Bullet|GravityWell|Wall} b
     * @param {Boolean} terminal If the result should have terminal results (ie: destroy the ship)
     */
    solveShipCollision: function (a, b, terminal) {
        var normalVector;
        var tangentVector;

        // If two ships collide, check their velocities. If the impact force is greater than the withstandForce, the two
        // ships should be destroyed. Otherwise, the ships should transfer opposite velocities
        if (b.type === Entity.TYPE.SHIP) {

            normalVector = this.$getNormalVector(a, b);
            tangentVector = this.$getTangentVector(normalVector);

            var aVectorAfter = this.$getVectorAfter(a, b, normalVector);
            var bVectorAfter = this.$getVectorAfter(b, a, normalVector);
            var aNormalVector = this.$getNormalVectorAfter(a, tangentVector);
            var bNormalVector = this.$getNormalVectorAfter(b, tangentVector);

            var aResultVelocity = this.$getResultVelocity(aVectorAfter, aNormalVector);
            var bResultVelocity = this.$getResultVelocity(bVectorAfter, bNormalVector);

            if (aResultVelocity.lengthSq() < a.withstandForce && bResultVelocity.lengthSq() < b.withstandForce) {
                a.velocity.set(aResultVelocity.x, aResultVelocity.y);
                b.velocity.set(bResultVelocity.x, bResultVelocity.y);
            } else if (terminal) {
                a.die();
                b.die();
            }

            // If the ship has collided with a bullet, the bullet and ship should be destroyed
        } else if (b.type === Entity.TYPE.BULLET) {
            if (terminal) {
                a.die();
            }
            b.destroy();

            // If the ship has collided with a wall and the impact force is greater than the withstand force, the ship
            // should be destroyed. Otherwise, the ship should bounce off of the wall.
        } else if (b.type === Entity.TYPE.WALL && a.velocity.length() !== 0) {

            if (a.velocity.lengthSq() < a.withstandForce) {
                normalVector = b.getCollisionPlane(a);

                var dot = a.velocity.dot(normalVector);
                var x = a.velocity.x - 2 * dot * normalVector.x;
                var y = a.velocity.y - 2 * dot * normalVector.y;
                a.velocity.set(x, y).multiplyScalar(0.8);

            } else if (terminal) {
                a.die();
            }

            // If the ship has "collided" with a gravity well, the gravity well should apply a gravitational force to
            // the ship.
        } else if (b.type === Entity.TYPE.GRAVITY_WELL) {
            b.applyForce(a);
        }
    },

    $getResultVelocity: function (aVectorAfter, aNormalVector) {
        return aNormalVector.add(aVectorAfter);
    },

    $getNormalVectorAfter: function (a, tangentVector) {
        var aTangentDot = tangentVector.dot(a.velocity);
        return tangentVector.clone().multiplyScalar(aTangentDot);
    },

    $getVectorAfter: function (a, b, normalVector) {
        var aNormalDot = normalVector.dot(a.velocity);
        var bNormalDot = normalVector.dot(b.velocity);
        var aNormalAfter = (aNormalDot * (a.mass - b.mass) + 2 * b.mass * bNormalDot) / (a.mass + b.mass);
        return normalVector.clone().multiplyScalar(aNormalAfter);
    },

    $getTangentVector: function (normalVector) {
        return new Vector((normalVector.y * -1), normalVector.x);
    },

    $getNormalVector: function (a, b) {
        var xD = (b.position.x - a.position.x);
        var yD = (-b.position.y + a.position.y); // invert the y direction
        return new Vector(xD, yD).normalize();
    }

};

if (typeof(module) === "object") {
    module.exports = CollisionSolver;
}