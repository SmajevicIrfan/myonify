const express = require('express');
const router = express.Router();

const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');

const multer  = require('multer')
const upload = multer();

const spawn = require('child_process').spawn;
const zipFolder = require('zip-folder');

const DATA_PATH = path.join(path.dirname(__dirname), 'data');

const makeID = length => {
    let result = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for(let i = 0; i < length; i++)
        result += possible.charAt(Math.floor(Math.random() * possible.length));

    return result;
}

const makeStructure = (_id, fileName) => {
  fs.mkdirSync(path.join(DATA_PATH, _id));
  console.log("case folder made");

  fs.mkdirSync(path.join(DATA_PATH, _id, 'tmp'));
  console.log("'tmp' folder made");

  fs.mkdirSync(path.join(DATA_PATH, _id, 'download'));
  console.log("'download' folder made");

  fs.mkdirSync(path.join(DATA_PATH, _id, 'download', 'certificates'));
  console.log("'certificates' folder made");
}

module.exports = function() {
  /* GET home page. */
  router.get('/', function(req, res, next) {
    console.log("SERVING");
    res.render('index', { title: 'Express' });
  });

  router.post('/', upload.single('dataCSV'), function(req, res, next) {
    const data = req.file.buffer;

    const csvName = req.file.originalname.split('.')[0];
    let _id = makeID(5);

    while (fs.existsSync(path.join(DATA_PATH, _id)))
      _id = makeID(5);

    makeStructure(_id, csvName);
    const newPath = path.join(DATA_PATH, _id, 'tmp', req.file.originalname);

    const dateFrom = req.body.from.split('-');
    const dateTo = req.body.to.split('-');
    const dates = dateFrom[2] + '.' + dateFrom[1] + '.' + dateFrom[0] + ' – ' +
                dateTo[2] + '.' + dateTo[1] + '.' + dateTo[0];
    const signature = req.body.signature;
    const signature_title = req.body.signature_title;

    fs.writeFile(newPath, data, (err) => {
      scriptFile = path.resolve(path.dirname(__dirname), 'csv-parser.py');
      const py = spawn('python', [scriptFile, _id, newPath, dates, signature_title, signature]);

      py.stdout.on('end', () => {
        const zipName = path.join(DATA_PATH, _id, 'tmp', csvName + '.zip');

        zipFolder(path.join(DATA_PATH, _id, 'download'), zipName, (err) => {
          res.download(zipName, (err) => {
            if (err)
              throw err;
            else {
              rimraf(path.join(DATA_PATH, _id), () => {
                console.log("DOWNLOAD COMPLETED & FOLDER REMOVED");
              });
            }
          });
        });
      });
    });
  });

  return router;
}
