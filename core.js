'use strict';

var WebGLDebugUtils = require("webgl-debug");
var Util = require("./util");
var DebugManager = require("./manager/debug");
var SceneManager = require("./manager/scene");
var TimeManager = require("./manager/time");
var SaveManager = require("./manager/save");
var InputManager = require("./manager/input/index");
var ImageLoader = require("./asset_loader/image");
var AudioLoader = require("./asset_loader/audio");
var FontLoader = require("./asset_loader/font");
var StorageScenario = require('./storage/scenario');

var ShaderProgram = require('./shader_program');
var VS = require("./shader/main.vs");
var FS = require("./shader/main.fs");


var Core = function(canvas, options) {
	if(!options) {
		options = {};
	}

	this.canvas_dom = canvas;
	this.ctx = null; // 2D context
	this.gl  = null; // 3D context

	// WebGL 3D mode
	if(options.webgl) {
		this.gl = this.createWebGLContext(this.canvas_dom);

		// shader program
		this.sprite_3d_shader = new ShaderProgram(
			this.gl,
			// verticle shader, fragment shader
			VS, FS,
			// attributes
			[
				"aTextureCoordinates",
				"aVertexPosition",
				"aColor"
			],
			// uniforms
			[
				"uMVMatrix",
				"uPMatrix",
				"uSampler", // texture data
			]
		);
	}
	// Canvas 2D mode
	else {
		this.ctx = this.canvas_dom.getContext('2d');
	}

	this.debug_manager = new DebugManager(this);
	this.scene_manager = new SceneManager(this);
	this.time_manager = new TimeManager();
	this.save_manager = new SaveManager();
	this.input_manager = new InputManager();

	this.width = Number(canvas.getAttribute('width'));
	this.height = Number(canvas.getAttribute('height'));

	this._cursor_image_name = null;
	this._default_cursor_image_name = null;

	// window.onresize is fired?
	this._is_resize_fired = false;

	this.frame_count = 0;

	this.request_id = null;

	this.image_loader = new ImageLoader();
	this.audio_loader = new AudioLoader();
	this.font_loader = new FontLoader();

	// add default save
	this.save_manager.addClass("scenario", StorageScenario);
};
Core.prototype.init = function () {
	// window.onresize is fired?
	this._is_resize_fired = false;

	this.frame_count = 0;

	this.request_id = null;

	this.debug_manager.init();
	this.scene_manager.init();
	this.time_manager.init();
	// TODO:
	//this.save_manager.init();
	this.input_manager.init();

	this.image_loader.init();
	this.audio_loader.init();
	this.font_loader.init();

	this.save_manager.initialLoad();
};

Core.prototype.reload = function () {
	this.init();
};

Core.prototype.isRunning = function () {
	return this.request_id ? true : false;
};
Core.prototype.startRun = function () {
	if(this.isRunning()) return;

	this.run();
};
Core.prototype.stopRun = function () {
	if(!this.isRunning()) return;

	cancelAnimationFrame(this.request_id);

	this.request_id = null;
};
Core.prototype.run = function(){
	// update fps
	this.debug_manager.beforeRun();

	this.scene_manager.beforeRun();
	// get gamepad input
	// get pressed key time
	this.input_manager.beforeRun();

	// play sound which already set to play
	this.time_manager.executeEvents();

	// play sound which already set to play
	this.audio_loader.executePlaySound();

	// change default cursor image
	this.changeDefaultCursorImage();

	var current_scene = this.scene_manager.currentScene();
	if(current_scene) {
		current_scene.beforeDraw();

		// clear already rendered canvas
		this.clearCanvas();

		current_scene.draw();

		current_scene.afterDraw();

		// draw transtion
		this.scene_manager.drawTransition();

		// overwrite cursor image on scene
		this._renderCursorImage();
	}

	this.frame_count++;

	this.debug_manager.afterRun();
	this.input_manager.afterRun();

	if(this._is_resize_fired) {
		this._fullsize();

		this._is_resize_fired = false;
	}

	// tick
	this.request_id = requestAnimationFrame(Util.bind(this.run, this));
};
Core.prototype.clearCanvas = function() {
	if (this.is2D()) {
		// 2D

		// This code equals `this.ctx.clearRect(0, 0, this.width, this.height);`
		// NOTE: This hack has better performance.
		this.canvas_dom.width = this.canvas_dom.width;
	}
	else if (this.is3D()) {
		// 3D
		this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
		this.gl.clearDepth(1.0);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT|this.gl.DEPTH_BUFFER_BIT);
	}
};
Core.prototype.is2D = function() {
	return this.ctx ? true : false;
};
Core.prototype.is3D = function() {
	return this.gl ? true : false;
};
// this method is deprecated.
Core.prototype.isKeyDown = function(flag) {
	return this.input_manager.isKeyDown(flag);
};
// this method is deprecated.
Core.prototype.isKeyPush = function(flag) {
	return this.input_manager.isKeyPush(flag);
};
// this method is deprecated.
Core.prototype.getKeyDownTime = function(bit_code) {
	return this.input_manager.getKeyDownTime(bit_code);
};
// this method is deprecated.
Core.prototype.isLeftClickDown = function() {
	return this.input_manager.isLeftClickDown();
};
// this method is deprecated.
Core.prototype.isLeftClickPush = function() {
	return this.input_manager.isLeftClickPush();
};
// this method is deprecated.
Core.prototype.isRightClickDown = function() {
	return this.input_manager.isRightClickDown();
};
// this method is deprecated.
Core.prototype.isRightClickPush = function() {
	return this.input_manager.isRightClickPush();
};

