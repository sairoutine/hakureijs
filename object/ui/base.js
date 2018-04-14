'use strict';

var BaseObject = require('../base');
var Util = require('../../util');

var ObjectUIBase = function(scene, option) {
	option = option || {};

	this._default_property = {
		x:        option.x        || 0,
		y:        option.y        || 0,
		children: option.children || [],
	};

	// event handler
	this._event_to_callback = {
		beforedraw: function () {},
	};

	BaseObject.apply(this, arguments);
};
Util.inherit(ObjectUIBase, BaseObject);

ObjectUIBase.prototype.initialize = function() {
	// reset children
	this.objects = this._default_property.children;

	BaseObject.prototype.initialize.apply(this, arguments);

	this._show_call_count = 0;

	// postion
	this.x(this._default_property.x);
	this.y(this._default_property.y);

	// default
	this.show();
};

ObjectUIBase.prototype.on = function (event, callback) {
	this._event_to_callback[event] = callback;

	return this;
};
ObjectUIBase.prototype.removeEvent = function (event) {
	this._event_to_callback[event] = function(){};

	return this;
};

ObjectUIBase.prototype._callEvent = function (event) {
	this._event_to_callback[event].apply(this);
};

ObjectUIBase.prototype.isEventSet = function (event) {
	return this._event_to_callback[event] ? true : false;
};



ObjectUIBase.prototype.beforeDraw = function() {
	BaseObject.prototype.beforeDraw.apply(this, arguments);

	this._callEvent("beforedraw");

	if (this.isEventSet("click") && this.core.input_manager.isLeftClickPush()) {
		var x = this.core.input_manager.mousePositionX();
		var y = this.core.input_manager.mousePositionY();

		if(this.checkCollisionWithPosition(x, y)) {
			this._callEvent("click");
		}
	}
};

ObjectUIBase.prototype.draw = function() {
	BaseObject.prototype.draw.apply(this, arguments);
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
	++this._show_call_count;
};
ObjectUIBase.prototype.hide = function() {
	--this._show_call_count;
};

module.exports = ObjectUIBase;
