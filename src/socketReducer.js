var UPDATESOCKET = "UPDATESOCKET";

var updateSocketActionCreator = function(socket) {
  return {
    type: UPDATESOCKET,
    socket: socket
  };
};

var socketReducer = function(state=null, action) {
  switch(action.type) {
    case UPDATESOCKET:
      return action.socket;
    default:
      return state;
  }
};

var updateSocket = function(socket) {
  return function(dispatch) {
    dispatch(updateSocketActionCreator(socket));
  };
}

module.exports = {
  socketReducer: socketReducer,
  updateSocket: updateSocket
};
