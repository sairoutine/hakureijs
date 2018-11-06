'use strict';

var ObjectPoint = require("../../object/point");
var InputManager = require("./_index");

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

		var x = (touch.clientX - rect.left) * this._click_position_width_ratio;
		var y = (touch.clientY - rect.top)  * this._click_position_height_ratio;
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

module.exports = InputManager;
