'use strict';
var JSDOM = require("jsdom").JSDOM;
var dom = new JSDOM("<!DOCTYPE html><p>Hello world</p>");
var canvasMockify = require('canvas-mock');

var assert = require('assert');
var Core = require('../../core');
var ScenarioManager = require('../../manager/scenario');

describe('ScenarioManager', function() {
	var core, scenario;
    before(function() {
		// canvas mock
		var canvas = dom.window.document.createElement("canvas");
		canvasMockify(canvas);

		core = new Core(canvas);
		scenario = new ScenarioManager(core);
	});
	after(function () {
		// TODO: fix not call private method
		scenario._stopPrintLetter();
	});

    describe('#init()', function() {
		var script = [];
        it('does not occur error', function(done) {
			scenario.init(script);
			done();
		});
	});

    describe('#start()', function() {
		var script = [
			{"chara": "chara1", "serif": "セリフ1"},
			{"chara": "chara2", "serif": "セリフ2"}
		];

		beforeEach(function() {
			scenario.init(script);
		});

        it('should start at first serif script', function() {
			scenario.start();
			assert(scenario.getCurrentCharaNameByPosition() === "chara1");
		});
	});

});
