'use strict';

var BaseObject = require('../base');
var Util = require('../../util');

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
		draw: null,
		touch: null,
	};

	// children
	this.objects = this._default_property.children;

	this._show_call_count = 0;

	this._is_touched = false;
};
Util.inherit(ObjectUIBase, BaseObject);

ObjectUIBase.prototype.init = function() {
	// reset children
	this.objects = this._default_property.children;

	BaseObject.prototype.init.apply(this, arguments);

	this._show_call_count = 0;

	this._is_touched = false;

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

	var x, y;
	if (this.isEventSet("click") && this.isShow() && this.core.input_manager.isLeftClickPush()) {
		x = this.core.input_manager.mousePositionX();
		y = this.core.input_manager.mousePositionY();

		if(this.checkCollisionWithPosition(x, y)) {
			this._callEvent("click");
		}
	}

	if (this.isEventSet("touch") && this.isShow()) {
		var touch = this.core.input_manager.getTouch(0);

		x = touch.x();
		y = touch.y();

		if (touch.isTap()) {
			this._is_touched = true;
		}
		else if (touch.isTouchRelease()) {
			if(this.checkCollisionWithPosition(x, y)) {
				this._callEvent("touch");
			}

			this._is_touched = false;
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
};

ObjectUIBase.prototype._callEvent = function (event) {
	this._event_to_callback[event].apply(this);
};

module.exports = ObjectUIBase;
