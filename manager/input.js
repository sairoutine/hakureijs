'use strict';

var CONSTANT = require("../constant/button");
var Util = require("../util");
var ObjectPoint = require("../object/point");

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
	this._before_is_touch_map = {};
	this._first_touch_id = null;

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
	this._before_is_touch_map = {};
	this._first_touch_id = null;
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


	this._before_is_touch_map = {};

	for(var id in this._touch_infos) {
		var touch_info = this._touch_infos[id];

		// reset touch move
		touch_info.change_x = 0;
		touch_info.change_y = 0;

		// save current touched
		this._before_is_touch_map[id] = true;
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

/********************************************
 * keyboard
 ********************************************/

InputManager.prototype.isKeyDown = function(flag) {
	return((this._current_keyflag & flag) ? true : false);
};

InputManager.prototype.isKeyPush = function(flag) {
	return !(this._before_keyflag & flag) && this._current_keyflag & flag;
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
			this._key_bit_code_to_down_time[bit_code]++;
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

/********************************************
 * mouse
 ********************************************/
InputManager.prototype.isLeftClickDown = function() {
	return this._is_left_clicked;
};

InputManager.prototype.isLeftClickPush = function() {
	// not true if is pressed in previous frame
	return this._is_left_clicked && !this._before_is_left_clicked;
};

InputManager.prototype.isRightClickDown = function() {
	return this._is_right_clicked;
};

InputManager.prototype.isRightClickPush = function() {
	// not true if is pressed in previous frame
	return this._is_right_clicked && !this._before_is_right_clicked;
};

InputManager.prototype.mousePositionPoint = function (scene) {
	var x = this.mousePositionX();
	var y = this.mousePositionY();

	var point = new ObjectPoint(scene);
	point.init();
	point.setPosition(x, y);


	return point;
};

// get values which the mouse wheel rolled
InputManager.prototype.mouseScroll = function () {
	return this._mouse_scroll;
};

InputManager.prototype.mousePositionX = function () {
	return this._mouse_x;
};

InputManager.prototype.mousePositionY = function () {
	return this._mouse_y;
};

InputManager.prototype.mouseMoveX = function () {
	return this._mouse_change_x;
};

InputManager.prototype.mouseMoveY = function () {
	return this._mouse_change_y;
};

InputManager.prototype._handleMouseDown = function(event) {
	if ("which" in event) { // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
		this._is_left_clicked  = event.which === 1;
		this._is_right_clicked = event.which === 3;
	}
	else if ("button" in event) {  // IE, Opera
		this._is_left_clicked  = event.button === 1;
		this._is_right_clicked = event.button === 2;
	}
	event.preventDefault();
};
InputManager.prototype._handleMouseUp = function(event) {
	if ("which" in event) { // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
		this._is_left_clicked  = event.which === 1 ? false : this._is_left_clicked;
		this._is_right_clicked = event.which === 3 ? false : this._is_right_clicked;
	}
	else if ("button" in event) {  // IE, Opera
		this._is_left_clicked  = event.button === 1 ? false : this._is_left_clicked;
		this._is_right_clicked = event.button === 2 ? false : this._is_right_clicked;
	}
	event.preventDefault();
};

InputManager.prototype._handleMouseMove = function (d) {
	d = d ? d : window.event;

	// get absolute coordinate position of canvas and adjust click position
	// because clientX and clientY return the position from the document.
	var rect = d.target.getBoundingClientRect();

	var x = d.clientX - rect.left;
	var y = d.clientY - rect.top;

	this._mouse_change_x = this._mouse_x - x;
	this._mouse_change_y = this._mouse_y - y;
	this._mouse_x = x;
	this._mouse_y = y;

	d.preventDefault();
};

InputManager.prototype._handleMouseWheel = function (event) {
	this._mouse_scroll = event.detail ? event.detail : -event.wheelDelta/120;
};

/********************************************
 * touch
 ********************************************/

var Touch = function(input_manager, id) {
	this._input_manager = input_manager;
	this._id = id;
};

Touch.prototype.isTouching = function() {
	return(this._id in this._input_manager._touch_infos);
};

Touch.prototype.isTap = function() {
	// not true if is pressed in previous frame
	return this.isTouching() && !this._input_manager._before_is_touch_map[this._id];
};

Touch.prototype.positionPoint = function (scene) {
	var x = this.x();
	var y = this.y();

	var point = new ObjectPoint(scene);
	point.init();
	point.setPosition(x, y);

	return point;
};

Touch.prototype.x = function () {
	if(!this.isTouching()) return 0;
	return this._input_manager._touch_infos[this._id].x;
};

Touch.prototype.y = function () {
	if(!this.isTouching()) return 0;
	return this._input_manager._touch_infos[this._id].y;
};

Touch.prototype.moveX = function () {
	if(!this.isTouching()) return 0;
	return this._input_manager._touch_infos[this._id].change_x;
};

Touch.prototype.moveY = function () {
	if(!this.isTouching()) return 0;
	return this._input_manager._touch_infos[this._id].change_y;
};

InputManager.prototype.getAnyTouch = function() {
	if(this._first_touch_id === null) {
		return new Touch(this, -1);
	}

	return new Touch(this, this._first_touch_id);
};
InputManager.prototype.getTouchList = function() {
	var touches = [];
	for(var id in this._touch_infos) {
		touches.push(new Touch(this, id));
	}

	return touches;
};

InputManager.prototype._handleTouchDown = function(ev) {
	// get absolute coordinate position of canvas and adjust click position
	// because clientX and clientY return the position from the document.
	var rect = event.target.getBoundingClientRect();

	var touches = ev.changedTouches;
	for (var i = 0, len = touches.length; i < len; i++) {
		var touch = touches[i];
		var id = touch.identifier;

		var x = touch.clientX - rect.left;
		var y = touch.clientY - rect.top;

		// add touch info
		this._touch_infos[id] = {
			x: x,
			y: y,
			change_x: 0,
			change_y: 0,
		};

		if(this._first_touch_id === null) {
			// treat only first touch as mouse click
			this._first_touch_id = id;

			// treat touch as mouse click
			this._is_left_clicked = true;
		}
	}

	event.preventDefault();
};
InputManager.prototype._handleTouchUp = function(ev) {
	var touches = ev.changedTouches;

	for (var i = 0, len = touches.length; i < len; i++) {
		var touch = touches[i];
		var id = touch.identifier;

		// delete touch info
		if(id in this._touch_infos) {
			delete this._touch_infos[id];

			if(this._first_touch_id === id) {
				this._first_touch_id = null;

				// treat touch as mouse click
				this._is_left_clicked = false;
			}
		}
	}

	event.preventDefault();
};
InputManager.prototype._handleTouchMove = function (ev) {
	// get absolute coordinate position of canvas and adjust click position
	// because clientX and clientY return the position from the document.
	var rect = event.target.getBoundingClientRect();

	var touches = ev.changedTouches;
	for (var i = 0, len = touches.length; i < len; i++) {
		var touch = touches[i];
		var id = touch.identifier;

		// update touch info
		if(id in this._touch_infos) {
			var x = touch.clientX - rect.left;
			var y = touch.clientY - rect.top;
			var touch_info = this._touch_infos[id];

			touch_info.change_x = touch_info.x - x;
			touch_info.change_y = touch_info.y - y;
			touch_info.x = x;
			touch_info.y = y;
		}
	}

	event.preventDefault();
};

InputManager.prototype._setTouchAsMouse = function(){
	if (this._first_touch_id !== null) {
		// update mouse info
		var touch_info = this._touch_infos[this._first_touch_id];
		this._mouse_change_x = touch_info.change_x;
		this._mouse_change_y = touch_info.change_y;
		this._mouse_x = touch_info.x;
		this._mouse_y = touch_info.y;
	}
};

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
				// the player presses target_button_id, no event has occured.
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
