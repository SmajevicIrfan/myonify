var express = require('express');
var path = require('path');
var fs = require('fs')
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();

/**
 * Create HTTP server.
 */
var http = require('http');
var server = http.createServer(app);

var routes = require('./routes/index')();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('node-sass-middleware')({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: true,
  sourceMap: true
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

if (!fs.existsSync(__dirname + '/data/tmp')) {
  fs.mkdirSync(__dirname + '/data/tmp');
  console.log("'tmp' folder made")
}
if (!fs.existsSync(__dirname + '/data/download')) {
  fs.mkdirSync(__dirname + '/data/download');
  console.log("'download' folder made")
}
if (!fs.existsSync(__dirname + '/data/download/certificates')) {
  fs.mkdirSync(__dirname + '/data/download/certificates');
  console.log("'certificates' folder made")
}

module.exports.app = app;
module.exports.server = server;
