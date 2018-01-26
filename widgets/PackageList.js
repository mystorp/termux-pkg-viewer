var blessed = require("blessed");
var Node = blessed.Node;
var List = blessed.List;
var ConfirmModal = require("./ConfirmModal");
var ExecCommandDialog = require("./ExecCommandDialog");
var HelpDialog = require("./HelpDialog");

var utils = require("../utils");

function PackageList(options) {
  if (!(this instanceof Node)) {
    return new PackageList(options);
  }
  options = options || {};
  List.call(this, options);
  this._initConfirmModal();
  this._initCommandDialog();
  this._initHelp();
  this.bindEvents();
  this._readPackages();
}

PackageList.prototype.bindEvents = function(){
  this.on("attach", function(){
    // bind navigate keys
    this.key("abcdefghijklmnopqrstuvwxyz".split(""), onLetterKey);
    this.key(["home", "end", "left", "up", "right", "down"], onDirectionKey);
    this.key(["tab", "space"], onDownKey);
    this.key(["S-tab", "S-space"], onUpKey);
    this.key("backspace", onRemoveKey);
    this.key("enter", onInstallKey);
    this.key("?", onHelp);
  });
  this.on("detach", function(){
    // unbind navigate keys
    this.unkey("abcdefghijklmnopqrstuvwxyz".split(""), onLetterKey);
    this.unkey(["home", "end", "left", "up", "right", "down"], onDirectionKey);
    this.unkey(["tab", "space"], onDownKey);
    this.unkey(["S-tab", "S-space"], onUpKey);
    this.unkey("backspace", onRemoveKey);
    this.unkey("enter", onInstallKey);
    this.unkey("?", onHelp);
  });
  this.on("select item", function(item){
    var pkg = this.allPackages[item.content];
    this.emit("select-package", pkg);
  });

  function onLetterKey(ch){
    var hit = false;
    var self = this;
    self.ritems.forEach(function(text, index){
      if(hit) {
        return;
      }
      if(text.indexOf(ch) === 0) {
        hit = true;
        self.select(index);
      }
    });
  }
  function onDirectionKey(ch, key){
    switch(key.name) {
      case "home":
        this.select(0);
        break;
      case "end":
        this.select(this.ritems.length > 0 ? this.ritems.length - 1 : 0);
        break;
      case "left":
      case "up":
        this.up();
        break;
      case "right":
      case "down":
        this.down();
        break;
    }
  }
  function onDownKey(){
    this.down();
  }
  function onUpKey(){
    this.up()
  }
  // remove
  function onRemoveKey(){
    var self = this;
    var name = self.getItem(self.selected).content;
    var msg = "Are you sure you want to remove `" + name + "` ?";
    self.confirm(msg).then(function(result){
      self.focus();
      if(result) {
        self.removePackage(name);
      }
    }, function(){});
  }
  // install
  function onInstallKey(){
    var self = this;
    var name = self.getItem(self.selected).content;
    var msg = "Are you sure you want to install `" + name + "` ?";
    self.confirm(msg).then(function(result){
      self.focus();
      if(result) {
        self.installPackage(name);
      }
    }, function(){});
  }
  // show help
  function onHelp(){
    this._.helpDialog.help();
  }
};

PackageList.prototype.installPackage = function(name){
  var title = "installing package: " + name;
  this.syscall(title, "apt", ["install", name, "-y"], {});
};

PackageList.prototype.removePackage = function(){
  var title = "removing package: " + name 
  this.syscall(title, "apt", ["remove", name, "-y"], {});
};

PackageList.prototype.confirm = function(msg){
  var self = this;
  return new Promise(function(resolve, reject){
    self._.modal.ask(msg, function(err, result){
      if(err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
    self.screen.render();
  });
};

PackageList.prototype.syscall = function(title, cmd, args, options){
  var dialog = this._.cmdDialog;
  dialog.setLabel(title);
  dialog.exec(cmd, args, options);
  dialog.show();
  dialog.setIndex(-1);
  this.screen.render();
};

PackageList.prototype._initConfirmModal = function(){
  this._.modal = new ConfirmModal();
  this.screen.append(this._.modal);
};

PackageList.prototype._initCommandDialog = function(){
  var dialog = this._.cmdDialog = new ExecCommandDialog({
    hidden: true
  });
  this.screen.append(dialog);
  dialog.on("hide", function(){
    this.focus();
  }.bind(this));
};

PackageList.prototype._initHelp = function(){
  var dialog = this._.helpDialog = new HelpDialog();
  this.screen.append(dialog);
  dialog.on("hide", function(){
    this.focus();
  }.bind(this));
};

PackageList.prototype._readPackages = function(){
  var self = this;
  utils.listPackages().then(function(pkgs){
    var items = Object.keys(pkgs);
    self.allPackages = pkgs;
    self.setItems(items);
    self.screen.render();
  });
};

PackageList.prototype.__proto__ = List.prototype;

PackageList.prototype.type = "packagelist";

module.exports = PackageList;
// vim: set ts=2 sw=2:
