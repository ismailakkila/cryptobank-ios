var React = require("react");
var {
  StyleSheet,
  View,
  Animated,
  TouchableOpacity
} = require("react-native");
var {Ionicons, Feather, MaterialCommunityIcons, AntDesign} = require("@expo/vector-icons");

var styles = StyleSheet.create({
  buttonGroupContainer: {
    width: "100%",
    flexDirection: "row",
    position: "absolute",
    bottom: 70,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8
  },
  button: {
    width: 60,
    height: 60,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 100,
    padding: 2,
    margin: 2,
  }
});

class CollabVideoControls extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fadeAnim: new Animated.Value(1)
    };
  }

  componentDidMount() {
    var {hideCollabControls} = this.props;
    Animated.timing(
      this.state.fadeAnim,
      {
        toValue: 0,
        delay: 3000
      }
    ).start(function(result) {
      if (result.finished) {
        hideCollabControls();
      }
    });
  }

  render() {
    var {fadeAnim} = this.state;
    var {
      handleDisconnectCall,
      handleMuteAudio,
      handleUnmuteAudio,
      handleEnableLoudSpeaker,
      handleDisableLoudSpeaker,
      handleMuteVideo,
      handleUnmuteVideo,
      enableMultiTasking,
      audioMuted,
      loudSpeaker,
      videoMuted
    } = this.props;
    return (
      <Animated.View
        style={[
          styles.buttonGroupContainer,
          {opacity: fadeAnim}
        ]}
      >
        <TouchableOpacity
          onPress={audioMuted ? handleUnmuteAudio : handleMuteAudio}
          style={[styles.button, {backgroundColor: audioMuted ? "red" : "#2185d0"}]}
        >
          <Ionicons
            name="ios-mic-off"
            size={25}
            color="white"
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={videoMuted ? handleUnmuteVideo : handleMuteVideo}
          style={[styles.button, {backgroundColor: videoMuted ? "red" : "#2185d0"}]}
        >
          <MaterialCommunityIcons
            name="video-off"
            size={25}
            color="white"
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={loudSpeaker ? handleDisableLoudSpeaker : handleEnableLoudSpeaker}
          style={[styles.button, {backgroundColor: loudSpeaker ? "red" : "#2185d0"}]}
        >
          <AntDesign
            name="sound"
            size={25}
            color="white"
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={enableMultiTasking}
          style={[styles.button, {backgroundColor: "#2185d0"}]}
        >
          <Feather
            name="minimize-2"
            size={25}
            color="white"
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleDisconnectCall}
          style={[styles.button, {backgroundColor: "red"}]}
        >
          <MaterialCommunityIcons
            name="phone-hangup"
            size={25}
            color="white"
          />
        </TouchableOpacity>
      </Animated.View>
    );
  }
}

module.exports = CollabVideoControls;
