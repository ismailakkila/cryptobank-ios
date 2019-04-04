var React = require("react");
var {
  StyleSheet,
  View,
  Text,
  Image
} = require("react-native");

var BTC = require("../assets/crypto/BTC.png");
var ETH = require("../assets/crypto/ETH.png");
var LTC = require("../assets/crypto/LTC.png");
var XRP = require("../assets/crypto/XRP.png");

var styles = StyleSheet.create({
  container: {
    height: 140,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap"
  },
  loadingContainer: {
    height: 140,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    opacity: 0.75,
    flexWrap: "wrap"
  },
  loadingPriceCardContainer: {
    width: "48.5%",
    height: 60,
    backgroundColor: "white",
    borderWidth: 3,
    borderColor: "#e0e1e2",
    borderRadius: 5,
    margin: 3
  },
  priceCardContainer: {
    width: "48.5%",
    height: 60,
    backgroundColor: "white",
    borderWidth: 3,
    borderColor: "#e0e1e2",
    borderRadius: 5,
    margin: 3,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center"
  },
  priceTextContainer: {
    flex: 2,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    padding: 3
  },
  priceIconContainer: {
    flex: 1,
    height: "100%",
    justifyContent: "center",
    alignItems: "center"
  },
  priceText: {
    fontWeight: "bold",
    fontSize: 14,
    color: "black"
  },
  cryptoText: {
    fontWeight: "bold",
    fontSize: 10,
    color: "#e0e1e2"
  }
});

var LoadingPricesCard = function() {
  return (
    <View
     style={styles.loadingPriceCardContainer}
    >
      <Image
        style={{height: "100%"}}
        source={{uri: 'https://react.semantic-ui.com/images/wireframe/paragraph.png'}}
        resizeMode="center"
      />
    </View>
  );
};

var LoadingPricesCardGroup = function(props) {
  var cardNum = props.cardNum;
  var cardGroup = [];
  for (var i = 0; i < cardNum; i++) {
    cardGroup.push((
      <LoadingPricesCard key={i} />
    ));
  }
  return (
    <View
      style={styles.loadingContainer}
    >
      {cardGroup}
    </View>
  );
};

var CryptoCard = function(props) {
  var {cryptoName, cryptoTicker, cryptoPrice} = props;
  switch(cryptoTicker) {
    case "BTC":
      var image = (
        <Image
          style={{flex: 1, width: 30}}
          source={BTC}
          resizeMode="contain"
        />
      );
      break;
    case "ETH":
      var image = (
        <Image
          style={{flex: 1, width: 30}}
          source={ETH}
          resizeMode="contain"
        />
      );
      break;
    case "LTC":
      var image = (
        <Image
          style={{flex: 1, width: 30}}
          source={LTC}
          resizeMode="contain"
        />
      );
      break;
    case "XRP":
      var image = (
        <Image
          style={{flex: 1, width: 30}}
          source={XRP}
          resizeMode="contain"
        />
      );
      break;
    default:
      var image = null;
  }
  return (
    <View
      style={styles.priceCardContainer}
    >
      <View
        style={styles.priceTextContainer}
      >
        <Text style={styles.priceText}>{cryptoPrice}</Text>
        <Text style={styles.cryptoText}>{cryptoName}</Text>
      </View>
      <View
        style={styles.priceIconContainer}
      >
        {image}
      </View>
    </View>
  );
};

var CryptoCardGroup = function(props) {
  var cryptoGroup = props.cryptoFeed.map(function(crypto) {
    return (
      <CryptoCard
        key={crypto.cryptoTicker}
        cryptoName={crypto.cryptoName}
        cryptoTicker={crypto.cryptoTicker}
        cryptoPrice={crypto.cryptoPrice}
      />
    )
  });
  return (
    <View
      style={styles.container}
    >
      {
        props.cryptoFeed.length === 0
        ?
          (
            <LoadingPricesCardGroup cardNum={4} />
          )
        :
          (
            <View
              style={styles.container}
            >
              {cryptoGroup}
            </View>
          )
      }
    </View>
  );
};

module.exports = CryptoCardGroup;
