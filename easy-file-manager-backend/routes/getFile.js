const express = require('express');
const router = express.Router();
const fs = require('fs');
const util = require('util');
const fs_readdir = util.promisify(fs.readdir);
const fs_stat = util.promisify(fs.stat);
const path = require('path');
const config = require('../config.json');

router.get('/', async function(req, res, next){
	if(req.query.path.indexOf("/../") != -1){
		res.send("");
		return;
	}
	let pathDir = path.join(config.root, req.query.path ? req.query.path : "");
	res.sendFile(pathDir);
});

module.exports = router;
