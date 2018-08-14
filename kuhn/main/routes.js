// init npm modules
var fs = require('fs');
require('string-format').extend(String.prototype, {});

// asynchronously fetch middleware functions from every feature
module.exports.middlewareFunctions = function(app, kwargs) {
    fs.readdir('{}/..'.format(__dirname), function(err, files) {
        if (err) {
            console.log('Error loading {}: {}'.format(featdir, err));
        }

        files.forEach(function(featdir) {
            if (featdir == 'README.md') return;
    
            // recursively find index.js of each feature directory
            fs.readdir('{}/../{}'.format(__dirname, featdir), function(err, files) {
                if (err) {
                    console.log('Error loading {}: {}'.format(featdir, err));
                }
    
                files.forEach(function(file) {
                    if (file != 'index.js') return;

                    try {
                        require('../{}/index.js'.format(featdir)).middleware(app, kwargs);
                        console.log('Loaded middleware functions from {}/index.js'.format(featdir));
                    }
                    catch (err) {
                        if (err instanceof TypeError) {
                            console.log('No middleware functions found in {}/index.js'.format(featdir));
                        }
                        else {
                            console.log('Unexpected error when loading middleware functions from {}/index.js: {}'.format(featdir, err));
                        }
                    }
                });
            });
        });
    });
}
 
