"use strict";

const moduleB = require('./moduleB.js');

module.exports = {
  run: () => {
    moduleB.log();
  }
};
