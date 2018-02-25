'use strict';

var BaseObject = require('../base');
var Util = require('../../util');

var ObjectUIBase = function(core) {
	BaseObject.apply(this, arguments);
};
Util.inherit(ObjectUIBase, BaseObject);

ObjectUIBase.prototype.init = function() {
	BaseObject.prototype.init.apply(this, arguments);
};

ObjectUIBase.prototype.beforeDraw = function() {
	BaseObject.prototype.beforeDraw.apply(this, arguments);

};

ObjectUIBase.prototype.draw = function() {
	BaseObject.prototype.draw.apply(this, arguments);
};

module.exports = ObjectUIBase;
