const express = require('express');
const multer = require('multer');

const process = require('../util/process');

const router = express.Router();
const upload = multer({});

const uploadFields = [
	{ name: 'dataCSV', maxCount: 1 },
	{ name: 'leftLogo', maxCount: 1 },
	{ name: 'rightLogo', maxCount: 1 }
];

const checkReq = (csvFile, req) => {
	if (!csvFile || !req.body.from || !req.body.to || !req.body.signature_title || !req.body.signature)
		throw { status: 400, message: 'Bad Request' };
};

const checkType = (csvFile) => {
	if (csvFile[0].mimetype !== 'text/csv' && csvFile[0].mimetype !== 'application/vnd.ms-excel')
		throw { status: 415, message: 'Unsupported Media Type' };
};

router.post('/', upload.fields(uploadFields), (req, res) => {
	const csvFile = req.files['dataCSV'];
	const leftLogo = req.files['leftLogo'];
	const rightLogo = req.files['rightLogo'];
	
	checkReq(csvFile, req);
	checkType(csvFile);

	const RAWData = {
		csv: csvFile[0].buffer,
		certificateData: {
			period: `${req.body.from.replace(/\//g, '.')} – ${req.body.to.replace(/\//g, '.')}`,
			signature_title: req.body.signature_title.toUpperCase(),
			signature: req.body.signature.replace(/\b\w/g, l => l.toUpperCase()),
			leftLogo: leftLogo ? leftLogo[0] : undefined,
			rightLogo: rightLogo ? rightLogo[0] : undefined
		}
	};

	process(RAWData).then((r) => {
		res.status(200).send(r);
	});
});

module.exports = router;