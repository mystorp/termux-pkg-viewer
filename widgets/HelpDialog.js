var blessed = require("blessed");
var Node = blessed.Node;
var Box = blessed.Box;

function HelpDialog(options) {
  if (!(this instanceof Node)) {
    return new HelpDialog(options);
  }
  options = options || {};
  options.hidden = true;
  Box.call(this, options);
  var helpText = [
    "{cyan-fg}",
    "  <letter> (a-z)",
    "    jump to first package whose",
    "    name starts with <letter>\n",
    "  tab or space:",
    "    jump to next package\n",
    "  shift + tab or shift + space:",
    "    jump to prev package\n",
    "  enter",
    "    install selected package\n",
    "  backspace",
    "    remove selected package\n",
    "  shift + q",
    "    exit program",
    "{/cyan-fg}"
  ].join("\n");
  blessed.Text({
    parent: this,
    top: "center",
    left: "center",
    shrink: true,
    tags: true,
    wrap: false,
    content: helpText
  });
  this.bindEvents();
}

HelpDialog.prototype.help = function(){
  this.show();
  this.focus();
  this.setIndex(-1);
  this.screen.render();
};

HelpDialog.prototype.bindEvents = function(){
  this.on("attach", function(){
    this.key(["escape", "?"], onESC);
  });
  this.on("detach", function(){
    this.unkey(["escape", "?"], onESC);
  });
  function onESC(){
    if(this.hidden) {
      return;
    }
    this.hide();
    this.screen.render();
  }
};

HelpDialog.prototype.__proto__ = Box.prototype;

HelpDialog.prototype.type = "helpdialog";

module.exports = HelpDialog;
// vim: set sw=2 ts=2:
