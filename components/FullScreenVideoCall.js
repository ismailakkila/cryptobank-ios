var React = require("react");
var {
  StyleSheet,
  TouchableOpacity,
  View,
  StatusBar
} = require("react-native");
var {RTCView} = require("react-native-webrtc");
var Proximity = require("react-native-proximity");
var InCallManager = require('react-native-incall-manager').default;

var CollabVideoControls = require("./CollabVideoControls");

var styles = StyleSheet.create({
  container: {
    flex: 1
  },
  containerVideo: {
    flex: 1,
    backgroundColor: "black",
    width: "100%",
    justifyContent: "center",
    alignItems: "center"
  },
  video: {
    minWidth: "100%",
    height: 720
  }
});

class FullScreenVideoCall extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showCollabControls: false,
      proximity: false
    };
    this.proximityListenerVideo = this.proximityListenerVideo.bind(this);
    this.showCollabControls = this.showCollabControls.bind(this);
    this.hideCollabControls = this.hideCollabControls.bind(this);
    this.muteLocalVideoStreams = this.muteLocalVideoStreams.bind(this);
    this.unmuteLocalVideoStreams = this.unmuteLocalVideoStreams.bind(this);
  }

  showCollabControls() {
    var {showCollabControls} = this.state;
    this.setState({
      showCollabControls: true
    });
  }

  hideCollabControls() {
    var {showCollabControls} = this.state;
    this.setState({
      showCollabControls: false
    });
  }

  muteLocalVideoStreams() {
    var {localMediaStream} = this.props;
    if (localMediaStream) {
      localMediaStream.getVideoTracks().forEach(function(track) {
        track.enabled = false;
      });
    }
  }

  unmuteLocalVideoStreams() {
    var {localMediaStream} = this.props;
    if (localMediaStream) {
      localMediaStream.getVideoTracks().forEach(function(track) {
        track.enabled = true;
      });
    }
  }

  proximityListenerVideo(data) {
    var {proximity} = data
    var {handleEnableLoudSpeaker, handleDisableLoudSpeaker} = this.props;
    if (proximity) {
      console.log("proximity video enabled");
      this.muteLocalVideoStreams();
      InCallManager.setKeepScreenOn(false);
      handleDisableLoudSpeaker();
      this.setState({proximity: true});
    }
    else {
      console.log("proximity video disabled");
      this.unmuteLocalVideoStreams();
      InCallManager.setKeepScreenOn(true);
      handleEnableLoudSpeaker();
      this.setState({proximity: false});
    }
  }

  componentDidUpdate() {
    Proximity.removeListener(this.proximityListenerVideo);
    Proximity.addListener(this.proximityListenerVideo);
  }

  componentDidMount() {
    var {handleEnableLoudSpeaker} = this.props;
    Proximity.addListener(this.proximityListenerVideo);
    InCallManager.setKeepScreenOn(true);
    handleEnableLoudSpeaker();
  }

  componentWillUnmount() {
    InCallManager.setKeepScreenOn(false);
    Proximity.removeListener(this.proximityListenerVideo);
  }

  render() {
    var {showCollabControls} = this.state;
    var {
      remoteMediaStream,
      handleDisconnectCall,
      handleMuteAudio,
      handleUnmuteAudio,
      handleEnableLoudSpeaker,
      handleDisableLoudSpeaker,
      handleMuteVideo,
      handleUnmuteVideo,
      audioMuted,
      loudSpeaker,
      videoMuted,
      enableMultiTasking
    } = this.props;
    return (
      <View style={styles.container}>
        <StatusBar
          barStyle={"light-content"}
        />
        {
          remoteMediaStream && (
            <TouchableOpacity
              style={styles.containerVideo}
              onPress={this.showCollabControls}
              activeOpacity={1}
            >
              <RTCView
                style={styles.video}
                objectFit="cover"
                streamURL={remoteMediaStream.toURL()}
              />
            </TouchableOpacity>
          )
        }
        {
          showCollabControls && (
            <CollabVideoControls
              hideCollabControls={this.hideCollabControls}
              handleDisconnectCall={handleDisconnectCall}
              handleMuteAudio={handleMuteAudio}
              handleUnmuteAudio={handleUnmuteAudio}
              handleEnableLoudSpeaker={handleEnableLoudSpeaker}
              handleDisableLoudSpeaker={handleDisableLoudSpeaker}
              handleMuteVideo={handleMuteVideo}
              handleUnmuteVideo={handleUnmuteVideo}
              enableMultiTasking={enableMultiTasking}
              audioMuted={audioMuted}
              loudSpeaker={loudSpeaker}
              videoMuted={videoMuted}
            />
          )
        }
      </View>
    );
  }
}

module.exports = FullScreenVideoCall;
