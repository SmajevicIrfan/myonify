const express = require('express');

const path = require('path');
const os = require('os');
const zipdir = require('zip-dir');
const rimraf = require('rimraf');

const router = express.Router();

router.get('', (req, res) => {
	const id = req.query.id;
	if (!id)
		throw { status: 400, message: 'Download ID not provided' };

	zipdir(path.join(os.tmpdir(), id), (err, buffer) => {
		rimraf(path.join(os.tmpdir(), id), () => {});
		
		if (err)
			throw { status: 500, message: err };

		res.set('Content-disposition', 'attachment; filename=report.zip');
		res.set('Content-Type', 'application/zip');

		res.status(200).send(buffer);
	});
});

module.exports = router;