'use strict';
var base_class = require('./base');
var util = require('../util');

var StorageSave = function(scene) {
	base_class.apply(this, arguments);
};
util.inherit(StorageSave, base_class);

StorageSave.KEY = function(){
	var key = "hakurei_engine:save";
	if (!this.isLocalMode() && window && window.location) {
		// localstorage key for browser
		return(key + ":" + window.location.pathname);
	}
	else {
		// file name for electron or node-webkit
		return "save";
	}
};

module.exports = StorageSave;
