var {combineReducers, bindActionCreators} = require("redux");
var {
  userReducer: userReducer,
  onboard: onboard,
  login: login,
  logout: logout,
  getLogin: getLogin,
  resetPassword: resetPassword
  } = require("./userReducer");

var {cryptoFeedReducer} = require("./cryptoFeedReducer");
var {socketReducer} = require("./socketReducer");
var {collabReducer, createCollabSession, getMessages, sendMessage, startVideoChat, startCall} = require("./collabReducer");

var rootReducer = combineReducers({
  user: userReducer,
  cryptoFeed: cryptoFeedReducer,
  socket: socketReducer,
  collab: collabReducer,
});

var mapStateToProps = function(state) {
  return {
    user: state.user,
    cryptoFeed: state.cryptoFeed,
    socket: state.socket,
    collab: state.collab,
  };
};

var mapDispatchToProps = function(dispatch) {
  return bindActionCreators({
    onboard: onboard,
    login: login,
    logout: logout,
    getLogin: getLogin,
    resetPassword: resetPassword,
    createCollabSession: createCollabSession,
    getMessages: getMessages,
    sendMessage: sendMessage,
    startVideoChat: startVideoChat,
    startCall: startCall
  }, dispatch);
};

module.exports = {
  rootReducer: rootReducer,
  mapStateToProps: mapStateToProps,
  mapDispatchToProps: mapDispatchToProps
};
