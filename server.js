const express = require('express');
const app = express();
const port = 3000;
 
app.get('/', (req, res) => {
  res
    .send('Hello pp server is running')
});
 
// Start the server
app.listen(process.env.PORT || port, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});



// const express = require('express');
// const request = requrie('requests');


// const app = express();



// app.get('/api', (req, res, body) => {
// 	let name = req.query.name;
	
// 	let feature = req.query.feature;
	

// 	var obj = {
// 		"keyOne": name,
// 		"keyTwo": feature
// 	}

// 	let something = "asdfasdfasdfa sdfas dfasdfjjj"
// 	request.post('your geoserver location', something)




	
// 	res.send(feature);

// }) 




// app.listen('3000', () => {
// 	console.log('application running on port 3000');
// });