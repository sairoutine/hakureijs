'use strict';

var LINES = 16;

var BaseObjectUI = require('./base');
var Util = require('../../util');

var ObjectUISpinner = function(scene, option) {
	BaseObjectUI.apply(this, arguments);

	option = option || {};

	this._default_property = Util.assign(this._default_property, {
		size:  option.size  || "",
		color: option.color || "black",
	});
};
Util.inherit(ObjectUISpinner, BaseObjectUI);

Util.defineProperty(ObjectUISpinner, "size");
Util.defineProperty(ObjectUISpinner, "color");

ObjectUISpinner.prototype.init = function() {
	BaseObjectUI.prototype.init.apply(this, arguments);

	this.size(this._default_property.size);
	this.color(this._default_property.color);

	this._start = new Date();
};

ObjectUISpinner.prototype.beforeDraw = function() {
	BaseObjectUI.prototype.beforeDraw.apply(this, arguments);

};

ObjectUISpinner.prototype.draw = function() {
	if (!this.isShow()) return;

	var ctx = this.core.ctx;

    var rotation = Math.floor(this.frame_count / 60 * LINES) / LINES;
    ctx.save();
    ctx.translate(this.x(), this.y());
    ctx.rotate(Math.PI * 2 * rotation);
    for (var i = 0; i < LINES; i++) {

        ctx.beginPath();
        ctx.rotate(Math.PI * 2 / LINES);
        ctx.moveTo(this.size() / 10, 0);
        ctx.lineTo(this.size() / 4, 0);
        ctx.lineWidth = this.size() / 30;
		ctx.globalAlpha = i / LINES;
        ctx.strokeStyle = this.color();
        ctx.stroke();
    }
    ctx.restore();
	BaseObjectUI.prototype.draw.apply(this, arguments);
};

ObjectUISpinner.prototype.width = function() { return this.size()/2; };
ObjectUISpinner.prototype.height = function() { return this.size()/2; };

module.exports = ObjectUISpinner;
