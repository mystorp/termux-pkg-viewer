var blessed = require("blessed");
var Node = blessed.Node;
var Element = blessed.Element;

function StatusLine(options) {
  if (!(this instanceof Node)) {
    return new StatusLine(options);
  }
  options = options || {};
  options.tags = true;
  Element.call(this, options);
  this.setPackage(null);
}

StatusLine.prototype.setPackage = function(pkg){
  var text = "";
  if(pkg) {
    text += pkg.name + (pkg.installed ? ",[installed]" : "");
  }
  text += "{|}press ? for help";
  this.setContent(text);
};

StatusLine.prototype.__proto__ = Element.prototype;

StatusLine.prototype.type = "statusline";

module.exports = StatusLine;
// vim: set sw=2 ts=2:
