# Step-by-Step Guide for this Small Tutorial

## Installation
## Angular
## Serving
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