const express = require('express');
const router = express.Router();
const fs = require('fs');
const util = require('util');
const fs_readdir = util.promisify(fs.readdir);
const fs_stat = util.promisify(fs.stat);
const path = require('path');
const config = require('../config.json');
const sharp = require('sharp');

router.get('/', async function(req, res, next){
	if(!config.show_thumb || req.query.path.indexOf("/../") != -1){
		res.sendFile(path.join(__dirname, '../public/images/image_file.svg'));
		return;
	}
	let pathDir = path.join(config.root, req.query.path ? req.query.path : "");
	res.contentType('image/png');
	res.send(await sharp(pathDir).resize(config.thumb_width).png().toBuffer());
});

module.exports = router;
