var apiClient = require("./apiClient");
var verifyInput = require("./verifyInput");
var socketClient = require("./socketClient");

var UPDATEUSER = "UPDATEUSER";

var defaultState = {
  err: null,
  authenticated: undefined,
  user: null,
  webexTeamsToken: null
};

var updateUserStateActionCreator = function(user) {
  return {
    type: UPDATEUSER,
    user: user
  };
};

var userReducer = function(state=defaultState, action) {
  switch(action.type) {
    case UPDATEUSER:
      return action.user;
    default:
      return state;
  }
};

var getLogin = function() {
  return function(dispatch) {
    apiClient.getLogin()
      .then(function(response) {
        if (response.status === 200) {
          socketClient.connect(dispatch)
            .then(function(connected) {
              dispatch(updateUserStateActionCreator(Object.assign(
                {},
                response.message.document,
                {err: null}
              )));
            });
        }
        else if (response.status === 401) {
          dispatch(updateUserStateActionCreator({
            err: null,
            authenticated: null,
            user: null,
            webexTeamsToken: null
          }));
        }
        else {
          throw response.status + ": " + response.message;
        }
      })
      .catch(function(err) {
        dispatch(updateUserStateActionCreator({
          err: err,
          authenticated: null,
          user: null,
          webexTeamsToken: null
        }));
      });
      return;
  };
};

var onboard = function(input) {
  return function(dispatch) {
    input = verifyInput.onboard(input);
    if (input) {
      apiClient.onboard(input)
        .then(function(response) {
          if (response.status === 200) {
            dispatch(updateUserStateActionCreator({
              err: null,
              authenticated: null,
              user: response.message.document,
              webexTeamsToken: null
            }));
          }
          else if (response.status === 404) {
            dispatch(updateUserStateActionCreator({
              err: null,
              authenticated: null,
              user: null,
              webexTeamsToken: null
            }));
          }
          else {
            throw response.status + ": " + response.message;
          }
        })
        .catch(function(err) {
          dispatch(updateUserStateActionCreator({
            err: err,
            authenticated: null,
            user: null,
            webexTeamsToken: null
          }));
        });
        return;
    }
    dispatch(updateUserStateActionCreator(defaultState));
  }
};

var login = function(input) {
  return function(dispatch) {
    input = verifyInput.login(input);
    if (input) {
      apiClient.login(input)
        .then(function(response) {
          if (response.status === 200) {
            socketClient.connect(dispatch)
              .then(function(connected) {
                dispatch(updateUserStateActionCreator(Object.assign(
                  {},
                  response.message.document,
                  {err: null}
                )));
              });
          }
          else if (response.status === 401) {
            dispatch(updateUserStateActionCreator({
              err: null,
              authenticated: false,
              user: null,
              webexTeamsToken: null
            }));
            setTimeout(function() {
              dispatch(updateUserStateActionCreator({
                err: null,
                authenticated: null,
                user: null,
                webexTeamsToken: null
              }));
            }, 2500);
          }
          else {
            throw response.status + ": " + response.message;
          }
        })
        .catch(function(err) {
          dispatch(updateUserStateActionCreator({
            err: err,
            authenticated: null,
            user: null,
            webexTeamsToken: null
          }));
        });
        return;
    }
    dispatch(updateUserStateActionCreator(defaultState));
  };
};

var logout = function() {
  return function(dispatch) {
    apiClient.logout()
      .then(function(response) {
        if (response.status === 200) {
          dispatch(updateUserStateActionCreator(defaultState));
        }
        else {
          throw response.status + ": " + response.message;
        }
      })
      .catch(function(err) {
        dispatch(updateUserStateActionCreator({
          err: err,
          authenticated: null,
          user: null,
          webexTeamsToken: null
        }));
      });
  };
};

var resetPassword = function(input) {
  return function(dispatch) {
    input = verifyInput.resetPassword(input);
    if (input) {
      apiClient.resetPassword(input)
        .then(function(response) {
          if (response.status === 200) {
            dispatch(updateUserStateActionCreator({
              err: null,
              authenticated: null,
              user: response.message.document,
              webexTeamsToken: null
            }));
          }
          else if (response.status == 404) {
            dispatch(updateUserStateActionCreator({
              err: null,
              authenticated: null,
              user: null,
              webexTeamsToken: null
            }));
          }
          else {
            throw response.status + ": " + response.message;
          }
        })
        .catch(function(err) {
          dispatch(updateUserStateActionCreator({
            err: err,
            authenticated: null,
            user: null,
            webexTeamsToken: null
          }));
        });
        return;
    }
    dispatch(updateUserStateActionCreator(defaultState));
  }
};

module.exports = {
  userReducer: userReducer,
  onboard: onboard,
  login: login,
  logout: logout,
  getLogin: getLogin,
  resetPassword: resetPassword
};
