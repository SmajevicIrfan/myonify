const path = require('path');

const { spawn } = require('child_process');
const messageHandler = require('./messageHandler');

module.exports = async (data, location) =>
	new Promise((resolve, reject) => {
		const excel_process = spawn('python', [path.join(__dirname, 'excel-process.py'), location]);

		// Send headers to the excel processor
		excel_process.stdin.write(data.headers.toString() + '\n');

		// Send each student and end write stream
		data.students.forEach(student => {
			excel_process.stdin.write(JSON.stringify(student) + '\n');
		});
		excel_process.stdin.end();

		// Process errors
		excel_process.stdout.on('data', messageHandler(resolve, reject));

		// If output stream ended without errors, success
		excel_process.stdout.on('end', () => {
			resolve('OK');
		});
	});