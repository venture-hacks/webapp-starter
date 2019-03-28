/**
 * This is the main application logic for our small angular app
 * Here we define 'modules' -- angular's term to break applications into smaller pieces
 *
* */

'use strict';
// Wondering why this is a function wrapped in parenthesis?
// It's a closure! They're great for hiding your code.
// Without them variables are usually created globally, available to any other
// scripts that could be running.
(function() {
    var API_BASE_URL = 'http://localhost:8080/api';
    var houndClientId = '';

    //REQUEST INFO JSON
    // @see https://houndify.com/reference/RequestInfo
    // Holds relevant information about the current context
    // This can be used to keep track of 'conversations' with Houndify
    var requestInfo = {
        ClientID: houndClientId,
        UserID: "adVenturer", // Lol puke
        Latitude: 40.7440,
        Longitude: 74.0324
    };

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


    // Declare app level module
    // The first parameter is the name
    // The second parameter is an array of other modules we'd like to use
    var app = angular.module('ventureApp', ['ui.bootstrap']);

    // Controllers hold the logic for specific pieces of the application
    // The first param is the name, the second is an array of 'services' required
    //  Services are objects that provide functionality and can be used across the app
    // The last element in the array is a function, which is the real 'controller' piece
    app.controller('houndTweetController', ['$scope', '$http',
        function($scope, $http) {
            // Default values
            $scope.isRecording = false;
            $scope.tweet = '';
            $scope.tweets = [];

            // Set default values

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

            // Setup the Hound Client to update our tweet when it processes speech
            houndClient.listeners.onTranscriptionUpdate = function(trObj) {
                // Must call $apply() on the scope when updating data in a callback
                // For longer callback functions, wrap the entire function in an $apply
                $scope.tweet = trObj.PartialTranscript;
                $scope.$apply();
                console.log($scope.tweet);
            };

            // ---- Functions that can be called from the html template ---- :

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
                        // Add the tweet to the list of all twee ts
                        $scope.tweets.push($scope.tweet);
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
    }]);

})();
