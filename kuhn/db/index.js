// init npm modules
var MongoClient = require('mongodb').MongoClient;

// import custom packages
var format = require('../routes/packages.js').formatter();

// format mongo database URI
function formatURI() {
    return 'mongodb://{}:{}@{}/{}'.format(process.env.DATABASE_USERNAME, process.env.DATABASE_PASSWORD, 
        process.env.DATABASE_URIBASE, process.env.DATABASE_NAME);
}

// connect to mongo database
var db;

MongoClient.connect(formatURI(), { useNewUrlParser: true }, (err, client) => {
    if (err) return console.log('Error connecting to MongoDB: {}'.format(err));
    db = client.db(process.env.DATABASE_NAME);
    console.log('Mongo database {} connected'.format(process.env.DATABASE_NAME));
});

// TODO: define middleware exports to main

// export mongo database
module.exports.db = db;


