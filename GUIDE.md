# Step-by-Step Guide for this Small Webapp

## Step 0: Bare Node
Node is a great platform. It allows javascript to run server-side and has a 
dope community.  
It has helpful runtime variables like `__dirname` which contains the working
directory, to name just one.
Most importantly, it allows you to import 'modules' (other libraries of code)
as well as other json files.  

Look in `server.js` to see a config file loaded into an objec using the 
`require()` method.  We'll configure later.  

## Step 1: Express
The most popular node server framework is [express](https://expressjs.com/). 
We'll use it to both serve our frontend app and build a small RESTful API backend.  
___Note: in production / in larger apps, it makes sense to separate the two___  

The basic server is quite easy, as is running it on our local machine:
In server.js
```node
    var express = require('express');
    var app = express();

    // THIS SHOULD ALWAYS BE THE LAST CALL IN THIS FILE
    // The first parameter is the port, the second is an optional callback on success.
    app.listen(8080, function() {
        console.log("App is running on localhost:8080");
    });
```

## Step 2: Twitter + Houndify Node
Node and its community provide a great way to use Apis. Many libraries exist
for virtually every API to expose the core features in a programmatic / not pure 
HTTP way.  

We'll use a Twitter and Houndify's Express library to interact with their APIs.

For Twitter:

In server.js
```node
    var Twitter = require('twitter');

    // Configure twitter with access tokens to authenticate requests
    // New applications can be registered to accounts @ https://apps.twitter.com/
    // For now, you can use our Test Account: https://twitter.com/venturetests
    var twitClient = new Twitter({
        consumer_key: config['twitter_consumer_key'],
        consumer_secret: config['twitter_consumer_secret'],
        access_token_key: config['twitter_access_token_key'],
        access_token_secret: config['twitter_access_token_secret']
    });
```

For Houndify we need something a little different. We need an authentication
handler to verify with their API and we need a 'textProxyHandler' to format
our requests to their liking. Both of these will be used by the frontend 
Houndify Client.  
Once you've registered your Houndify Client and claimed your trial code, 
update the `config.json` file.

In server.js
```node
    var houndifyExpress = require('houndify').HoundifyExpress;
    //authenticates requests so the service knows we're legit
    app.get(API_BASE + '/houndifyAuth', houndifyExpress.createAuthenticationHandler({
        clientId:  config["houndify_client_id"],
        clientKey: config["houndify_client_key"]
    }));
    
    //sends the request to Houndify backend with authentication headers
    app.get(API_BASE + '/textSearchProxy', houndifyExpress.createTextProxyHandler());
```

## Step 3: Creating a RESTful API 
We want to expose the Twitter Client to post and fetch our tweets.  
We'll create a small API in RESTful style. The biggest thing about REST is 
that each request can be handled independently, without prior context. (Statelessness)  
Another big piece of REST is the resources: they should be accessed / computed on
depending on the type of HTTP request.

Our HTTP endpoint setup is:

    GET /tweets
    Accept: application/json  
        Fetches all our tweets and responds with just a list of their text
    
    POST /tweets  
    Accept: application/json  
        Pulls in data from the requests body and tweets it
    
So the same resource endpoint has different actions depending on the 
request method.

In server.js
```node
    // These are pretty unnecessary endpoints, just an example of using node on a backend
    // Basically just wrappers for using the Twitter API directly, but I'm sure you'll find a more creative use
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
```

## Step 4: Serving the App + Middleware
Middleware in express processes parts of the requests to make data more 
accessible and requests easier to handle.

Examples:
* Log all requests that come in
* Parse JSON content into a useable place
* Serve static content

We'll use a few middlewares to do these things:
* morgan's dev 
* body-parser
* express.static

app.use will apply these middlewares to all incoming requests.

In server.js
```node

// Middleware -- processes parts of the requests to make data more accessible
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var logger = require('morgan')('dev');


// Host the Angular app as a static folder to simulate frontend
// Express uses a middleware-type style: extensible and flexible
app.use(express.static(__dirname + '/app'));
// Parse json requests and write request logs to the console
app.use(jsonParser);
app.use(logger);
```

## Step 5: Frontend Houndify
We've set up our backend to use Houndify, but the frontend needs a way to communicate. Communication can be hard, people
are scary, but Houndify is easy(-ish). Before we jump into Angular, let's setup our Houndify Client.

First we'll create variables for our Api's url and our Houndify ClientId. We will create this inside
 the closure function. (function() {  /* HERE */  })();

In app.js
```javascript
    var API_BASE_URL = 'http://localhost:8080/api';
    var houndClientId = 'YOUR CLIENT ID';
```

Then we just need one extra piece: the requestInfo. The requestInfo helps keep
track of the conversation context with Houndify, a crazy cool way to handle voice. 
Siri step aside.  

```javascript
    // @see https://houndify.com/reference/RequestInfo
    var requestInfo = {
        ClientID: houndClientId,
        UserID: "adVenturer", // Lol puke
        Latitude: 40.7440,
        Longitude: 74.0324
    };
```

Houndify makes a bunch of different Clients for many different languages. 
We'll be using the [Web Client](https://docs.houndify.com/sdks/docs/web)

```javascript
     // Set up the basic Houndify Client
        var houndClient = new Houndify.HoundifyClient({
            // Can be any name that identifies your client
            clientId: houndClientId,
    
            //For handling the authentication.
            //See method HoundifyExpress.createAuthenticationHandler()
            authURL: API_BASE_URL + '/houndifyAuth',
    
            //You need to create an endpoint on your server
            //for handling the authentication and proxying
            //text search http requests to Houndify backend
            //See SDK's server-side method HoundifyExpress.createTextProxyHandler().
            textSearchProxy: {
                url: API_BASE_URL + '/textSearchProxy',
                method: "GET"
            },
    
            //Enable Voice Activity Detection
            // Like Siri: stops recording when you stop talking
            //Default: true
            enableVAD: false,
    
            // Event Listeners
            onError: function(err, info) {
                console.log("Error with Houndify!");
                console.log(err);
                console.log(info);
            },
    
            onRecordingStarted: function() {
                console.log('Recording to Houndify!');
            }
            // We can add more listeners to customize the actions as we please
        });
```

## Step 6: Angular app setup
Angular app's are modular, meaning you can build them from many different pieces.
'Modules' can depend on other modules for their functionality.
Angular is html heavy -- which is good! Angular easily integrates into html and 
extends it.  

Modules can contain a variety of Angular things:
- Controllers
- Directives
- Services
- Filters

We will only cover controllers right now, but the others are so dope you 
need to check them out!! Shit's lit.  
Controllers are attached to HTML elements and contain the elements logic and data.  

We first need to create the 'app' module and then add a controller.

In app.js
```javascript
    // Declare app level module
    // The first parameter is the name
    // The second parameter is an array of other modules we'd like to use
    var app = angular.module('ventureApp', []);

    // Controllers hold the logic for specific pieces of the application
    // The first param is the name, the second is an array of 'services' required
    //  Services are objects that provide functionality and can be used across the app
    // The last element in the array is a function, which is the real 'controller' piece
    app.controller('houndTweetController', [function() {}]);
```

Then we can bind these to the HTML page to create our small app:

In index.html
```html
<html ng-app="ventureApp">
    ...
    <body ng-controller="houndTweetController">
    ...
    </body>
</html>
```

## Step 7: $scope + $http
This is a biggie -- the $scope service allows us to access the controllers javascript right from the html, basically.  
We'll do a few things with this:
* Update the Tweet text with Houndify
* Hide and Show
* Submit / Reset the Tweet 

The $http service can be used to perform simple http requests: GET, POST, PUT ...  
We must inject these into the controller like so:  

In app.js
```javascript
    app.controller('houndTweetController', ['$scope', '$http',
        function($scope, $http) {
        ...
    }
```

We can add variable and function to the $scope to be accessed in the html:

In app.js
```javascript
    app.controller('houndTweetController', ['$scope', '$http',
        function($scope, $http) {
        // Default values
        $scope.isRecording = false;
        $scope.tweet = '';
    }
```

Here are the functions we'll need. They should all be placed inside the controller.

In app.js
```javascript
    // Setup the Hound Client to update our tweet when it processes speech
    houndClient.listeners.onTranscriptionUpdate = function(trObj) {
        // Must call $apply() on the scope when updating data in a callback
        // For longer callback functions, wrap the entire function in an $apply
        $scope.tweet = trObj.PartialTranscript;
        $scope.$apply();
        console.log($scope.tweet);
    };

    // ---- Functions that can be called from the html ---- :

    // Either stop / start the voice to tweet recording and show the button
    $scope.startStopVoiceSearch = function() {
        if (houndClient.voiceSearch.isStreaming()) {
            //stops streaming voice search requests, expects the final response from backend
            $scope.isRecording = false;
            houndClient.voiceSearch.stop();
        } else {
            $scope.isRecording = true;
            houndClient.voiceSearch.start(requestInfo);
            //starts streaming of voice search requests to Houndify backend
        }
    };
    
    // Will send whatever we have as the tweet to our backend to be tweeted
    $scope.sendTweet = function() {
        // Do some simple error checking
        if ($scope.tweet.length > 140) {
            // Could expand here and show a nice error message to the user
            console.log("Can't write a tweet longer than 140 Characters. Duh.");
            return;
        }

        $http.post(API_BASE_URL + '/tweets', {tweet: this.tweet})
            .success(function(data) {
                // Our tweet was successfully posted!
                console.log("Successfully posted tweet: " + data.tweet);

                // Reset the tweet
                $scope.tweet = '';
                // Shut off the voice search
                $scope.startStopVoiceSearch();
                // NOTE: $apply does not have to be called since $http is already an angular method
            })
            .error(function(error, responseCode) {
                // Something bad happened :/
                console.log("Error POSTing Tweets");
                console.log(error);
                console.log("Error response: " + responseCode);
            });
    };


    // Resets the current tweet and restarts the voice service
    $scope.resetTweet = function() {
        $scope.tweet = '';
        houndClient.voiceSearch.stop();

        // Hound needs a little time to process the 'stop' call
        // Note: This is not the best way to do this. Can you think of a better one?
        setTimeout(function() {
            // Gives a 250 millisecond wait before the voice analysis is restarted
            houndClient.voiceSearch.start(requestInfo);
        }, 250);
    }
```


Finally, the html to setup the record button and input form:
Hiding and showing are done with ng-hide and ng-show, which are give javascript expressions and change dynamically.
In index.html
```html
    <!--Inside #main-->
    <!-- Bootstrap sets a bunch of useful classes to help with all kinds of layouts. Grids are easiest.-->
    <div class="span12 text-center">
    
        <!-- When a variable or function is put in the $scope, it can be injected straight into the HTML
               in two ways:
                if the attribute is an ng-attribute: no need for {{ }}
                otherwise: wrap the javascript variable / function in {{ }} and angular will process it
               -->
        <section ng-show="!isRecording">
            <!-- Data binding in Angular is the coolest:
                ng-model allows us to reference a variable in the $scope
                    and changes are reflected both in the javascript and in the html
                 -->
            <button class="btn btn-primary btn-lg" ng-click="startStopVoiceSearch()">
                <!-- Bootstrap has a ton of icons preloaded:
                    http://www.w3schools.com/icons/bootstrap_icons_glyphicons.asp -->
                <i class="glyphicon glyphicon-record"></i>
            </button>
        </section>

        <!-- ng-show / ng-hide will dynamically show/hide elements.
                They can be given functions or variables -->
        <section id="tweetContainer" class="container" ng-show="isRecording">
            <h1 class="text-center">Speak your mind</h1>
            <form class="form-group span12">
                <textarea id="voiceInput" type="text" class="form-control" ng-model="tweet"></textarea>

                <div ng-hide="tweet.length == 0">
                    <!-- These functions are defined in the $scope -->
                    <button class="btn btn-primary" ng-click="sendTweet()">
                        Tweet it yo
                    </button>
                    <button class="btn btn-default" ng-click="resetTweet()">
                        Reset
                    </button>
                </div>
            </form>
        </section>
    </div>
```

## Step 8: UI Bootstrap
[UI Bootstrap](https://angular-ui.github.io/bootstrap/) is a library for Bootstrap components 
built for Angular. Gives us a lot of pretty buttons and bars to use. 

Firstly, need to 'inject' the dependency in the 'ventureApp' module:  

In app.js
```javascript

var app = angular.module('ventureApp', ['ui.bootstrap']);

```

We'll use UI Bootstrap to show a progress bar for how long our tweet is. We can use a few pre-defined 'directives'
straight in html like they are native elements.

In index.html
```html
    <!-- Right above the Tweet button -->

    <!-- This is called a directive. It is an Angular-defined html element, generated from a template.-->
    <uib-progressbar max="140" value="tweet.length" type="{{progressType()}}">
        <span>{{tweet.length}} / 140</span>
    </uib-progressbar>
```

We can dynamically set the type of the bar (ie. green, orange, red) depending on how long our tweet is.

In app.js
```javascript
    
    // controller ...
    
    // Determines which state the progressBar should be in depending
    //  on how close the tweet is to exceeding the 140 char limit
    $scope.progressType = function() {
        var tweetLength = $scope.tweet.length;
        var type = 'danger';
        if (tweetLength < 120) {
            type = 'success';
        } else if (tweetLength >= 120 && tweetLength <= 140) {
            type = 'warning';
        }
        return type;
    };
    
    // more controller ...
```

## Step 9: Tweets List
Wouldn't it be nice to see all those tweets you've already tweeted?  
We'll add a small aside and load all of our past tweets in a list using Angular repeat:  

First we need an object to reference in the $scope:  

In app.js
```javascript
    /// In controller ... 
    
    // Default to an empty list of past tweets
    $scope.tweets = [];
    
    // Fetch all past tweet texts from our backend
    $http.get(API_BASE_URL + '/tweets')
        .success(function(data) {
            $scope.tweets = data.tweets;
        })
        .error(function(error, responseCode) {
            console.log("Error GETing tweets");
            console.log(error);
            console.log("Error response: " + responseCode);
        });
        
        
    /// In successful Tweet callback
    .success(function(data) {
        ...
 
        // Add the tweet to the list of all tweets
        $scope.tweets.push(data.tweet);
        
        ...
     }
     /// more controller ...
```

In index.html
```html
    /// Right after #main
    
    <aside id="tweetsColumn">
            <p><b>What's been on your mind: </b></p>
            <p ng-repeat="t in tweets">{{t}}</p>
    </aside>
```