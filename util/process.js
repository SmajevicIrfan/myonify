const path = require('path');
const tmp = require('tmp');
const rimraf = require('rimraf');

const processCerts = require('./processCerts');
const processExcel = require('./processExcel');

const trim = str => str.replace(/^(\s|")+|(\s|")+$/gm, '');
const compare = (student1, student2) => {
	const student1Info = `${student1['grade']} ${student1['last name']} ${student1['first name']}`;
	const student2Info = `${student2['grade']} ${student2['last name']} ${student2['first name']}`;
	return +(student1Info > student2Info) - +(student1Info < student2Info);
};

const seperateRows = (csvData) => {
	return csvData.toString('utf8').split(/(\r\n|\n|\r)/g).filter(row => /\S/.test(row))
		.map(line => line.split(',').map(field => trim(field)));
};

const makeStudentObjects = (headers, rows) => {
	return rows.slice(1).map(row => row.reduce((
		(acc, curr, index) => Object.assign({}, acc, { [headers[index]]: Number.isNaN(+curr) ? curr : +curr })
	), {})).sort(compare);
};

const prepareData = (RAWData) => {
	const rows = seperateRows(RAWData.csv);
	const headers = rows[0].map(field => field.toLowerCase());

	return {
		headers: headers,
		certificateData: RAWData.certificateData,
		students: makeStudentObjects(headers, rows)
	};
};

const promisify = (data, location) =>
	Promise.all([processCerts(data, location), processExcel(data, location)])
		.then(() => 
			Promise.resolve(path.basename(location))
		)
		.catch(error => {
			rimraf(location, () => {});
			return Promise.reject(error);
		});

module.exports = RAWData => {
	const data = prepareData(RAWData);
	if (data.students.length === 0)
		return Promise.reject('CSV file empty');

	const workDirectory = tmp.dirSync({prefix: 'report_', keep: true});
	return promisify(data, workDirectory.name);
};