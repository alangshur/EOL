// init custom packages
var format = require('../routes/packages.js').formatter();
var {path, fs} = require('../routes/packages.js').pathsys();

// init login packages
var credentials = require('./credentials.js');

// define middleware exports to main
module.exports.middleware = function(app) {

    // GET for login: #/login
    app.get('/login', (req, res) => {
        res.sendFile(path.resolve(__dirname + './../../popper/login/login.html'));
    });

    // GET for login db: #/login/db
    app.get('/login/db', (req, res) => {

        // configure response json (errorMessage is null if credentials are valid)
        res.json({
            'sessionID': req.sessionID, 
            'errorMessage': credentials.validateLogin(req.query.username, req.query.password)
        });

        console.log('GET Request @ login/db');
    });

    // POST for login db: #/login/db
    app.post('/login/db', (req, res) => {

        // configure response json (errorMessage is null if credentials are valid)
        res.json({
            'sessionID': req.sessionID, 
            'errorMessage': credentials.validateRegister(req.query.email, req.query.username, req.query.password)
        });

        console.log('POST Request @ login/db');
    });
}