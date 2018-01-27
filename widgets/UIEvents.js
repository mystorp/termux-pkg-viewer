var EventEmitter = require("events").EventEmitter;

/**
 * shared events object for widgets in same directory
 * 
 * events:
 *
 *   select-package
 *   show-modal
 *   hide-modal
 *   show-cmddialog
 *   hide-cmddialog
 */
module.exports = new EventEmitter();
