'use strict';

var ShaderProgram = function(
	gl,
	vs_text,
	fs_text,
	attribute_variables,
	uniform_variables
) {
	if (!gl) throw new Error("arguments 1 must be WebGLRenderingContext instance");

	this.gl = gl;

	var vs_shader = this.createShader(gl, gl.VERTEX_SHADER, vs_text);
	var fs_shader = this.createShader(gl, gl.FRAGMENT_SHADER, fs_text);
	var shader_program = this.createShaderProgram(gl, vs_shader, fs_shader);

	var i;
	var attribute_locations = {};
	for (i=0; i < attribute_variables.length; i++) {
		attribute_locations[ attribute_variables[i] ] = gl.getAttribLocation(shader_program, attribute_variables[i]);
	}

	var uniform_locations = {};
	for (i=0; i < uniform_variables.length; i++) {
		uniform_locations[ uniform_variables[i] ] = gl.getUniformLocation(shader_program, uniform_variables[i]);
	}

	this.shader_program = shader_program;
	this.attribute_locations = attribute_locations;
	this.uniform_locations = uniform_locations;
};

ShaderProgram.prototype.createShader = function (gl, type, source_text) {
	if(type !== gl.VERTEX_SHADER && type !== gl.FRAGMENT_SHADER) {
		throw new Error ("type must be vertex or fragment");
	}

	var shader = gl.createShader(type);

	gl.shaderSource(shader, source_text);

	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		throw (
			(type === gl.VERTEX_SHADER ? "Vertex" : "Fragment") + " failed to compile:\n\n" + gl.getShaderInfoLog(shader));
	}

	return shader;
};

ShaderProgram.prototype.createShaderProgram = function(gl, vertex_shader, fragment_shader) {
	var shaderProgram = gl.createProgram();

	gl.attachShader(shaderProgram, vertex_shader);
	gl.attachShader(shaderProgram, fragment_shader);

	gl.linkProgram(shaderProgram);

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		throw new Error("Could not initialize shaders:\n\n" + gl.getProgramInfoLog(shaderProgram));
	}

	return shaderProgram;
};

module.exports = ShaderProgram;
