var backendUrl = require("./backendUrl");

var generateQueryString = function(input) {
  var keyPairs = [];
  for (var key in input) {
    keyPairs.push(key + "=" + encodeURIComponent(input[key]));
  }
  return keyPairs.join("&");
}

var httpClient = function(method, url, input=null) {
  return new Promise(function(resolve, reject) {
    switch(method) {
      case "GET":
        var req = new XMLHttpRequest();
        if (input) {
          url = url + "?" + generateQueryString(input)
        }
        req.open(method, url, true);
        req.onreadystatechange = function() {
          if (req.readyState === 4) {
            try {
              resolve({
                status: req.status,
                message: JSON.parse(req.responseText),
              });
            }
            catch(err) {
              if (err.name === "SyntaxError") {
                resolve({
                  status: req.status,
                  message: req.responseText
                });
              }
              else {
                reject(err);
              }
            }
          }
        };
        req.withCredentials = true;
        req.send();
        break;
      case "POST":
        var req = new XMLHttpRequest();
        if (input) {
          input = generateQueryString(input)
        }
        else {
          input = "";
        }
        req.open(method, url, true);
        req.onreadystatechange = function() {
          if (req.readyState === 4) {
            try {
              resolve({
                status: req.status,
                message: JSON.parse(req.responseText)
              });
            }
            catch(err) {
              if (err.name === "SyntaxError") {
                resolve({
                  status: req.status,
                  message: req.responseText
                });
              }
              else {
                reject(err);
              }
            }
          }
        };
        req.withCredentials = true;
        req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        req.send(input);
        break;
    }
  });
};

var onboard = function(input) {
  return httpClient("GET", backendUrl + "/onboard/" + input.initialToken);
};

var login = function(input) {
  return httpClient("POST", backendUrl + "/login", input);
};

var logout = function() {
  return httpClient("GET", backendUrl + "/logout");
};

var getLogin = function() {
  return httpClient("GET", backendUrl + "/login");
};

var resetPassword = function(input) {
  return httpClient("POST", backendUrl + "/resetPassword", input);
};

module.exports = {
  onboard: onboard,
  login: login,
  logout: logout,
  getLogin: getLogin,
  resetPassword: resetPassword
};
