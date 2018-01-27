var child_process = require("child_process");
var blessed = require("blessed");
var lodash = require("lodash");
var Node = blessed.Node;
var Element = blessed.Element;
var UIEvents = require("./UIEvents");


function ExecCommandDialog(options) {
  if (!(this instanceof Node)) {
    return new ExecCommandDialog(options);
  }
  options = lodash.assign({
    top: "center",
    left: "center",
    width: "80%",
    height: "80%",
    border: {type: "line"},
    style: {
      bg: "black"
    }
  }, options || {});
  Element.call(this, options);
  // child components
  this._.quit = blessed.Button(lodash.assign({
    parent: this,
    top: 1,
    right: 2,
    shrink: true,
    content: "  quit",
    width: 8,
    style: {
      focus: {
        fg: "white",
        bg: "blue",
        bold: true
      }
    }
  }, options.buttonOptions || {}));
  this._.body = blessed.Text({
    parent: this,
    top: 3,
    right: 2,
    bottom: 1,
    left: 2,
    style: {
      bg: "black",
      fg: "white"
    },
    scrollable: true
  });
  this.bindEvents();
}

ExecCommandDialog.prototype.bindEvents = function(){
  var self = this;
  var quitBtn = self._.quit;
  self.on("attach", function(){
    self.key("tab", onTab);
    quitBtn.on("press", onQuit);
  });
  self.on("detach", function(){
    self.unkey("tab", onTab);
    quitBtn.un("press", onQuit);
  });
  function onTab(){
    self._.quit.focus();
  }
  function onQuit(){
    self.hide();
    UIEvents.emit("hide-cmddialog");
    self.screen.render();
  }
};

ExecCommandDialog.prototype.exec = function(cmd, args, options){
  var self = this;
  var quitElement = self._.quit;
  var bodyElement = self._.body;
  var p = child_process.spawn(cmd, args, options);
  var output = "";
  bodyElement.setContent(output);
  p.on("close", function(){
    quitElement.focus();
    UIEvents.emit("pclose-cmddialog");
    self.screen.render();
  });
  p.stdout.on("data", onData);
  p.stderr.on("data", onData);
  self.focus();
  self.screen.render();
  function onData(buf){
    output += buf.toString();
    bodyElement.setContent(output);
    bodyElement.setScrollPerc(100);
    self.screen.render();
  }
};

ExecCommandDialog.prototype.show = function(){
  var superShow = Element.prototype.show;
  UIEvents.emit("show-cmddialog");
  superShow.call(this);
};

ExecCommandDialog.prototype.__proto__ = Element.prototype;

ExecCommandDialog.prototype.type = "execcommanddialog";

module.exports = ExecCommandDialog;
// vim: set ts=2 sw=2:
