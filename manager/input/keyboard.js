'use strict';

var BUTTON_CONSTANT = require("../../constant/button");
var KEYBOARD_CONSTANT = require("../../constant/keyboard/default");

// In the case of a button that supports analog input, a threshold value that indicates how far the button is turned on.
var ANALOGUE_STICK_THRESHOLD = 0.5;

var KeyboardManager = function (input_manager) {
	this._input_manager = input_manager;

	this._current_keyflag = 0x0;
	this._before_keyflag = 0x0;

	this._key_bit_code_to_down_time = {};

	// e.keyCode => bit code map
	this._keycode_to_bit_code = this._setupKeycodeMap(KEYBOARD_CONSTANT);
};

// invert bitcode and keycode map
// example: Map<bitcode, keycode> => Map<keycode, bitcode>
KeyboardManager.prototype._setupKeycodeMap = function(keyboard_map) {
	var keycode_to_bit_code = {};
	for (var bit_code in keyboard_map) {
		var keycode = keyboard_map[bit_code];
		keycode_to_bit_code[keycode] = bit_code;
	}

	return keycode_to_bit_code;
};

KeyboardManager.prototype.init = function () {
	this._current_keyflag = 0x0;
	this._before_keyflag = 0x0;

	this._initPressedKeyTime();
};

KeyboardManager.prototype._initPressedKeyTime = function() {
	this._key_bit_code_to_down_time = {};

	for (var key in BUTTON_CONSTANT) {
		var bit_code = BUTTON_CONSTANT[key];
		this._key_bit_code_to_down_time[bit_code] = 0;
	}
};

KeyboardManager.prototype.update = function(){

	this._setGamepadAsKeyboard();

	// count pressed key time
	this._setPressedKeyTime();
};

KeyboardManager.prototype._setPressedKeyTime = function() {
	for (var key in BUTTON_CONSTANT) {
		var bit_code = BUTTON_CONSTANT[key];
		if (this.isKeyDown(bit_code)) {
			++this._key_bit_code_to_down_time[bit_code];
		}
		else {
			this._key_bit_code_to_down_time[bit_code] = 0;
		}
	}
};

KeyboardManager.prototype._setGamepadAsKeyboard = function(){
	if (!this._input_manager.isGamepadConnected(0)) return;

	var pad = this._input_manager.getGamepad(0); // 1P gamepad

	for (var key in BUTTON_CONSTANT) {
		var bit_code = BUTTON_CONSTANT[key];

		if (pad.isButtonDown(bit_code)) {
			this._current_keyflag |= bit_code;
		}
		else if (this._isGamepPadStickDown(pad, bit_code)) {
			this._current_keyflag |= bit_code;
		}
		else {
			this._current_keyflag &= ~bit_code;
		}

	}
};

KeyboardManager.prototype._isGamepPadStickDown = function(pad, bit_code) {
	if (bit_code === BUTTON_CONSTANT.UP && pad.getAxisY() < -ANALOGUE_STICK_THRESHOLD) {
		return true;
	}
	else if (bit_code === BUTTON_CONSTANT.DOWN && pad.getAxisY() > ANALOGUE_STICK_THRESHOLD) {
		return true;
	}
	else if (bit_code === BUTTON_CONSTANT.LEFT && pad.getAxisX() < -ANALOGUE_STICK_THRESHOLD) {
		return true;
	}
	else if (bit_code === BUTTON_CONSTANT.RIGHT && pad.getAxisX() > ANALOGUE_STICK_THRESHOLD) {
		return true;
	}
	else {
		return false;
	}
};

KeyboardManager.prototype.afterDraw = function(){
	// save key current pressed keys
	this._before_keyflag = this._current_keyflag;
};

KeyboardManager.prototype.setupEvents = function(canvas_dom) {
	var _this = this;

	// bind keyboard
	window.onkeydown = function(e) { _this._handleKeyDown(e); };
	window.onkeyup   = function(e) { _this._handleKeyUp(e); };
};

KeyboardManager.prototype._handleKeyDown = function(e) {
	this._current_keyflag |= this._keycode_to_bit_code[e.keyCode];
	e.preventDefault();
};
KeyboardManager.prototype._handleKeyUp = function(e) {
	this._current_keyflag &= ~this._keycode_to_bit_code[e.keyCode];
	e.preventDefault();
};

KeyboardManager.prototype.isKeyDown = function(bit_code) {
	return((this._current_keyflag & bit_code) ? true : false);
};

KeyboardManager.prototype.isKeyPush = function(bit_code) {
	return !(this._before_keyflag & bit_code) && this._current_keyflag & bit_code;
};

KeyboardManager.prototype.isKeyRelease = function(bit_code) {
	return (this._before_keyflag & bit_code) && !(this._current_keyflag & bit_code);
};

KeyboardManager.prototype.getKeyDownTime = function(bit_code) {
	return this._key_bit_code_to_down_time[bit_code];
};

module.exports = KeyboardManager;
