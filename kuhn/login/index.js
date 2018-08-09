// init custom packages
var format = require('../routes/packages.js').formatter();
var {path, fs} = require('../routes/packages.js').pathsys();

// init login packages
var credentials = require('./credentials.js');

// define passport exports to main
module.exports.passportConfig = function(passport, LocalStrateg) {
    
}

// define middleware exports to main
module.exports.middleware = function(app) {

    // GET for login: #/login
    app.get('/login', (req, res) => {
        res.sendFile(path.resolve(__dirname + './../../popper/login/login.html'));
    });

    // GET for login db: #/login/db
    app.get('/login/db', (req, res) => {
        var username = req.query.username;
        var password = req.query.password;
        var errorMessage = credentials.validateLogin(username, password);
        
        // configure response json (errorMessage is null if credentials are valid)
        res.json({
            'errorMessage': errorMessage
        });

        // login if errorMessage is null
        if (!errorMessage) {

        }

        console.log('GET Request @ login/db');
    });

    // POST for login db: #/login/db
    app.post('/login/db', (req, res) => {
        var email = req.query.email;
        var username = req.query.username;
        var password = req.query.password;
        var errorMessage = credentials.validateRegister(email, username, password);

        // configure response json (errorMessage is null if credentials are valid)
        res.json({
            'errorMessage': errorMessage
        });

        // login if errorMessage is null
        if (!errorMessage) {

        }

        console.log('POST Request @ login/db');
    });
}