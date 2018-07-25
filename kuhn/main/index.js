// init npm modules
var express = require('express');
var bodyParser= require('body-parser'); 
var envConfig = require('dotenv').config();

// import custom packages
var format = require('../routes/packages.js').formatter();
var {path, fs} = require('../routes/packages.js').pathsys();

// init express app
app = express();

// configure app npm modules
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, './../../popper')));

// import mongo database configuration
var db = require('../db/index.js').db;

// configure port (default to localhost:3000)
const PORT = process.env.PORT || 3000;

// set app to listen on PORT (http npm module deprecated)
app.listen(PORT, () => {
    console.log('EOL running on port {}'.format(PORT));
});

// import middleware from all features
require('../routes/index.js').middlewareFunctions(app);

// GET for default: #/
app.get('/', (req, res) => {
    var response = {
        msg: process.env.TEST_MSG
    };

    res.json(response);
});