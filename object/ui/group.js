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
		alpha:           option.alpha           || 1.0,
	});
};
Util.inherit(ObjectUIGroup, BaseObjectUI);

Util.defineProperty(ObjectUIGroup, "width");
Util.defineProperty(ObjectUIGroup, "height");
Util.defineProperty(ObjectUIGroup, "backgroundColor");
Util.defineProperty(ObjectUIGroup, "alpha");

ObjectUIGroup.prototype.init = function() {
	BaseObjectUI.prototype.init.apply(this, arguments);

	this.width(this._default_property.width);
	this.height(this._default_property.height);
	this.backgroundColor(this._default_property.backgroundColor);
	this.alpha(this._default_property.alpha);
};

ObjectUIGroup.prototype.update = function() {
	BaseObjectUI.prototype.update.apply(this, arguments);

};

ObjectUIGroup.prototype.draw = function() {
	if (!this.isShow()) return;

	var ctx = this.core.ctx;

	if (this.backgroundColor()) {
		ctx.save();
		ctx.translate(this.x(), this.y());
		ctx.fillStyle = this.backgroundColor();
		ctx.globalAlpha = this.alpha();
		ctx.fillRect(-this.width()/2, -this.height()/2, this.width(), this.height());
		ctx.restore();
	}
	BaseObjectUI.prototype.draw.apply(this, arguments);
};


module.exports = ObjectUIGroup;
