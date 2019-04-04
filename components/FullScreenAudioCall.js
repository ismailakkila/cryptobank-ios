var React = require("react");
var {
  StyleSheet,
  View,
  Image,
  Text,
  TouchableOpacity,
  StatusBar,
} = require("react-native");
var {Ionicons} = require("@expo/vector-icons");
var Proximity = require("react-native-proximity");

var CollabAudioControls = require("./CollabAudioControls");

var agentImages = [
  require("../assets/agent/agent1.jpg"),
  require("../assets/agent/agent2.jpg"),
  require("../assets/agent/agent3.jpg"),
  require("../assets/agent/agent4.jpg"),
  require("../assets/agent/agent5.jpg")
];

var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e0e1e2",
    justifyContent: "flex-start",
    alignItems: "center"
  },
  containerHeading: {
    backgroundColor: "white",
    paddingTop: 25,
    height: 60,
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center"
  },
  containerHeadingButton: {
    width: 60,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  headingText: {
    fontWeight: "bold",
    fontSize: 14,
    color: "black",
    margin: 5
  },
  containerCalling: {
    width: "100%",
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  containerCallingCircle: {
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    width: 200,
    height: 200,
    borderRadius: 100
  },
  agentImage: {
    height: 50,
    width: 50,
    borderRadius: 25,
    margin: 10
  }
});

class FullScreenAudioCall extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      proximity: false
    };
    this.proximityListenerAudio = this.proximityListenerAudio.bind(this);
  }

  proximityListenerAudio(data) {
    var {proximity} = data
    if (proximity) {
      console.log("proximity audio enabled");
      this.setState({proximity: true});
    }
    else {
      console.log("proximity audio disabled");
      this.setState({proximity: false});
    }
  }

  componentDidUpdate() {
    Proximity.removeListener(this.proximityListenerAudio);
    Proximity.addListener(this.proximityListenerAudio);
  }

  componentDidMount() {
    Proximity.addListener(this.proximityListenerAudio);
  }

  componentWillUnmount() {
    Proximity.removeListener(this.proximityListenerAudio);
  }

  render() {
    var {
      agentId,
      handleDisconnectCall,
      handleMuteAudio,
      handleUnmuteAudio,
      handleEnableLoudSpeaker,
      handleDisableLoudSpeaker,
      audioMuted,
      loudSpeaker,
      enableMultiTasking
    } = this.props;
    return (
      <View
        style={styles.container}
      >
        <StatusBar
          barStyle={"dark-content"}
        />
        <View
          style={styles.containerHeading}
        >
          <TouchableOpacity
            onPress={enableMultiTasking}
            style={styles.containerHeadingButton}
          >
            <Ionicons
              name="ios-arrow-back"
              size={30}
              color="#2185d0"
            />
          </TouchableOpacity>
        </View>
        <View
          style={styles.containerCalling}
        >
          <View
            style={styles.containerCallingCircle}
          >
            <Image
              style={styles.agentImage}
              source={agentImages[agentId]}
              resizeMode="cover"
            />
            <Text style={[styles.headingText, {fontSize: 18, color: "#2185d0"}]}>Connected</Text>
          </View>
        </View>
        <CollabAudioControls
          handleDisconnectCall={handleDisconnectCall}
          handleMuteAudio={handleMuteAudio}
          handleUnmuteAudio={handleUnmuteAudio}
          handleEnableLoudSpeaker={handleEnableLoudSpeaker}
          handleDisableLoudSpeaker={handleDisableLoudSpeaker}
          audioMuted={audioMuted}
          loudSpeaker={loudSpeaker}
        />
      </View>
    );
  }
}

module.exports = FullScreenAudioCall;
