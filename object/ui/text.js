'use strict';

var BaseObjectUI = require('./base');
var Util = require('../../util');
var ObjectUIText = function(scene, option) {
	BaseObjectUI.apply(this, arguments);

	option = option || {};

	this._default_property = Util.assign(this._default_property, {
		text:      option.text || "",
		textColor: option.textColor || "black",
		textSize:  option.textSize  || "24px",
		textAlign: option.textAlign || "left",
	});
};
Util.inherit(ObjectUIText, BaseObjectUI);

Util.defineProperty(ObjectUIText, "text");
Util.defineProperty(ObjectUIText, "textColor");
Util.defineProperty(ObjectUIText, "textSize");
Util.defineProperty(ObjectUIText, "textAlign");

ObjectUIText.prototype.init = function() {
	BaseObjectUI.prototype.init.apply(this, arguments);

	this.text(this._default_property.text);
	this.textColor(this._default_property.textColor);
	this.textSize(this._default_property.textSize);
	this.textAlign(this._default_property.textAlign);
};

ObjectUIText.prototype.beforeDraw = function() {
	BaseObjectUI.prototype.beforeDraw.apply(this, arguments);

};

ObjectUIText.prototype.draw = function() {
	if (!this.isShow()) return;
	BaseObjectUI.prototype.draw.apply(this, arguments);

	var ctx = this.core.ctx;

	ctx.save();
	ctx.fillStyle = this.textColor();
	ctx.textAlign = this.textAlign();
	ctx.font = this.textSize() + " 'sans-serif'";
	ctx.fillText(this.text(), this.x(), this.y());
	ctx.restore();
};


module.exports = ObjectUIText;
