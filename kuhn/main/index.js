// init npm modules
var path = require('path');
var express = require('express');
var MongoClient = require('mongodb').MongoClient;
var envConfig = require('dotenv').config();

// init app
app = express();

// configure port
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`EOL running on port ${ PORT }`);
});

app.get('/', (req, res) => {
    var response = {
        msg: process.env.TEST_MSG
    };
    res.json(response);
});






