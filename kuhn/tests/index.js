var assert = require('assert');

module.exports.middleware = function(app) {
    // no middleware functions
    (function noMiddlewareFunctions() {
        console.log('No middleware functions in: {}'.format(__dirname));
    })();
}