var express = require('express');
var router = express.Router();

var fs = require('fs');
//Umm... is it bad that I kinda want beaty music
var multer  = require('multer')
var upload = multer();

module.exports = function() {
  /* GET home page. */
  router.get('/', function(req, res, next) {
    console.log("SERVING");
    res.render('index', { title: 'Express' });
  });

  router.post('/', upload.single('dataCSV'), function(req, res, next) {
    var data = req.file.buffer;
    var school = req.body.school;
    var newPath = __dirname + '/../files/' + req.file.originalname;

    fs.writeFile(newPath, data, function(err) {
      var parse = require('../files/parser')(req.file.originalname, res, school);
      if (parse) {
        //var file = __dirname + '/../files/data.zip';

        /*var filename = path.basename(file);
        var mimetype = mime.lookup(file);

        res.setHeader('Content-disposition', 'attachment; filename=' + filename);
        res.setHeader('Content-type', mimetype);
        var filestream = fs.createReadStream(file);
        filestream.pipe(res);*/

        //res.download(file);
      }
    });
  });

  return router;
}
