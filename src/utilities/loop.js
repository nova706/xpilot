var Loop = {
    fps: 30,
    interval: 1000 / 30,
    delta: 0,
    currentTime: 0,
    lastTime: (new Date()).getTime(),
    running: false
};

Loop.init = function (fps, isClient) {
    this.fps = fps || 30;
    this.interval = 1000 / this.fps;
    this.delta = 0;
    this.currentTime = 0;
    this.lastTime = (new Date()).getTime();

    this.isClient = isClient;

    if (this.isClient) {
        var i;
        var vendors = ['ms', 'moz', 'webkit', 'o'];
        for (i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
            window.requestAnimationFrame = window[vendors[i] + 'RequestAnimationFrame'];
            window.cancelAnimationFrame = window[vendors[i] + 'CancelAnimationFrame'] || window[vendors[i] + 'CancelRequestAnimationFrame'];
        }
    }

    this.running = false;
    this.$timerId = null;
};

Loop.trackStats = function (stats) {
    this.stats = stats;
};

Loop.start = function (callback) {
    if (!this.running) {
        this.lastTime = (new Date()).getTime();
        this.running = true;
        this.tick(callback);
    }
};

Loop.stop = function () {
    this.running = false;
    if (this.isClient) {
        window.cancelAnimationFrame(this.$timerId);
    } else {
        clearTimeout(this.$timerId);
    }
};

Loop.advance = function (callback) {
    var self = this;
    if (this.isClient) {
        this.$timerId = window.requestAnimationFrame(function () {
            self.tick(callback);
        });
    } else {
        this.$timerId = setTimeout(function () {
            self.tick(callback);
        }, this.fps);
    }
};

Loop.tick = function (callback) {

    // If the world is not running, break the loop.
    if (!this.running) {
        return;
    }

    if (this.stats) {
        this.stats.begin();
    }

    this.currentTime = (new Date()).getTime();
    this.delta = (this.currentTime - this.lastTime);

    if (this.delta >= this.interval) {
        this.lastTime = this.currentTime - (this.delta % this.interval);
    }

    if (typeof callback === 'function') {
        callback(this.delta, this.delta >= this.interval);
    }

    if (this.stats) {
        this.stats.end();
    }

    this.advance(callback);
};

if (typeof(module) === "object") {
    module.exports = Loop;
}