/**
 * A very basic server
 */

var express = require('express');

var app = express();

// Host the Angular app as a static folder to simulate frontend
app.use(express.static(__dirname + '/app'));

// Define a few backend endpoints.
// NOTE: This is just a small example. For larger projects it makes sense to separate
//  the frontend and backend server
app.get('/api', function(req, res) {
    res.send("This is a backend endpoint!")
});

app.listen(8080, function() {
    console.log("App is running on localhost:8000");
});

