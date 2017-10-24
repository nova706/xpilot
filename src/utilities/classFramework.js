(function (factory) {
    if (typeof(module) === "object") {
        module.exports = factory();
    } else if (window) {
        window.Class = factory();
    }
})(function () {

    return {
        create: function (extend, definition) {
            var $initializing = false;

            var klass = function () {
                if ($initializing) {
                    return;
                }
                this.init.apply(this, arguments);
            };

            // if we have more than an argument
            if (definition) {
                // it means that extend is the parent
                klass.prototype = extend.prototype;
                $initializing = true;
                klass.prototype = new klass();
                $initializing = false;

                // while definition could be a function
                if (typeof definition === "function") {
                    // and in this case we call it once and never again
                    definition = definition(
                        // sending the $parent prototype
                        extend.prototype
                    );
                }
            } else {
                // otherwise extend is the prototype
                // but it could have its own closure
                // so it could be a function
                // let's execute it
                definition = typeof extend === "function" ? extend() : extend;
            }

            // enrich the prototype
            var key;
            for (key in definition) {
                klass.prototype[key] = definition[key];
            }

            if (!klass.prototype.init) {
                klass.prototype.init = function () {
                };
            }

            // be sure about the constructor
            klass.prototype.constructor = klass;
            // and return the "klass"
            return klass;
        }
    };

});