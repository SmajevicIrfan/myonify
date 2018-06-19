const path = require('path');
const tmp = require('tmp');
const rimraf = require('rimraf');

const processCerts = require('./processCerts');
const processExcel = require('./processExcel');

const promisify = (data, location) =>
	Promise.all([processCerts(data, location), processExcel(data, location)])
		.then(() => 
			Promise.resolve(path.basename(location))
		)
		.catch(error => {
			rimraf(location, () => {});
			return Promise.reject(error);
		});

module.exports = data => {
	if (data.students.length === 0)
		return Promise.reject('CSV file empty');

	const workDirectory = tmp.dirSync({prefix: 'report_', keep: true});
	return promisify(data, workDirectory.name);
};