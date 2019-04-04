var React = require("react");
var {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  StatusBar
} = require("react-native");
var {RTCView} = require("react-native-webrtc");
var {Ionicons, AntDesign} = require("@expo/vector-icons");

var styles = StyleSheet.create({
  container: {
    flex: 1
  },
  video: {
    flex: 1,
    width: "100%"
  },
  buttonGroupContainer: {
    width: "100%",
    position: "absolute",
    bottom: 70,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8
  },
  button: {
    width: 160,
    height: 50,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
    padding: 2,
    margin: 5,
  },
  text: {
    fontSize: 14,
    color: "white",
    margin: 5
  }
});

class SelfVideoView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.handleStartVideoCall = this.handleStartVideoCall.bind(this);
    this.stopLocalStreams = this.stopLocalStreams.bind(this);
  }

  handleStartVideoCall() {
    var {webexClientTools, cryptobankRep, startCall, cancelSelfView} = this.props;
    this.stopLocalStreams();
    startCall(
      webexClientTools,
      {
        destination: cryptobankRep.email,
        options: {
          constraints: {
            audio: true,
            video: true
          }
        }
      },
      true
    );
    cancelSelfView();
  }

  stopLocalStreams() {
    var {localMediaStream} = this.props;
    if (localMediaStream) {
      localMediaStream.getTracks().forEach(function(track) {
        track.stop();
        localMediaStream.removeTrack(track);
      });
    }
  }

  render() {
    var {localMediaStream, cancelSelfView} = this.props;
    return (
      <View style={styles.container}>
        <StatusBar
          barStyle={"light-content"}
        />
        {
          localMediaStream && (
            <RTCView
              style={styles.video}
              streamURL={localMediaStream.toURL()}
            />
          )
        }
      <StatusBar
        barStyle="light-content"
      />
      <View
        style={styles.buttonGroupContainer}
      >
        <TouchableOpacity
          onPress={this.handleStartVideoCall}
          style={[styles.button, {backgroundColor: "#2185d0"}]}
        >
          <Ionicons
            name="ios-videocam"
            size={25}
            color="white"
          />
          <Text style={styles.text}>Ready To Call</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={cancelSelfView}
          style={[styles.button, {backgroundColor: "#00b5ad"}]}
        >
          <AntDesign
            name="back"
            size={25}
            color="white"
          />
          <Text style={styles.text}>Back</Text>
        </TouchableOpacity>
      </View>
      </View>
    );
  }
}

module.exports = SelfVideoView;
