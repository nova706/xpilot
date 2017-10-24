if (typeof(module) === "object") {
    var Class = require('../utilities/classFramework');
}

/**
 * @Class EventEmitter
 * Emits events that can be listened to
 */
var EventEmitter = Class.create(function () {

    return {

        /**
         * Creates a new EventEmitter
         */
        init: function () {
            this.$listeners = {};
            this.events = {};
        },

        /**
         * Listens to an event
         * @param {String} eventName
         * @param {Function} listener
         * @returns {Function} Can be called to stop listening to the event
         */
        on: function (eventName, listener) {
            if (typeof listener !== 'function' || !this.events[eventName]) {
                return function () {};
            }

            if (!this.$listeners[eventName]) {
                this.$listeners[eventName] = [];
            }

            this.$listeners[eventName].push(listener);

            var self = this;
            return function () {
                self.off(eventName, listener);
            };
        },

        /**
         * Stops listening to an event
         * @param {String} eventName
         * @param {Function} [listener] If provided, only un-registers that listener. Otherwise, removes all listeners to the event
         */
        off: function (eventName, listener) {
            if (!this.$listeners[eventName]) {
                return;
            }

            if (typeof listener === 'function') {
                var i;
                for (i = 0; i < this.$listeners[eventName].length; i++) {
                    if (this.$listeners[eventName][i] === listener) {
                        this.$listeners[eventName].splice(i, 1);
                        break;
                    }
                }
            } else {
                this.$listeners[eventName] = [];
            }
        },

        /**
         * Emits the event with any number of arguments
         * @param {String} eventName
         */
        emit: function (eventName) {
            if (this.$listeners[eventName]) {
                var args = [].splice.call(arguments, 1);

                var i;
                for (i = 0; i < this.$listeners[eventName].length; i++) {
                    this.$listeners[eventName][i].apply(this, args);
                }
            }
        },

        /**
         * Removes all listeners
         */
        destroy: function () {
            this.$listeners = {};
        }
    };

});

if (typeof(module) === "object") {
    module.exports = EventEmitter;
}