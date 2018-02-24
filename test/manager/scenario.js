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

        it('should start serif script by arguments', function() {
			scenario.start(1);
			assert(scenario.getCurrentCharaNameByPosition() === "chara2");
		});

	});

    describe('#next(), isStart(), isEnd()', function() {
		var script = [
			{"chara": "chara1", "serif": "セリフ1"},
			{"chara": "chara2", "serif": "セリフ2"}
		];

		before(function() {
			scenario.init(script);
		});

        it('check whether is start correctly', function() {
			assert(scenario.isStart() === false);
			assert(scenario.isEnd()   === false);
			scenario.start();
			assert(scenario.isStart() === true);
			assert(scenario.isEnd()   === false);
		});

        it('should go next', function() {
			scenario.next();
			assert(scenario.getCurrentCharaNameByPosition() === "chara2");

			assert(scenario.isStart() === true);
			assert(scenario.isEnd()   === true);
		});
	});


});
