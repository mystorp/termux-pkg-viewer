var blessed = require("blessed");
var Node = blessed.Node;
var Element = blessed.Element;

var utils = require("../utils");

function PackageInfo(options) {
  if (!(this instanceof Node)) {
    return new PackageInfo(options);
  }
  options = options || {};
  Element.call(this, options);
}

PackageInfo.prototype.showPackage = function(pkg){
  var self = this;
  utils.getPackageInfo(pkg.name).then(function(info){
    self.setContent(info);
    self.screen.render();
  });
};

PackageInfo.prototype.__proto__ = Element.prototype;

PackageInfo.prototype.type = 'packageinfo';

module.exports = PackageInfo;

// vim: ts=2 sw=2:
