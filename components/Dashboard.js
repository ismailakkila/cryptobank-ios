var React = require("react");
var {
  StyleSheet,
  View,
  Image,
  Alert,
  StatusBar
} = require("react-native");
var {RTCView} = require('react-native-webrtc');

var CryptoCardGroup = require("./CryptoCardGroup");
var CryptoPortfolio = require("./CryptoPortfolio");
var Collaboration = require("./Collaboration");
var Menu = require("./Menu");

var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "#1b1c1d",
  }
});

var BTCBALANCE = 3.678;
var ETHBALANCE = 32;
var LTCBALANCE = 56;
var XRPBALANCE = 2476;

var cryptoBalances = {
  BTC: BTCBALANCE,
  ETH: ETHBALANCE,
  LTC: LTCBALANCE,
  XRP: XRPBALANCE
};

var initialCryptoFeed = [
  {
    cryptoName: "Bitcoin",
    cryptoTicker: "BTC",
    cryptoPrice: ""
  },
  {
    cryptoName: "Ethereum",
    cryptoTicker: "ETH",
    cryptoPrice: ""
  },
  {
    cryptoName: "Litecoin",
    cryptoTicker: "LTC",
    cryptoPrice: ""
  },
  {
    cryptoName: "Ripple",
    cryptoTicker: "XRP",
    cryptoPrice: ""
  }
];

var getCryptoPortfolioData = function(cryptoFeed) {
  return cryptoFeed.map(function(crypto) {
    return Object.assign({}, crypto, {
      cryptoBalance: Number(cryptoBalances[crypto.cryptoTicker]),
      cryptoPrice: Number(crypto.cryptoPrice.split(" ")[1]),
    });
  });
};

class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedMenuOption: "portfolio"
    };
    this.handleSelectMenuOption = this.handleSelectMenuOption.bind(this);
    this.handleAlertLoans = this.handleAlertLoans.bind(this);
  }

  handleSelectMenuOption(option) {
    this.setState({
      selectedMenuOption: option
    });
  }

  handleAlertLoans() {
    Alert.alert(
      "CryptoBank",
      "Stay Tuned! This is coming soon.",
      [{
        text: 'OK',
        onPress: () => this.setState({
          selectedMenuOption: "portfolio",
          alertDisplayed: false
        })
      }]
    );
  }

  render() {
    var {user, socket, collab, cryptoFeed, logout, createCollabSession, getMessages, sendMessage, startVideoChat, startCall} = this.props;
    var {selectedMenuOption, alertDisplayed} = this.state;
    switch(selectedMenuOption) {
      case "portfolio":
        var displayedInterface = (
          <View
            style={styles.container}
          >
            <StatusBar
              barStyle="light-content"
            />
            <Image
              style={{width: "25%"}}
              source={require("../assets/cryptobank-logo.png")}
              resizeMode="contain"
            />
            <CryptoCardGroup cryptoFeed={cryptoFeed} />
            <CryptoPortfolio
              cryptoPortfolio={cryptoFeed.length < 4 ? getCryptoPortfolioData(initialCryptoFeed) : getCryptoPortfolioData(cryptoFeed)}
            />
            <Menu
              selectedMenuOption={selectedMenuOption}
              handleSelectMenuOption={this.handleSelectMenuOption}
              handleAlertLoans={this.handleAlertLoans}
            />
          </View>
        );
        break;
      case "chat":
        var displayedInterface = (
          <Collaboration
            user={user}
            socket={socket}
            collab={collab}
            createCollabSession={createCollabSession}
            getMessages={getMessages}
            sendMessage={sendMessage}
            startVideoChat={startVideoChat}
            startCall={startCall}
            handleSelectMenuOption={this.handleSelectMenuOption}
          />
        );
        break;
    }
    return displayedInterface;
  }
}

module.exports = Dashboard;
