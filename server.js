const express = require('express');
const app = express();
const port = 3000;
const path = require('path');
 
// app.get('/', (req, res) => {
//   res
//     .sendFile(path.join(__dirname, '/index.html'))
// });

app.get('/', function(req, res) {
  res.sendFile('index.html', {root: __dirname })
});
 
// Start the server
app.listen(process.env.PORT || port, () => {
  console.log(`App listening on port ${port}`);
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