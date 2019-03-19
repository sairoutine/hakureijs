'use strict';

var GamepadManager = require("./gamepad");
var KeyboardManager = require("./keyboard");

var InputManager = function () {
	this._gamepad = new GamepadManager(this);
	this._keyboard = new KeyboardManager(this);

	this._is_left_clicked  = false;
	this._is_right_clicked = false;
	this._before_is_left_clicked  = false;
	this._before_is_right_clicked = false;
	this._mouse_change_x = 0;
	this._mouse_change_y = 0;
	this._mouse_x = 0;
	this._mouse_y = 0;
	this._mouse_scroll = 0;

	this._touch_infos = {};
	this._before_is_touched_map = {};
	this._is_touched_map = {};
	this._touch_ids = [];

	this._click_position_width_ratio = 1;
	this._click_position_height_ratio = 1;

};

InputManager.prototype.init = function () {
	this._gamepad.init();
	this._keyboard.init();

	this._is_left_clicked  = false;
	this._is_right_clicked = false;
	this._before_is_left_clicked  = false;
	this._before_is_right_clicked = false;
	this._mouse_change_x = 0;
	this._mouse_change_y = 0;
	this._mouse_x = 0;
	this._mouse_y = 0;
	this._mouse_scroll = 0;

	this._touch_infos = {};
	this._before_is_touched_map = {};
	this._is_touched_map = {};
	this._touch_ids = [];

	this._click_position_width_ratio = 1;
	this._click_position_height_ratio = 1;
};
InputManager.prototype.update = function(){
	this._gamepad.update();
	this._keyboard.update();

	// treat as mouse event
	this._setTouchAsMouse();
};

InputManager.prototype.afterDraw = function(){
	this._gamepad.afterDraw();
	this._keyboard.afterDraw();

	// save key current clicked mouse
	this._before_is_left_clicked = this._is_left_clicked;
	this._before_is_right_clicked = this._is_right_clicked;

	// reset mouse wheel and mouse move
	this._mouse_scroll = 0;
	this._mouse_change_x = 0;
	this._mouse_change_y = 0;

	this._before_is_touched_map = {};

	for(var id in this._touch_infos) {
		var touch_info = this._touch_infos[id];

		// reset touch move
		touch_info.change_x = 0;
		touch_info.change_y = 0;

		// save current touched
		if(id in this._is_touched_map) {
			this._before_is_touched_map[id] = true;
		}
	}
};

InputManager.prototype.setupEvents = function(canvas_dom) {
	this._gamepad.setupEvents(canvas_dom);
	this._keyboard.setupEvents(canvas_dom);

	var self = this;

	// bind mouse click
	canvas_dom.onmousedown = function(e) { self._handleMouseDown(e); };
	canvas_dom.onmouseup   = function(e) { self._handleMouseUp(e); };

	// bind mouse move
	canvas_dom.onmousemove = function(d) { self._handleMouseMove(d); };

	// bind touch
	canvas_dom.ontouchstart = function(e) { self._handleTouchDown(e); };
	canvas_dom.ontouchend   = function(e) { self._handleTouchUp(e); };

	// bind touch move
	canvas_dom.ontouchmove = function(d) { self._handleTouchMove(d); };

	// bind mouse wheel
	var mousewheelevent = (window.navi && /Firefox/i.test(window.navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel";
	if (canvas_dom.addEventListener) { //WC3 browsers
		canvas_dom.addEventListener(mousewheelevent, function(e) {
			var event = window.event || e;
			self._handleMouseWheel(event);
		}, false);
	}

	// unable to use right click menu.
	canvas_dom.oncontextmenu = function() { return false; };
};

// called by core class
InputManager.prototype.scaleClickPosition = function (width, height) {
	this._click_position_width_ratio  = width;
	this._click_position_height_ratio = height;
};

/********************************************
 * keyboard
 ********************************************/

InputManager.prototype.isKeyDown = function(bit_code) {
	if (typeof bit_code === "undefined") throw new Error("isKeyDown needs arguments.");
	return this._keyboard.isKeyDown.apply(this._keyboard, arguments);
};

InputManager.prototype.isKeyPush = function(bit_code) {
	if (typeof bit_code === "undefined") throw new Error("isKeyPush needs arguments.");
	return this._keyboard.isKeyPush.apply(this._keyboard, arguments);
};

InputManager.prototype.isKeyRelease = function(bit_code) {
	if (typeof bit_code === "undefined") throw new Error("isKeyRelease needs arguments.");
	return this._keyboard.isKeyRelease.apply(this._keyboard, arguments);
};

InputManager.prototype.getKeyDownTime = function(bit_code) {
	if (typeof bit_code === "undefined") throw new Error("getKeyDownTime needs arguments.");
	return this._keyboard.getKeyDownTime.apply(this._keyboard, arguments);
};

/********************************************
 * gamepad
 ********************************************/

// get one of the pressed button id
InputManager.prototype.getAnyButtonId = function(){
	throw new Error("InputManager's getAnyButtonId method is deprecated.");
};

InputManager.prototype.getGamepad = function(index) {
	return this._gamepad.getGamepad.apply(this._gamepad, arguments);
};

InputManager.prototype.getGamepadList = function() {
	return this._gamepad.getGamepadList.apply(this._gamepad, arguments);
};

InputManager.prototype.isGamepadConnected = function(index) {
	return this._gamepad.isGamepadConnected.apply(this._gamepad, arguments);
};

module.exports = InputManager;
