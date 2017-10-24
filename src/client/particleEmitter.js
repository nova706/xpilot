/**
 * @Class ParticleEmitter
 * @Augments Entity
 * Emits particles at a given point and velocity
 */
var ParticleEmitter = Class.create(Entity, function ($parent) {

    return {

        /**
         * Creates the particle emitter
         * @param {Number} x X Position
         * @param {Number} y Y Position
         * @param {Object} options Particle and ParticleEmitter options
         */
        init: function (x, y, options) {
            $parent.init.call(this, x, y);

            options = options || {};

            this.emitting = false;
            this.velocity = options.velocity ||  new Vector();
            this.maxParticles = options.maxParticles || 100;

            this.particles = [];

            this.container = new PIXI.Container();

            var i;
            for (i = 0; i < this.maxParticles; i++) {
                this.particles[i] = new Particle(this.position.x, this.position.y, options);
                this.container.addChild(this.particles[i].sprite);
            }
        },

        /**
         * Starts the emitter
         */
        start: function () {
            this.emitting = true;
        },

        /**
         * Stops the emitter
         */
        stop: function () {
            this.emitting = false;
        },

        /**
         * Fires a burst of particles at the same time
         */
        burst: function () {
            var i;
            var particle;

            for (i = 0; i < this.particles.length; i++) {
                particle = this.particles[i];
                particle.burst(this.position.x, this.position.y, this.velocity.x, this.velocity.y);
            }
        },

        /**
         * Destroys the emitter and removes it from the stage. This destroys all particles
         */
        destroy: function () {
            this.emitting = false;

            var i;
            for (i = 0; i < this.particles.length; i++) {
                this.particles[i].destroy();
            }
            this.particles = [];

            if (this.container) {
                this.container.destroy();
                delete this.container;
            }
            $parent.destroy.call(this);
        },

        /**
         * The particle emitter physics loop
         * @param {Number} dT Delta time in milliseconds
         */
        tick: function (dT) {
            var i;
            var particle;

            // Advance ever particle while emitting
            for (i = 0; i < this.particles.length; i++) {
                particle = this.particles[i];
                particle.tick(dT);

                if (this.emitting) {
                    particle.start();

                    // Update the particle start position and velocity
                    particle.update(this.position.x, this.position.y, this.velocity.x, this.velocity.y);
                } else {
                    particle.stop();
                }
            }
        }
    };

});