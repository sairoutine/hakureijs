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
		clickstart: null,
		clickend: null,
		draw: null,
		touch: null,
		touchstart: null,
		touchend: null,
	};

	// children
	this.objects = this._default_property.children;

	this._show_call_count = 0;

	this._is_touched = false;
	this._is_clicked = false;
};
Util.inherit(ObjectUIBase, BaseObject);

ObjectUIBase.prototype.init = function() {
	// reset children
	this.objects = this._default_property.children;

	BaseObject.prototype.init.apply(this, arguments);

	this._show_call_count = 0;

	this._is_touched = false;
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
		this._updateTouch();
	}
};

ObjectUIBase.prototype._updateClick = function() {
	var x = this.core.input_manager.mousePositionX();
	var y = this.core.input_manager.mousePositionY();

	if(this.core.input_manager.isLeftClickPush()) {
		// check whether the event handler is set
		// because calling checkCollisionWithPosition is heavy for performance.
		if (this.isEventSet("click") || this.isEventSet("clickstart") || this.isEventSet("clickend")) {
			if(this.checkCollisionWithPosition(x, y)) {
				this._is_clicked = true;

				if (this.isEventSet("clickstart")) {
					this._callEvent("clickstart");
				}
			}
		}
	}
	else if (this.core.input_manager.isLeftClickRelease()) {
		if(this._is_clicked) {
			this._is_clicked = false;

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

ObjectUIBase.prototype._updateTouch = function() {
	var touch = this.core.input_manager.getTouch(0);
	var x = touch.x();
	var y = touch.y();

	if (touch.isTap()) {
		// check whether the event handler is set
		// because calling checkCollisionWithPosition is heavy for performance.
		if (this.isEventSet("touch") || this.isEventSet("touchstart") || this.isEventSet("touchend")) {
			if(this.checkCollisionWithPosition(x, y)) {
				this._is_touched = true;

				if (this.isEventSet("touchstart")) {
					this._callEvent("touchstart");
				}
			}
		}
	}
	else if (touch.isTouchRelease()) {
		if(this._is_touched) {
			this._is_touched = false;

			if (this.isEventSet("touchend")) {
				this._callEvent("touchend");
			}

			if(this.checkCollisionWithPosition(x, y)) {
				if (this.isEventSet("touch")) {
					this._callEvent("touch");
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

	// If the game hides the UI while the user is clicking or touching, this._is_XXX will be kept true even after the user releases it.
	// Therefore, force to turn false if the ui is hidden.
	this._is_touched = false;
	this._is_clicked = false;
};

ObjectUIBase.prototype._callEvent = function (event) {
	this._event_to_callback[event].apply(this);
};

module.exports = ObjectUIBase;
