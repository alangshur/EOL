/* DB UTILITY (EXPORTED AS OBJECT) */

// init npm modules
const MongoClient = require('mongodb').MongoClient;
require('string-format').extend(String.prototype, {});

// persist db instance
var _db;
var isConnected = false;

// export db utility
module.exports = {

    // connect to specified db with callback
    connect: function(databaseName, callback) {
        MongoClient.connect(this.formatURI(databaseName), { useNewUrlParser: true }, (err, client) => {
            if (err) return console.log('Error connecting to MongoDB: {}'.format(err));
            else {
                db = client.db(databaseName);

                // persist db export
                _db = db;
                isConnected = true;

                return callback();
            }
        });
    },

    // retrieve persisted db
    getDB: function() {
        return _db;
    },

    // check that database is connected
    isConnected: function() {
        return isConnected;
    },

    // format specified db URI
    formatURI: function(databaseName) {
        if (databaseName == 'eol_db_prod') {
            // TODO: implement for prod db
        }
        else if (databaseName == 'eol_db') {
            return 'mongodb://{}:{}@{}/{}'.format(process.env.DATABASE_USERNAME_DEV, process.env.DATABASE_PASSWORD_DEV, 
                process.env.DATABASE_URIBASE_DEV, databaseName);
        }
    },

    // mongo collection shortcuts
    User: function() {
        if (_db) {
            return _db.collection('users');
        }
        else {
            console.log("Cannot get collection: 'user'")
        }
    },
    Session: function() {
        if (_db) {
            return _db.collection('sessions');
        }
        else {
            console.log("Cannot get collection: 'sessions'")
        }
    },
    Spot: function() {
        if (_db) {
            return _db.collection('spots');
        }
        else {
            console.log("Cannot get collection: 'spots'")
        }
    }
}
