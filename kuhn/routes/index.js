// init npm modules
var fs = require('fs');

// import custom packages
var format = require('./packages.js').formatter;

// synchronously fetch middleware functions from every feature
module.exports.middlewareFunctions = function(app) {
    fs.readdirSync('{}/..'.format(__dirname)).forEach(function(featdir) {
        if (featdir == 'README.md' || featdir == 'main' || featdir == 'routes') return;

        // recursively find index.js of each feature directory
        fs.readdirSync('{}/../{}'.format(__dirname, featdir)).forEach(function(file) {
            if (file != 'index.js') return;
            require('../{}/index.js'.format(featdir)).middleware(app);
        });
    });
}

