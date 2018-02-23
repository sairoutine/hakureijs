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

StorageScenario.prototype.getSerifStatus = function(id) {
	var status = this.get(id);

	if(!status) status = {};

	return status;
};

StorageScenario.prototype.incrementPlayedCount = function(id){
	var status = this.getSerifStatus(id);

	status.played_count = status.played_count || 0;
	status.played_count++;

	this.set(id, status);
};

module.exports = StorageScenario;
