'use strict';
var base_object = require('./base');
var util = require('../util');
var CONSTANT_3D = require('../constant_3d').SPRITE3D;
var ShaderProgram = require('../shader_program');
var VS = require("../shader/main.vs");
var FS = require("../shader/main.fs");

var glmat = require('gl-matrix');

var Sprite3d = function(scene) {
	base_object.apply(this, arguments);

	this.current_sprite_index = 0;

	this._z = 0;

	this.vertices = [];
	this.coordinates = [];
	this.indices = [];
	this.colors = [];

	this.vertices.length    = CONSTANT_3D.V_SIZE;
	this.coordinates.length = CONSTANT_3D.C_SIZE;
	this.indices.length     = CONSTANT_3D.I_SIZE;
	this.colors.length      = CONSTANT_3D.A_SIZE;

	var gl = this.core.gl;
	this.vBuffer = gl.createBuffer();
	this.cBuffer = gl.createBuffer();
	this.iBuffer = gl.createBuffer();
	this.aBuffer = gl.createBuffer();

	this.texture = null;

	this.shader = new ShaderProgram(
		gl,
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

	this.mvMatrix = glmat.mat4.create();
	glmat.mat4.identity(this.mvMatrix);

	this.pMatrix = glmat.mat4.create();
	glmat.mat4.identity(this.pMatrix);

	var near = 0.1;
	var far  = 10.0;
	glmat.mat4.ortho(this.pMatrix,
		-this.core.width/2,
		this.core.width/2,
		-this.core.height/2,
		this.core.height/2,
		near, far);
};
util.inherit(Sprite3d, base_object);

Sprite3d.prototype.init = function(){
	base_object.prototype.init.apply(this, arguments);

	this.current_sprite_index = 0;

	this._initVertices();
	this._initCoordinates();
	this._initIndices();
	this._initColors();

	this._initTexture();
};

Sprite3d.prototype._initVertices = function() {
	var w = this.spriteWidth()/2;
	var h = this.spriteHeight()/2;

	// The upper left corner is the origin
	// so reduce canvas width and add canvas height
	this.vertices[0]  = -w - this.core.width/2;
	this.vertices[1]  = -h + this.core.height/2;
	this.vertices[2]  = -1.0;

	this.vertices[3]  =  w - this.core.width/2;
	this.vertices[4]  = -h + this.core.height/2;
	this.vertices[5]  = -1.0;

	this.vertices[6]  =  w - this.core.width/2;
	this.vertices[7]  =  h + this.core.height/2;
	this.vertices[8]  = -1.0;

	this.vertices[9]  = -w - this.core.width/2;
	this.vertices[10] =  h + this.core.height/2;
	this.vertices[11] = -1.0;
};

Sprite3d.prototype._initCoordinates = function() {

	var image = this.core.image_loader.getImage(this.spriteName());

	var w = this.spriteWidth() / image.width;
	var h = this.spriteHeight() / image.height;

	var x1 = w * this.spriteIndexX();
	var y1 = h * this.spriteIndexY();
	var x2 = x1 + w;
	var y2 = y1 + h;

	this.coordinates[0] = x1;
	this.coordinates[1] = y2;

	this.coordinates[2] = x2;
	this.coordinates[3] = y2;

	this.coordinates[4] = x2;
	this.coordinates[5] = y1;

	this.coordinates[6] = x1;
	this.coordinates[7] = y1;
};

Sprite3d.prototype._initIndices = function() {
	this.indices[0] = 0;
	this.indices[1] = 1;
	this.indices[2] = 2;

	this.indices[3] = 0;
	this.indices[4] = 2;
	this.indices[5] = 3;
};

Sprite3d.prototype._initColors = function() {
	this.colors[0] = 1.0;
	this.colors[1] = 1.0;
	this.colors[2] = 1.0;
	this.colors[3] = 1.0;

	this.colors[4] = 1.0;
	this.colors[5] = 1.0;
	this.colors[6] = 1.0;
	this.colors[7] = 1.0;

	this.colors[8] = 1.0;
	this.colors[9] = 1.0;
	this.colors[10] = 1.0;
	this.colors[11] = 1.0;

	this.colors[12] = 1.0;
	this.colors[13] = 1.0;
	this.colors[14] = 1.0;
	this.colors[15] = 1.0;
};

Sprite3d.prototype._initTexture = function() {
	var gl = this.core.gl;
	var image = this.core.image_loader.getImage(this.spriteName());

	var texture = gl.createTexture();

	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
	gl.bindTexture(gl.TEXTURE_2D, null);

	this.texture = texture;
};




Sprite3d.prototype.beforeDraw = function(){
	base_object.prototype.beforeDraw.apply(this, arguments);
	// animation sprite
	if(this.frame_count % this.spriteAnimationSpan() === 0) {
		this.current_sprite_index++;
		if(this.current_sprite_index >= this.spriteIndices().length) {
			this.current_sprite_index = 0;
		}
	}

	// update vertices property
	this._initVertices();
	this._initCoordinates();
	this._translate();
	this._rotate();
};


Sprite3d.prototype._translate = function() {
	for(var i = 0; i < CONSTANT_3D.V_ITEM_NUM; i++) {
		this.vertices[i * CONSTANT_3D.V_ITEM_SIZE + 0] += this.x();
		this.vertices[i * CONSTANT_3D.V_ITEM_SIZE + 1] -= this.y();
		this.vertices[i * CONSTANT_3D.V_ITEM_SIZE + 2] += this.z();
	}
};

Sprite3d.prototype._rotate = function() {
	var radian = this._getRadian();
	for(var i = 0; i < CONSTANT_3D.V_ITEM_NUM; i++) {
		var x = this.vertices[i * CONSTANT_3D.V_ITEM_SIZE + 0];
		var y = this.vertices[i * CONSTANT_3D.V_ITEM_SIZE + 1];

		this.vertices[i * CONSTANT_3D.V_ITEM_SIZE + 0] = x * Math.cos(radian) - y * Math.sin(radian);
		this.vertices[i * CONSTANT_3D.V_ITEM_SIZE + 1] = x * Math.sin(radian) + y * Math.cos(radian);
	}
};

Sprite3d.prototype._getRadian = function() {
	var theta = this.velocity.theta;
	return util.thetaToRadian(theta);
};

Sprite3d.prototype.draw = function(){
	if(this.isShow()) {
		var gl = this.core.gl;

		gl.useProgram(this.shader.shader_program);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.cBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.coordinates), gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.aBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.colors), gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
		gl.enableVertexAttribArray(this.shader.attribute_locations.aVertexPosition);
		gl.vertexAttribPointer(this.shader.attribute_locations.aVertexPosition,
							 CONSTANT_3D.V_ITEM_SIZE, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.aBuffer);
		gl.enableVertexAttribArray(this.shader.attribute_locations.aColor);
		gl.vertexAttribPointer(this.shader.attribute_locations.aColor,
							 CONSTANT_3D.A_ITEM_SIZE, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.cBuffer);
		gl.enableVertexAttribArray(this.shader.attribute_locations.aTextureCoordinates);
		gl.vertexAttribPointer(this.shader.attribute_locations.aTextureCoordinates,
							 CONSTANT_3D.C_ITEM_SIZE, gl.FLOAT, false, 0, 0);

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.texture);
		gl.uniform1i(this.shader.uniform_locations.uSampler, 0);

		gl.uniformMatrix4fv(this.shader.uniform_locations.uPMatrix,  false, this.pMatrix);
		gl.uniformMatrix4fv(this.shader.uniform_locations.uMVMatrix, false, this.mvMatrix);

		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		gl.enable(gl.BLEND);
		gl.disable(gl.DEPTH_TEST);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);

		gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);

		gl.flush();
		/*
		 * TODO:
		 * reflect
		 * scaling
		*/
	}

	// draw sub objects(even if this object is not show)
	base_object.prototype.draw.apply(this, arguments);
};

