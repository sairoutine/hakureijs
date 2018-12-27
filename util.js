'use strict';
var Util = {
	inherit: function( child, parent ) {
		// inherit instance methods
		var getPrototype = function(p) {
			if(Object.create) return Object.create(p);

			var F = function() {};
			F.prototype = p;
			return new F();
		};
		child.prototype = getPrototype(parent.prototype);
		child.prototype.constructor = child;

		// inherit static methods
		for (var func_name in parent) {
			child[func_name] = parent[func_name];
		}
	},
	loop: function(num, func) {
		for (var i = 0; i < num; i++) {
			func(i);
		}
	},
	radianToTheta: function(radian) {
		return (radian * 180 / Math.PI) | 0;
	},
	thetaToRadian: function(theta) {
		return theta * Math.PI / 180;
	},
	calcMoveXByVelocity: function(velocity) {
		return velocity.magnitude * Math.cos(Util.thetaToRadian(velocity.theta));
	},
	calcMoveYByVelocity: function(velocity) {
		return velocity.magnitude * Math.sin(Util.thetaToRadian(velocity.theta));
	},
	hexToRGBString: function(h) {
		var hex16 = (h.charAt(0) === "#") ? h.substring(1, 7) : h;
		var r = parseInt(hex16.substring(0, 2), 16);
		var g = parseInt(hex16.substring(2, 4), 16);
		var b = parseInt(hex16.substring(4, 6), 16);

		return 'rgb(' + r + ', ' + g + ', ' + b + ')';
	},
	clamp: function(num, min, max) {
		return (num < min ? min : (num > max ? max : num));
	},
	isElectron: function() {
		if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') {
			return true;
		}
		return false;
	},
	canPlayOgg: function () {
		var audio = document.createElement('audio');
		if (audio.canPlayType) {
			return audio.canPlayType('audio/ogg');
		}

		return false;
	},

	getRandomInt: function(min, max) {
		if (arguments.length === 1) {
			max = arguments[0];
			min = 1;
		}

		return Math.floor( Math.random() * (max - min + 1) ) + min;
	},
	// save blob object to your computer
	downloadBlob: function (blob, fileName) {
		// create url
		var url = (window.URL || window.webkitURL);
		var dataUrl = url.createObjectURL(blob);
		// create mouse event
		var event = document.createEvent("MouseEvents");
		event.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
		// create a tag
		var a = document.createElementNS("http://www.w3.org/1999/xhtml", "a");
		a.href = dataUrl;
		a.download = fileName;
		// dispatch mouse click event to a link
		a.dispatchEvent(event);
	},
	shallowCopyHash: function (src_hash) {
		var dst_hash = {};
		for(var k in src_hash){
			dst_hash[k] = src_hash[k];
		}
		return dst_hash;
	},

	// for old browser
	assign: function assign(target, varArgs) { // .length of function is 2
		if (!target) { // TypeError if undefined or null
			throw new TypeError('Cannot convert undefined or null to object');
		}

		var to = Object(target);

		for (var index = 1; index < arguments.length; index++) {
			var nextSource = arguments[index];

			if (nextSource) { // Skip over if undefined or null
				for (var nextKey in nextSource) {
					// Avoid bugs when hasOwnProperty is shadowed
					if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
						to[nextKey] = nextSource[nextKey];
					}
				}
			}
		}
		return to;
	},

	// for old browser
	bind: function(func, oThis) {
		if (typeof func !== 'function') {
			// closest thing possible to the ECMAScript 5
			// internal IsCallable function
			throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
		}

		var aArgs   = Array.prototype.slice.call(arguments, 1),
			fToBind = func,
			FNOP    = function() {},
			fBound  = function() {
				return fToBind.apply(func instanceof FNOP ? func : oThis,
					aArgs.concat(Array.prototype.slice.call(arguments)));
			};

		if (func.prototype) {
			// Function.prototype doesn't have a prototype property
			FNOP.prototype = func.prototype;
		}
		fBound.prototype = new FNOP();

		return fBound;
	},
	// for old browser
	// NOTE: not perfect polyfill
	defineProperty: function(klass, prop_name) {
		var private_prop_name = "_" + prop_name;
		klass.prototype[prop_name] = function(val) {
			if (typeof val !== 'undefined') { this[private_prop_name] = val; }
			return this[private_prop_name];
		};
	},
};

module.exports = Util;
