"use strict";

const urlParse = require('url').parse;
const slug = require('slug');
const path = require('path');

module.exports.urlToFilename = function urlToFilename(url) {
  const parsedUrl = urlParse(url);
  const urlPath = parsedUrl.path.split('/')
    .filter(function(component) {
      //过滤空路径
      return component !== '';
    })
    .map(function(component) {
        //Make strings url-safe
      return slug(component, { remove: null });
    })
    .join('/');
  let filename = path.join(parsedUrl.hostname, urlPath);
  if(!path.extname(filename).match(/htm/)) {
    filename += '.html';
  }
  return filename;
};
