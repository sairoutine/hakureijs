'use strict';

var BaseObjectUI = require('./base');
var Util = require('../../util');
var ObjectUIGroup = function(scene, option) {
	BaseObjectUI.apply(this, arguments);

	option = option || {};

	this._default_property = Util.assign(this._default_property, {
		width:           option.width           || 0,
		height:          option.height          || 0,
		backgroundColor: option.backgroundColor || null,
	});
};
Util.inherit(ObjectUIGroup, BaseObjectUI);

Util.defineProperty(ObjectUIGroup, "width");
Util.defineProperty(ObjectUIGroup, "height");
Util.defineProperty(ObjectUIGroup, "backgroundColor");

ObjectUIGroup.prototype.init = function() {
	BaseObjectUI.prototype.init.apply(this, arguments);

	this.width(this._default_property.width);
	this.height(this._default_property.height);
	this.backgroundColor(this._default_property.backgroundColor);
};

ObjectUIGroup.prototype.beforeDraw = function() {
	BaseObjectUI.prototype.beforeDraw.apply(this, arguments);

};

ObjectUIGroup.prototype.draw = function() {
	if (!this.isShow()) return;
	BaseObjectUI.prototype.draw.apply(this, arguments);

	var ctx = this.core.ctx;

	if (this.backgroundColor()) {
		ctx.save();
		ctx.fillStyle = this.backgroundColor();
		ctx.fillRect(this.x(), this.y(), this.width(), this.height());
		ctx.restore();
	}
};


module.exports = ObjectUIGroup;