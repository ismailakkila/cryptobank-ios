var React = require("react");
var {AntDesign, Ionicons} = require("@expo/vector-icons");
var {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView
} = require("react-native");

var BTC = require("../assets/crypto/BTC.png");
var ETH = require("../assets/crypto/ETH.png");
var LTC = require("../assets/crypto/LTC.png");
var XRP = require("../assets/crypto/XRP.png");

var styles = StyleSheet.create({
  container: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  titleContainer: {
    height: 40,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    padding: 5
  },
  footerContainer: {
    height: 40,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    padding: 5,
    borderTopColor: "#e0e1e2",
    borderTopWidth: 1
  },
  cryptoItemContainer: {
    height: 70,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopColor: "#e0e1e2",
    borderTopWidth: 1
  },
  cryptoItemLeft: {
    flex: 1,
    height: "100%",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 15,
    paddingLeft: 15
  },
  cryptoItemRight: {
    flex: 1,
    height: "100%",
    justifyContent: "center",
    alignItems: "flex-end",
    paddingRight: 15
  },
  cryptoButtonsContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center"
  },
  cryptoButtonContainer: {
    width: 40,
    paddingLeft: 5,
    paddingRight: 5,
  },
  cryptoItemText: {
    fontSize: 10,
    color: "#696969",
    margin: 4
  },
  cryptoPriceText: {
    fontSize: 10,
    color: "#696969",
    margin: 2
  },
  titleText: {
    color: "#2185d0",
    fontWeight: "bold"
  },
  cryptoIcons: {
    marginLeft: 4,
    marginRight: 4,
    marginBottom: 4
  }
});

var CryptoItem = function(props) {
  var {cryptoName, cryptoTicker, cryptoPrice, cryptoBalance} = props;
  switch(cryptoTicker) {
    case "BTC":
      var image = (
        <Image
          style={{height: 30, width: 30}}
          source={BTC}
          resizeMode="contain"
        />
      );
      break;
    case "ETH":
      var image = (
        <Image
          style={{height: 30, width: 30}}
          source={ETH}
          resizeMode="contain"
        />
      );
      break;
    case "LTC":
      var image = (
        <Image
          style={{height: 30, width: 30}}
          source={LTC}
          resizeMode="contain"
        />
      );
      break;
    case "XRP":
      var image = (
        <Image
          style={{height: 30, width: 30}}
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
      style={styles.cryptoItemContainer}
    >
      <View style={styles.cryptoItemLeft}>
        {image}
        <Text style={[styles.cryptoItemText, {fontWeight: "bold"}]}>{cryptoName}</Text>
      </View>
      <View style={styles.cryptoItemRight}>
        <Text style={[styles.cryptoPriceText, {fontWeight: "bold"}]}>{String(cryptoBalance) + " " + cryptoTicker}</Text>
        <View style={{height: 20}}>
          {
            isNaN(cryptoPrice)
              ? null
              :
               (
                 <Text style={styles.cryptoPriceText}>
                  {"$" + String((cryptoBalance * cryptoPrice).toFixed(2))}
                 </Text>
               )
          }
        </View>
        <View
          style={styles.cryptoButtonsContainer}
        >
          <TouchableOpacity
            style={styles.cryptoButtonContainer}
          >
            <Ionicons
              style={styles.cryptoIcons}
              name="ios-send"
              size={25}
              color="#696969"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cryptoButtonContainer}
          >
            <AntDesign
              style={styles.cryptoIcons}
              name="qrcode"
              size={25}
              color="#696969"
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

var CryptoPortfolio = function(props) {
  var cryptoUsdPrices = props.cryptoPortfolio.map(function(crypto) {
      var balance = crypto.cryptoBalance * crypto.cryptoPrice;
      if (!isNaN(balance)) {
        return crypto.cryptoBalance * crypto.cryptoPrice;
      }
      return NaN;
  });
  var cryptoTotalBalance = cryptoUsdPrices.reduce(function(sum, balance) {
    return sum + balance;
  }).toFixed(2);
  var CryptoItemGroup = props.cryptoPortfolio.map(function(crypto) {
    return (
      <CryptoItem
        key={crypto.cryptoTicker}
        cryptoName={crypto.cryptoName}
        cryptoTicker={crypto.cryptoTicker}
        cryptoPrice={crypto.cryptoPrice}
        cryptoBalance={crypto.cryptoBalance}
      />
    );
  });
  return (
    <ScrollView
      contentContainerStyle={styles.container}
    >
      <View
        style={styles.titleContainer}
      >
        <Text style={styles.titleText}>Your Portfolio</Text>
      </View>
      {CryptoItemGroup}
      <View
        style={styles.footerContainer}
      >
        {
          isNaN(cryptoTotalBalance)
            ? null
            :
              (
                <Text style={styles.titleText}>
                  Total Balance: {"$" + String(cryptoTotalBalance)}
                </Text>
              )
        }
      </View>
    </ScrollView>
  );
};

module.exports = CryptoPortfolio;
