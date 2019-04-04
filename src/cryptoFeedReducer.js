var UPDATECRYPTOPRICEFEED = "UPDATECRYPTOPRICEFEED";

var updateCryptoPriceFeedActionCreator = function(cryptoPriceFeed) {
  return {
    type: UPDATECRYPTOPRICEFEED,
    cryptoPriceFeed: cryptoPriceFeed
  }
};

var cryptoFeedReducer = function(state=[], action) {
  switch(action.type) {
    case UPDATECRYPTOPRICEFEED:
      return action.cryptoPriceFeed;
    default:
      return state;
  }
};

var updateCryptoPriceFeed = function(cryptoPriceFeed) {
  return function(dispatch) {
    dispatch(updateCryptoPriceFeedActionCreator(cryptoPriceFeed));
  };
};

module.exports = {
  cryptoFeedReducer: cryptoFeedReducer,
  updateCryptoPriceFeed: updateCryptoPriceFeed
};
