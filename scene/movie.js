'use strict';

// movie scene

var base_scene = require('./base');
var util = require('../util');

var SceneMovie = function(core) {
	base_scene.apply(this, arguments);

	this.video = null;

	// go if the movie is done.
	this.next_scene_name_and_args = null;

	this.is_playing = false;

	this._height = null;
	this._width  = null;
	this._top    = null;
	this._left   = null;

	this.is_mute = false;
};
util.inherit(SceneMovie, base_scene);

SceneMovie.prototype.init = function(movie_path, callback) {
	base_scene.prototype.init.apply(this, arguments);

	var self = this;

	self.is_playing = false;

	self._height = null;
	self._width  = null;
	self._top    = null;
	self._left   = null;

	// go if the movie is done.
	self._callback = function(){};
	if (callback) {
		self._callback = callback;
	}

	// stop bgm if it is played.
	this.core.audio_loader.stopBGM();

	var video = document.createElement("video");
	video.src = movie_path;
	video.controls = false;
	video.preload = "auto";
	video.oncanplaythrough = function () {
		self._calcDrawSizeAndPosition();

		video.play();

		self.is_playing = true;
	};

	if (this.is_mute) {
		video.muted = true;
	}

	video.load();


	self.video = video;
};

SceneMovie.prototype.beforeDraw = function(){
	base_scene.prototype.beforeDraw.apply(this, arguments);

	if(this.is_playing && this.video.ended) {
		this.notifyEnd();
	}
};

SceneMovie.prototype.draw = function(){
	base_scene.prototype.draw.apply(this, arguments);

	var ctx = this.core.ctx;

	if(!ctx) return; // 2D context has been depricated in this game

	ctx.save();
	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, this.core.width, this.core.height);

	if (this.is_playing) {
		ctx.drawImage(this.video, 0, 0, this.video.videoWidth, this.video.videoHeight, this._left, this._top, this._width, this._height);
	}
	ctx.restore();
};

SceneMovie.prototype._calcDrawSizeAndPosition = function(){
	var scene_aspect = this.width / this.height; // canvas aspect
	var video_aspect = this.video.videoWidth / this.video.videoHeight; // video aspect
	var left, top, width, height;

	if(video_aspect >= scene_aspect) { // video width is larger than it's height
		width = this.width;
		height = this.width / video_aspect;
		top = (this.height - height) / 2;
		left = 0;
	}
	else { // video height is larger than it's width
		height = this.height;
		width = this.height * video_aspect;
		top = 0;
		left = (this.width - width) / 2;
	}


	this._height = height;
	this._width  = width;
	this._top    = top;
	this._left   = left;
};

SceneMovie.prototype.notifyEnd = function(){
	// release video data memory
	this.video = null;

	this.is_playing = false;


	this._callback();
};


module.exports = SceneMovie;
