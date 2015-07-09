/* jshint strict: true */
/* global require, console */


/**
 * module dependencies
 */

var express     = require('express');


/**
 * init `express` & `routes`
 */

var routes      = require('./routes');
var http_server = express();


/**
 * dispatch requests to the router
 */
http_server.disable('x-powered-by');
http_server.disable('etag');
http_server.use('/', routes);


/**
 * `instantiate` express app
 */

http_server.listen(process.env.PORT || 3000, function() {
    'use strict';
    console.log('Express server listening on port', process.env.PORT || 3000);
});
