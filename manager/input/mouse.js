'use strict';

var ObjectPoint = require("../../object/point");
var InputManager = require("./_index");

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

	var x = (d.clientX - rect.left) * this._click_position_width_ratio;
	var y = (d.clientY - rect.top)  * this._click_position_height_ratio;

	this._mouse_change_x = this._mouse_x - x;
	this._mouse_change_y = this._mouse_y - y;
	this._mouse_x = x;
	this._mouse_y = y;

	d.preventDefault();
};

InputManager.prototype._handleMouseWheel = function (event) {
	this._mouse_scroll = event.detail ? event.detail : -event.wheelDelta/120;
};

module.exports = InputManager;
