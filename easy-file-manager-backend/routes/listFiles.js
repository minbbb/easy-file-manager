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
		res.send({});
		return;
	}
	let pathDir = path.join(config.root, req.query.path ? req.query.path : "");
	let items = [];
	try{
		items = await fs_readdir(pathDir);
	}catch(err){
		console.log(err);
	}
	items = items.map((item)=>{
		return {'name': item};
	});
	for (let i = 0; i < items.length; i++){
		try{
			items[i].stat = await fs_stat(path.join(pathDir, items[i].name));
			items[i].dir = items[i].stat.isDirectory();
		}catch(err){
			console.log(err);
			items[i].stat = null;
			items[i].dir = false;
		}
	}
	res.send(items);
});

module.exports = router;
