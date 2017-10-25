'use strict';

var DebugManager = function (core) {
	this.core = core;
	this.dom = null; // debug menu area

	this.is_debug_mode = false; // default: false


	this._is_showing_collision_area = false; // default: false

	this._variables = {};
};

DebugManager.prototype.setOn = function (dom) {
	this.is_debug_mode = true;
	this.dom = dom;
};
DebugManager.prototype.setOff = function () {
	this.is_debug_mode = false;
	this.dom = null;
};

DebugManager.prototype.set = function (name, value) {
	if(!this.is_debug_mode) return;

	this._variables[name] = value;
};
DebugManager.prototype.get = function (name) {
	if(!this.is_debug_mode) return null;

	return this._variables[name];
};



// add text menu
DebugManager.prototype.addMenuText = function (text) {
	if(!this.is_debug_mode) return;

	// create element
	var dom = window.document.createElement('pre');
	dom.textContent = text;

	// add element
	this.dom.appendChild(dom);
};

// add button menu
DebugManager.prototype.addMenuButton = function (button_value, func) {
	if(!this.is_debug_mode) return;

	var core = this.core;

	// create element
	var input = window.document.createElement('input');

	// set attributes
	input.setAttribute('type', 'button');
	input.setAttribute('value', button_value);
	input.onclick = function () {
		func(core);
	};

	// add element
	this.dom.appendChild(input);
};

// show collision area of object instance
DebugManager.prototype.setShowingCollisionAreaOn = function () {
	this._is_showing_collision_area = true;
};
DebugManager.prototype.setShowingCollisionAreaOff = function () {
	this._is_showing_collision_area = false;
};
DebugManager.prototype.isShowingCollisionArea = function () {
	return this._is_showing_collision_area;
};

module.exports = DebugManager;
