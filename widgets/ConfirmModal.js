var blessed = require("blessed");
var Node = blessed.Node;
var Question = blessed.Question;
var lodash = require("lodash");

function ConfirmModal(options) {
  if (!(this instanceof Node)) {
    return new ConfirmModal(options);
  }
  options = lodash.assign({
    shrink: true,
    top: "center",
    left: "center",
    border: {type: "line"},
    padding: 1,
    style: {
      shadow: true,
      fg: "white",
      bg: "yellow",
      border: {
        fg: "yellow"
      }
    }
  }, options || {});
  Question.call(this, options);
  this._patch();
  this.bindEvents();
  this.setIndex(-1);
}

ConfirmModal.prototype._patch = function(){
  var self = this;
  var okBtn = self._.okay;
  var cancelBtn = self._.cancel;
  var screen = self.screen;
	okBtn.position.left = "50%-8";
  okBtn.position.top += 1;
  okBtn.style.fg = "black";
  okBtn.style.bg = "white";
  okBtn.content = "Yes";
  screen.setEffects(okBtn, okBtn, "focus", "blur", {
    fg: "white",
    bg: "blue",
		bold: true
  }, "focusEffects", "_ftemp");

  cancelBtn.align = "center";
  cancelBtn.content = "  No";
	cancelBtn.position.left = "50%";
  cancelBtn.position.top += 1;
  cancelBtn.style.fg = "black";
  cancelBtn.style.bg = "white";
  screen.setEffects(cancelBtn, cancelBtn, "focus", "blur", {
    fg: "white",
    bg: "red",
		bold: true
  }, "focusEffects", "_ftemp");
};

ConfirmModal.prototype.bindEvents = function(){
  var self = this;
  var okBtn = self._.okay;
  var cancelBtn = self._.cancel;
  self.on("attach", function(){
    okBtn.key("tab", onTabKey);
    cancelBtn.key("tab", onTabKey);
  });
  self.on("detach", function(){
    okBtn.unkey("tab", onTabKey);
    cancelBtn.unkey("tab", onTabKey);
  });
  function onTabKey(){
    if(this === okBtn) {
      cancelBtn.focus();
    } else {
      okBtn.focus();
    }
    self.screen.render();
  }
};

ConfirmModal.prototype.ask = function(msg, callback){
  var superAsk = Question.prototype.ask;
  superAsk.call(this, msg, callback);
  this.focus();
  this._.okay.focus();
  this.setIndex(-1);
  this.screen.render();
}

ConfirmModal.prototype.__proto__ = Question.prototype;

ConfirmModal.prototype.type = 'confirmmodal';

module.exports = ConfirmModal;

// vim: set ts=2 sw=2:
