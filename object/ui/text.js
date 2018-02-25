'use strict';

var BaseObjectUI = require('./base');
var Util = require('../../util');

var ObjectUIText = function(core) {
	BaseObjectUI.apply(this, arguments);
};
Util.inherit(ObjectUIText, BaseObjectUI);

ObjectUIText.prototype.init = function() {
	BaseObjectUI.prototype.init.apply(this, arguments);
};

ObjectUIText.prototype.beforeDraw = function() {
	BaseObjectUI.prototype.beforeDraw.apply(this, arguments);

};

ObjectUIText.prototype.draw = function() {
	BaseObjectUI.prototype.draw.apply(this, arguments);
};

module.exports = ObjectUIText;
