'use strict';

var CONSTANT = require("../../constant/button");
var Util = require("../../util");

// const
var DEFAULT_BUTTON_ID_TO_BIT_CODE = {
	0: CONSTANT.BUTTON_Z,
	1: CONSTANT.BUTTON_X,
	2: CONSTANT.BUTTON_SPACE,
	3: CONSTANT.BUTTON_SHIFT,
};

var InputManager = function () {
	this._current_keyflag = 0x0;
	this._before_keyflag = 0x0;
	this._key_bit_code_to_down_time = {};

	// gamepad button_id to bit code of key input
	this._button_id_to_key_bit_code = Util.shallowCopyHash(DEFAULT_BUTTON_ID_TO_BIT_CODE);

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

	this._is_gamepad_usable = false;
};

InputManager.prototype.init = function () {
	this._current_keyflag = 0x0;
	this._before_keyflag = 0x0;
	this._initPressedKeyTime();

	// gamepad button_id to bit code of key input
	this._button_id_to_key_bit_code = Util.shallowCopyHash(DEFAULT_BUTTON_ID_TO_BIT_CODE);

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
InputManager.prototype.beforeRun = function(){
	// get gamepad input
	this._handleGamePad();

	// count pressed key time
	this._setPressedKeyTime();

	// treat as mouse event
	this._setTouchAsMouse();
};

InputManager.prototype.afterRun = function(){
	// save key current pressed keys
	this._before_keyflag = this._current_keyflag;
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
	var self = this;

	// bind keyboard
	window.onkeydown = function(e) { self._handleKeyDown(e); };
	window.onkeyup   = function(e) { self._handleKeyUp(e); };

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

	// bind gamepad
	if(window.Gamepad && window.navigator && window.navigator.getGamepads) {
		self._is_gamepad_usable = true;
	}
};

// called by core class
InputManager.prototype.scaleClickPosition = function (width, height) {
	this._click_position_width_ratio  = width;
	this._click_position_height_ratio = height;
};

module.exports = InputManager;
