var passwordValidator = require('password-validator');

var validatePassword = function(password) {
  var schema = new passwordValidator();
  schema
    .is().min(8)
    .is().max(64)
    .has().uppercase()
    .has().lowercase()
    .has().digits()
    .has().not().spaces();
  return schema.validate(password);
};

var onboard = function(input) {
  var allowedKeys = ["initialToken"];
  try {
    var inputKeys = Object.keys(input);

    var boolInputKeysIncluded = inputKeys.reduce(function(result, key) {
      return result && allowedKeys.includes(key);
    }, true);

    var boolInputKeysNumber = allowedKeys.length === inputKeys.length;

    var boolInputKeysString = inputKeys.reduce(function(result, key) {
      return result && typeof(input[key]) === "string" && input[key];
    }, true);

    if (boolInputKeysIncluded && boolInputKeysNumber && boolInputKeysString) {
      return input;
    }
    return false;
  }
  catch(err) {
    return false;
  }
};

var resetPassword = function(input) {
  var allowedKeys = ["initialToken", "username", "password"];
  try {
    var inputKeys = Object.keys(input);

    var boolInputKeysIncluded = inputKeys.reduce(function(result, key) {
      return result && allowedKeys.includes(key);
    }, true);

    var boolInputKeysNumber = allowedKeys.length === inputKeys.length;

    var boolInputKeysString = inputKeys.reduce(function(result, key) {
      return result && typeof(input[key]) === "string" && input[key];
    }, true);

    var boolValidPassword = validatePassword(input["password"]);

    if (boolInputKeysIncluded && boolInputKeysNumber && boolInputKeysString && boolValidPassword) {
      return input;
    }
    return false;
  }
  catch(err) {
    return false;
  }
};

var login = function(input) {
  var allowedKeys = ["username", "password"];
  try {
    var inputKeys = Object.keys(input);

    var boolInputKeysIncluded = inputKeys.reduce(function(result, key) {
      return result && allowedKeys.includes(key);
    }, true);

    var boolInputKeysNumber = allowedKeys.length === inputKeys.length;

    var boolInputKeysString = inputKeys.reduce(function(result, key) {
      return result && typeof(input[key]) === "string" && input[key];
    }, true);

    if (boolInputKeysIncluded && boolInputKeysNumber && boolInputKeysString) {
      return input;
    }
    return false;
  }
  catch(err) {
    return false;
  }
};

module.exports = {
  onboard: onboard,
  resetPassword: resetPassword,
  login: login
};
