var child_process = require("child_process");

exports.listPackages = listPackages;
exports.getPackageInfo = getPackageInfo;


function listPackages(){
  var cmd = "apt list";
  var options ={};
  // DEBUG
  if(process.env.NODE_ENV === "ubuntu") {
    cmd = "apt list z*";
  }
  return getCommandOutput(cmd, options).then(function(buf){
    var pkgs = {};
    buf.split(/\n/g).forEach(function(line){
      var pkg = parsePackageInfo(line);
      if(pkg.name && pkg.version) {
        pkgs[pkg.name] = pkg;
      }
    });
    return pkgs;
  });
}

function getPackageInfo(name) {
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
// vim: set ts=2 sw=2:
