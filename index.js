var http = require('http');
var qs = require('querystring');
var request = require('request');

process.env.NODE_ENV = process.env.NODE_ENV || "development"

var ROUTER_URL = {
  "development": "http://localhost:8081",
  "production" : "http://assistant-router.herokuapp.com"
}


function sendToRouter(command) {
  request.post(ROUTER_URL[process.env.NODE_ENV], {body: JSON.stringify(command)}, function (err, response, body) {
    if (err) {
      console.error("Unable to reach router")
      return console.error(err);
    }
  })
}

function detectCommand(command) {
  var options = {
    url: 'https://api.wit.ai/message?q=' + qs.escape(command.text),
    headers: {"Authorization": "Bearer UE47AC55EFCKJM2WQCIDFBT5F3RK5EGW" }
  }

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log(body)
      var message = JSON.parse(body)
      var resultData = JSON.stringify({result: body})
      if (command.callback != undefined) {
        request.post(command.callback, {body: resultData})
      }
      var routeCommand = {"category": message.outcomes.intent, "commands": message.outcomes.entities}
      sendToRouter(routeCommand)
    }
  })
}

function createServer(port) {
  http.createServer(function (req, res) {
    var body = "";

    req.on('data', function (chunk) {
      body += chunk;
    })

    req.on('end', function () {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.end('OK!');

      if (body.length > 0) {
        console.log(body);
        var formData = JSON.parse(body);
        detectCommand(formData)
      }
    });
  }).listen(port)
}

function start() {
  var port = Number(process.env.PORT || 8080);
  console.log("Started on port " + port)
  createServer(port);
}

start()
