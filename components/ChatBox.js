var React = require("react");
var {
  StyleSheet,
  View,
  Text,
  Image,
} = require("react-native");

var styles = StyleSheet.create({
  containerChatbox: {
    padding: 2,
    width: "75%",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    backgroundColor: "white",
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    margin: 5
  },
  containerAvatar: {
    margin: 5,
    width: 30,
    height: 30,
  },
  containerChatContent: {
    flex: 1,
    margin: 10,
    justifyContent: "center",
    alignItems: "flex-start"
  },
  containerChatContentHeading: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center"
  },
  containerChatContentText: {
  },
  textChatHeading: {
    fontSize: 12,
    fontWeight: "bold"
  },
  textChatDate: {
    margin: 5,
    fontSize: 10,
    opacity: 0.7
  },
  textChatText: {
    fontSize: 10
  }
});

class ChatBox extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    var {type, displayName, date, text} = this.props;
    return (
      <View
        style={[styles.containerChatbox, (type.name === "bot" || type.name === "agent") ? {alignSelf: "flex-start"} : {alignSelf: "flex-end"}]}
      >
        <View style={styles.containerAvatar}>
          <Image
            source={type.image}
            style={{
              width: 30,
              height: 30
            }}
          />
        </View>
        <View style={styles.containerChatContent}>
          <View style={styles.containerChatContentHeading}>
            <Text style={
              type.name === "guest" ? [styles.textChatHeading, {color: "blue"}] : styles.textChatHeading
            }>
              {displayName}
            </Text>
            <Text style={styles.textChatDate}>
              {date}
            </Text>
          </View>
          <View style={styles.containerChatContentText}>
            <Text style={styles.textChatText}>
              {text}
            </Text>
          </View>
        </View>
      </View>
    );
  }
}

module.exports = ChatBox;
