// 'use strict';

// Imports dependencies and set up http server
const 
  request = require('request'),
  express = require('express'),
  bodyParser = require('body-parser'),
  app = express(),
  async = require("async"),
  apiai = require("apiai"),
  uuid = require('uuid');



// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// Firstly you need to add some middleware to parse the post data of the body.
app.use(bodyParser.json());       // to support JSON-encoded bodies
//app.use(bodyParser.urlencoded()); // to support URL-encoded bodies - depricited 
app.use(bodyParser.urlencoded({ extended: true })); // to support URL-encoded bodies
/*
//uuid.v1()
const apiAiService = apiai("YOUR_ACCESS_TOKEN", {
    language: "en",
    requestSource: "fb"
});
*/
var whatsAppWelcomeMessage = function (req, res, next) {
  
    async.auto({
        whatsAppLoginAPI: function(callback) {

            var username = "admin",
                password = "Welcome!1";
            var options = {
                method: 'POST',
                url: 'https://172.16.245.87:11002/v1/users/login',
                headers:{       
                    authorization: "Basic " + new Buffer(username + ":" + password).toString("base64"),
                    'content-type': 'application/json' 
                },
                rejectUnauthorized: false //Error: Error: self signed certificate in certificate chain
            };

            request(options, function (error, response, body) {
                //console.log(error, response, body);
                if (error) {
                    //throw new Error(error);
                    //if (error) callback(error);
                    if (error) callback(new Error(error));
                } else {
                    if (!error && response.statusCode == 200) {
                        console.log("Successfully whatsAppLoginAPI!");
                        callback(null, body);
                    } else {
                        console.error("Failed calling Send API", response.statusCode, response.statusMessage, body.error);
                        callback(new Error("Failed calling Send API", response.statusCode, response.statusMessage, body.error));
                        //callback(body);
                    }
                }
            });

        },
        checkContactByAPI: ['whatsAppLoginAPI', function (results, callback) {
                console.log("Mobile: "+req.body.mobile); //9887658765 -> invalid whatsapp user
                ob = JSON.parse(results.whatsAppLoginAPI); 
                var tokenJson;  
                ob.users.forEach(function(item) {
                    tokenJson = item.token ;
                });
                //callback(null, '2');
                //OR
                
                var username = "admin",
                password = "Welcome!1";
                var options = {
                    method: 'POST',
                    url: 'https://172.16.245.87:11002/v1/contacts',
                    headers:{       
                        authorization: "Bearer " + tokenJson,
                        'content-type': 'application/json' 
                    },
                    body: { blocking: 'wait', contacts: [ '+919716004560' ] },
                    json: true,
                    rejectUnauthorized: false //Error: Error: self signed certificate in certificate chain
                };
                request(options, function (error, response, body) {
                    //console.log(error, response, body);
                    if (error) {
                        if (error) callback(new Error(error));
                    } else {
                        if (!error && response.statusCode == 200) {
                            console.log("Successfully checkContactByAPI!");
                            callback(null, body);
                        } else {
                            console.error("Failed calling Send API", response.statusCode, response.statusMessage, body.error);
                            callback(new Error("Failed calling Send API", response.statusCode, response.statusMessage, body.error));
                        }
                    }
                });
            }
        ],
        /*
        getEvenMessageByAPI: ['checkContactByAPI', function (results, callback) {
                console.log(uuid.v1());
                sendEventToApiAi(event, uuid.v1());
            }
        ],
        */
        sendWhatAppMessageByAPI: ['checkContactByAPI', function (results, callback) {
                ob = JSON.parse(results.whatsAppLoginAPI);
                var tokenJson;
                ob.users.forEach(function(item) {
                    tokenJson = item.token ;
                });

                object = results.checkContactByAPI;
                var waId;
                object.contacts.forEach(function(item) {
                    waId = item.wa_id ;
                });
                //callback(null, '2');
                //OR

                var options = {
                    method: 'POST',
                    url: 'https://172.16.245.87:11002/v1/messages',
                    headers:{
                        authorization: "Bearer " + tokenJson,
                        'content-type': 'application/json'
                    },
                    body: {
                      recipient_type: "individual", //"individual" OR "group"
                      //to: waId, //"whatsapp_id" OR "whatsapp_group_id"
                      to: "919716004560", //"whatsapp_id" OR "whatsapp_group_id"
                      type: "text", //"audio" OR "document" OR "hsm" OR "image" OR "text"
                      text: {
                        body: "Test By Node.js"
                      }
                    },
                    json: true,
                    rejectUnauthorized: false //Error: Error: self signed certificate in certificate chain
                };
                console.log(options);
                request(options, function (error, response, body) {
                    console.log(error, response, body);
                    if (error) {
                        if (error) callback(new Error(error));
                    } else {
                        if (!error && response.statusCode == 200 || response.statusCode == 201) {
                            console.log("Successfully sendWhatAppMessageByAPI!");
                            console.log(body)
                            callback(null, body);
                        } else {
                            console.error("Failed calling Send API", response.statusCode, response.statusMessage, body.error);
                            callback(new Error("Failed calling Send API", response.statusCode, response.statusMessage, body.error));
                        }
                    }
                });
            }
        ],
    }, function(error, results) {
        if (error) {
            console.log("Error!");
            console.log(error);
            return next(error);
        } else {
            //console.log("Successfully!");
            //console.log(results);
            return next(null, results);
        }
    });
}
/*
//Dialogflow Event
let event = { type: "WELCOME" };
const sendEventToApiAi = (event, sessionId) => {
    return new Promise(function(resolve, reject) {

        let eventArg = {
            "name": event.type
            //"data": event.data
        };
        
        var request = apiAiService.eventRequest(eventArg, {sessionId: sessionId});

        request.on('response', function(response) {
            console.log("sendEventToApiAi: response=" + JSON.stringify(response));
            return resolve(response);
        });

        request.on('error', function(error) {
            return reject(error);
        });

        request.end();
    });
}
*/

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function(request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

// assuming POST:   moblie=9716004560           <-- URL encoding
//
// or       POST: {"moblie":"9716004560"}       <-- JSON encoding
app. post("/whatsapp-welcome-message", whatsAppWelcomeMessage, function (req, res) {
    res.send("This page is authenticated!")
});

// Accepts POST requests at /webhook endpoint
app.post('/whatsapp-webhook', (req, res) => {  
  // Parse the request body from the POST
  let body = req.body;
});

// Accepts GET requests at the /webhook endpoint
app.get('/whatsapp-webhook', (req, res) => {
  console.log('whatsapp webhook is not listening')
});

// listen for requests :)
var listener = app.listen(process.env.PORT || 3030, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
