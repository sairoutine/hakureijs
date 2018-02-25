'use strict';

var BaseObject = require('../base');
var Util = require('../../util');

var ObjectUIBase = function(scene, option) {
	BaseObject.apply(this, arguments);

	option = option || {};

	this._default_property = {
		x: option.x || 0,
		y: option.y || 0,
	};

	// event handler
	this._event_to_callback = {
		beforedraw: function () {},
	};

	this._show_call_count = 0;
};
Util.inherit(ObjectUIBase, BaseObject);

ObjectUIBase.prototype.init = function() {
	BaseObject.prototype.init.apply(this, arguments);

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

ObjectUIBase.prototype.beforeDraw = function() {
	BaseObject.prototype.beforeDraw.apply(this, arguments);

	this._event_to_callback.beforedraw.apply(this);
};

ObjectUIBase.prototype.draw = function() {
	BaseObject.prototype.draw.apply(this, arguments);
};

ObjectUIBase.prototype.isShow = function() {
	return this._show_call_count > 0;
};

ObjectUIBase.prototype.show = function() {
	++this._show_call_count;
};
ObjectUIBase.prototype.hide = function() {
	--this._show_call_count;
};

module.exports = ObjectUIBase;
