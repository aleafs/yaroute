/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

"use strict";

exports.execute = function (req, res, pos) {
  process.nextTick(function () {
    res.end(JSON.stringify({
      'url' : req.url, 'suburl' : req._suburl, 'action' : '/', 'pos' : pos,
    }));
  });
};

