/**
 * MongoDB connection encapsulation
 */

var config = require('../config/config.json');

var Mongo = require('mongodb');

var Grid = require('gridfs-stream');

var localConnectionString = 'mongodb://' + config.local.mongo.host + ":" + config.local.mongo.port;
var prodConnectionString = process.env.MONGO_CON_STRING;
var connectionString = prodConnectionString || localConnectionString + '/ggstorage';

var mongoGridClient = null;

var create = function (cb) {
    Mongo.MongoClient.connect(connectionString, function (err, db) {
        if (err) {
            console.error('Could not connect to mongo with connection string ' + connectionString);
            throw err;

        }
        console.log('Successfully connected to mongo with connection string: ' + connectionString);

        mongoGridClient = Grid(db, Mongo);
        cb(mongoGridClient);

        //db.close();
    });
};

module.exports.create = create;