Sprite3d.prototype.z = function(val) {
	if (typeof val !== 'undefined') { this._z = val; }
	return this._z;
};




Sprite3d.prototype.spriteName = function(){
	throw new Error("spriteName method must be overridden.");
};
Sprite3d.prototype.spriteIndexX = function(){
	return this.spriteIndices()[this.current_sprite_index].x;
};
Sprite3d.prototype.spriteIndexY = function(){
	return this.spriteIndices()[this.current_sprite_index].y;
};
Sprite3d.prototype.width = function(){
	return this.spriteWidth() * this.scaleWidth();
};
Sprite3d.prototype.height = function(){
	return this.spriteHeight() * this.scaleHeight();
};




Sprite3d.prototype.isShow = function(){
	return true;
};


Sprite3d.prototype.spriteAnimationSpan = function(){
	return 0;
};
Sprite3d.prototype.spriteIndices = function(){
	return [{x: 0, y: 0}];
};
Sprite3d.prototype.spriteWidth = function(){
	return 0;
};
Sprite3d.prototype.spriteHeight = function(){
	return 0;
};
Sprite3d.prototype.rotateAdjust = function(){
	return 0;
};

Sprite3d.prototype.scaleWidth = function(){
	return 1;
};
Sprite3d.prototype.scaleHeight = function(){
	return 1;
};
Sprite3d.prototype.isReflect = function(){
	return false;
};

module.exports = Sprite3d;
