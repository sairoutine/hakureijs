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
};

GamepadManager.prototype.init = function () {
	this._rawgamepads = [];
	this._before_rawgamepads = [];

	this._pads = [];
};

GamepadManager.prototype.update = function(){
	// get gamepad input
	this._handleGamePad();

	for (var i = 0, len = this._pads.length; i < len; i++) {
		this._pads[i].update();
	}
};

GamepadManager.prototype._handleGamePad = function() {
	if(!this._is_gamepad_usable) return;
	var rawgamepads = window.navigator.getGamepads();

	this._copy(this._rawgamepads, rawgamepads);
};

// TODO: bug
GamepadManager.prototype._copy = function(before, after) {
	for (var i = 0, len = after.length; i < len; i++) {
		if (!(i in before)) {
			before[i] = {};
		}

		if (!after[i]) {
			continue;
		}

		before[i].connected = after[i].connected;
		before[i].id        = after[i].id;
		before[i].axes      = after[i].axes;
		if (!("buttons" in before[i])) {
			before[i].buttons = [];
		}
		for (var j = 0, len2 = after[i].buttons.length; j < len2; j++) {
			if(!(j in before[i].buttons)) {
				before[i].buttons[j] = {};
			}
			before[i].buttons[j].pressed = after[i].buttons[j].pressed;
			before[i].buttons[j].value = after[i].buttons[j].value;
		}
	}
};

GamepadManager.prototype.afterDraw = function(){
	// save key current pressed buttons
	this._copy(this._before_rawgamepads, this._rawgamepads);
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

// TODO: bug
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

	this._setAnalogStickAsAxis();

	// Count button pressed time.
	this._setPressedTime();
};

// TODO: bug
Gamepad.prototype._updateConfig = function() {
	var current_raw = this._gamepad_manager._rawgamepads[this._index];
	var before_raw = this._gamepad_manager._before_rawgamepads[this._index];
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

Gamepad.prototype._setAnalogStickAsAxis = function() {
	return;
	var raw = this._gamepad_manager._rawgamepads[this._index];

	if (this._gamepad_manager._rawgamepads[this._index]) {
		if (raw.axes[1] < -ANALOGUE_BUTTON_THRESHOLD) {
			this._gamepad_manager._rawgamepads[this._index].buttons[ this._config[BUTTON_CONSTANT.UP] ] = {pressed: true};
		}
		if (raw.axes[1] > ANALOGUE_BUTTON_THRESHOLD) {
			this._gamepad_manager._rawgamepads[this._index].buttons[ this._config[BUTTON_CONSTANT.DOWN] ] = {pressed: true};
		}
		if (raw.axes[0] < -ANALOGUE_BUTTON_THRESHOLD) {
			this._gamepad_manager._rawgamepads[this._index].buttons[ this._config[BUTTON_CONSTANT.LEFT] ] = {pressed: true};
		}
		if (raw.axes[0] > ANALOGUE_BUTTON_THRESHOLD) {
			this._gamepad_manager._rawgamepads[this._index].buttons[ this._config[BUTTON_CONSTANT.RIGHT] ] = {pressed: true};
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
			return raw.buttons[button_id].pressed;
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
			return raw.buttons[button_id].pressed;
		}
		else {
			return false;
		}
	}
	else {
		return false;
	}
};

// TODO: bug
Gamepad.prototype.isButtonPush = function(bit_code) {
	return (!this._isBeforeButtonDown(bit_code) && this.isButtonDown(bit_code));
};

// TODO: bug
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
