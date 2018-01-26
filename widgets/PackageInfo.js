var blessed = require("blessed");
var Node = blessed.Node;
var Element = blessed.Element;

var utils = require("../utils");

function PackageInfo(options) {
  if (!(this instanceof Node)) {
    return new PackageInfo(options);
  }
  options = options || {};
  options.tags = true;
  Element.call(this, options);
}

PackageInfo.prototype.showPackage = function(pkg){
  var self = this;
  // TODO: show pkg files
  utils.getPackageInfo(pkg.name).then(function(info){
    info = "Installed: " + !!pkg.installed + "\n" + info;
    self.setContent(self.formatInfo(info));
    self.screen.render();
  });
};

PackageInfo.prototype.formatInfo = function(info){
  var lines = info.trim().split(/\r?\n/g);
  return lines.map(function(line){
    var pos = line.indexOf(": ");
    if(pos === -1) {
      return line;
    }
    var field = line.substring(0, pos);
    var value = line.substring(pos + 2);
    return "{bold}" + field + "{/bold}: " + value;
  }).join("\n");
};

PackageInfo.prototype.__proto__ = Element.prototype;

PackageInfo.prototype.type = "packageinfo";

module.exports = PackageInfo;

// vim: ts=2 sw=2:
