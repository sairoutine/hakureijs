'use strict';

var ObjectPoint = require("../../object/point");
var InputManager = require("./_index");

var TOUCH_IDX_AS_MOUSE = 0;

InputManager.prototype.getTouch = function(idx) {
	if(idx > this._touch_ids.length - 1) {
		// idx's touch has not been touched yet.
		return this._nullTouch();
	}

	var id = this._touch_ids[idx];
	return new Touch(this, id);
};

InputManager.prototype.getAllTouchList = function() {
	var touches = [];
	for(var i = 0, len = this._touch_ids.length; i < len; i++) {
		var id = this._touch_ids[i];
		touches.push(new Touch(this, id));
	}

	return touches;

};

InputManager.prototype.getTouchList = function() {
	var touches = [];
	for(var i = 0, len = this._touch_ids.length; i < len; i++) {
		var id = this._touch_ids[i];

		// Currently touched only
		if (id in this._is_touched_map) {
			touches.push(new Touch(this, id));
		}
	}

	return touches;
};

InputManager.prototype._nullTouch = function() {
	return new Touch(this, -1);
};

InputManager.prototype._handleTouchDown = function(ev) {
	ev.preventDefault();

	// Get absolute coordinate position of canvas and adjust click position
	// because clientX and clientY return the position from the document.
	var rect = ev.target.getBoundingClientRect();

	var touches = ev.changedTouches;
	for (var i = 0, len = touches.length; i < len; i++) {
		var touch = touches[i];
		var id = touch.identifier;

		// Replace released old id with new id
		(function (_this, origin_id) {
			var idx = null;
			for(var i = 0, len = _this._touch_ids.length; i < len; i++) {
				var id = _this._touch_ids[i];

				if (!(id in _this._is_touched_map)) {
					idx = i;
					break;
				}
			}

			if (idx === null) {
				// Because there are no replacable id, so expand _touch_ids array.
				idx = _this._touch_ids.length;
			}
			else {
				// If succeeded to replace old id, also delete touch object.
				delete _this._touch_infos[ _this._touch_ids[idx] ];
			}

			_this._touch_ids[idx] = origin_id;

			// treat as mouse event
			if (idx === TOUCH_IDX_AS_MOUSE) {
				_this._is_left_clicked = true;
			}
		})(this, id);

		var x = (touch.clientX - rect.left) * this._click_position_width_ratio;
		var y = (touch.clientY - rect.top)  * this._click_position_height_ratio;

		// Add touch info
		this._touch_infos[id] = {
			x: x,
			y: y,
			change_x: 0,
			change_y: 0,
		};

		// Set touch flag true
		this._is_touched_map[id] = true;
	}
};
InputManager.prototype._handleTouchUp = function(ev) {
	ev.preventDefault();

	var touches = ev.changedTouches;
	for (var i = 0, len = touches.length; i < len; i++) {
		var touch = touches[i];
		var id = touch.identifier;

		// Set touch flag false
		delete this._is_touched_map[id];

		// treat as mouse event
		if (id === this._touch_ids[TOUCH_IDX_AS_MOUSE]) {
			this._is_left_clicked = false;
		}
	}

};
InputManager.prototype._handleTouchMove = function (ev) {
	ev.preventDefault();

	// get absolute coordinate position of canvas and adjust click position
	// because clientX and clientY return the position from the document.
	var rect = ev.target.getBoundingClientRect();

	var touches = ev.changedTouches;
	for (var i = 0, len = touches.length; i < len; i++) {
		var touch = touches[i];
		var id = touch.identifier;

		if(!(id in this._touch_infos)) {
			// Assumes that no one comes here.
			continue;
		}

		// Update touch info
		var x = touch.clientX - rect.left;
		var y = touch.clientY - rect.top;
		var touch_info = this._touch_infos[id];

		touch_info.change_x = touch_info.x - x;
		touch_info.change_y = touch_info.y - y;
		touch_info.x = x;
		touch_info.y = y;
	}
};

// treat as mouse event
InputManager.prototype._setTouchAsMouse = function(){
	var touch = this.getTouch(TOUCH_IDX_AS_MOUSE);
	if (touch.isTouching()) {
		// update mouse info
		this._mouse_change_x = touch.moveX();
		this._mouse_change_y = touch.moveY();
		this._mouse_x = touch.x();
		this._mouse_y = touch.y();
	}
};

/********************************************
 * touch
 ********************************************/

var Touch = function(input_manager, id) {
	this._input_manager = input_manager;
	this._id = id;
};

Touch.prototype.isEnable = function() {
	return(this._id in this._input_manager._touch_infos);
};

Touch.prototype.isTouching = function() {
	return(this._id in this._input_manager._is_touched_map);
};

Touch.prototype.isTap = function() {
	// not true if is pressed in previous frame
	return this.isTouching() && !(this._id in this._input_manager._before_is_touched_map);
};

Touch.prototype.isTouchRelease = function() {
	return !this.isTouching() && (this._id in this._input_manager._before_is_touched_map);
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
	if(!this.isEnable()) return 0;
	return this._input_manager._touch_infos[this._id].x;
};

Touch.prototype.y = function () {
	if(!this.isEnable()) return 0;
	return this._input_manager._touch_infos[this._id].y;
};

Touch.prototype.moveX = function () {
	if(!this.isEnable()) return 0;
	return this._input_manager._touch_infos[this._id].change_x;
};

Touch.prototype.moveY = function () {
	if(!this.isEnable()) return 0;
	return this._input_manager._touch_infos[this._id].change_y;
};



module.exports = InputManager;
