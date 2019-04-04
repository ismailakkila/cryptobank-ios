var React = require("react");
var {
  StyleSheet,
  View,
  ScrollView
} = require("react-native");

var cryptoBankImage = require("../assets/agent/cryptobank.jpg");
var guestImage = require("../assets/agent/guest.jpg");
var agentImages = [
  require("../assets/agent/agent1.jpg"),
  require("../assets/agent/agent2.jpg"),
  require("../assets/agent/agent3.jpg"),
  require("../assets/agent/agent4.jpg"),
  require("../assets/agent/agent5.jpg")
];
var ChatBox = require("./ChatBox");

var styles = StyleSheet.create({
  containerChat: {
    flex: 1,
    width: "100%"
  },
  containerScrollView: {
    width: "100%",
    justifyContent: "flex-end",
    flexGrow: 1,
    padding: 10
  }
});

class ChatMessages extends React.Component {
  constructor(props) {
    super(props);
    this.chatScrollView = React.createRef();
    this.state = {};
  }

  componentDidMount() {
    var {scrollToEnd, resetChatBoxFocused} = this.props;
    var {chatScrollView} = this;
    if (scrollToEnd && chatScrollView) {
      setTimeout(function() {
        this.chatScrollView.current.scrollToEnd();
        resetChatBoxFocused();
      }.bind(this), 250);
    }
  }

  componentDidUpdate() {
    var {scrollToEnd, resetChatBoxFocused} = this.props;
    var {chatScrollView} = this;
    if (scrollToEnd && chatScrollView) {
      setTimeout(function() {
        this.chatScrollView.current.scrollToEnd();
        resetChatBoxFocused();
      }.bind(this), 250);
    }
  }

  render() {
    var {collab, scrollToEnd} = this.props;
    var {chatScrollView} = this;
    var formatTime = function(number) {
      if (number < 10) {
        number = "0" + String(number);
        return number;
      }
      return number;
    };

    var chats = collab.chats.filter(function(chat) {
      return Boolean(chat.text);
    }).map(function(chat, index) {
      var {personId, created, text, id} = chat;
      var hours = formatTime(new Date(created).getHours());
      var minutes = formatTime(new Date(created).getMinutes());
      var date = hours + ":" + minutes;
      if (personId === collab.guestId) {
        return (
          <ChatBox
            key={index}
            type={{
              name: "guest",
              image: guestImage
            }}
            displayName={"You"}
            date={date}
            text={text}
          />
        );
      }
      else if (personId === collab.botId) {
        return (
          <ChatBox
            key={index}
            type={{
              name: "bot",
              image: cryptoBankImage
            }}
            displayName={"CryptoBank"}
            date={date}
            text={text}
          />
        );
      }
      else {
        return (
          <ChatBox
            key={index}
            type={{
              name: "agent",
              image: agentImages[Number(collab.cryptobankRep.agentId)]
            }}
            displayName={collab.cryptobankRep.displayName}
            date={date}
            text={text}
          />
        );
      }
    });
    return (
      <View style={styles.containerChat}>
        <ScrollView
          ref={this.chatScrollView}
          contentContainerStyle={styles.containerScrollView}
          onContentSizeChange={()=>this.chatScrollView.current.scrollToEnd()}
        >
          {chats.reverse()}
        </ScrollView>
      </View>
    );
  }
}

module.exports = ChatMessages;
