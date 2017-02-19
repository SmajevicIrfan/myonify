var fs = require('fs');

var parse = require('csv-parse');
var stringify = require('csv-stringify');

var Excel = require('exceljs');
var zipFolder = require('zip-folder');

var students = {};
var scores = {};
var schools = ['undef'];
var fields;
module.exports = function(res) {
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
            firstName : student[keys['first_name']],
            lastName  : student[keys['last_name']],
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
    fs.readFile('./files/myOn.csv', 'utf8', (err, data) => {
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
              obj[output[0][i]] = student[i];
            }

            if (students[student[id]] != undefined) {
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

        if (scores['IHT']) {
          var wstream = fs.createWriteStream(__dirname + '/temp.json');

          wstream.write(JSON.stringify(scores, null, '\t'));
          wstream.end();
        }

        end();
      });
    });
  }

  function end() {
    schools.forEach(function(school, index) {
      // Create a new workbook file in current working-path
      workbooks[index] = new Excel.Workbook();

      if (school == 'undef') {

      }
      else {
        workbooks[index].xlsx.readFile(__dirname + '/empty.xlsx')
          .then(function() {
            var worksheet = workbooks[index].getWorksheet('Welcome');

            var sheets = {};
            for (var _class in scores[school]) {
              console.log(school + ": " + _class);
              sheets[_class] = workbooks[index].addWorksheet(_class);

              sheets[_class].addRow(fields);
              for (var student in scores[school][_class]) {
                var tmp = [];
                for (var data in scores[school][_class][student])
                  tmp.push(scores[school][_class][student][data]);

                sheets[_class].addRow(tmp);
              }
            }

            workbooks[index].xlsx.writeFile(__dirname + '/data/' + school + '.xlsx')
              .then(function() {
                  console.log(school, "saved");
                  if (index >= schools.length - 1)
                    zippy();
              });
          });
      }
    });
  }

  var p = false;
  function zippy() {
    console.log("zipping")
    zipFolder(__dirname + '/data', __dirname + '/data.zip', function(err) {
      if(err) {
          console.log('oh no!', err);
      } else {
          console.log('EXCELLENT');

          var zip = __dirname + '/data.zip';
          res.download(zip);
      }
    });
  }

  if(p)
    return true;
}
