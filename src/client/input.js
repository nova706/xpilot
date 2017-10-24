/**
 * @Class Input
 * Tracks current input actions to send to the server
 */
var Input = {

    left: false,
    right: false,
    up: false,
    down: false,
    space: false

};

/**
 * Handle when a key is pressed
 * @param e Event
 * @param {Boolean} isPressed True if the key is still pressed
 */
Input.handleKey = function (e, isPressed) {
    var key = e.keyCode || e.which;

    switch (key) {
    case 37: // Left Arrow
        this.left = isPressed;
        break;
    case 38: // Up Arrow
        this.up = isPressed;
        break;
    case 39: // Right Arrow
        this.right = isPressed;
        break;
    case 40: // Down Arrow
        this.down = isPressed;
        break;
    case 32: // Space
        this.space = isPressed;
        break;
    }
};

window.onkeydown = function (evt) {
    Input.handleKey.call(Input, evt, true);
};
window.onkeyup = function (evt) {
    Input.handleKey.call(Input, evt, false);
};