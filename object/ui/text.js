'use strict';

var BaseObjectUI = require('./base');
var Util = require('../../util');
var ObjectUIText = function(scene, option) {
	BaseObjectUI.apply(this, arguments);

	option = option || {};

	this._default_property = Util.assign(this._default_property, {
		text:         option.text         || "",
		textColor:    option.textColor    || "black",
		textSize:     option.textSize     || "24px",
		textAlign:    option.textAlign    || "left",
		textBaseline: option.textBaseline || "alphabetic",
		textFont:     option.textFont     || "sans-serif",
		lineColor:    option.lineColor    || null,
		lineWidth:    option.lineWidth    || 1.0,
	});
};
Util.inherit(ObjectUIText, BaseObjectUI);

Util.defineProperty(ObjectUIText, "text");
Util.defineProperty(ObjectUIText, "textColor");
Util.defineProperty(ObjectUIText, "textSize");
Util.defineProperty(ObjectUIText, "textAlign");
Util.defineProperty(ObjectUIText, "textBaseline");
Util.defineProperty(ObjectUIText, "textFont");
Util.defineProperty(ObjectUIText, "lineColor");
Util.defineProperty(ObjectUIText, "lineWidth");

ObjectUIText.prototype.init = function() {
	BaseObjectUI.prototype.init.apply(this, arguments);

	this.text(this._default_property.text);
	this.textColor(this._default_property.textColor);
	this.textSize(this._default_property.textSize);
	this.textAlign(this._default_property.textAlign);
	this.textBaseline(this._default_property.textBaseline);
	this.textFont(this._default_property.textFont);
	this.lineColor(this._default_property.lineColor);
	this.lineWidth(this._default_property.lineWidth);
};

ObjectUIText.prototype.update = function() {
	BaseObjectUI.prototype.update.apply(this, arguments);

};

ObjectUIText.prototype.draw = function() {
	if (!this.isShow()) return;

	var ctx = this.core.ctx;

	ctx.save();
	ctx.textAlign = this.textAlign();
	ctx.textBaseline = this.textBaseline();
	ctx.font = this.textSize() + " '" + this.textFont() + "'";

	if (this.lineColor() && this.lineWidth()) {
		ctx.strokeStyle = this.lineColor();
		ctx.lineWidth = this.lineWidth();
		ctx.strokeText(this.text(), this.x(), this.y());
	}

	ctx.fillStyle = this.textColor();
	ctx.fillText(this.text(), this.x(), this.y());

	ctx.restore();
	BaseObjectUI.prototype.draw.apply(this, arguments);
};


module.exports = ObjectUIText;
