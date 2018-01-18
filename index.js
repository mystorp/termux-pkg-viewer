var child_process = require("child_process");
var chalk = require("chalk");
var blessed = require("blessed");
var EventEmitter = require("events").EventEmitter;

var events = new EventEmitter;
createUI();

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
  screen.append(createLeftUI());
  screen.append(createRightUI());
  screen.render();
  events.on("update", function(){
    screen.render();
  });
}
function createLeftUI(){
  var WIDTH = 30;
  var ctop = 0;
  var box = blessed.List({
    top: 0,
    left: 0,
    bottom: 0,
    width: WIDTH,
    items: [],
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
  var pkgs = {};
  var textItems;
  box.on("click", function(){
    box.focus();
  });
  box.on("select item", function(item){
    var pkg = pkgs[item.content];
    events.emit("select", pkg);
  });
  box.key("abcdefghijklmnopqrstuvwxyz".split(""), function(ch, key){
    if(!textItems) { return; }
    var hit = false;
    textItems.forEach(function(text, index){
      if(hit) { return; }
      if(text.indexOf(ch) === 0) {
        hit = true;
        box.select(index);
      }
    });
  });
  box.key(["home", "end", "left", "up", "right", "down"], function(ch){
    switch(ch) {
      case "home":
        box.select(0);
        break;
      case "end":
        box.select(textItems ? textItems.length - 1 : 0);
        break;
      case "left":
      case "up":
        box.up();
        break;
      case "right":
      case "down":
        box.down();
        break;
    }
  });
  box.key(["space"], function(ch, key){
    box.down();
  });
  box.key(["S-space"], function(){
    box.up()
  });
  listPackages().then(function(buf){
    var items = [];
    buf.split(/\n/g).forEach(function(line){
      var pkg = parsePackageInfo(line);
      if(pkg.name && pkg.version) {
        pkgs[pkg.name] = pkg;
        items.push(pkg.name);
      }
    });
    box.setItems(items);
    textItems = items;
    box.pick(function(){
      events.emit("update");
    });
  });
  return box;
}

function createRightUI(){
  var box = blessed.Box({
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
  box.on("click", function(){
    box.focus();
  });
  var installBtn = blessed.Button({
    parent: box,
    top: 1,
    left: 1,
    mouse: true,
    content: " install ",
    shrink: true,
    style: {
      fg: "white",
      bg: "green",
      underline: false,
      focus: {
        underline: true
      }
    }
  });
  installBtn.on("press", function(){
    console.log("pkg install", currentPkg.name);
  });
  var removeBtn = blessed.Button({
    parent: box,
    top: 1,
    left: 10,
    mouse: true,
    content: " remove ",
    shrink: true,
    style: {
      fg: "white",
      bg: "red",
      underline: false,
      focus: {
        underline: true
      }
    }
  });
  removeBtn.on("press", function(){
    console.log("pkg uninstall", currentPkg.name);
  });
  var textPanel = blessed.Text({
    parent: box,
    top: 3,
    left: 0
  });
  var currentPkg;
  events.on("select", function(pkg){
    if(pkg === currentPkg) {
      return;
    }
    showPackage(pkg.name).then(function(info){
      info = info.split(/\n/g).map(function(line){
        var i = line.indexOf(": ");
        if(i === -1) { return line; }
        var field = chalk.bold(line.substring(0, i));
        var value = line.substring(i + 2);
        if(field === "Package") {
          value = chalk.green(value);
        } else if(field === "Description") {
          value = chalk.yellow(value);
        }
        return field + ": " + value;
      }).join("\n");
      textPanel.setContent(info);
      if(pkg.installed) {
        installBtn.hide();
        removeBtn.show();
      } else {
        installBtn.show();
        removeBtn.hide();
      }
      events.emit("update");
    });
    currentPkg = pkg;
  });
  return box;
}

function listPackages(){
  var cmd = "apt list";
  var options ={};
  return getCommandOutput(cmd, options);
}

function showPackage(name) {
  var cmd = "apt show " + name;
  var options = {};
  return getCommandOutput(cmd, options);
}

function getCommandOutput(cmd, options) {
  return new Promise(function(resolve, reject) {
    child_process.exec(cmd, options, function(err, stdout, stderr) {
      if(err) {
        reject(err);
      } else {
        resolve(stdout.toString());
      }
    });
  });
}

function parsePackageInfo(info) {
  var parts = info.split(" ");
  var name = parts[0].split("/").shift();
  var version = parts[1];
  var arch = parts[2];
  var props = parts[3];
  if(props) {
    props = props.substring(1, props.length - 1).split(",");
  } else {
    props = [];
  }
  return {
    name: name,
    version: version,
    arch: arch,
    installed: props.indexOf("installed") > -1
  };
}
