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
    var houndClientId = '***REMOVED***';

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
    var app = angular.module('ventureApp', []);

    // Controllers hold the logic for specific pieces of the application
    // The first param is the name, the second is an array of 'services' required
    //  Services are objects that provide functionality and can be used across the app
    // The last element in the array is a function, which is the real 'controller' piece
    app.controller('houndTweetController', [function() {}]);

})();