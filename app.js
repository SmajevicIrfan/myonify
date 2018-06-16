#!/usr/bin/env node

const createError = require('http-errors');
const express = require('express');
const logger = require('morgan');

const app = express();

const uploadRouter = require('./routes/upload');
//const downloadRouter = require('./routes/download');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api/upload', uploadRouter);
//app.use('/api/download', downloadRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
	next(createError(404));
});
  
// error handler
app.use((err, req, res, next) => {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};
  
	// send back the status
	res.status(err.status || 500).send(err.message || 'Error');
  
	next();
});

module.exports = app;