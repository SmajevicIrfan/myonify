const path = require('path');
const { spawn } = require('child_process');

module.exports = (headers, data) => {
	
	return new Promise((resolve, reject) => {
		if (data.length === 0)
			reject('CSV file empty');

		let excel_process = spawn('python', [path.join(__dirname, 'excel-process.py')]);
		// Send headers to the excel processor
		excel_process.stdin.write(headers.toString() + '\n');
		excel_process.stdin.write('ć č ž š đ\n');
		
		data.forEach(student => {
			excel_process.stdin.write(JSON.stringify(student) + '\n');
		});
		excel_process.stdin.end();

		excel_process.stdout.on('data', chunk => {
			// eslint-disable-next-line no-console
			console.log(chunk.toString('utf8'));
			if (chunk.toString('utf8') === 'ERROR')
				reject('Some error occured while generating the excel report. Please debug for more information.');
		});

		const used = process.memoryUsage();
		// eslint-disable-next-line no-console
		console.log('MEMORY USAGE:');
		for (let key in used) {
			// eslint-disable-next-line no-console
			console.log(`${key} ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
		}
	
		excel_process.stdout.on('end', () => {
			resolve('OK');
		});
	});
};