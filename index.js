var child_process = require("child_process");
var chalk = require("chalk");
var blessed = require("blessed");

var PackageList = require("./widgets/PackageList");
var PackageInfo = require("./widgets/PackageInfo");

if(module === require.main) {
  createUI();
}

function createUI() {
  var screen = blessed.screen({
    smartCSR: true,
    tabSize: 4,
    cursor: {
      shape: "block",
      blink: true
    },
		fullUnicode: true,
    title: "termux package viewer"
  });
  screen.key("C-q", function(){
    process.exit(0);
  });
  var leftui = new PackageList({
    top: 0,
    left: 0,
    bottom: 0,
    width: 30,
    items: [],
    focused: true,
    scrollable: true,
    clickable: true,
    label: chalk.bold.magenta(" packages "),
    border: {type: "line"},
    style: {
      border: {fg: "yellow"},
      item: {fg: "green"},
      selected: {fg: "white", bg: "magenta"},
    }
  });
  var rightui = new PackageInfo({
    top: 0,
    left: 30,
    bottom: 0,
    right: 0,
    clickable: false,
    label: chalk.bold.magenta(" description "),
    border: {type: "line"},
    style: {
      border: {fg: "yellow"}
    }
  });
  leftui.on("select-package", function(pkg){
    rightui.showPackage(pkg);
  });
  screen.append(leftui);
  screen.append(rightui);
  screen.render();
}
// vim: set sw=2 ts=2:
