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
  screen.append(createAlertUI());
  screen.append(createLoadingUI());
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
  box.on("select item", function(item){
    var pkg = pkgs[item.content];
    events.emit("select", pkg);
  });
  // navigate key bindings
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
  box.key(["home", "end", "left", "up", "right", "down"], function(ch, key){
    switch(key.name) {
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
  box.key(["tab", "space"], function(ch, key){
    box.down();
  });
  box.key(["S-tab", "S-space"], function(){
    box.up()
  });
  // remove
  box.key("backspace", function(){
    var package = box.getItem(box.selected);
    var name = package.content;
    var msg = "Are you sure you want to remove `" + name + "` ?";
    events.emit("alert", msg, function(result){
      if(result) {
        removePackage(name).then(function(){
          pkgs[name].installed = false;
          // TODO: change item's fg
        });
      }
    });
  });
  // install
  box.key("enter", function(){
    var package = box.getItem(box.selected);
    var name = package.content;
    var msg = "Are you sure you want to install `" + name + "` ?";
    events.emit("alert", msg, function(result){
      if(result) {
        installPackage(name).then(function(){
          pkgs[name].installed = true;
          // TODO: change item's fg
        });
      }
    });
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
      box.setContent(info);
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

function createAlertUI(){
  var box = blessed.Question({
    shrink: true,
    top: "center",
    left: "center",
    border: {type: "line"},
    style: {
      shadow: true,
      fg: "white",
      bg: "magenta"
    }
  });
  box.key("esc", function(){
    box.hide();
    events.emit("update");
  });
  events.on("alert", function(msg, callback){
    box.ask(msg, function(error, result){
      box.hide();
      events.emit("update");
      callback(result);
    });
    box.focus();
    events.emit("update");
  });
  return box;
}

function createLoadingUI(){
  var box = blessed.Loading({
    shrink: true,
    top: "center",
    left: "center",
    border: {type: "line"},
    style: {
      shadow: true,
      fg: "white",
      bg: "magenta"
    }
  });
  box.hide();
  events.on("loading", function(text){
    box.load(text);
  });
  events.on("stop-loading", function(){
    box.stop();
  });
  return box;
}

function removePackage(name){
  events.emit("loading", "removing package: " + name);
  return getCommandOutput("apt remove " + name).then(function(){
    events.emit("stop-loading");
  }, function(){
    events.emit("stop-loading");
  });
}

function installPackage(name){
  events.emit("loading", "installing package: " + name);
  return getCommandOutput("apt install " + name).then(function(){
    events.emit("stop-loading");
  }, function(){
    events.emit("stop-loading");
  });
}
