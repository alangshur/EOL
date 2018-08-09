// init custom packages
var mongoUtil = require('../db/index.js').mongoUtil;

module.exports = {
    validateLogin: function(username, password) {
        return 'invalid_test';
    },
    validateRegister: function(email, username, password) {
        return 'invalid_test';
    }
}