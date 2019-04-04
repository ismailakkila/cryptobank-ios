var React = require("react");
var {MaterialCommunityIcons} = require("@expo/vector-icons");
var {
  StyleSheet,
  View,
  Text,
  TouchableOpacity
} = require("react-native");

var styles = StyleSheet.create({
  menuContainer: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-end",
    alignItems: "center"
  },
  menuBoxContainer: {
    height: 55,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#e0e1e2",
    borderTopColor: "#696969",
    borderTopWidth: 2
  },
  menuButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  menuText: {
    fontWeight: "bold",
    fontSize: 12,
    color: "#696969"
  },
  selectedMenuText: {
    fontWeight: "bold",
    fontSize: 12,
    color: "#2185d0"
  }
});

class Menu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    var {selectedMenuOption, handleSelectMenuOption, handleAlertLoans} = this.props;
    return (
      <View
        style={styles.menuContainer}
      >
        <View
          style={styles.menuBoxContainer}
        >
          <TouchableOpacity
            style={styles.menuButton}
            onPress={()=>handleSelectMenuOption("portfolio")}
          >
            <MaterialCommunityIcons
              name="finance"
              size={25}
              color={selectedMenuOption === "portfolio" ? "#2185d0" : "#696969"}
            />
            <Text
              style={selectedMenuOption === "portfolio" ? styles.selectedMenuText : styles.menuText}
            >
              Portfolio
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={()=>handleSelectMenuOption("chat")}
            style={styles.menuButton}
          >
            <MaterialCommunityIcons
              name="message-video"
              size={25}
              color={selectedMenuOption === "chat" ? "#2185d0" : "#696969"}
            />
            <Text
              style={selectedMenuOption === "chat" ? styles.selectedMenuText : styles.menuText}
            >
              Help Service
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={handleAlertLoans}
          >
            <MaterialCommunityIcons
              name="bank"
              size={25}
              color={selectedMenuOption === "loans" ? "#2185d0" : "#696969"}
            />
            <Text
              style={selectedMenuOption === "loans" ? styles.selectedMenuText : styles.menuText}
            >
              Loans
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

module.exports = Menu;
