"use strict";

function Logger(name) {
  this.count = 0;
  this.name = name;
}

Logger.prototype.log = function(message) {
  this.count++;
  console.log('[' + this.name + '] ' + message + ' count:' + this.count);
};
//let logger =
module.exports = new Logger('DEFAULT');
