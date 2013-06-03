/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

"use strict";

module.exports = require([__dirname, process.env.ROUTE_COV ? 'lib-cov' : 'lib', 'route.js'].join('/'));
