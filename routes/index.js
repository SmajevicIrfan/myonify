const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
	res.render('index', { title: 'MyONify - Create MyON certificates' });
});

module.exports = router;