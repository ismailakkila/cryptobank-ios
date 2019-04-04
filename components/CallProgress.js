var React = require("react");

var {
  StyleSheet,
  Animated,
  View,
  Image,
  Text,
  TouchableOpacity,
  StatusBar
} = require("react-native");
var {MaterialIcons} = require("@expo/vector-icons");
var Proximity = require("react-native-proximity");
var {Audio} = require("expo");

var agentImages = [
  require("../assets/agent/agent1.jpg"),
  require("../assets/agent/agent2.jpg"),
  require("../assets/agent/agent3.jpg"),
  require("../assets/agent/agent4.jpg"),
  require("../assets/agent/agent5.jpg")
];

var ringingSoundAsset = require("../assets/sounds/incallmanager_ringback.mp3");

var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e0e1e2",
    justifyContent: "flex-start",
    alignItems: "center"
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
    alignItems: "center"
  },
  agentImage: {
    height: 50,
    width: 50,
    borderRadius: 25,
    margin: 10
  },
  buttonContainer: {
    width: "100%",
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

class CallProgress extends React.Component {
  constructor(props) {
    super(props);
    this.state ={
      circleSize: new Animated.Value(175),
      circleRadius: new Animated.Value(87.5),
      proximity: false,
      isRinging: false
    };
    this.proximityListenerProgress = this.proximityListenerProgress.bind(this);
    this.ringingSoundObject = new Audio.Sound();
    this.stopRinging = this.stopRinging.bind(this);
    this.startRinging = this.startRinging.bind(this);
  }

  proximityListenerProgress(data) {
    var {proximity} = data;
    if (proximity) {
      console.log("proximity progress enabled");
      this.setState({proximity: true});
    }
    else {
      console.log("proximity progress disabled");
      this.setState({proximity: false});
    }
  }

  stopRinging() {
    var {ringingSoundObject} = this;
    ringingSoundObject.stopAsync()
      .then(function() {
        this.setState({
          isRinging: false
        });
      }.bind(this));
  }

  startRinging() {
    var {ringingSoundObject} = this;
    ringingSoundObject.loadAsync(ringingSoundAsset)
      .then(function(status) {
        console.log("sound file is loaded.");
        ringingSoundObject.setIsLoopingAsync(true);
        ringingSoundObject.playAsync();
      })
      .then(function(status) {
        this.setState({
          isRinging: true
        });
      }.bind(this))
      .catch(function(err) {
        console.log("sound file is loading or failed loading.");
      });
  }

  componentDidMount() {
    var {callState} = this.props;
    var {isRinging} = this.state;
    var {startRinging} = this;
    Proximity.addListener(this.proximityListenerProgress);
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(
            this.state.circleSize,
            {
              toValue: 200,
              duration: 1000,
            }
          ),
          Animated.timing(
            this.state.circleRadius,
            {
              toValue: 100,
              duration: 1000,
            }
          )
        ]),
        Animated.parallel([
          Animated.timing(
            this.state.circleSize,
            {
              toValue: 175,
              duration: 1000,
            }
          ),
          Animated.timing(
            this.state.circleRadius,
            {
              toValue: 87.5,
              duration: 1000,
            }
          )
        ])
      ])
    ).start();
    /*
    if (callState === "Calling" && !isRinging) {
      startRinging();
    }
    */
  }

  componentDidUpdate() {
    var {callState} = this.props;
    var {isRinging} = this.state;
    var {startRinging} = this;
    Proximity.removeListener(this.proximityListenerProgress);
    Proximity.addListener(this.proximityListenerProgress);
    /*
    if (callState === "Ringing" && !isRinging) {
      startRinging();
    }
    */
  }

  componentWillUnmount() {
    var {ringingSoundObject, stopRinging} = this;
    var {isRinging} = this.state;
    Proximity.removeListener(this.proximityListenerProgress);
    //ringingSoundObject.unloadAsync();
  }

  render() {
    var {handleDisconnectCall, agentId, callState} = this.props;
    var {circleSize, circleRadius} = this.state;
    return (
      <View
        style={styles.container}
      >
        <StatusBar
          barStyle={"dark-content"}
        />
        <View
          style={styles.containerCalling}
        >
          <Animated.View
            style={[
              styles.containerCallingCircle,
              {
                height: circleSize,
                width: circleSize,
                borderRadius: circleRadius
              }
            ]}
          >
            <Image
              style={styles.agentImage}
              source={agentImages[agentId]}
              resizeMode="cover"
            />
            <Text style={[styles.headingText, {fontSize: 18, color: "#2185d0"}]}>{callState}</Text>
          </Animated.View>
        </View>
        <View
          style={styles.buttonContainer}
        >
          <TouchableOpacity
            onPress={handleDisconnectCall}
            style={[styles.button, {backgroundColor: "red"}]}
          >
            <MaterialIcons
              name="cancel"
              size={25}
              color="white"
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

module.exports = CallProgress;
