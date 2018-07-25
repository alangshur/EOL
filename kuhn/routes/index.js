// init npm modules
var fs = require('fs');

// import custom packages
var format = require('./packages.js').formatter();

// synchronously fetch middleware functions from every feature (TODO --> UPGRADE TO ASYNC)
module.exports.middlewareFunctions = function(app) {
    fs.readdir('{}/..'.format(__dirname), function(err, files) {
        if (err) {
            console.log('Error loading {}: {}'.format(featdir, err));
        }

        files.forEach(function(featdir) {
            if (featdir == 'README.md' || featdir == 'main' || featdir == 'routes') return;
    
            // recursively find index.js of each feature directory
            fs.readdir('{}/../{}'.format(__dirname, featdir), function(err, files) {
                if (err) {
                    console.log('Error loading {}: {}'.format(featdir, err));
                }
    
                files.forEach(function(file) {
                    if (file != 'index.js') return;

                    try {
                        require('../{}/index.js'.format(featdir)).middleware(app);
                        console.log('Loaded middleware functions from {}/index.js'.format(featdir));
                    }
                    catch (err) {
                        console.log('No middleware functions found in {}/index.js'.format(featdir));
                    }
                });
            });
        });
    });
}
 
