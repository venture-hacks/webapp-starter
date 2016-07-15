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

// Middleware -- processes parts of the requests to make data more accessible
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var logger = require('morgan')('dev');

// Configure twitter with access tokens to authenticate requests
// New applications can be registered to accounts @ https://apps.twitter.com/
// For now, you can use our Test Account: https://twitter.com/venturetests
var twitClient = new Twitter({
    consumer_key: config['twitter_consumer_key'],
    consumer_secret: config['twitter_consumer_secret'],
    access_token_key: config['twitter_access_token_key'],
    access_token_secret: config['twitter_access_token_secret']
});

// Host the Angular app as a static folder to simulate frontend
// Express uses a middleware-type style: extensible and flexible
app.use(express.static(__dirname + '/app'));
// Parse json requests and write request logs to the console
app.use(jsonParser);
app.use(logger);


// From our sponsor: Houndify
//authenticates requests so the service knows we're legit
app.get(API_BASE + '/houndifyAuth', houndifyExpress.createAuthenticationHandler({
    clientId:  config["houndify_client_id"],
    clientKey: config["houndify_client_key"]
}));

//sends the request to Houndify backend with authentication headers
app.get(API_BASE + '/textSearchProxy', houndifyExpress.createTextProxyHandler());


// Define a few backend endpoints.
// NOTE: This is just a small example. For larger projects it makes sense to separate
//  the frontend and backend server
app.get(API_BASE, function(req, res) {
    res.status(200).send("This is a backend endpoint!")
});

// Basic Restful Request Structure: GET vs POST
// These are pretty unnecessary endpoints, just an example of using node on a backend
// Basically just wrappers for using the Twitter API directly, but I'm sure you'll find a more
//  creative use
// Also check out the Streaming API for real time tweets
app.get(API_BASE + '/tweets', function(req, res) {
    twitClient.get('statuses/user_timeline', {}, function(errors, tweetObjs, response) {
        if (errors) {
            // If you are unfamiliar with HTTP status codes, no worries! They're easy to look up
            res.status(response.statusCode).send({errors: errors});
        } else {
            // We'll only use the text from the tweets, so strip them from the response
            var tweets = [];
            for (var i = 0; i < tweetObjs.length; i++)
                tweets.push(tweetObjs[i].text)
            res.status(200).send({tweets: tweets});
        }
    });
});

app.post(API_BASE + '/tweets', function(req, res) {
    // body-parser puts json data sent from our angular app into the body of the request
    var tweetText = req.body.tweet;
    // This will greatly slow down the response time. NOT MEANT TO BE A PRODUCTION EXAMPLE
    twitClient.post('statuses/update', {status: tweetText}, function(errors, tweet, response) {
        if (errors) {
            // If you are unfamiliar with HTTP status codes, no worries! They're easy to look up
            res.status(response.statusCode).send({errors: errors});
        } else {
            res.status(response.statusCode).send({tweet: tweet});
        }
    });
});

// The first parameter is the port, the second is an optional callback on success.
app.listen(8080, function() {
    console.log("App is running on localhost:8080");
});

