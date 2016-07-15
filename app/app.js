'use strict';
(function() {
    var API_BASE_URL = 'http://localhost:8080/api';
    var houndClientId = '***REMOVED***';

    //REQUEST INFO JSON
    //see https://houndify.com/reference/RequestInfo
    // This can be used to have 'conversations' with Houndify
    var requestInfo = {
        ClientID: houndClientId,
        UserID: "adVenturer", // Lol puke
        Latitude: 40.7440,
        Longitude: 74.0324
    };

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
        //Default: true
        enableVAD: true,

        // Event Listeners

        onError: function(err, info) {
            console.log(err);
            console.log(info);
        },

        onRecordingStarted: function() {
            console.log('Recording');
        }
        // We can add more listeners to customize the actions as we please
    });


    // Declare app level module which depends on views, and components
    var app = angular.module('ventureApp', [
      'ui.bootstrap'
    ]);

    app.controller('houndTweetController', ['$scope',
        function($scope) {

            $scope.isRecording = false;
            $scope.tweet = '';

            $scope.startStopVoiceSearch = function() {
                if (houndClient.voiceSearch.isStreaming()) {
                    //stops streaming voice search requests, expects the final response from backend
                    houndClient.voiceSearch.stop();
                } else {
                    houndClient.voiceSearch.start(requestInfo);
                    //starts streaming of voice search requests to Houndify backend
                }
            };

            $scope.progressType = function() {
                var tweetLength = this.tweet.length;
                var type = 'danger';
                if (tweetLength < 120) {
                    type = 'success';
                } else if (tweetLength >= 120 && tweetLength <= 140) {
                    type = 'warning';
                }
                return type;
            };

            houndClient.listeners.onTranscriptionUpdate = function(trObj) {
                $scope.tweet = trObj.PartialTranscript;
                console.log($scope.tweet);
            };
    }]);

})();