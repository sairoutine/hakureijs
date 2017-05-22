'use strict';
var base_class = require('./base');
var util = require('../util');

var StorageSave = function(scene) {
	base_class.apply(this, arguments);
};
util.inherit(StorageSave, base_class);

StorageSave.KEY = function(){
	var key = "hakurei_engine_game:save";
	if (window && window.location) {
		return(key + ":" + window.location.pathname);
	}
	else {
		return key;
	}
};

module.exports = StorageSave;
