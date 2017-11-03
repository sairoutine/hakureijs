'use strict';

// movie scene

var base_scene = require('./base');
var util = require('../util');

var SceneMovie = function(core) {
	base_scene.apply(this, arguments);

	this.video = null;

	// go if the movie is done.
	this.next_scene_name = null;

	this.is_playing = false;
};
util.inherit(SceneMovie, base_scene);

SceneMovie.prototype.init = function(movie_path, next_scene_name) {
	base_scene.prototype.init.apply(this, arguments);

	var self = this;

	self.is_playing = false;

	// go if the movie is done.
	self.next_scene_name = next_scene_name;

	var video = document.createElement("video");
	video.src = movie_path;
	video.controls = false;
	video.preload = "auto";
	video.onended = function () {
		self.notifyEnd();
	};
	video.oncanplaythrough = function () {
		self.is_playing = true;
		video.play();
	};
	video.load();


	self.video = video;
};

SceneMovie.prototype.draw = function(){
	base_scene.prototype.draw.apply(this, arguments);

	var ctx = this.core.ctx;

	if(!ctx) return; // 2D context has been depricated in this game

	ctx.save();
	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, this.core.width, this.core.height);

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

	if (this.is_playing) {
		ctx.drawImage(this.video, 0, 0, this.video.videoWidth, this.video.videoHeight, left, top, width, height);
	}
	ctx.restore();
};

SceneMovie.prototype.notifyEnd = function(){
	// release video data memory
	this.video = null;

	if (this.next_scene_name) {
		this.core.changeScene(this.next_scene_name);
	}
};


module.exports = SceneMovie;
