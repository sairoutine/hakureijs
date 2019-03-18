'use strict';

var BUTTON_CONSTANT = require("../../constant/button");
var DEFAULT_CONSTANT = require("../../constant/gamepad/default");
var XBOX360_CONSTANT = require("../../constant/gamepad/xbox360");
var SNES_CONSTANT = require("../../constant/gamepad/snes");
var PS4_CONSTANT = require("../../constant/gamepad/ps4");

// In the case of a button that supports analog input, a threshold value that indicates how far the button is turned on.
var ANALOGUE_BUTTON_THRESHOLD = 0.5;

var GamepadManager = function (input_manager) {
	this._is_gamepad_usable = false;

	this._rawgamepads = [];
	this._before_rawgamepads = [];

	this._pads = [];

	this._bit_code_to_down_time = {};
};

GamepadManager.prototype.init = function () {
	this._rawgamepads = [];
	this._before_rawgamepads = [];

	this._pads = [];

	this._initPressedTime();
};

GamepadManager.prototype._initPressedTime = function() {
	this._bit_code_to_down_time = {};

	for (var key in BUTTON_CONSTANT) {
		var bit_code = BUTTON_CONSTANT[key];
		this._bit_code_to_down_time[bit_code] = 0;
	}
};

GamepadManager.prototype.update = function(){
	for (var i = 0, len = this._pads.length; i < len; i++) {
		this._pads[i].update();
	}

	// get gamepad input
	this._handleGamePad();

	// Count button pressed time.
	this._setPressedTime();
};

GamepadManager.prototype._setPressedTime = function() {
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

GamepadManager.prototype._handleGamePad = function() {
	if(!this._is_gamepad_usable) return;
	this._rawgamepads = window.navigator.getGamepads();
};

GamepadManager.prototype.afterDraw = function(){
	// save key current pressed buttons
	this._before_rawgamepads = this._rawgamepads;
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
};


Gamepad.prototype.update = function() {
	this._updateConfig();
	this._setAnalogStickAsAxis();
};

Gamepad.prototype._updateConfig = function() {
	var current_raw = this._rawgamepads[this._index];
	var before_raw = this._before_rawgamepads[this._index];
	if (current_raw && before_raw && current_raw.id !== before_raw.id) {
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

GamepadManager.prototype._setAnalogStickAsAxis = function(){
	var raw = this._gamepad_manager._before_rawgamepads[this._index];

	if (raw) {
		if (raw.axes[1] < -ANALOGUE_BUTTON_THRESHOLD) {
			raw.buttons[ this._config[BUTTON_CONSTANT.BUTTON_UP] ] = true;
		}
		if (raw.axes[1] > ANALOGUE_BUTTON_THRESHOLD) {
			raw.buttons[ this._config[BUTTON_CONSTANT.BUTTON_DOWN] ] = true;
		}
		if (raw.axes[0] < -ANALOGUE_BUTTON_THRESHOLD) {
			raw.buttons[ this._config[BUTTON_CONSTANT.BUTTON_LEFT] ] = true;
		}
		if (raw.axes[0] > ANALOGUE_BUTTON_THRESHOLD) {
			raw.buttons[ this._config[BUTTON_CONSTANT.BUTTON_RIGHT] ] = true;
		}
	}
};


Gamepad.prototype._isBeforeButtonDown = function(bit_code) {
	var raw = this._gamepad_manager._before_rawgamepads[this._index];

	if (raw) {
		var button_id = this._gamepad_manager._config[bit_code];
		return raw.buttons[button_id].pressed;
	}
	else {
		return false;
	}
};

Gamepad.prototype.isButtonDown = function(bit_code) {
	var raw = this._gamepad_manager._rawgamepads[this._index];

	if (raw) {
		var button_id = this._gamepad_manager._config[bit_code];
		return raw.buttons[button_id].pressed;
	}
	else {
		return false;
	}
};

Gamepad.prototype.isButtonPush = function(bit_code) {
	return !this._isBeforeButtonDown() && this.isButtonDown();
};

Gamepad.prototype.isButtonRelease = function(bit_code) {
	return this._isBeforeButtonDown() && !this.isButtonDown();
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

Gamepad.prototype.getAxisY = function(){
	var raw = this._gamepad_manager._rawgamepads[this._index];

	if (raw) {
		return raw.axes[1];
	}
	else {
		return 0;
	}
};

module.exports = GamepadManager;
