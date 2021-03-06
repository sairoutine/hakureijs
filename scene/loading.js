'use strict';

// loading scene

var base_scene = require('./base');
var util = require('../util');

var SceneLoading = function(core) {
	base_scene.apply(this, arguments);

	// go if the all assets loading is done.
	this.next_scene_name = null;
};
util.inherit(SceneLoading, base_scene);

SceneLoading.prototype.init = function(assets, next_scene_name) {
	base_scene.prototype.init.apply(this, arguments);

	// assets
	var images = assets.images || [];
	var sounds = assets.sounds || [];
	var bgms   = assets.bgms   || [];
	var fonts  = assets.fonts   || [];

	// go if the all assets loading is done.
	this.next_scene_name = next_scene_name;

	this._loadImages(images);
	this._loadSounds(sounds);
	this._loadBGMs(bgms);
	this._loadFonts(fonts);
};

SceneLoading.prototype._loadImages = function(images) {
	for (var key in images) {
		var image_conf = images[key];

		if (typeof image_conf === "string") {
			this.core.image_loader.loadImage(key, image_conf);
		}
		else {
			// load with scale settings
			this.core.image_loader.loadImage(key, image_conf.path, image_conf.scale_width, image_conf.scale_height);
		}
	}
};
SceneLoading.prototype._loadSounds = function(sounds) {
	for (var key2 in sounds) {
		var conf2 = sounds[key2];
		this.core.audio_loader.loadSound(key2, conf2.path, conf2.volume);
	}
};

SceneLoading.prototype._loadBGMs = function(bgms) {
	for (var key3 in bgms) {
		var conf3 = bgms[key3];
		var volume = "volume" in conf3 ? conf3.volume : 1.0;
		this.core.audio_loader.loadBGM(key3, conf3.path, volume, conf3.loopStart, conf3.loopEnd);
	}
};

SceneLoading.prototype._loadFonts = function(fonts) {
	for (var key4 in fonts) {
		var conf4 = fonts[key4];
		this.core.font_loader.loadFont(key4, conf4.path, conf4.format);
	}
};

SceneLoading.prototype.update = function() {
	base_scene.prototype.update.apply(this, arguments);

	if (this.core.isAllLoaded()) {
		this.notifyAllLoaded();
	}
};

SceneLoading.prototype.progress = function(){
	var progress = (this.core.audio_loader.progress() + this.core.image_loader.progress() + this.core.font_loader.progress()) / 3;
	return progress;
};

SceneLoading.prototype.draw = function(){
	base_scene.prototype.draw.apply(this, arguments);
};
SceneLoading.prototype.notifyAllLoaded = function(){
	if (this.next_scene_name) {
		this.core.scene_manager.changeScene(this.next_scene_name);
	}
};


module.exports = SceneLoading;
