var blessed = require("blessed");
var Node = blessed.Node;
var Element = blessed.Element;
var UIEvents = require("./UIEvents");

function StatusLine(options) {
  if (!(this instanceof Node)) {
    return new StatusLine(options);
  }
  options = options || {};
  options.tags = true;
  Element.call(this, options);
  this.bindEvents();
  this.setPackage(null);
}

StatusLine.prototype.setPackage = function(pkg){
  var text = "";
  if(pkg) {
    text += pkg.name + (pkg.installed ? "[installed]" : "");
  }
  text += "{|}press ? for help";
  this.setContent(text);
  this.set("lastPackage", pkg);
};

StatusLine.prototype.onShowModal = function(){
  this.setContent("{right}tab: switch button, space: click button, esc: hide{/right}");
};
StatusLine.prototype.onHideModal = function(){
  this.setPackage(this.get("lastPackage"));
};

StatusLine.prototype.onShowCommandDialog = function(){
  this.setContent("{right}please wait while \"quit\" is not blue{/right}");
};
StatusLine.prototype.onHideCommandDialog = function(){
  this.setPackage(this.get("lastPackage"));
};
StatusLine.prototype.onOperationDone = function(){
  this.setContent("{right}press enter to close dialog.{/right}");
};

StatusLine.prototype.bindEvents = function(){
  var onSelectPackage = this.setPackage.bind(this);
  var onShowModal = this.onShowModal.bind(this);
  var onHideModal = this.onHideModal.bind(this);
  var onShowCommandDialog = this.onShowCommandDialog.bind(this);
  var onHideCommandDialog = this.onHideCommandDialog.bind(this);
  var onOperationDone = this.onOperationDone.bind(this);
  this.on("attach", function(){
    UIEvents.on("select-package", onSelectPackage);
    UIEvents.on("show-modal", onShowModal);
    UIEvents.on("hide-modal", onHideModal);
    UIEvents.on("show-cmddialog", onShowCommandDialog);
    UIEvents.on("hide-cmddialog", onHideCommandDialog);
    UIEvents.on("pclose-cmddialog", onOperationDone);
  });
  this.on("detach", function(){
    UIEvents.removeListener("select-package", onSelectPackage);
    UIEvents.removeListener("show-modal", onShowModal);
    UIEvents.removeListener("hide-modal", onHideModal);
    UIEvents.removeListener("show-cmddialog", onShowCommandDialog);
    UIEvents.removeListener("hide-cmddialog", onHideCommandDialog);
    UIEvents.removeListener("pclose-cmddialog", onOperationDone);
  });
};

StatusLine.prototype.__proto__ = Element.prototype;

StatusLine.prototype.type = "statusline";

module.exports = StatusLine;
// vim: set sw=2 ts=2:
