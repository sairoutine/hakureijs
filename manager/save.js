'use strict';
// repository for storage save class

//var Util = require("../util");
var SaveManager = function () {
	this._name_to_class = {};
};

// klass must inherited save/base class
SaveManager.prototype.addClass = function(name, klass){
	if(typeof this[name] !== "undefined") throw new Error(name + " is reserved word.");

	this._name_to_class[name] = klass;
};

SaveManager.prototype.initialLoad = function(){
	for (var name in this._name_to_class) {
		var Klass = this._name_to_class[name];

		if(!this[name]) {
			this[name] = Klass.load();
		}
	}
};



SaveManager.prototype.load = function(){
	for (var name in this._name_to_class) {
		var Klass = this._name_to_class[name];
		this[name] = Klass.load();
	}
};

SaveManager.prototype.save = function(){
	for (var name in this._name_to_class) {
		this[name].save();
	}
};

SaveManager.prototype.reload = function(){
	for (var name in this._name_to_class) {
		this[name].reload();
	}
};



SaveManager.prototype.del = function(){
	for (var name in this._name_to_class) {
		this[name].del();
	}
};

module.exports = SaveManager;
