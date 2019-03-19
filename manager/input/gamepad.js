'use strict';

var BUTTON_CONSTANT = require("../../constant/button");
var DEFAULT_CONSTANT = require("../../constant/gamepad/default");
var XBOX360_CONSTANT = require("../../constant/gamepad/xbox360");
var SNES_CONSTANT = require("../../constant/gamepad/snes");
var PS4_CONSTANT = require("../../constant/gamepad/ps4");

var GamepadManager = function (input_manager) {
	this._is_gamepad_usable = false;

	this._rawgamepads = [];
	this._before_rawgamepads = [];

	this._pads = [];
};

GamepadManager.prototype.init = function () {
	this._rawgamepads = [];
	this._before_rawgamepads = [];

	this._pads = [];
};

GamepadManager.prototype.update = function(){
	if(!this._is_gamepad_usable) return;

	// get gamepad input
	this._handleGamePad();

	for (var i = 0, len = this._pads.length; i < len; i++) {
		this._pads[i].update();
	}
};

GamepadManager.prototype._handleGamePad = function() {
	this._rawgamepads = window.navigator.getGamepads();
};

// TODO: refactor
GamepadManager.prototype.afterDraw = function(){
	if(!this._is_gamepad_usable) return;

	// save key current pressed buttons
	this._before_rawgamepads = [];
	for (var i = 0, len = this._rawgamepads.length; i < len; i++) {
		if (!this._rawgamepads[i]) {
			this._before_rawgamepads[i] = null;
			continue;
		}

		this._before_rawgamepads[i] = {
			buttons: {},
			id: this._rawgamepads[i].id,
		};

		for (var j in this._rawgamepads[i].buttons) {
			this._before_rawgamepads[i].buttons[j] = {pressed: this._rawgamepads[i].buttons[j].pressed};
		}
	}
};

GamepadManager.prototype.setupEvents = function(canvas_dom) {
	// bind gamepad
	if(window.Gamepad && window.navigator && window.navigator.getGamepads) {
		this._is_gamepad_usable = true;
	}
};


GamepadManager.prototype.getGamepad = function(index) {
	if (!(index in this._pads)) {
		this._pads[index] = new Gamepad(this, index);
	}

	return this._pads[index];
};

GamepadManager.prototype.getGamepadList = function() {
	throw new Error("getGamepadList method is not implemented yet.");
};

GamepadManager.prototype.isGamepadConnected = function(index) {
	return this._rawgamepads[index] && this._rawgamepads[index].connected;
};

var Gamepad = function(gamepad_manager, index) {
	this._gamepad_manager = gamepad_manager;
	this._index = index;

	this._config = DEFAULT_CONSTANT;

	this._bit_code_to_down_time = {};

	this._initPressedTime();
};

Gamepad.prototype._initPressedTime = function() {
	for (var key in BUTTON_CONSTANT) {
		var bit_code = BUTTON_CONSTANT[key];
		this._bit_code_to_down_time[bit_code] = 0;
	}
};

Gamepad.prototype.update = function() {

	this._updateConfig();

	// Count button pressed time.
	this._setPressedTime();
};

Gamepad.prototype._updateConfig = function() {
	var current_raw = this._gamepad_manager._rawgamepads[this._index];
	if (current_raw) {
		if (current_raw.id === "Xbox 360 Controller (STANDARD GAMEPAD Vendor: 045e Product: 028e)") {
			this._config = XBOX360_CONSTANT;
		}
		else if (current_raw.id === "USB Gamepad  (STANDARD GAMEPAD Vendor: 0079 Product: 0011)") {
			this._config = SNES_CONSTANT;
		}
		else if (current_raw.id === "Sony PlayStation DualShock 4 (v2) wireless controller") {
			this._config = PS4_CONSTANT;
		}
		else {
			this._config = DEFAULT_CONSTANT;
		}
	}
};

Gamepad.prototype._setPressedTime = function() {
	for (var key in BUTTON_CONSTANT) {
		var bit_code = BUTTON_CONSTANT[key];
		if (this.isButtonDown(bit_code)) {
			++this._bit_code_to_down_time[bit_code];
		}
		else {
			this._bit_code_to_down_time[bit_code] = 0;
		}
	}
};


Gamepad.prototype._isBeforeButtonDown = function(bit_code) {
	var raw = this._gamepad_manager._before_rawgamepads[this._index];
	if (raw) {
		if (bit_code in this._config) {
			var button_id = this._config[bit_code];
			return raw.buttons[button_id] && raw.buttons[button_id].pressed;
		}
		else {
			return false;
		}
	}
	else {
		return false;
	}
};

Gamepad.prototype.isButtonDown = function(bit_code) {
	var raw = this._gamepad_manager._rawgamepads[this._index];
	if (raw) {
		if (bit_code in this._config) {
			var button_id = this._config[bit_code];
			return raw.buttons[button_id] && raw.buttons[button_id].pressed;
		}
		else {
			return false;
		}
	}
	else {
		return false;
	}
};

Gamepad.prototype.isButtonPush = function(bit_code) {
	return (!this._isBeforeButtonDown(bit_code) && this.isButtonDown(bit_code));
};

Gamepad.prototype.isButtonRelease = function(bit_code) {
	return (this._isBeforeButtonDown(bit_code) && !this.isButtonDown(bit_code));
};

Gamepad.prototype.getButtonDownTime = function(bit_code) {
	return this._bit_code_to_down_time[bit_code];
};

Gamepad.prototype.getAxisX = function(){
	var raw = this._gamepad_manager._rawgamepads[this._index];

	if (raw) {
		return raw.axes[0];
	}
	else {
		return 0;
	}
};

Gamepad.prototype.getAxisY = function() {
	var raw = this._gamepad_manager._rawgamepads[this._index];

	if (raw) {
		return raw.axes[1];
	}
	else {
		return 0;
	}
};

module.exports = GamepadManager;
