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
})();