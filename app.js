var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');
var storage_route = require('./routes/storage');
var mongoClient = require('./database/mongo').mongoClient;

var app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

/**
 * Middleware for mongo connection to be established middleware
 */
app.use(function (req, res, next) {
    if (!mongoClient.mongoDb) {
        res.status = 500;
        res.send('Server is not ready yet');
    } else {
        next();
    }
});

app.use('/storage', storage_route);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    res.status = 404;
    res.send('Not Found');
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.send('error')
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    console.log(err);
    res.status(err.status || 500);
    res.send('error');
});


module.exports = app;