// this method is deprecated.
Core.prototype.mousePositionX = function () {
	return this.input_manager.mousePositionX();
};
// this method is deprecated.
Core.prototype.mousePositionY = function () {
	return this.input_manager.mousePositionX();
};
// this method is deprecated.
Core.prototype.mouseMoveX = function () {
	return this.input_manager.mouseMoveX();
};
// this method is deprecated.
Core.prototype.mouseMoveY = function () {
	return this.input_manager.mouseMoveY();
};
// this method is deprecated.
Core.prototype.mouseScroll = function () {
	return this.input_manager.mouseScroll();
};

Core.prototype.fullscreen = function() {
	var mainCanvas = this.canvas_dom;
	if (mainCanvas.requestFullscreen) {
		mainCanvas.requestFullscreen();
	}
	else if (mainCanvas.msRequestuestFullscreen) {
		mainCanvas.msRequestuestFullscreen();
	}
	else if (mainCanvas.mozRequestFullScreen) {
		mainCanvas.mozRequestFullScreen();
	}
	else if (mainCanvas.webkitRequestFullscreen) {
		mainCanvas.webkitRequestFullscreen();
	}
};

Core.prototype.isAllLoaded = function() {
	if (this.image_loader.isAllLoaded() && this.audio_loader.isAllLoaded() && this.font_loader.isAllLoaded()) {
		return true;
	}
	return false;
};



// TODO: If destroy core instance, delete event handler, if do not, memory leak
Core.prototype.setupEvents = function() {
	if(!window) return;

	// setup requestAnimationFrame
	window.requestAnimationFrame = (function(){
		return window.requestAnimationFrame	||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame	||
			function(callback) { window.setTimeout(callback, 1000 / 60); };
	})();

	this._setupError();

	this.audio_loader.setupEvents();
	this.font_loader.setupEvents();

	this.input_manager.setupEvents(this.canvas_dom);
};


Core.prototype._setupError = function() {
	/*
	 * msg: error message
	 * file: file path
	 * line: row number
	 * column: column number
	 * err: error object
	 */

	var self = this;
	window.onerror = function (msg, file, line, column, err) {
		self.showError(msg, file, line, column, err);

		// restart game at error point
		//self.request_id = requestAnimationFrame(Util.bind(self.run, self));

		// or

		// restart game at first point
		//self.init();
		//self.startRun();
	};
};


Core.prototype.fullsize = function() {
	var self = this;
	window.onresize = function (e) {
		self._is_resize_fired = true;
	};

	this._fullsize();
};
Core.prototype._fullsize = function() {

	var window_aspect = window.innerWidth / window.innerHeight;
	var canvas_aspect = this.width / this.height;
	var left, top, width, height;

	if(canvas_aspect >= window_aspect) {
		width = window.innerWidth;
		height = window.innerWidth / canvas_aspect;
		top = (window.innerHeight - height) / 2;
		left = 0;
	}
	else {
		height = window.innerHeight;
		width = window.innerHeight * canvas_aspect;
		top = 0;
		left = (window.innerWidth - width) / 2;
	}

	var width_ratio = this.width/width;
	var height_ratio = this.height/height;

	var mainCanvas = this.canvas_dom;
	mainCanvas.style.left   = left   + "px";
	mainCanvas.style.top    = top    + "px";
	mainCanvas.style.width  = width  + "px";
	mainCanvas.style.height = height + "px";
	this.input_manager.scaleClickPosition(width_ratio, height_ratio);
};

