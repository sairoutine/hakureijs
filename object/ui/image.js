'use strict';

var BaseObjectUI = require('./base');
var Util = require('../../util');
var ObjectUIImage = function(scene, option) {
	BaseObjectUI.apply(this, arguments);

	option = option || {};

	this._default_property = Util.assign(this._default_property, {
		imageName: option.imageName  || null,
		scale:     option.scale      || 1,
		width:     option.width      || null,
		height:    option.height     || null,
	});
};
Util.inherit(ObjectUIImage, BaseObjectUI);

Util.defineProperty(ObjectUIImage, "imageName");
Util.defineProperty(ObjectUIImage, "scale");
Util.defineProperty(ObjectUIImage, "width");
Util.defineProperty(ObjectUIImage, "height");

ObjectUIImage.prototype.init = function() {
	BaseObjectUI.prototype.init.apply(this, arguments);

	this.imageName(this._default_property.imageName);
	this.scale(this._default_property.scale);
	this.width(this._default_property.width);
	this.height(this._default_property.height);

	if (!this.width() && !this.height()) {
		var image = this.core.image_loader.getImage(this.imageName());
		this.width(image.width * this.scale());
		this.height(image.height * this.scale());
	}
};

ObjectUIImage.prototype.update = function() {
	BaseObjectUI.prototype.update.apply(this, arguments);

};

ObjectUIImage.prototype.draw = function() {
	if (!this.isShow()) return;

	var image = this.core.image_loader.getImage(this.imageName());
	var width  = image.width  * this.scale();
	var height = image.height * this.scale();
	var ctx = this.core.ctx;
	ctx.save();
	ctx.translate(this.x(), this.y());
	ctx.drawImage(image,
		-width/2,
		-height/2,
		width,
		height
	);
	ctx.restore();
	BaseObjectUI.prototype.draw.apply(this, arguments);
};


module.exports = ObjectUIImage;
