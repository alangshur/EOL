// init npm modules
var fs = require('fs');
var format = require('string-format');

// enable method mode for format module
format.extend(String.prototype, {});

// synchronously fetch GET functions from every feature
module.exports = function(app) {
    fs.readdirSync('{}/..'.format(__dirname)).forEach(function(featdir) {
        if (featdir == 'README.md' || featdir == 'main' || featdir == 'routes') return;
    
        // recursively find index.js of each feature directory
        fs.readdirSync('{}/../{}'.format(__dirname, featdir)).forEach(function(file) {
            if (file != 'index.js') return;
    
            require('../{}/index.js'.format(featdir))(app);
        });
    });
}