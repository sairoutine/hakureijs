'use strict';

var ImageLoader = function() {
	this.initialize();
};
ImageLoader.prototype.initialize = function() {
	// cancel already loading images
	for(var name in this.images){
		this.images[name].image.src = "";
	}
	this.images = {};

	this.loading_image_num = 0;
	this.loaded_image_num = 0;
};

ImageLoader.prototype.loadImage = function(name, path, scale_width, scale_height) {
	var self = this;

	self.loading_image_num++;

	// it's done to load image
	var onload_function = function() {
		self.loaded_image_num++;
	};

	var image = new Image();
	image.src = path;
	image.onload = onload_function;
	this.images[name] = {
		scale_width: scale_width,
		scale_height: scale_height,
		image: image,
	};
};

ImageLoader.prototype.isAllLoaded = function() {
	return this.loaded_image_num === this.loading_image_num;
};
ImageLoader.prototype.isLoaded = function(name) {
	return((name in this.images) ? true : false);
};


ImageLoader.prototype.getImage = function(name) {
	if (!this.isLoaded(name)) throw new Error("Can't find image '" + name + "'.");

	return this.images[name].image;
};
ImageLoader.prototype.getScaleWidth = function(name) {
	if (!this.isLoaded(name)) throw new Error("Can't find image '" + name + "'.");

	return this.images[name].scale_width;
};
ImageLoader.prototype.getScaleHeight = function(name) {
	if (!this.isLoaded(name)) throw new Error("Can't find image '" + name + "'.");

	return this.images[name].scale_height;
};



ImageLoader.prototype.progress = function() {
	// avoid division by zero
	if (this.loading_image_num === 0) return 1;

	return this.loaded_image_num / this.loading_image_num;
};




module.exports = ImageLoader;
