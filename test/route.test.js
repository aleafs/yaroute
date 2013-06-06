/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

"use strict";

var http = require('http');
var should = require('should');
var Router = require(__dirname + '/../');

var Request = function (url, body) {
  return {
    'url' : url, 'body' : body,
  };
};

describe('app route interface', function () {

  /* {{{ should_route_works_fine() */
  it('should_route_works_fine', function (done) {
    var _me = Router.create();

    /**
     * @ 异步API
     */
    _me.addRule('/' + ' /' + '/contrOller/ action/', function (req, res) {
      process.nextTick(function () {
        res.end(JSON.stringify({
          'prefix' : 'controller/action', 'url' : req.url, 'suburl' : req._suburl,
        }));
      });
    });

    /**
     * @ 同步API
     */
    _me.addRule('controller/action/help', function (req, res) {
      res.end(JSON.stringify({
        'prefix' : 'controller/action/help', 'url' : req.url, 'suburl' : req._suburl,
      }));
    });

    _me.addRule('/directory', function (req, res) {
      res.end(JSON.stringify({
        'prefix' : '/directory', 'url' : req.url, 'suburl' : req._suburl,
      }));
    });

    var num = 5;
    var rep = {};

    var __message = [];
    rep.writeHead = function (code) {
    };
    rep.end = function (s) {
      __message.push(s);
      if (0 === (--num)) {
        __message.sort().should.eql([JSON.stringify({
          "prefix":"/","url":"/i/am.not.defined","suburl":"/i/am.not.defined"
        }), JSON.stringify({
          "prefix":"/directory","url":"/directory","suburl":"/"
        }), JSON.stringify({
          "prefix":"controller/action","url":"contrOller//action/af","suburl":"/af"
        }), JSON.stringify({
          "prefix":"controller/action/help","url":"/controller/action/Help/tag1/","suburl":"/tag1"
        }), undefined]);
        done();
      }
    };

    _me.dispatch(Request('contrOller/' + '/action/af', null), rep);
    _me.dispatch(Request('/controller/action/Help/tag1/', null), rep);
    _me.dispatch(Request('/directory', null), rep);
    _me.dispatch(Request('/i/am.not.defined', null), rep);

    /**
     * @ 根路径
     */
    _me.addRule('/', function (req, res) {
      res.end(JSON.stringify({
        'prefix' : '/', 'url' : req.url, 'suburl' : req._suburl,
      }));
    });

    _me.dispatch(Request('/i/am.not.defined'), rep);
  });
  /* }}} */

  /* {{{ should_init_with_directory_works_fine() */
  it('should_init_with_directory_works_fine', function (done) {

    var __message = [];
    var rep = {};
    rep.end = function (m) {
      __message.push(m);
      if (__message.length < 4) {
        return;
      }

      __message.sort().should.eql([JSON.stringify({
        "url":"/hello/.ignore","suburl":"/.ignore","action":"/hello"
      }), JSON.stringify({
        "url":"/hello/world","suburl":"/","action":"/hello/world"
      }), JSON.stringify({
        "url":"/hello?a=b","suburl":"/?a=b","action":"/hello"
      }), JSON.stringify({
        "url":"/root","suburl":"/root","action":"/", 'pos' : 3,
      })]);
      done();
    };

    var _me = Router.initFromDirectory(__dirname + '/fixtures/route');
    ['/hello?a=b', '/hello/world', '/hello/.ignore', '/root'].forEach(function (s, i) {
      _me.dispatch(Request(s), rep, i);
    });
  });
  /* }}} */

});

