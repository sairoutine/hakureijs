'use strict';

var CONSTANT = require("../../constant/button");
var InputManager = require("./_index");

/********************************************
 * keyboard
 ********************************************/

InputManager.prototype.isKeyDown = function(flag) {
	return((this._current_keyflag & flag) ? true : false);
};

InputManager.prototype.isKeyPush = function(flag) {
	return !(this._before_keyflag & flag) && this._current_keyflag & flag;
};

InputManager.prototype.isKeyRelease = function(flag) {
	return (this._before_keyflag & flag) && !(this._current_keyflag & flag);
};

InputManager.prototype.getKeyDownTime = function(bit_code) {
	return this._key_bit_code_to_down_time[bit_code];
};

InputManager.prototype._initPressedKeyTime = function() {
	this._key_bit_code_to_down_time = {};

	for (var button_id in CONSTANT) {
		var bit_code = CONSTANT[button_id];
		this._key_bit_code_to_down_time[bit_code] = 0;
	}
};

InputManager.prototype._setPressedKeyTime = function() {
	for (var button_id in CONSTANT) {
		var bit_code = CONSTANT[button_id];
		if (this.isKeyDown(bit_code)) {
			++this._key_bit_code_to_down_time[bit_code];
		}
		else {
			this._key_bit_code_to_down_time[bit_code] = 0;
		}
	}
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

InputManager.prototype._handleKeyDown = function(e) {
	this._current_keyflag |= this._keyCodeToBitCode(e.keyCode);
	e.preventDefault();
};
InputManager.prototype._handleKeyUp = function(e) {
	this._current_keyflag &= ~this._keyCodeToBitCode(e.keyCode);
	e.preventDefault();
};

module.exports = InputManager;
