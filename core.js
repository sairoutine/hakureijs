'use strict';

var Core = function(canvas) {
	// メインCanvas
	this.ctx = canvas.getContext('2d');

	this.width = Number(canvas.getAttribute('width'));
	this.height = Number(canvas.getAttribute('height'));

	// シーン一覧
	this.scenes = [];

	// 経過フレーム数
	this.frame_count = 0;

	// requestAnimationFrame の ID
	this.request_id = null;
};
Core.prototype.init = function () {
	// 経過フレーム数を初期化
	this.frame_count = 0;

	// requestAnimationFrame の ID
	this.request_id = null;
};
Core.prototype.isRunning = function () {
	return this.request_id ? true : false;
};
Core.prototype.startRun = function () {
	if(this.isRunning()) return;

	this.run();
};
Core.prototype.run = function(){
	/*
	this.handleGamePad();

	this.currentScene().run();
	this.currentScene().updateDisplay();

	if(Config.DEBUG) {
		this._renderFPS();
	}

	// SEを再生
	this.runPlaySound();

	// 押下されたキーを保存しておく
	this.before_keyflag = this.keyflag;
	*/

	// 経過フレーム数更新
	this.frame_count++;

	// 次の描画タイミングで再呼び出ししてループ
	this.request_id = requestAnimationFrame(this.run.bind(this));
};

module.exports = Core;
