'use strict';


var SerifManager = function (option) {
};

SerifManager.prototype.init = function (script) {};
SerifManager.prototype.setAutoStart = function (flag) {};
SerifManager.prototype.isEnd = function () {};
SerifManager.prototype.isStart = function () {};
SerifManager.prototype.next = function () {};
SerifManager.prototype._showBackground = function(script) {};
SerifManager.prototype._showChara = function(script) {};
SerifManager.prototype._setOption = function(script) {};
SerifManager.prototype._printMessage = function (message) {};
SerifManager.prototype.isWaitingNext = function () {};
SerifManager.prototype.isEndPrinting = function () {};
SerifManager.prototype._startPrintMessage = function () {};
SerifManager.prototype._cancelPrintMessage = function () {};
SerifManager.prototype.startPrintMessage = function () {};
SerifManager.prototype.cancelPrintMessage = function () {};
SerifManager.prototype.isBackgroundChanged = function () {};
SerifManager.prototype.getBackgroundImageName = function () {};
SerifManager.prototype.getImageName = function (pos) {};
SerifManager.prototype.getChara = function (pos) {};
SerifManager.prototype.isTalking = function (pos) {};
SerifManager.prototype.getOption = function () {};
SerifManager.prototype.lines = function () {};
SerifManager.prototype.getSerifRowsCount = function () {};
SerifManager.prototype.right_image = function () {};
SerifManager.prototype.left_image = function () {};
SerifManager.prototype.is_right_talking = function () {};
SerifManager.prototype.is_left_talking = function () {};
SerifManager.prototype.font_color = function () {};
SerifManager.prototype.is_end = function () {};
SerifManager.prototype.is_background_changed = function () {};
SerifManager.prototype.background_image = function () {};

module.exports = SerifManager;
