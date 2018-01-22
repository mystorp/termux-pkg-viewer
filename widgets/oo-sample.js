/**
 * 这个仅仅作为示例文件
 * 它提供了了 blessed 风格的面向对象类的写法
 * 有任何新增组件，都基于这个风格修改
 */
var blessed = require("blessed");
var Node = blessed.Node;
var Element = blessed.Element;

function Sample(options) {
  if (!(this instanceof Node)) {
    return new Sample(options);
  }
  options = options || {};
  Element.call(this, options);
}

Sample.prototype.__proto__ = Element.prototype;

Sample.prototype.type = 'sample';

module.exports = Sample;
