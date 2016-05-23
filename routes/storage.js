var express = require('express');
var router = express.Router();
var multer = require('multer');
var streamifier = require('streamifier');

var mongoClient = require('../database/mongo').mongoClient;


/**
 * File upload
 *
 * This route is used to handle <b>multipart</b> file upload request.
 *
 */
router.post('/', multer().single('image'), function (req, res, next) {
    var file = req.file;

    var writeStream = mongoClient.gridClient.createWriteStream({
        filename: file.originalname || "temp"
    });

    //Async write command to mongo's GridFS
    streamifier.createReadStream(file.buffer).pipe(writeStream);

    //Write error delegation
    writeStream.on('error', function (err) {
        next(err);
    });

    //Write done handling
    writeStream.on('close', function (file) {
        res.send(file);
    });
});

/**
 * Get file resource by ID
 */
router.get('/:id', function (req, res, next) {
    var requestedId = req.params.id;

    var gridByIdQuery = {_id: requestedId};
    var gridClient = mongoClient.gridClient;
    gridClient.exist(gridByIdQuery, function (err, found) {
        //delegate errors
        if (err) {
            next(err);
        }
        //pipe response back if file is found
        if (found) {
            var readStream = gridClient.createReadStream(gridByIdQuery);
            readStream.pipe(res);
        } else {
            //delegate to 'Not Found/404' middleware
            next();
        }
    });
});

/**
 * GETs storage stats
 */
router.get('/stats', function (req, res, next) {
    var mongoDb = mongoClient.mongoDb;

    mongoDb.stats(function(err, stats){
        if(err){
            next(err);
        }

        res.send(stats);
    });

});

module.exports = router;
