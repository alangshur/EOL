// import custom packages
var format = require('../routes/packages.js').formatter();
var {path, fs} = require('../routes/packages.js').pathsys();
var mongoUtil = require('../db/index.js').mongoUtil;

// define middleware exports to main
module.exports.middleware = function(app) {

    // GET for login: #/login
    app.get('/login', (req, res) => {
        res.sendFile(path.resolve(__dirname + './../../popper/login/login.html'));
    });

    // GET for login db: #/login/db
    app.get('/login/db', (req, res) => {
        res.json({"sessionID": req.sessionID});

        console.log('GET Request @ login/db');
    });
}