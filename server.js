/**
 * A basic server for handling the Angular app and basic backend functions
 */

// Node lets us load in any json file as an object
// __dirname is a node variable that holds the current working directory path
var config = require(__dirname + '/config');
var API_BASE = '/' + config.apiBase;
var express = require('express');
var app = express();

// The first parameter is the port, the second is an optional callback on success.
app.listen(8080, function() {
    console.log("App is running on localhost:8080");
});