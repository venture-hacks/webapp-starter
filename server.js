/**
 * A basic server for handling the Angular app and basic backend functions
 */

// Node lets us load in any json file as an object
// __dirname is a node variable that holds the current working directory path
var config = require(__dirname + '/config');
var API_BASE = '/' + config.apiBase;
