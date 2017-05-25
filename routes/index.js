var express = require('express');
var router = express.Router();

var fs = require('fs');
const path = require('path');

var multer  = require('multer')
var upload = multer();

var spawn = require('child_process').spawn;
var zipFolder = require('zip-folder');

module.exports = function() {
  /* GET home page. */
  router.get('/', function(req, res, next) {
    console.log("SERVING");
    res.render('index', { title: 'Express' });
  });

  router.post('/', upload.single('dataCSV'), function(req, res, next) {
    var data = req.file.buffer;

    csvName = req.file.originalname.split('.')[0];
    var newPath = __dirname + '/../data/tmp/' + req.file.originalname;

    var dateFrom = req.body.from.split('-');
    var dateTo = req.body.to.split('-');
    var dates = dateFrom[2] + '.' + dateFrom[1] + '.' + dateFrom[0] + ' – ' +
                dateTo[2] + '.' + dateTo[1] + '.' + dateTo[0];
    var signature = req.body.signature;
    var options = {
      args: [newPath, dates, signature]
    }

    fs.writeFile(newPath, data, function(err) {
      console.log("CSV saved locally!");

      scriptFile = path.resolve(path.dirname(__dirname), 'csv-parser.py');
      console.log("Running scrpt from: " + scriptFile);

      var py = spawn('python', [scriptFile]);

      py.stdout.on('end', function() {
        fs.unlink(newPath);

        var zipName = __dirname + '/../data/tmp/' + csvName + '.zip';
        zipFolder(__dirname + '/../data/download', zipName, function(err) {
          res.download(zipName);
        });
      });

      py.stdin.write(newPath + '\n');
      py.stdin.write(dates + '\n');
      py.stdin.write(signature + '\n');
      py.stdin.end();
    });
  });

  return router;
}
