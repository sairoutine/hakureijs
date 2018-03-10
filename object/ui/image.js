'use strict';

var BaseObjectUI = require('./base');
var Util = require('../../util');
var ObjectUIImage = function(scene, option) {
	BaseObjectUI.apply(this, arguments);

	option = option || {};

	this._default_property = Util.assign(this._default_property, {
		image_name: option.image_name || null,
		scale:      option.scale      || 1,
		width:      option.width      || null,
		height:     option.height     || null,
	});
};
Util.inherit(ObjectUIImage, BaseObjectUI);

Util.defineProperty(ObjectUIImage, "image_name");
Util.defineProperty(ObjectUIImage, "scale");
Util.defineProperty(ObjectUIImage, "width");
Util.defineProperty(ObjectUIImage, "height");

ObjectUIImage.prototype.init = function() {
	BaseObjectUI.prototype.init.apply(this, arguments);

	this.image_name(this._default_property.image_name);
	this.scale(this._default_property.scale);
	this.width(this._default_property.width);
	this.height(this._default_property.height);

	if (!this.width() && !this.height()) {
		var image = this.core.image_loader.getImage(this.image_name());
		this.width(image.width * this.scale());
		this.height(image.height * this.scale());
	}
};

ObjectUIImage.prototype.beforeDraw = function() {
	BaseObjectUI.prototype.beforeDraw.apply(this, arguments);

};

ObjectUIImage.prototype.draw = function() {
	if (!this.isShow()) return;
	BaseObjectUI.prototype.draw.apply(this, arguments);

	var image = this.core.image_loader.getImage(this.image_name());
	var width  = image.width  * this.scale();
	var height = image.height * this.scale();
	var ctx = this.core.ctx;
	ctx.save();
	ctx.translate(this.x(), this.y());
	ctx.drawImage(image,
		//-width/2,
		//-height/2,
		0,
		0,
		width,
		height
	);
	ctx.restore();
};


module.exports = ObjectUIImage;
