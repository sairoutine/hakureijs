'use strict';
var base_class = require('./base');
var util = require('../util');

var StorageSave = function(scene) {
	base_class.apply(this, arguments);
};
util.inherit(StorageSave, base_class);

var PREFIX = "hakurei_engine";
var KEY = "save";

StorageSave.KEY = function(){
	if (!this.isLocalMode() && typeof window !== "undefined" && window.location) {
		// localstorage key for browser
		return([PREFIX, KEY, window.location.pathname].join(":"));
	}
	else {
		// file name for electron or node-webkit
		return KEY;
	}
};

module.exports = StorageSave;
