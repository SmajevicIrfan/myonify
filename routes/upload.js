const express = require('express');
const multer = require('multer');

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
	else if (Number(student1['grade']) > Number(student2['grade']))
		return 1;

	if (`${student1['last name']} ${student1['first name']}` < `${student2['last name']} ${student2['first name']}`)
		return -1;
	else if (`${student1['last name']} ${student1['first name']}` > `${student2['last name']} ${student2['first name']}`)
		return 1;

	return 0;
};

router.post('/', upload.fields(uploadFields), (req, res) => {
	const csvFile = req.files['dataCSV'];
	const leftLogo = req.files['leftLogo'];
	const rightLogo = req.files['rightLogo'];

	if (!csvFile)
		throw { status: 400, message: 'CSV file not provided' };
	
	if (!req.body.from || !req.body.to || !req.body.signature_title || !req.body.signature)
		throw { status: 400, message: 'Bad Request' };

	if (csvFile[0].mimetype !== 'text/csv' && csvFile[0].mimetype !== 'application/vnd.ms-excel')
		throw { status: 415, message: 'Unsupported Media Type' };
	
	const rows = csvFile[0].buffer.toString('utf8').split(/(\r\n|\n|\r)/g).filter(row => /\S/.test(row))
		.map(line => line.split(',').map(field => trim(field)));
	const headers = rows[0].map(field => field.toLowerCase());

	const data = {
		headers: headers,
		certificateData: {
			period: `${req.body.from.replace(/\//g, '.')} – ${req.body.to.replace(/\//g, '.')}`,
			signature_title: req.body.signature_title.toUpperCase(),
			signature: req.body.signature.replace(/\b\w/g, l => l.toUpperCase()),
			leftLogo: leftLogo ? leftLogo[0] : undefined,
			rightLogo: rightLogo ? rightLogo[0] : undefined
		},
		students: rows.slice(1).map(row => row.reduce((
			(acc, curr, index) => Object.assign({}, acc, { [headers[index]]: Number.isNaN(+curr) ? curr : +curr })
		), {})).sort(compare)
	};

	process(data).then((r) => {
		res.status(200).send(r);
	});
});

module.exports = router;