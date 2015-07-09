/* jshint strict: true */
/* global console, require, module */


/**
 * module dependencies
 */

var http       = require('http');
var latency    = require('response-time');
var router     = require('express').Router();
var bodyparser = require("body-parser");


/**
 * setup middlewares
 */

router.use(latency());
router.use(bodyparser.json());


/**
 * local variables
 */

var BAD_REQ = "Could not decode request: JSON parsing failed";


/**
 * `slice` a.k.a Array.slice
 */

var slice = Array.prototype.slice;


/**
 * `sendError` parses error into
 * human readable json string and
 * sends it to the client
 *
 * @api private
 */

function sendError(res, code, desc) {
    'use strict';

    return res.status(code).json({
        code: code,
        message: http.STATUS_CODES[code],
        error: desc || undefined
    });
}


/**
 * `errorHandler` middleware
 * 
 * @api private
 */

function errorHandler(err, req, res, next) {
    'use strict';

    console.log(err);
    return sendError(res, 500);
}


/**
 * `parseBodyItem` parses incoming
 * Body and filters the completed ones
 * 
 * @param  p   previous array
 * @param  k   current item in array
 * 
 * @api private
 */

function parseBodyItem(p, k) {
    'use strict';

    if (k.type === 'htv' && k.workflow === 'completed') {
        var d = {};
        d.concataddress = "28 Donington Ave Georges Hall NSW 2198";
        d.concataddress = [
            k.address.buildingNumber || '',
            k.address.street || '',
            k.address.suburb || '',
            k.address.state || '',
            k.address.postcode || ''
        ].join(' ');
        d.type = k.type;
        d.workflow = k.workflow;
        p.push(d);
    }

    return p;
}


/**
 * `postHtvHandler` handler
 * 
 * @api private
 */

function postHtvHandler() {
    'use strict';

    var args = slice.call(arguments);
    var req  = args.shift();
    var res  = args.shift();
    var next = args.shift();

    try {
        if (!req.body.payload.length) {
            return sendError(res, 400, BAD_REQ);
        }
        
        res.json({
            response: req.body.payload.reduce(parseBodyItem, [])
        })
    } catch(e) {
        return sendError(res, 400, BAD_REQ);
    }
}


/**
 * Not found handler
 * 
 * @api private
 */

function notFoundHandler() {
    'use strict';

    var args = slice.call(arguments);
    var req  = args.shift();
    var res  = args.shift();
    var next = args.shift();

    return sendError(res, 404);
}


/**
 * setup routes
 */

router.post('/', postHtvHandler);
router.all('*', notFoundHandler);


/**
 * use error handler middleware
 */

router.use(errorHandler);


/**
 * expose `router`
 */

module.exports = router;
