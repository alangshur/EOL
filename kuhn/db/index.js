// init npm modules
var MongoClient = require('mongodb').MongoClient;
var format = require('string-format');

// enable method mode for format module
format.extend(String.prototype, {});

// define middleware exports to main
module.exports.middleware = function(app) {

    // no middleware functions
    (function noMiddlewareFunctions() {
        console.log('No middleware functions in: {}'.format(__dirname));
    })();
}

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

// export mongo database
module.exports.db = db;


