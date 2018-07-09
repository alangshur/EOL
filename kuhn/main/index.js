// init npm modules
var fs = require('fs');
var path = require('path');
var express = require('express');
var format = require('string-format');
var envConfig = require('dotenv').config();

// enable method mode for format module
format.extend(String.prototype, {});

// init express app
app = express();

// import mongo database configuration
var db = require('../db/index.js').db;

// configure port (default to localhost:3000)
const PORT = process.env.PORT || 3000;

// set app to listen on PORT (http npm module deprecated)
app.listen(PORT, () => {
    console.log(`EOL running on port ${ PORT }`);
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
