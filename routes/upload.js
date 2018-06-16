const express = require('express');
const multer = require('multer');
const path = require('path');

//const spawn = require('child_process').spawn;

const process = require('../util/process');

let router = express.Router();
let upload = multer({});

const uploadFields = [
	{ name: 'dataCSV', maxCount: 1 },
	{ name: 'leftLogo', maxCount: 1 },
	{ name: 'rightLogo', maxCount: 1 }
];

const trim = str => str.replace(/^(\s|")+|(\s|")+$/gm, '');
const compare = (student1, student2) => {
	if (Number(student1['grade']) < Number(student2['grade']))
		return -1;
	if (Number(student1['grade']) > Number(student2['grade']))
		return 1;
	
	['last name', 'first name'].forEach(key => {
		if (student1[key] < student2[key])
			return -1;
		if (student1[key] > student2[key])
			return 1;
	});
	
	return 0;
};

router.get('/', (req, res) => {
	//res.status(200).send('Welcome to my app');
	res.sendFile(path.join(__dirname, '..', 'test.xlsx'));
});

router.post('/', upload.fields(uploadFields), (req, res) => {
	const csvFile = req.files['dataCSV'][0];
	
	if (path.extname(csvFile.originalname) !== '.csv' ||
	(csvFile.mimetype !== 'text/csv' && csvFile.mimetype !== 'application/vnd.ms-excel'))
		throw { status: 415, message: 'Unsupported Media Type' };
	
	const rows = csvFile.buffer.toString('utf8').split(/(\r\n|\n|\r)/g).filter(row => /\S/.test(row))
		.map(line => line.split(',').map(field => trim(field)));
	const headers = rows[0].map(field => String(field.toLowerCase()));
	
	const data = rows.slice(1).map(row => row.reduce((
		(acc, curr, index) => Object.assign({}, acc, { [headers[index]]: Number.isNaN(+curr) ? curr : +curr })
	), {})).sort(compare);

	process(headers, data).then((r) => {
		res.status(200).send(r);
	});
});

module.exports = router;