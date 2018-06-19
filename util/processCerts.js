const path = require('path');
const fs = require('fs');
const rimraf = require('rimraf');

const { spawn } = require('child_process');
const messageHandler = require('./messageHandler');

module.exports = async (data, location) =>
	new Promise((resolve, reject) => {
		if (data.students.length === 0)
			reject('CSV file empty');
		
		fs.mkdirSync(path.join(location, 'certificates'));
		fs.mkdirSync(path.join(location, 'certificates', 'tmp-logos'));
		
		if (data.certificateData.leftLogo)
			fs.writeFileSync(
				path.join(location, 'certificates', 'tmp-logos', data.certificateData.leftLogo.originalname),
				data.certificateData.leftLogo.buffer
			);
		if (data.certificateData.rightLogo)
			fs.writeFileSync(
				path.join(location, 'certificates', 'tmp-logos', data.certificateData.rightLogo.originalname),
				data.certificateData.rightLogo.buffer
			);

		const cert_process = spawn('python', [path.join(__dirname, 'cert-process.py'), path.join(location, 'certificates')], {
			cwd: __dirname
		});

		// Send necessary data to certificate processor
		cert_process.stdin.write(data.certificateData.period + '\n');
		cert_process.stdin.write(data.certificateData.signature_title + '\n');
		cert_process.stdin.write(data.certificateData.signature + '\n');

		// Were each of the logos provided
		cert_process.stdin.write(`${data.certificateData.leftLogo ?
			data.certificateData.leftLogo.originalname : '0'
		}\n`);
		cert_process.stdin.write(`${data.certificateData.rightLogo ?
			data.certificateData.rightLogo.originalname : '0'
		}\n`);

		data.students.forEach(student => {
			cert_process.stdin.write(JSON.stringify(student) + '\n');
		});
		cert_process.stdin.end();

		// Process errors
		cert_process.stdout.on('data', messageHandler(reject));

		// If output stream ended without errors, success
		cert_process.stdout.on('end', () => {
			rimraf(path.join(location, 'certificates', 'tmp-logos'), () => {});
			resolve('OK');
		});
	});