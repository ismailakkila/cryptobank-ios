var ReconnectingWebSocket = require("reconnecting-websocket");
var {updateSocket} = require("./socketReducer");
var {updateCryptoPriceFeed} = require("./cryptoFeedReducer");
var {updateCollabSession} = require("./collabReducer");
var backendUrl = require("./backendUrl");

var socketConnectionTimeout = 10000;

var parseSocketMessage = function(data) {
  try {
    if (data) {
      data = data.split(/^\d+/);
      var arrayLength = data.length;
      if (arrayLength === 2) {
        return JSON.parse(data[1]);
      }
    }
    return null;
  }
  catch(e) {
    return null;
  }
};

var parseSocketEvent = function(data) {
  if (Array.isArray(data)) {
    if (
      data.length === 2 &&
      typeof(data[0]) === "string" &&
      typeof(data[1]) === "object"
    ) {
      return {
        socketEvent: data[0],
        socketPayload: data[1]
      };
    }
    return null;
  }
};



var connect = function(dispatch) {
  return new Promise(function(resolve, reject) {

    var client = new ReconnectingWebSocket(
      backendUrl + "/socket.io/?EIO=3&transport=websocket",
      ["react-native"]
    );

    setTimeout(function() {
      reject("Socket connection timed after: " + socketConnectionTimeout + "ms");
      return;
    }, socketConnectionTimeout);

    client.onopen = function(e) {
      updateSocket(client)(dispatch);
      client.onmessage = function(e) {
        var data = parseSocketMessage(e.data);
        if (data) {
          var parsedSocket = parseSocketEvent(data);
          if (parsedSocket) {
            switch(parsedSocket.socketEvent) {
              case "cryptoPriceFeed":
                updateCryptoPriceFeed(parsedSocket.socketPayload)(dispatch);
                break;
              case "cryptobankRepAssigned":
                updateCollabSession(parsedSocket.socketPayload)(dispatch);
                break;
              case "roomAssigned":
                updateCollabSession(parsedSocket.socketPayload)(dispatch);
                break;
              case "collabErr":
                updateCollabSession(parsedSocket.socketPayload)(dispatch);
                break;
            }
          }
        }
      };
      resolve(true);
      return;
    };
  });
};

module.exports = {
  connect: connect
};
