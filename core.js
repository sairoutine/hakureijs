'use strict';

/* TODO: create scene_manager class */

var WebGLDebugUtils = require("webgl-debug");
var Util = require("./util");
var DebugManager = require("./manager/debug");
var TimeManager = require("./manager/time");
var SaveManager = require("./manager/save");
var InputManager = require("./manager/input");
var ImageLoader = require("./asset_loader/image");
var AudioLoader = require("./asset_loader/audio");
var FontLoader = require("./asset_loader/font");
var SceneLoading = require('./scene/loading');
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

	this.time_manager = new TimeManager(this);

	this.save_manager = new SaveManager();

	this.input_manager = new InputManager();

	this.width = Number(canvas.getAttribute('width'));
	this.height = Number(canvas.getAttribute('height'));

	this.current_scene = null;
	this._reserved_next_scene = null; // next scene which changes next frame run
	this.scenes = {};

	this._cursor_image_name = null;
	this._default_cursor_image_name = null;

	this.frame_count = 0;

	this.request_id = null;

	this.image_loader = new ImageLoader();
	this.audio_loader = new AudioLoader();
	this.font_loader = new FontLoader();

	// add default scene
	this.addScene("loading", new SceneLoading(this));

	// add default save
	this.save_manager.addClass("scenario", StorageScenario);
};
Core.prototype.init = function () {
	this.current_scene = null;
	this._reserved_next_scene = null; // next scene which changes next frame run

	this.frame_count = 0;

	this.request_id = null;

	// TODO:
	//this.debug_manager.init();
	this.time_manager.init();
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
	// get gamepad input
	// get pressed key time
	this.input_manager.beforeRun();

	// go to next scene if next scene is set
	this.changeNextSceneIfReserved();

	// play sound which already set to play
	this.time_manager.executeEvents();

	// play sound which already set to play
	this.audio_loader.executePlaySound();

	// change default cursor image
	this.changeDefaultCursorImage();

	var current_scene = this.currentScene();
	if(current_scene) {
		current_scene.beforeDraw();

		// clear already rendered canvas
		this.clearCanvas();

		current_scene.draw();

		current_scene.afterDraw();

		// overwrite cursor image on scene
		this._renderCursorImage();
	}

	/*

	if(Config.DEBUG) {
		this._renderFPS();
	}

	// play sound effects
	this.runPlaySound();
	*/

	this.frame_count++;

	this.input_manager.afterRun();

	// tick
	this.request_id = requestAnimationFrame(Util.bind(this.run, this));
};
Core.prototype.currentScene = function() {
	if(this.current_scene === null) {
		return;
	}

	return this.scenes[this.current_scene];
};

Core.prototype.addScene = function(name, scene) {
	this.scenes[name] = scene;
};
Core.prototype.changeScene = function(scene_name, varArgs) {
	if(!(scene_name in this.scenes)) throw new Error (scene_name + " scene doesn't exists.");

	var args = Array.prototype.slice.call(arguments); // to convert array object
	this._reserved_next_scene = args;

	// immediately if no scene is set
	if (!this.current_scene) {
		this.changeNextSceneIfReserved();
	}
};
Core.prototype.changeNextSceneIfReserved = function() {
	if(this._reserved_next_scene) {
		if (this.currentScene() && this.currentScene().isSetFadeOut() && !this.currentScene().isInFadeOut()) {
			this.currentScene().startFadeOut();
		}
		else if (this.currentScene() && this.currentScene().isSetFadeOut() && this.currentScene().isInFadeOut()) {
			// waiting for quiting fade out
		}
		else {
			// change next scene
			this.current_scene = this._reserved_next_scene.shift();
			var current_scene = this.currentScene();
			current_scene.init.apply(current_scene, this._reserved_next_scene);

			this._reserved_next_scene = null;
		}
	}
};
Core.prototype.changeSceneWithLoading = function(scene, assets) {
	if(!assets) assets = {};
	this.changeScene("loading", assets, scene);
};

Core.prototype.clearCanvas = function() {
	if (this.is2D()) {
		// 2D
		this.ctx.clearRect(0, 0, this.width, this.height);
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

	// setup WebAudio
	window.AudioContext = (function(){
		return window.AudioContext || window.webkitAudioContext;
	})();

	// setup requestAnimationFrame
	window.requestAnimationFrame = (function(){
		return window.requestAnimationFrame	||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame	||
			function(callback) { window.setTimeout(callback, 1000 / 60); };
	})();

	this._setupError();

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


Core.prototype.showError = function(msg, file, line, column, err) {
	this.clearCanvas();

	if (this.is2D()) {
		// TODO: create html dom and overlay it on canvas
		var ctx = this.ctx;
		var x = 30;
		var y = 100;

		ctx.save();
		ctx.fillStyle = 'black';
		ctx.fillRect(0, 0, this.width, this.height);
		ctx.restore();

		ctx.save();
		ctx.fillStyle = "red";
		ctx.font = "60px 'sans-serif'";
		ctx.fillText('Error', x, y);

		y+= 60;

		ctx.fillStyle = "white";
		ctx.font = "30px 'sans-serif'";

		ctx.fillText(msg, x, y);
		y+= 30 + 5;
		ctx.fillText("File: " + file, x, y);
		y+= 30 + 5;
		ctx.fillText("Line: " + line + ":" + column, x, y);
		y+= 30 + 5;
		ctx.fillText("Stack Trace: ", x, y);
		y+= 30 + 5;
		x+= 30 + 5;
		var stack = err.stack.split("\n");
		for (var i = 0, len = stack.length; i < len; i++) {
			var text = stack[i];
			ctx.fillText(text, x, y);
			y += 30 + 5;
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
	this.time_manager.setTimeout(callback, frame_count);
};

module.exports = Core;
