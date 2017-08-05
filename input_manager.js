'use strict';

var CONSTANT = require("./constant");
var Util = require("./util");

// const
var DEFAULT_BUTTON_ID_TO_BIT_CODE = {
	0: CONSTANT.BUTTON_Z,
	1: CONSTANT.BUTTON_X,
	2: CONSTANT.BUTTON_SPACE,
	3: CONSTANT.BUTTON_SHIFT,
};

var InputManager = function () {
	this.current_keyflag = 0x0;
	this.before_keyflag = 0x0;
	this._key_bit_code_to_down_time = {};

	// gamepad button_id to bit code of key input
	this._button_id_to_key_bit_code = Util.shallow_copy_hash(DEFAULT_BUTTON_ID_TO_BIT_CODE);

	this.is_left_clicked  = false;
	this.is_right_clicked = false;
	this.before_is_left_clicked  = false;
	this.before_is_right_clicked = false;
	this.mouse_change_x = 0;
	this.mouse_change_y = 0;
	this.mouse_x = 0;
	this.mouse_y = 0;
	this.mouse_scroll = 0;

	this.is_connect_gamepad = false;
};

InputManager.prototype.init = function () {
	this.current_keyflag = 0x0;
	this.before_keyflag = 0x0;
	this.initPressedKeyTime();

	// gamepad button_id to bit code of key input
	this._button_id_to_key_bit_code = Util.shallow_copy_hash(DEFAULT_BUTTON_ID_TO_BIT_CODE);

	this.is_left_clicked  = false;
	this.is_right_clicked = false;
	this.before_is_left_clicked  = false;
	this.before_is_right_clicked = false;
	this.mouse_change_x = 0;
	this.mouse_change_y = 0;
	this.mouse_x = 0;
	this.mouse_y = 0;
	this.mouse_scroll = 0;

	this.is_connect_gamepad = false;
};
InputManager.prototype.enableGamePad = function () {
	this.is_connect_gamepad = true;
};
InputManager.prototype.beforeRun = function(){
	// get gamepad input
	this.handleGamePad();

	// get pressed key time
	this.handlePressedKeyTime();
};

InputManager.prototype.afterRun = function(){
	// save key current pressed keys
	this.before_keyflag = this.current_keyflag;
	this.before_is_left_clicked = this.is_left_clicked;
	this.before_is_right_clicked = this.is_right_clicked;

	// reset mouse wheel and mouse move
	this.mouse_scroll = 0;
	this.mouse_change_x = 0;
	this.mouse_change_y = 0;
};


InputManager.prototype.handleKeyDown = function(e) {
	this.current_keyflag |= this._keyCodeToBitCode(e.keyCode);
	e.preventDefault();
};
InputManager.prototype.handleKeyUp = function(e) {
	this.current_keyflag &= ~this._keyCodeToBitCode(e.keyCode);
	e.preventDefault();
};
InputManager.prototype.isKeyDown = function(flag) {
	return((this.current_keyflag & flag) ? true : false);
};
InputManager.prototype.isKeyPush = function(flag) {
	return !(this.before_keyflag & flag) && this.current_keyflag & flag;
};


InputManager.prototype.getKeyDownTime = function(bit_code) {
	return this._key_bit_code_to_down_time[bit_code];
};

