var fs = require('fs');

var parse = require('csv-parse');
var stringify = require('csv-stringify');

var Excel = require('exceljs');
var zipFolder = require('zip-folder');

var students = {};
var scores = {};
var schools = ['undef'];
var fields;

var jsdom = require("jsdom");
var template = fs.readFileSync('./public/images/template.svg', 'utf8');

module.exports = function(name, res, chosenSchool) {
  name = name.split('.')[0];

  fs.readFile('./files/student-ids.csv', 'utf8', (err, data) => {
    if (err) throw err;

    var keys = {};
    parse(data, { comment: '#' }, function(err, output) {
      var len = output[0].length;
      for (var i = 0; i < len; i++) {
        keys[output[0][i]] = i;
      }

      var id = keys['id'];
      len = output.length;
      output.forEach(function(student, i) {
        if (i) {
          students[student[id]] = {
            school    : student[keys['institution']],
            class     : student[keys['class']]
          }

          if (schools.indexOf(student[keys['institution']]) < 0)
            schools.push(student[keys['institution']]);

          if (i == len - 1)
            _done();
        }
      });
    });
  });

  var workbooks = [];
  var headers = {};
  function _done() {
    fs.readFile('./files/' + name + '.csv', 'utf8', (err, data) => {
      if (err) throw err;

      parse(data, { comment: '#' }, function(err, output) {
        var len = output[0].length;
        fields = output[0];
        for (var i = 0; i < len; i++) {
          headers[output[0][i]] = i;
        }

        var id = headers['student_sis_id'];

        var _len = output.length;

        output.forEach(function(student, _i) {
          if (_i) {
            var obj = {};

            for (var i = 0; i < len; i++) {
              if (isNaN(student[i]) || student[i] == '')
                obj[output[0][i]] = student[i];
              else
                obj[output[0][i]] = parseFloat(student[i]);
            }

            if (students[student[id]] != undefined) {
              /*
               * CERTIFICATE
               */
               console.log(students[student[id]]['school'] + " <> " + chosenSchool);
               if (students[student[id]]['school'] == chosenSchool) {
                 console.log(obj.student_name_first + ' ' + obj.student_name_last);
                 jsdom.env({
                   html: template,
                   done: function(errors, window) {
                     var document = window.document;

                     var a = document.getElementById("certificate");
                     // Get the SVG document inside the Object tag
                     var svgDoc = a.contentDocument;
                     svgEl = svgDoc.getElementsByTagName('svg')[0];

                     var name = svgDoc.querySelector('#name');
                     var title = svgDoc.querySelector('#title');

                     name.textContent = obj.student_name_first + ' ' + obj.student_name_last;

                     var nameH = name.getBoundingClientRect().height;
                     var nameW = name.getBoundingClientRect().width;
                     var nameTop = name.getBoundingClientRect().top;

                     var xforms = title.transform.baseVal; // An SVGTransformList
                     var firstXForm = xforms.getItem(0);       // An SVGTransform

                     var certL = firstXForm.matrix.e;
                     var certTop = firstXForm.matrix.f;
                     var certW = title.getBoundingClientRect().width;

                     var rateX = certL / title.getBoundingClientRect().left;
                     var rateY = certTop / title.getBoundingClientRect().top;

                     var tmp = (nameW - certW) / 2 * rateX;

                     // Setting
                     name.transform.baseVal.getItem(0).setTranslate(certL - tmp, nameTop - nameH / 2);

                     fs.writeFile(__dirnamame + '/data/' + obj.student_name_first + '_' + obj.student_name_last + '.svg',
                                  '<?xml version="1.0" encoding="utf-8"?>\n' + document.getElementsByTagName('svg')[0].outerHTML,
                                  (err) => {

                      if (err) throw err;
                      console.log('The file has been saved!');
                    });
                   }
                });
              }
              /****************************************/
              if (scores[students[student[id]]['school']] == undefined)
                scores[students[student[id]]['school']] = {};

              if (scores[students[student[id]]['school']][students[student[id]]['class']] == undefined)
                scores[students[student[id]]['school']][students[student[id]]['class']] = {};

              scores[students[student[id]]['school']][students[student[id]]['class']][student[id]] = obj;
            }
            else {
              if (scores['undef'] == undefined)
                scores['undef'] = {};

              scores['undef'][student[id]] = obj;
            }
          }
        });

        /*if (scores['IHT']) {
          var wstream = fs.createWriteStream(__dirname + '/temp.json');

          wstream.write(JSON.stringify(scores, null, '\t'));
          wstream.end();
        }*/

        end();
      });
    });
  }

  function end() {
    schools.forEach(function(school, index) {
      // Create a new workbook file in current working-path
      workbooks[index] = new Excel.Workbook();

      if (school == 'undef') {
        /*workbooks[index].xlsx.readFile(__dirname + '/empty.xlsx')
          .then(function() {
            var worksheet = workbooks[index].getWorksheet('Welcome');

            worksheet.addRow(fields);
            for (var student in scores[school]) {
              var tmp = [];
              for (var data in scores[school][student])
                tmp.push(scores[school][student][data]);

              worksheet.addRow(tmp);
            }

            workbooks[index].xlsx.writeFile(__dirname + '/data/' + school + '.xlsx')
              .then(function() {
                  console.log(school, "saved");
                  if (index >= schools.length - 1)
                    zippy();
              });
          });*/
      }
      else {
        workbooks[index].xlsx.readFile(__dirname + '/empty.xlsx')
          .then(function() {
            var worksheet = workbooks[index].getWorksheet('Welcome');
            worksheet.addRow(fields.concat(['class']));

            var sheets = {};
            for (var _class in scores[school]) {
              sheets[_class] = workbooks[index].addWorksheet(_class);

              sheets[_class].addRow(fields);
              for (var student in scores[school][_class]) {
                var tmp = [];
                for (var data in scores[school][_class][student])
                  tmp.push(scores[school][_class][student][data]);

                sheets[_class].addRow(tmp);
                worksheet.addRow(tmp.concat([_class]));
              }
            }

            fs.open(__dirname + '/data/' + school + '.xlsx', 'w', (err, fd) => {
              console.log('file for', school, 'created!');

              workbooks[index].xlsx.writeFile(__dirname + '/data/' + school + '.xlsx')
                .then(function() {
                    console.log(school, "saved");
                    if (index >= schools.length - 1)
                      zippy();
                });
            });
          });
      }
    });
  }

  var p = false;
  function zippy() {
    console.log("zipping")
    zipFolder(__dirname + '/data', __dirname + '/' + name + '.zip', function(err) {
      if(err) {
          console.log('oh no!', err);
      } else {
          console.log('EXCELLENT');

          var zip = __dirname + '/' + name + '.zip';
          res.download(zip);

          dirname = __dirname + '/data';
          fs.readdir(dirname, function(err, filenames) {
            if (err) {
              onError(err);
              return;
            }
            filenames.forEach(function(filename) {
              console.log(dirname + '/' + filename);
              if (filename != 'certificates')
                fs.unlink(dirname + '/' + filename);
            });
          });

          fs.unlink(__dirname + '/' + name + '.csv');
      }
    });
  }

  if(p)
    return true;
}
