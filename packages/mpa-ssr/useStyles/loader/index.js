"use strict";

function stringifyRequest(loaderContext, request) {
  return JSON.stringify(
    loaderContext.utils.contextify(loaderContext.context, request)
  );
}

const { getHashDigest } = require("loader-utils");

module.exports = function loader() {};
module.exports.pitch = function pitch(request) {
  if (this.cacheable) {
    this.cacheable();
  }

  const insertCss = require.resolve("./insertCss.js");
  const filePath = this.resourcePath;
  const hash = getHashDigest(filePath, "md5", "hex", 8);

  return `
    var css = require(${stringifyRequest(this, `!!${request}`)});
    var insertCss = require(${stringifyRequest(this, `!${insertCss}`)});
    var content = typeof css === 'string' ? [[module.id, css, '']] : css;

    exports = module.exports = css.locals || {};
    exports._getContent = function() { return content; };
    exports._getHash = function() { return '${hash}' };
    exports._getCss = function() { return '' + css; };
    exports._insertCss = function(options) { return insertCss('${hash}',content, options) };

    // Hot Module Replacement
    // https://webpack.github.io/docs/hot-module-replacement
    // Only activated in browser context
    if (module.hot && typeof window !== 'undefined' && window.document) {
      var removeCss = function() {};
      module.hot.accept(${stringifyRequest(this, `!!${request}`)}, function() {
        css = require(${stringifyRequest(this, `!!${request}`)});
        content = typeof css === 'string' ? [[module.id, css, '']] : css;
        removeCss = insertCss(content, { replace: true });
      });
      module.hot.dispose(function() { removeCss(); });
    }
  `;
};
