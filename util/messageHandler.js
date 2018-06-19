const debug = require('debug')('debug:server');

module.exports = (reject) => chunk => {
	debug(chunk.toString('utf8'));
	if (chunk.toString('utf8') === 'ERROR')
		reject('Some error occured while generating the excel report. Please debug for more information.');
};