'use strict';

var BaseObject = require('../base');
var Util = require('../../util');

var MOVE_ON_CLICK_PX = 3;

var ObjectUIBase = function(scene, option) {
	BaseObject.apply(this, arguments);

	option = option || {};

	this._default_property = {
		x:        option.x        || 0,
		y:        option.y        || 0,
		children: option.children || [],
	};

	// event handler
	this._event_to_callback = {
		update: null,
		beforedraw: null,
		click: null,
		clickstart: null,
		clickend: null,
		draw: null,
	};

	this._move_on_click_px = 0;

	// children
	this.objects = this._default_property.children;

	this._show_call_count = 0;

	this._is_clicked = false;
};
Util.inherit(ObjectUIBase, BaseObject);

ObjectUIBase.prototype.init = function() {
	// reset children
	this.objects = this._default_property.children;

	BaseObject.prototype.init.apply(this, arguments);

	this._show_call_count = 0;

	this._is_clicked = false;

	// position
	this.x(this._default_property.x);
	this.y(this._default_property.y);

	// default
	this.show();
};

ObjectUIBase.prototype.update = function() {
	BaseObject.prototype.update.apply(this, arguments);

	if(this.isEventSet("update")) {
		this._callEvent("update");
	}

	if (this.isShow()) {
		this._updateClick();
	}
};

ObjectUIBase.prototype._updateClick = function() {
	var x = this.core.input_manager.mousePositionX();
	var y = this.core.input_manager.mousePositionY();

	if(this.core.input_manager.isLeftClickPush()) {
		// check whether the event handler is set
		// because calling checkCollisionWithPosition is heavy for performance.
		if (this.isEventSet("click") || this.isEventSet("clickstart") || this.isEventSet("clickend") || this._move_on_click_px) {
			if(this.checkCollisionWithPosition(x, y)) {
				this._is_clicked = true;

				this._moveOnClickStart();

				if (this.isEventSet("clickstart")) {

					this._callEvent("clickstart");
				}
			}
		}
	}
	else if (this.core.input_manager.isLeftClickRelease()) {
		if(this._is_clicked) {
			this._is_clicked = false;

			this._moveOnClickEnd();

			if (this.isEventSet("clickend")) {
				this._callEvent("clickend");
			}

			if(this.checkCollisionWithPosition(x, y)) {
				if (this.isEventSet("click")) {
					this._callEvent("click");
				}
			}
		}
	}
};


ObjectUIBase.prototype.beforeDraw = function() {
	BaseObject.prototype.beforeDraw.apply(this, arguments);

	if(this.isEventSet("beforedraw")) {
		this._callEvent("beforedraw");
	}
};

ObjectUIBase.prototype.draw = function() {
	if(!this.isShow()) return;

	BaseObject.prototype.draw.apply(this, arguments);

	if(this.isEventSet("draw")) {
		this._callEvent("draw");
	}
};

ObjectUIBase.prototype.setMoveOnClick = function () {
	this._move_on_click_px = MOVE_ON_CLICK_PX;

	return this;
};

ObjectUIBase.prototype.on = function (event, callback) {
	this._event_to_callback[event] = callback;

	return this;
};
ObjectUIBase.prototype.removeEvent = function (event) {
	this._event_to_callback[event] = null;

	return this;
};

ObjectUIBase.prototype.isEventSet = function (event) {
	return this._event_to_callback[event] ? true : false;
};

ObjectUIBase.prototype.isShow = function() {
	return this._show_call_count > 0;
};

ObjectUIBase.prototype.collisionWidth = function() {
	return this.width();
};

ObjectUIBase.prototype.collisionHeight = function() {
	return this.height();
};

ObjectUIBase.prototype.show = function() {
	this._show_call_count = 1;
};
ObjectUIBase.prototype.hide = function() {
	this._show_call_count = 0;

	// If the game hides the UI while the user is clicking, this._is_clicked will be kept true even after the user releases it.
	// Therefore, force to turn false if the ui is hidden.
	this._is_clicked = false;
};

ObjectUIBase.prototype._callEvent = function (event) {
	this._event_to_callback[event].apply(this);
};

ObjectUIBase.prototype._moveOnClickStart = function () {
	if (this._move_on_click_px === 0) return;

	this.x(this.x() + this._move_on_click_px);
	this.y(this.y() + this._move_on_click_px);

	for (var i = 0, len = this.objects.length; i < len; i++) {
		var child = this.objects[i];
		child.x(child.x() + this._move_on_click_px);
		child.y(child.y() + this._move_on_click_px);
	}

};

ObjectUIBase.prototype._moveOnClickEnd = function () {
	if (this._move_on_click_px === 0) return;

	this.x(this.x() - this._move_on_click_px);
	this.y(this.y() - this._move_on_click_px);

	for (var i = 0, len = this.objects.length; i < len; i++) {
		var child = this.objects[i];
		child.x(child.x() - this._move_on_click_px);
		child.y(child.y() - this._move_on_click_px);
	}
};

module.exports = ObjectUIBase;
