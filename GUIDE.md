# Step-by-Step Guide for this Small Tutorial

## Installation
## Angular
## Serving
## Backend
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