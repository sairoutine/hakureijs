'use strict';

var CONSTANT = require("../../constant/button");
var InputManager = require("./_index");

/********************************************
 * gamepad
 ********************************************/

// get one of the pressed button id
InputManager.prototype.getAnyButtonId = function(){
	if(!this._is_gamepad_usable) return;

	var pads = window.navigator.getGamepads();
	var pad = pads[0]; // 1P gamepad

	if(!pad) return;

	for (var i = 0; i < pad.buttons.length; i++) {
		if(pad.buttons[i].pressed) {
			return i;
		}
	}
};

InputManager.prototype._getKeyByButtonId = function(button_id) {
	var keys = this._button_id_to_key_bit_code[button_id];
	if(!keys) keys = 0x00;

	return keys;
};

InputManager.prototype._handleGamePad = function() {
	if(!this._is_gamepad_usable) return;
	var pads = window.navigator.getGamepads();
	var pad = pads[0]; // 1P gamepad

	if(!pad) return;

	// button
	for (var i = 0, len = pad.buttons.length; i < len; i++) {
		if(!(i in this._button_id_to_key_bit_code)) continue; // ignore if I don't know its button
		if(pad.buttons[i].pressed) { // pressed
			this._current_keyflag |= this._getKeyByButtonId(i);
		}
		else { // not pressed
			this._current_keyflag &= ~this._getKeyByButtonId(i);
		}
	}

	// analog stick to arrow keys
	if (pad.axes[1] < -0.5) {
		this._current_keyflag |= CONSTANT.BUTTON_UP;
	}
	else {
		this._current_keyflag &= ~CONSTANT.BUTTON_UP;
	}
	if (pad.axes[1] > 0.5) {
		this._current_keyflag |= CONSTANT.BUTTON_DOWN;
	}
	else {
		this._current_keyflag &= ~CONSTANT.BUTTON_DOWN;
	}
	if (pad.axes[0] < -0.5) {
		this._current_keyflag |= CONSTANT.BUTTON_LEFT;
	}
	else {
		this._current_keyflag &= ~CONSTANT.BUTTON_LEFT;
	}
	if (pad.axes[0] > 0.5) {
		this._current_keyflag |= CONSTANT.BUTTON_RIGHT;
	}
	else {
		this._current_keyflag &= ~CONSTANT.BUTTON_RIGHT;
	}
};
/*
InputManager.prototype.setButtonIdMapping = function(button_id, key) {
	var defined_key = this._button_id_to_key_bit_code[button_id];

	for (var target_button_id in this._button_id_to_key_bit_code) {
		var target_key = this._button_id_to_key_bit_code[target_button_id];
		// If there are already set keys in other keys, replace it.
		if (target_key === key) {
			if (defined_key) {
				// replace other key's button_id mapping to current button_id's key.
				this._button_id_to_key_bit_code[target_button_id] = defined_key;
			}
			else {
				// the player presses target_button_id, no event has occurred.
				delete this._button_id_to_key_bit_code[target_button_id];
			}
		}
	}

	// set
	this._button_id_to_key_bit_code[button_id] = key;
};

InputManager.prototype.setAllButtonIdMapping = function(map) {
	this._button_id_to_key_bit_code = Util.shallowCopyHash(map);
};

InputManager.prototype.getButtonIdToKeyMap = function() {
	return Util.shallowCopyHash(this._button_id_to_key_bit_code);
};
// convert { value => key } hash
InputManager.prototype.getKeyToButtonIdMap = function() {
	var map = {};
	for (var button_id in this._button_id_to_key_bit_code) {
		var key = this._button_id_to_key_bit_code[button_id];
		map[key] = button_id; // NOTE: cannot duplicate, if it, overwrite it
	}

	return map;
};


InputManager.prototype.dumpGamePadKey = function() {
	var dump = {};

	for (var button_id in this._button_id_to_key_bit_code) {
		var key = this._button_id_to_key_bit_code[ button_id ];
		switch(key) {
			case CONSTANT.BUTTON_LEFT:
				dump[button_id] = "LEFT";
				break;
			case CONSTANT.BUTTON_UP:
				dump[button_id] = "UP";
				break;
			case CONSTANT.BUTTON_RIGHT:
				dump[button_id] = "RIGHT";
				break;
			case CONSTANT.BUTTON_DOWN:
				dump[button_id] = "DOWN";
				break;
			case CONSTANT.BUTTON_Z:
				dump[button_id] = "Z";
				break;
			case CONSTANT.BUTTON_X:
				dump[button_id] = "X";
				break;
			case CONSTANT.BUTTON_SHIFT:
				dump[button_id] = "SHIFT";
				break;
			case CONSTANT.BUTTON_SPACE:
				dump[button_id] = "SPACE";
				break;
			default:
				dump[button_id] = "UNKNOWN";
		}
	}

	console.log(dump);
};
*/

module.exports = InputManager;
