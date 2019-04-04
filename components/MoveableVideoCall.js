var React = require("react");
var {
  StyleSheet,
  View
} = require("react-native");
var {RTCView} = require("react-native-webrtc");
var MovableView = require('react-native-movable-view').default;

var styles = StyleSheet.create({
  containerMoveable: {
    zIndex: 100
  },
  containerVideo: {
    position: "absolute",
    height: 256,
    width: 144
  },
  video: {
    width: "100%",
    height: "100%",
    borderRadius: 10
  }
});

class MoveableVideoCall extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mounted: false
    };
  }

  componentDidMount() {
    this.setState({mounted: true});
  }

  componentWillUnmount() {
    this.setState({mounted: false});
  }

  render() {
    var {mounted} = this.state;
    var {remoteMediaStream, disableMultiTasking} = this.props;
    return (
      <MovableView style={styles.containerMoveable}>
        <View
          style={[styles.containerVideo, mounted ? {left: 25, top: 65} : null]}
        >
          <RTCView
            style={styles.video}
            objectFit="cover"
            streamURL={remoteMediaStream.toURL()}
          />
        </View>
      </MovableView>
    );
  }
}

module.exports = MoveableVideoCall;
