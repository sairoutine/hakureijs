'use strict';
var base_class = require('./base');
var util = require('../util');

var StorageScenario = function(scene) {
	base_class.apply(this, arguments);
};
util.inherit(StorageScenario, base_class);

var PREFIX = "hakurei_engine";
var KEY = "scenario";

StorageScenario.KEY = function(){
	if (!this.isLocalMode() && window && window.location) {
		// localstorage key for browser
		return([PREFIX, KEY, window.location.pathname].join(":"));
	}
	else {
		// file name for electron or node-webkit
		return KEY;
	}
};

module.exports = StorageScenario;
