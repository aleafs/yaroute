/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

"use strict";

var fs = require('fs');

/* {{{ private function _urlclean() */
var _urlclean = function (s) {
  var o = String(s).replace(/\s+/g, '').toLowerCase().split('/').filter(function (i) {
    return i.length;
  });

  return '/' + o.join('/');
};
/* }}} */

/* {{{ private function throwNotFoundResponse() */
var throwNotFoundResponse = function (req, res) {
  res.writeHead(404);
  res.end();
};
/* }}} */

exports.create = function () {

  var _me = {};

  /**
   * @ 路由规则
   */
  var __Rules = {};

  /**
   * @ 匹配表
   */
  var __Stack = null;

  _me.addRule = function (url, fn) {
    var idx = _urlclean(url);
    if ('/' !== idx) {
      idx += '/';
    }

    __Rules[idx] = {
      'fn' : fn, 'prefix' : idx, '_sort' : idx.length,
    };
    __Stack = null;
  };

  /* {{{ private function _sortRouteTable() */
  var _sortRouteTable = function () {
    __Stack = [];
    for (var i in __Rules) {
      __Stack.push(__Rules[i]);
    }

    __Stack.sort(function (a, b) {
      return b._sort - a._sort;
    });
  };
  /* }}} */

  /* {{{ public function route() */
  _me.route = function (req, res) {

    if (!Array.isArray(__Stack)) {
      _sortRouteTable();
    }

    var p = '/';
    var u = String(req.url).split('?');
    var s = _urlclean(u.shift());
    for (var i = 0; i < __Stack.length; i++) {
      p = __Stack[i].prefix;
      if ('/' === p || 0 === (s + '/').indexOf(p)) {
        u.unshift(s.substring(p.length));
        req._suburl = _urlclean(u.join('?'));
        return __Stack[i].fn.apply(null, arguments);
      }
    }

    throwNotFoundResponse.apply(null, arguments);
  };
  /* }}} */

  return _me;
};

exports.initFromDirectory = function (dir) {

  var _me = exports.create();

  /* {{{ private function R() */
  var R = function (d, p) {
    fs.readdirSync(d).forEach(function (fn) {
      if (fn.match(/^\./)) {
        return;
      }

      var all = d + '/' + fn;
      if (fs.statSync(all).isDirectory()) {
        return R(all, p + '/' + fn);
      }

      var the = fn.match(/^(.+?)\.js$/);
      if (!the) {
        return;
      }

      var _ = require(all);
      var A = p + '/' + (('index' === the[1]) ? '' : the[1]);
      if ('function' === (typeof _.execute)) {
        _me.addRule(A, _.execute);
      }
    });
  };
  /* }}} */

  R(dir, '');

  return _me;
};

