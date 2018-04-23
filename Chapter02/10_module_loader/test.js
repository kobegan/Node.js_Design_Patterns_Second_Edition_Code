/**
 * Created by Ganchao on 2018/4/20.
 */
"use strict";
const fs = require('fs');
let originalRequire = require;

function loadModule(filename, module, require) {
    const wrappedSrc = `(function(module, exports, require){
        ${fs.readFileSync(filename, 'utf-8')}
    })(module, module.exports, require);`;
    eval(wrappedSrc);
}

var require = function (filename) {
    let id = require.resolve(filename);
    if(require.cache[id]) {
        return require.cache[id].exports;
    }

    const module = {
        exports: {},
        id: id
    };

    require.cache[id] = module;

    loadModule(filename, module, require);

    return module.exports;

};

require.cache = {};
require.resolve = function(moduleName) {
    return originalRequire.resolve(moduleName);
};

require(process.argv[2]);