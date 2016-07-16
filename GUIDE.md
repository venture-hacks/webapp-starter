# Step-by-Step Guide for this Small Tutorial

## Installation
## Step 5: Frontend Houndify
We've set up our backend to use Houndify, but the frontend needs a way to communicate. Communication can be hard, people
are scary, but Houndify is easy(-ish). Before we jump into Angular, let's setup our Houndify Client.

First we'll create variables for our Api's url and our Houndify ClientId. We will create this inside
 the closure function. (function() {  /* HERE */  })();

In app.js
```javascript
    var API_BASE_URL = 'http://localhost:8080/api';
    var houndClientId = '***REMOVED***';
```

Then we just need one extra piece: the requestInfo. The requestInfo helps keep
track of the conversation with Houndify, a crazy cool way to handle voice. Siri step aside.  

```javascript
```

Houndify makes a bunch of different Clients for many different languages. 
We'll be using the [Web Client](https://docs.houndify.com/sdks/docs/web)

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