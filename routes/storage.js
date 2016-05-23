var express = require('express');
var router = express.Router();
var multer = require('multer');
var streamifier = require('streamifier');

var GridFsCreator = require('../database/mongo');


/**
 * File upload
 *
 * This route is used to handle <b>multipart</b> file upload request.
 *
 */
router.post('/', multer().single('image'), function (req, res, next) {
    var file = req.file;

    GridFsCreator.create(function (client) {
        var writeStream = client.createWriteStream({
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
        })
    });
});

/**
 * Get file resource by ID
 */
router.get('/:id', function (req, res, next) {
    var requestedId = req.params.id;

    GridFsCreator.create(function (client) {
        var gridByIdQuery = {_id: requestedId};
        client.exist(gridByIdQuery, function (err, found) {
            //delegate errors
            if (err) {
                next(err);
            }
            //pipe response back if file is found
            if (found) {
                var readstream = client.createReadStream(gridByIdQuery);
                readstream.pipe(res);
            } else {
                //delegate to 'Not Found/404' middleware
                next();
            }
        })
    });
});

module.exports = router;
