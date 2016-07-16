/**
 * A basic server for handling the Angular app and basic backend functions
 */

var Twitter = require('twitter');
var houndifyExpress = require('houndify').HoundifyExpress;
var express = require('express');
var app = express();

// Node lets us load in any json file as an object
// __dirname is a node variable that holds the current working directory path
var config = require(__dirname + '/config');
var API_BASE = '/' + config.apiBase;

// Configure twitter with access tokens to authenticate requests
// New applications can be registered to accounts @ https://apps.twitter.com/
// For now, you can use our Test Account: https://twitter.com/venturetests
var twitClient = new Twitter({
    consumer_key: config['twitter_consumer_key'],
    consumer_secret: config['twitter_consumer_secret'],
    access_token_key: config['twitter_access_token_key'],
    access_token_secret: config['twitter_access_token_secret']
});

// From our sponsor: Houndify
//authenticates requests so the service knows we're legit
app.get(API_BASE + '/houndifyAuth', houndifyExpress.createAuthenticationHandler({
    clientId:  config["houndify_client_id"],
    clientKey: config["houndify_client_key"]
}));

//sends the request to Houndify backend with authentication headers
app.get(API_BASE + '/textSearchProxy', houndifyExpress.createTextProxyHandler());

// The first parameter is the port, the second is an optional callback on success.
app.listen(8080, function() {
    console.log("App is running on localhost:8080");
});

