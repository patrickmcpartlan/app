
const express = require('express');
const request = requrie('requests');


const app = express();



app.get('/api', (req, res, body) => {
	let name = req.query.name;
	
	let feature = req.query.feature;
	

	var obj = {
		"keyOne": name,
		"keyTwo": feature
	}

	let something = "asdfasdfasdfa sdfas dfasdfjjj"
	request.post('your geoserver location', something)




	
	res.send(feature);

}) 




app.listen('3000', () => {
	console.log('application running on port 3000');
});