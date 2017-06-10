'use strict';

// TODO: add pooling logic
// TODO: split manager class and pool manager class
var base_object = require('./base');
var util = require('../util');
var glmat = require('gl-matrix');

var CONSTANT_3D = require('../constant_3d').SPRITE3D;

var PoolManager3D = function(scene, Class) {
	base_object.apply(this, arguments);

	this.Class = Class;
	this.objects = {};

	this.vertices = [];
	this.coordinates = [];
	this.indices = [];
	this.colors = [];

	var gl = this.core.gl;
	this.vBuffer = gl.createBuffer();
	this.cBuffer = gl.createBuffer();
	this.iBuffer = gl.createBuffer();
	this.aBuffer = gl.createBuffer();

	this.mvMatrix = glmat.mat4.create();
	this.pMatrix = glmat.mat4.create();
};
util.inherit(PoolManager3D, base_object);

PoolManager3D.prototype.init = function() {
	base_object.prototype.init.apply(this, arguments);

	this.objects = {};

	this._initmvpMatrix();
	this._setOrthographicProjection();

};
PoolManager3D.prototype._initmvpMatrix = function() {
	glmat.mat4.identity(this.mvMatrix);
	glmat.mat4.identity(this.pMatrix);
};
PoolManager3D.prototype._setOrthographicProjection = function() {
	var near = 0.1;
	var far  = 10.0;
	glmat.mat4.ortho(this.pMatrix,
		-this.core.width/2,
		this.core.width/2,
		-this.core.height/2,
		this.core.height/2,
		near, far);
};

PoolManager3D.prototype.beforeDraw = function(){
	base_object.prototype.beforeDraw.apply(this, arguments);

	for(var id in this.objects) {
		this.objects[id].beforeDraw();
	}

	// update: vertices, indices, texture coordinates, colors
	this._updateAttributes();
};

// update: vertices, indices, texture coordinates, colors
PoolManager3D.prototype._updateAttributes = function() {
	this._resetAttributes();

	var i = 0;
	for(var id in this.objects) {
		var object = this.objects[id];

		if(!object.isShow()){
			continue;
		}

		var j;
		for(j = 0; j < CONSTANT_3D.V_SIZE; j++) {
			this.vertices[i * CONSTANT_3D.V_SIZE + j] = object.vertices[j];
		}

		for(j = 0; j < CONSTANT_3D.C_SIZE; j++) {
			this.coordinates[i * CONSTANT_3D.C_SIZE + j] = object.coordinates[j];
		}

		for(j = 0; j < CONSTANT_3D.I_SIZE; j++) {
			this.indices[i * CONSTANT_3D.I_SIZE + j] = i * CONSTANT_3D.V_ITEM_NUM + object.indices[j];
		}

		for(j = 0; j < CONSTANT_3D.A_SIZE; j++) {
			this.colors[i * CONSTANT_3D.A_SIZE + j] = object.colors[j];
		}

		i++;
	}
};

PoolManager3D.prototype._resetAttributes = function() {
	this.vertices.length    = 0;
	this.coordinates.length = 0;
	this.indices.length     = 0;
	this.colors.length      = 0;
};




PoolManager3D.prototype.draw = function(){
	base_object.prototype.draw.apply(this, arguments);

	// There is no objects.
	if (this.vertices.length === 0) return;

	var gl = this.core.gl;
	var shader = this.core.sprite_3d_shader;

	gl.useProgram(shader.shader_program);

	gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);

	gl.bindBuffer(gl.ARRAY_BUFFER, this.cBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.coordinates), gl.STATIC_DRAW);

	gl.bindBuffer(gl.ARRAY_BUFFER, this.aBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.colors), gl.STATIC_DRAW);

	gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
	gl.enableVertexAttribArray(shader.attribute_locations.aVertexPosition);
	gl.vertexAttribPointer(shader.attribute_locations.aVertexPosition,
						 CONSTANT_3D.V_ITEM_SIZE, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, this.aBuffer);
	gl.enableVertexAttribArray(shader.attribute_locations.aColor);
	gl.vertexAttribPointer(shader.attribute_locations.aColor,
						 CONSTANT_3D.A_ITEM_SIZE, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, this.cBuffer);
	gl.enableVertexAttribArray(shader.attribute_locations.aTextureCoordinates);
	gl.vertexAttribPointer(shader.attribute_locations.aTextureCoordinates,
						 CONSTANT_3D.C_ITEM_SIZE, gl.FLOAT, false, 0, 0);

	// TODO: use some types of texture
	for(var id in this.objects) {
		var texture = this.objects[id].texture;
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.uniform1i(shader.uniform_locations.uSampler, 0);
		break;
	}

	gl.uniformMatrix4fv(shader.uniform_locations.uPMatrix,  false, this.pMatrix);
	gl.uniformMatrix4fv(shader.uniform_locations.uMVMatrix, false, this.mvMatrix);

	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	gl.enable(gl.BLEND);
	gl.disable(gl.DEPTH_TEST);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);

	gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);

	/*
	 * TODO:
	 * reflect
	 * scaling
	*/
};

PoolManager3D.prototype.afterDraw = function(){
	base_object.prototype.afterDraw.apply(this, arguments);
	for(var id in this.objects) {
		this.objects[id].afterDraw();
	}
};

PoolManager3D.prototype.create = function() {
	var object = new this.Class(this.scene);
	object.init.apply(object, arguments);

	this.objects[object.id] = object;

	return object;
};
PoolManager3D.prototype.remove = function(id) {
	delete this.objects[id];
};

PoolManager3D.prototype.checkCollisionWithObject = function(obj1) {
	for(var id in this.objects) {
		var obj2 = this.objects[id];
		if(obj1.checkCollision(obj2)) {
			obj1.onCollision(obj2);
			obj2.onCollision(obj1);
		}
	}
};

PoolManager3D.prototype.checkCollisionWithManager = function(manager) {
	for(var obj1_id in this.objects) {
		for(var obj2_id in manager.objects) {
			if(this.objects[obj1_id].checkCollision(manager.objects[obj2_id])) {
				var obj1 = this.objects[obj1_id];
				var obj2 = manager.objects[obj2_id];

				obj1.onCollision(obj2);
				obj2.onCollision(obj1);

				// do not check died object twice
				if (!this.objects[obj1_id]) {
					break;
				}
			}
		}
	}
};

PoolManager3D.prototype.removeOutOfStageObjects = function() {
	for(var id in this.objects) {
		if(this.objects[id].isOutOfStage()) {
			this.remove(id);
		}
	}
};




module.exports = PoolManager3D;