Core.prototype.showError = function(msg, file, line, column, err) {
	this.clearCanvas();

	if (this.is2D()) {
		// TODO: create html dom and overlay it on canvas
		var ctx = this.ctx;
		var x = 24;
		var y = 80;

		ctx.save();
		ctx.fillStyle = 'black';
		ctx.fillRect(0, 0, this.width, this.height);
		ctx.restore();

		ctx.save();
		ctx.fillStyle = "red";
		ctx.font = "48px 'sans-serif'";
		ctx.fillText('Error', x, y);

		y+= 48;

		ctx.fillStyle = "white";
		ctx.font = "24px 'sans-serif'";

		ctx.fillText(msg, x, y);
		y+= 24 + 5;
		ctx.fillText("Time: " + (new Date()).toString(), x, y);
		y+= 24 + 5;
		ctx.fillText("File: " + file, x, y);
		y+= 24 + 5;
		ctx.fillText("Line: " + line + ", Column:" + column, x, y);
		y+= 24 + 5;
		ctx.fillText("Stack Trace: ", x, y);
		y+= 24 + 5;
		x+= 24 + 5;
		var stack = err.stack.split("\n");
		for (var i = 0, len = stack.length; i < len; i++) {
			var text = stack[i];
			ctx.fillText(text, x, y);
			y += 24 + 5;
		}
		ctx.restore();
	}
	else if (this.is3D()) {
		// TODO: render canvas by WebGL
		window.alert(msg + "\n" + line + ":" + column);
	}
};



Core.prototype.createWebGLContext = function(canvas) {
	var gl;
	try {
		gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
		gl = WebGLDebugUtils.makeDebugContext(gl);
	} catch (e) {
		throw e;
	}
	if (!gl) {
		throw new Error ("Could not initialize WebGL");
	}

	return gl;
};

Core.prototype.enableCursorImage = function(default_image_name) {
	// disable to show browser default cursor
	this.canvas_dom.style.cursor = "none";

	this._default_cursor_image_name = default_image_name;
};

// use your own cursor image
Core.prototype.isUsingCursorImage = function() {
	return this._default_cursor_image_name ? true : false;
};

Core.prototype.changeCursorImage = function(image_name) {
	this._cursor_image_name = image_name;
};
// change browser default cursor
Core.prototype.disableCursorImage = function(image_name) {
	if (!this.isUsingCursorImage()) return;

	this.canvas_dom.style.cursor = "auto";
	this._cursor_image_name = null;
	this._default_cursor_image_name = null;
};
Core.prototype.changeDefaultCursorImage = function() {
	if (!this.isUsingCursorImage()) return;
	this._cursor_image_name = this._default_cursor_image_name;
};
Core.prototype._renderCursorImage = function () {
	if (!this.isUsingCursorImage()) return;

	// if it is in loading scene, not show cursor
	if (!this.image_loader.isLoaded(this._cursor_image_name)) return;

	var ctx = this.ctx;

	if (!ctx) return;

	ctx.save();

	var cursor = this.image_loader.getImage(this._cursor_image_name);

	var x = this.input_manager.mousePositionX();
	var y = this.input_manager.mousePositionY();

	var scale_width  = this.image_loader.getScaleWidth(this._cursor_image_name);
	var scale_height = this.image_loader.getScaleHeight(this._cursor_image_name);
	ctx.translate(x, y);
	ctx.drawImage(cursor,
		0,
		0,
		cursor.width*scale_width,
		cursor.height*scale_height
	);
	ctx.restore();
};

Core.prototype.setTimeout = function (callback, frame_count) {
	console.error("core's setTimeout method is deprecated.");
	this.time_manager.setTimeout(callback, frame_count);
};
Core.prototype.currentScene = function() {
	console.error("core's currentScene method is deprecated.");
	return this.scene_manager.currentScene.apply(this.scene_manager, arguments);
}
Core.prototype.addScene = function(name, scene) {
	console.error("core's addScene method is deprecated.");
	return this.scene_manager.addScene.apply(this.scene_manager, arguments);
};
Core.prototype.changeScene = function(scene_name, varArgs) {
	console.error("core's changeScene method is deprecated.");
	return this.scene_manager.changeScene.apply(this.scene_manager, arguments);
};
Core.prototype.changeNextSceneIfReserved = function() {
	console.error("core's changeNextSceneIfReserved method is deprecated.");
	return this.scene_manager.changeNextSceneIfReserved.apply(this.scene_manager, arguments);
};
Core.prototype.changeSceneWithLoading = function(scene, assets) {
	console.error("core's changeSceneWithLoading method is deprecated.");
	return this.scene_manager.changeSceneWithLoading.apply(this.scene_manager, arguments);
};

module.exports = Core;
