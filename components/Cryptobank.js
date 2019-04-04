var React = require("react");
var {AppLoading, Asset, Font} = require('expo');
var {YellowBox, Image} = require("react-native");
var {AntDesign, Ionicons, MaterialCommunityIcons, Feather, Foundation, MaterialIcons} = require("@expo/vector-icons");
console.disableYellowBox = true;

var Login = require("./Login");
var Dashboard = require("./Dashboard");

var cacheImages = function(images) {
  return images.map(image => {
    if (typeof image === 'string') {
      return Image.prefetch(image);
    } else {
      return Asset.fromModule(image).downloadAsync();
    }
  });
}

var cacheFonts = function(fonts) {
  return fonts.map(font => Font.loadAsync(font));
}

class Cryptobank extends React.Component {
  constructor(props) {
    super(props);
    props.getLogin();
    this.state = {isReady: false};
  }

  async _loadAssetsAsync() {
    const imageAssets = cacheImages([
      require('../assets/cryptobank-logo.png'),
      require('../assets/cryptobank-icon.png'),
      require('../assets/cryptobank-splash.png'),
      require('../assets/icon.png'),
      require('../assets/logo/ciscoWebexTeams.png'),
      require('../assets/crypto/BTC.png'),
      require('../assets/crypto/ETH.png'),
      require('../assets/crypto/LTC.png'),
      require('../assets/crypto/XRP.png'),
      require('../assets/agent/agent1.jpg'),
      require('../assets/agent/agent2.jpg'),
      require('../assets/agent/agent3.jpg'),
      require('../assets/agent/agent4.jpg'),
      require('../assets/agent/agent5.jpg'),
      require('../assets/agent/cryptobank.jpg'),
      require('../assets/agent/guest.jpg')
    ]);

    const fontAssets = cacheFonts([
      Ionicons.font,
      AntDesign.font,
      MaterialCommunityIcons.font,
      Feather.font,
      Foundation.font,
      MaterialIcons.font
    ]);

    await Promise.all([
      ...imageAssets,
      ...fontAssets
    ]);
  }

  render() {
    var authenticated = this.props.user.authenticated;
    var {isReady} = this.state;
    if (!isReady) {
      return (
        <AppLoading
          startAsync={this._loadAssetsAsync}
          onFinish={() => this.setState({ isReady: true })}
          onError={console.warn}
        />
      );
    }
    else {
      if (authenticated) {
        return (
          <Dashboard
            user={this.props.user}
            socket={this.props.socket}
            collab={this.props.collab}
            cryptoFeed={this.props.cryptoFeed}
            logout={this.props.logout}
            createCollabSession={this.props.createCollabSession}
            getMessages={this.props.getMessages}
            sendMessage={this.props.sendMessage}
            startVideoChat={this.props.startVideoChat}
            startCall={this.props.startCall}
          />
        );
      }
      else if (authenticated === null || authenticated === false) {
        return (
          <Login
            user={this.props.user}
            onboard={this.props.onboard}
            login={this.props.login}
            resetPassword={this.props.resetPassword}
          />
        );
      }
      else {
        return (
          <AppLoading />
        );
      }
    }
  }
}

module.exports = Cryptobank;