InputManager.prototype.handleMouseDown = function(event) {
	if ("which" in event) { // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
		this.is_left_clicked  = event.which === 1;
		this.is_right_clicked = event.which === 3;
	}
	else if ("button" in event) {  // IE, Opera
		this.is_left_clicked  = event.button === 1;
		this.is_right_clicked = event.button === 2;
	}
	event.preventDefault();
};
InputManager.prototype.handleMouseUp = function(event) {
	if ("which" in event) { // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
		this.is_left_clicked  = event.which === 1 ? false : this.is_left_clicked;
		this.is_right_clicked = event.which === 3 ? false : this.is_right_clicked;
	}
	else if ("button" in event) {  // IE, Opera
		this.is_left_clicked  = event.button === 1 ? false : this.is_left_clicked;
		this.is_right_clicked = event.button === 2 ? false : this.is_right_clicked;
	}
	event.preventDefault();
};
InputManager.prototype.isLeftClickDown = function() {
	return this.is_left_clicked;
};
InputManager.prototype.isLeftClickPush = function() {
	// not true if is pressed in previous frame
	return this.is_left_clicked && !this.before_is_left_clicked;
};
InputManager.prototype.isRightClickDown = function() {
	return this.is_right_clicked;
};
InputManager.prototype.isRightClickPush = function() {
	// not true if is pressed in previous frame
	return this.is_right_clicked && !this.before_is_right_clicked;
};
InputManager.prototype.handleMouseMove = function (d) {
	d = d ? d : window.event;
	d.preventDefault();
	this.mouse_change_x = this.mouse_x - d.clientX;
	this.mouse_change_y = this.mouse_y - d.clientY;
	this.mouse_x = d.clientX;
	this.mouse_y = d.clientY;
};
InputManager.prototype.mousePositionX = function () {
	return this.mouse_x;
};
InputManager.prototype.mousePositionY = function () {
	return this.mouse_y;
};
InputManager.prototype.mouseMoveX = function () {
	return this.mouse_change_x;
};
InputManager.prototype.mouseMoveY = function () {
	return this.mouse_change_y;
};
InputManager.prototype.handleMouseWheel = function (event) {
	this.mouse_scroll = event.detail ? event.detail : -event.wheelDelta/120;
};
InputManager.prototype.mouseScroll = function () {
	return this.mouse_scroll;
};
InputManager.prototype._keyCodeToBitCode = function(keyCode) {
	var flag;
	switch(keyCode) {
		case 16: // shift
			flag = CONSTANT.BUTTON_SHIFT;
			break;
		case 32: // space
			flag = CONSTANT.BUTTON_SPACE;
			break;
		case 37: // left
			flag = CONSTANT.BUTTON_LEFT;
			break;
		case 38: // up
			flag = CONSTANT.BUTTON_UP;
			break;
		case 39: // right
			flag = CONSTANT.BUTTON_RIGHT;
			break;
		case 40: // down
			flag = CONSTANT.BUTTON_DOWN;
			break;
		case 88: // x
			flag = CONSTANT.BUTTON_X;
			break;
		case 90: // z
			flag = CONSTANT.BUTTON_Z;
			break;
	}
	return flag;
};
InputManager.prototype.handleGamePad = function() {
	if(!this.is_connect_gamepad) return;
	var pads = window.navigator.getGamepads();
	var pad = pads[0]; // 1Pコン

	if(!pad) return;

	// button
	for (var i = 0, len = pad.buttons.length; i < len; i++) {
		if(!(i in this._button_id_to_key_bit_code)) continue; // ignore if I don't know its button
		if(pad.buttons[i].pressed) { // pressed
			this.current_keyflag |= this.getKeyByButtonId(i);
		}
		else { // not pressed
			this.current_keyflag &= ~this.getKeyByButtonId(i);
		}
	}

	// arrow keys
	if (pad.axes[1] < -0.5) {
			this.current_keyflag |= CONSTANT.BUTTON_UP;
	}
	else {
			this.current_keyflag &= ~CONSTANT.BUTTON_UP;
	}
	if (pad.axes[1] > 0.5) {
			this.current_keyflag |= CONSTANT.BUTTON_DOWN;
	}
	else {
			this.current_keyflag &= ~CONSTANT.BUTTON_DOWN;
	}
	if (pad.axes[0] < -0.5) {
			this.current_keyflag |= CONSTANT.BUTTON_LEFT;
	}
	else {
			this.current_keyflag &= ~CONSTANT.BUTTON_LEFT;
	}
	if (pad.axes[0] > 0.5) {
			this.current_keyflag |= CONSTANT.BUTTON_RIGHT;
	}
	else {
			this.current_keyflag &= ~CONSTANT.BUTTON_RIGHT;
	}
};
InputManager.prototype.initPressedKeyTime = function() {
	this._key_bit_code_to_down_time = {};

	for (var button_id in CONSTANT) {
		var bit_code = CONSTANT[button_id];
		this._key_bit_code_to_down_time[bit_code] = 0;
	}
};

InputManager.prototype.handlePressedKeyTime = function() {
	for (var button_id in CONSTANT) {
		var bit_code = CONSTANT[button_id];
		if (this.isKeyDown(bit_code)) {
			this._key_bit_code_to_down_time[bit_code]++;
		}
		else {
			this._key_bit_code_to_down_time[bit_code] = 0;
		}
	}
};
InputManager.prototype.setupEvents = function(canvas_dom) {
	var self = this;

	// bind keyboard
	window.onkeydown = function(e) { self.handleKeyDown(e); };
	window.onkeyup   = function(e) { self.handleKeyUp(e); };

	// bind mouse click
	canvas_dom.onmousedown = function(e) { self.handleMouseDown(e); };
	canvas_dom.onmouseup   = function(e) { self.handleMouseUp(e); };

	// bind mouse move
	canvas_dom.onmousemove = function(d) { self.handleMouseMove(d); };

	// bind mouse wheel
	var mousewheelevent = (window.navi && /Firefox/i.test(window.navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel";
	if (canvas_dom.addEventListener) { //WC3 browsers
		canvas_dom.addEventListener(mousewheelevent, function(e) {
			var event = window.event || e;
			self.handleMouseWheel(event);
		}, false);
	}

	// unable to use right click menu.
	// NOTE: not used
	// this.canvas_dom.oncontextmenu = function() { return false; };

	// bind gamepad
	if(window.Gamepad && window.navigator && window.navigator.getGamepads) {
		self.enableGamePad();
	}
};

module.exports = InputManager;
