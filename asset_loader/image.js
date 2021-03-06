'use strict';

var ImageLoader = function() {
	this.images = {};

	this.loading_image_num = 0;
	this.loaded_image_num = 0;
};
ImageLoader.prototype.init = function() {
	// cancel already loading images
	for(var name in this.images){
		this.images[name].src = "";
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
		self.images[name] = self._generateImageCanvas(name, scale_width, scale_height);
		self.loaded_image_num++;
	};

	var image = new Image();
	image.src = path;
	image.onload = onload_function;
	this.images[name] = image;
};

ImageLoader.prototype.unloadImage = function(name) {
	var self = this;
	if(!(name in self.images)) return;

	self.loading_image_num--;
	self.loaded_image_num--;
	delete self.images[name];
};


ImageLoader.prototype._generateImageCanvas = function(name, scale_width, scale_height) {
	scale_width = typeof scale_width === "undefined" ? 1 : scale_width;
	scale_height = typeof scale_height === "undefined" ? 1 : scale_height;

	var image = this.getImage(name);

	var width = image.width * scale_width;
	var height = image.height * scale_height;

	var offscreen = document.createElement('canvas');
	offscreen.width = width;
	offscreen.height = height;

	var ctx = offscreen.getContext('2d');

	// NOTE: some mobile devices return null perhaps due to low memory.
	if (ctx !== null) {
		ctx.drawImage(image, 0, 0, width, height);
	}

	return offscreen;
};

ImageLoader.prototype.isAllLoaded = function() {
	return this.loaded_image_num === this.loading_image_num;
};
ImageLoader.prototype.isLoaded = function(name) {
	return((name in this.images) ? true : false);
};


ImageLoader.prototype.getImage = function(name) {
	if (!this.isLoaded(name)) throw new Error("Can't find image '" + name + "'.");

	return this.images[name];
};

ImageLoader.prototype.progress = function() {
	// avoid division by zero
	if (this.loading_image_num === 0) return 1;

	return this.loaded_image_num / this.loading_image_num;
};




module.exports = ImageLoader;
