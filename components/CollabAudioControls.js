var React = require("react");
var {
  StyleSheet,
  View,
  TouchableOpacity
} = require("react-native");
var {Ionicons, AntDesign, MaterialCommunityIcons} = require("@expo/vector-icons");

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
    margin: 10,
  }
});

var CollabAudioControls = function(props) {
  var {
    handleDisconnectCall,
    handleMuteAudio,
    handleUnmuteAudio,
    handleEnableLoudSpeaker,
    handleDisableLoudSpeaker,
    audioMuted,
    loudSpeaker
  } = props;
  return (
    <View
      style={styles.buttonGroupContainer}
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
        onPress={handleDisconnectCall}
        style={[styles.button, {backgroundColor: "red"}]}
      >
        <MaterialCommunityIcons
          name="phone-hangup"
          size={25}
          color="white"
        />
      </TouchableOpacity>
    </View>
  );
};

module.exports = CollabAudioControls;
