// init npm modules
var MongoClient = require('mongodb').MongoClient;

// import custom packages
var format = require('../routes/packages.js').formatter();

// export mongo database
var _db;

module.exports.mongoUtil = {

    // connect to specified db with callback
    connect: function(databaseName, callback) {
        MongoClient.connect(this.formatURI(databaseName), { useNewUrlParser: true }, (err, client) => {
            if (err) return console.log('Error connecting to MongoDB: {}'.format(err));
            else {
                db = client.db(databaseName);

                // persist db export
                _db = db;

                return callback();
            }
        });
    },

    // format specified db URI
    formatURI: function(databaseName) {
        if (databaseName == 'eol_db_prod') {
            // TODO: Implement for PROD DB
        }
        else if (databaseName == 'eol_db') {
            return 'mongodb://{}:{}@{}/{}'.format(process.env.DATABASE_DEV_USERNAME, process.env.DATABASE_DEV_PASSWORD, 
                process.env.DATABASE_DEV_URIBASE, databaseName);
        }
    },

    // retrieve persisted db
    getDB: function() {
        return _db;
    }
}


