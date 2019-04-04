var React = require("react");
var {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Animated,
  StatusBar
} = require("react-native");
var {Permissions} = require("expo");
var {Ionicons, Foundation} = require("@expo/vector-icons");
var InCallManager = require('react-native-incall-manager').default;

var ChatMessages = require("./ChatMessages");
var Video = require("./Video");
var MoveableVideoCall = require("./MoveableVideoCall");

var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e0e1e2",
    justifyContent: "flex-start",
    alignItems: "center"
  },
  containerHeading: {
    paddingTop: 25,
    height: 60,
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center"
  },
  containerHeadingButtonGroup: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center"
  },
  containerHeadingButton: {
    width: 60,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  containerHeadingDescription: {
    flex: 1,
    flexDirection: "row",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  headingText: {
    fontWeight: "bold",
    fontSize: 14,
    margin: 5
  },
  containerChatArea: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    padding: 10
  },
  containerLoading: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 5,
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  containerTypeChat: {
    width: "100%",
    height: 60,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 10,
    backgroundColor: "white",
  },
  containerChatTextInput: {
    flex: 1,
    height: "100%",
    borderRadius: 10,
    borderColor: "#e0e1e2",
    borderWidth: 1
  },
  textInput: {
    flex: 1,
    width: "100%",
    color: "black",
    paddingLeft: 7
  }
});

class Collaboration extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      webexTeamsClientStatus: null,
      webexTeamsServerStatus: null,
      webexTeamsNotAvailable: false,
      chatMessage: "",
      chatBoxFocused: false,
      hasCameraPermission: false,
      hasMicPermission: false,
      showSelfView: false,
      clickedVideoChatButton: false,
      audioMuted: false,
      videoMuted: false,
      multitasking: false,
      fadeAnim: new Animated.Value(0),
      fadeAnimStarted: false,
      loudSpeaker: false,
    };
    this.resetState = this.resetState.bind(this);
    this.handleStartCollab = this.handleStartCollab.bind(this);
    this.handleChatBox = this.handleChatBox.bind(this);
    this.handleAddReply = this.handleAddReply.bind(this);
    this.resetChatBoxFocused = this.resetChatBoxFocused.bind(this);
    this.handleFocusChatBox = this.handleFocusChatBox.bind(this);
    this.handleStartVideoChat = this.handleStartVideoChat.bind(this);
    this.handleStartAudioCall = this.handleStartAudioCall.bind(this);
    this.cancelSelfView = this.cancelSelfView.bind(this);
    this.handleDisconnectCall = this.handleDisconnectCall.bind(this);
    this.handleMuteAudio = this.handleMuteAudio.bind(this);
    this.handleUnmuteAudio = this.handleUnmuteAudio.bind(this);
    this.handleMuteVideo = this.handleMuteVideo.bind(this);
    this.handleUnmuteVideo = this.handleUnmuteVideo.bind(this);
    this.enableMultiTasking = this.enableMultiTasking.bind(this);
    this.disableMultiTasking = this.disableMultiTasking.bind(this);
    this.handleEnableLoudSpeaker = this.handleEnableLoudSpeaker.bind(this);
    this.handleDisableLoudSpeaker = this.handleDisableLoudSpeaker.bind(this);
  }

  resetState() {
    this.setState({
      loading: true,
      webexTeamsClientStatus: null,
      webexTeamsServerStatus: null,
      webexTeamsNotAvailable: false,
      chatMessage: "",
      chatBoxFocused: false,
      hasCameraPermission: false,
      hasMicPermission: false,
      showSelfView: false,
      clickedVideoChatButton: false,
      audioMuted: false,
      videoMuted: false,
      multitasking: false,
      fadeAnim: new Animated.Value(0),
      fadeAnimStarted: false,
      loudSpeaker: false,
    });
  }

  resetChatBoxFocused() {
    this.setState({chatBoxFocused: false});
  }

  handleFocusChatBox() {
    this.setState({chatBoxFocused: true});
  }

  handleChatBox(e) {
    this.setState({chatMessage: e});
  }

  handleAddReply() {
    var {collab, sendMessage} = this.props;
    var {chatMessage} = this.state;
    if (chatMessage) {
      sendMessage(collab.webexClientTools, {
        text: chatMessage,
        roomId: collab.roomId
      }, true)
      .then(function() {
        this.setState({chatMessage: ""});
      }.bind(this));
    }
  }

  handleStartCollab() {
    var {webexTeamsClientStatus, webexTeamsServerStatus, webexTeamsNotAvailable} = this.state;
    var {socket, user, createCollabSession, collab} = this.props;
    if (socket.readyState === 1 && user.webexTeamsToken) {
      if (
        webexTeamsServerStatus === null &&
        webexTeamsClientStatus === null &&
        webexTeamsNotAvailable === false
      ) {
        createCollabSession(socket, user.webexTeamsToken)
          .then(function() {
            if (webexTeamsNotAvailable === false) {
              setTimeout(function() {
                this.setState({
                  webexTeamsClientStatus: "in-progress",
                  webexTeamsServerStatus: "in-progress"
                });
              }.bind(this), 2500);
            }
          }.bind(this));
      }
    }
    else {
      this.setState({
        loading: false,
        webexTeamsNotAvailable: true,
        webexTeamsClientStatus: null,
        webexTeamsServerStatus: null
      });
    }
  }

  handleStartVideoChat() {
    var {collab, startVideoChat} = this.props;
    var {hasMicPermission, hasCameraPermission, multitasking} = this.state;
    if (collab.call) {
      if (collab.callType === "video" && multitasking) {
        this.setState({multitasking: false});
      }
    }
    else {
      if (collab.registered && hasMicPermission && hasCameraPermission) {
        startVideoChat(collab.webexClientTools);
        this.setState({clickedVideoChatButton: true});
      }
    }
  }

  cancelSelfView() {
    this.setState({ showSelfView: false});
  }

  handleDisconnectCall() {
    var {collab} = this.props;
    if (collab.call) {
      switch(collab.call.status) {
        case "initiated":
          collab.call.reject();
          InCallManager.stop();
          break;
        case "ringing":
          collab.call.reject();
          InCallManager.stop();
          break;
        case "connected":
          collab.call.hangup();
          InCallManager.stop();
          break;
        default:
          return;
      }
    }
  }

  handleMuteAudio() {
    var {collab} = this.props;
    if (collab.call && collab.localMediaStream) {
      if (collab.call.status === "connected" && collab.remoteMediaStream) {
        collab.localMediaStream.getAudioTracks()[0].enabled = false;
        this.setState({audioMuted: true});
      }
    }
  }

  handleUnmuteAudio() {
    var {collab} = this.props;
    if (collab.call && collab.localMediaStream) {
      if (collab.call.status === "connected" && collab.remoteMediaStream) {
        collab.localMediaStream.getAudioTracks()[0].enabled = true;
        this.setState({audioMuted: false});
      }
    }
  }

  handleMuteVideo() {
    var {collab} = this.props;
    if (collab.call && collab.localMediaStream) {
      if (collab.call.status === "connected" && collab.remoteMediaStream) {
        collab.localMediaStream.getVideoTracks()[0].enabled = false;
        this.setState({videoMuted: true});
      }
    }
  }

  handleUnmuteVideo() {
    var {collab} = this.props;
    if (collab.call && collab.localMediaStream) {
      if (collab.call.status === "connected" && collab.remoteMediaStream) {
        collab.localMediaStream.getVideoTracks()[0].enabled = true;
        this.setState({videoMuted: false});
      }
    }
  }

  handleEnableLoudSpeaker() {
    InCallManager.setForceSpeakerphoneOn(true);
    this.setState({loudSpeaker: true});
  }

  handleDisableLoudSpeaker() {
    InCallManager.setForceSpeakerphoneOn(false);
    this.setState({loudSpeaker: false});
  }

  handleStartAudioCall() {
    var {collab, startCall} = this.props;
    var {multitasking} = this.state;
    if (collab.call) {
      if (collab.callType === "audio" && multitasking) {
        this.setState({multitasking: false});
      }
    }
    else {
      startCall(
        collab.webexClientTools,
        {
          destination: collab.cryptobankRep.email,
          options: {
            constraints: {
              audio: true,
              video: false
            }
          }
        },
        true
      );
    }
  }

  enableMultiTasking() {
    this.setState({multitasking: true});
  }

  disableMultiTasking() {
    this.setState({multitasking: false});
  }

  componentWillUnmount() {
    clearInterval(this.checkMessagesInterval);
    this.resetState();
  }

  componentDidMount() {
    Permissions.askAsync(Permissions.AUDIO_RECORDING, Permissions.CAMERA)
      .then(function(result) {
        this.setState({
          hasMicPermission: result.permissions.audioRecording.status === "granted",
          hasCameraPermission: result.permissions.camera.status === "granted"
        });
      }.bind(this));
    this.handleStartCollab();
    this.checkMessagesInterval = setInterval(function() {
      var {webexTeamsClientStatus, webexTeamsServerStatus, loading, webexTeamsNotAvailable} = this.state;
      var {collab, getMessages} = this.props;
      if (
          webexTeamsNotAvailable === false &&
          webexTeamsServerStatus === "ready" &&
          webexTeamsClientStatus === "ready" &&
          !loading &&
          collab.chats.length > 0
        ) {
        getMessages(collab.webexClientTools, {roomId: collab.roomId, max: 100}, true);
      }
    }.bind(this), 2500);
  }

  componentDidUpdate() {
    var {
      webexTeamsClientStatus,
      webexTeamsServerStatus,
      loading,
      webexTeamsNotAvailable,
      showSelfView,
      clickedVideoChatButton,
      audioMuted,
      videoMuted,
      multitasking,
      fadeAnim,
      fadeAnimStarted,
      loudSpeaker
    } = this.state;
    var {collab, getMessages} = this.props;

    if (collab.err !== null && webexTeamsNotAvailable === false) {
      this.setState({
        loading: false,
        webexTeamsNotAvailable: true,
        webexTeamsClientStatus: null,
        webexTeamsServerStatus: null
      });
      return;
    }
    else {
      if (collab.warn !== null) {
        //console.error(collab.warn);
        return;
      }
      if (
          collab.webexClientTools !== null &&
          collab.guestId !== null &&
          webexTeamsClientStatus === "in-progress"
        ) {
        this.setState({webexTeamsClientStatus: "ready"});
        return;
      }
      if (
          collab.cryptobankRep !== null &&
          collab.roomId !== null &&
          collab.botId !== null &&
          webexTeamsServerStatus === "in-progress"
        ) {
        this.setState({webexTeamsServerStatus: "ready"});
        return;
      }
      if (
        webexTeamsNotAvailable === false &&
        webexTeamsClientStatus === "ready" &&
        webexTeamsServerStatus === "ready" &&
        loading
      ) {
        getMessages(collab.webexClientTools, {roomId: collab.roomId, max: 100})
          .then(function() {
            this.setState({loading: false});
          }.bind(this));
          return;
      }
      if (collab.localMediaStream && clickedVideoChatButton) {
        if (collab.localMediaStream.active) {
          var videoTrack = collab.localMediaStream._tracks.filter(function(track) {
            return track.enabled === true && track.readyState === "live" && track.kind === "video";
          });
          if (videoTrack.length === 1) {
            this.setState({
              showSelfView: true,
              clickedVideoChatButton: false
            });
          }
        }
      }
      if (collab.call === "disconnected") {
        var setState = {};
        if (multitasking) {
          setState.multitasking = false;
        }
        if (fadeAnimStarted) {
          setState.fadeAnimStarted = false;
          setState.fadeAnim = new Animated.Value(0);
        }
        if (audioMuted) {
          setState.audioMuted = false;
        }
        if (videoMuted) {
          setState.videoMuted = false;
        }
        if (loudSpeaker) {
          setState.loudSpeaker = false;
        }
        if (Object.keys(setState).length > 0) {
          this.setState(setState);
        }
      }
      if (collab.call) {
        if (multitasking) {
          if (!fadeAnimStarted) {
            Animated.loop(
              Animated.sequence([
                Animated.timing(
                  fadeAnim,
                  {
                    toValue: 1,
                    duration: 1500
                  }
                ),
                Animated.timing(
                  fadeAnim,
                  {
                    toValue: 0,
                    duration: 1500
                  }
                )
              ])
            ).start();
            this.setState({fadeAnimStarted: true});
          }
        }
        else {
          if (fadeAnimStarted) {
            Animated.loop(
              Animated.sequence([
                Animated.timing(
                  fadeAnim,
                  {
                    toValue: 1,
                    duration: 1500
                  }
                ),
                Animated.timing(
                  fadeAnim,
                  {
                    toValue: 0,
                    duration: 1500
                  }
                )
              ])
            ).stop();
            this.setState({fadeAnimStarted: false});
          }
        }
      }
    }
  }

  render() {
    //console.log(JSON.stringify(this.props.collab));
    //console.log(this.state);
    var {handleSelectMenuOption, collab, startVideoChat, startCall} = this.props;
    var {loading, webexTeamsNotAvailable, chatMessage, chatBoxFocused, showSelfView, audioMuted, videoMuted, multitasking, fadeAnim, loudSpeaker} = this.state;
    var {handleStartVideoChat, handleStartAudioCall, handleDisconnectCall, handleMuteAudio, handleUnmuteAudio, handleMuteVideo, handleUnmuteVideo, cancelSelfView, enableMultiTasking, disableMultiTasking, handleEnableLoudSpeaker, handleDisableLoudSpeaker} = this;
    if ((collab.call && !multitasking) || showSelfView) {
      return (
        <Video
          collab={collab}
          cancelSelfView={cancelSelfView}
          startCall={startCall}
          handleDisconnectCall={handleDisconnectCall}
          handleMuteAudio={handleMuteAudio}
          handleUnmuteAudio={handleUnmuteAudio}
          handleMuteVideo={handleMuteVideo}
          handleUnmuteVideo={handleUnmuteVideo}
          handleEnableLoudSpeaker={handleEnableLoudSpeaker}
          handleDisableLoudSpeaker={handleDisableLoudSpeaker}
          audioMuted={audioMuted}
          videoMuted={videoMuted}
          loudSpeaker={loudSpeaker}
          showSelfView={showSelfView}
          enableMultiTasking={enableMultiTasking}
        />
      );
    }
    return (
      <KeyboardAvoidingView
        enabled
        behavior="padding"
        style={styles.container}
      >
        <StatusBar
          barStyle="dark-content"
        />
        {
          (
            collab.call &&
            collab.callType === "video" &&
            collab.remoteMediaStream &&
            multitasking
          ) && (
            <MoveableVideoCall
              remoteMediaStream={collab.remoteMediaStream}
              disableMultiTasking={disableMultiTasking}
            />
          )
        }
        <View
          style={[styles.containerHeading, collab.call && multitasking ? {backgroundColor: "red"} : {backgroundColor: "white"}]}
        >
          {
            (collab.call && multitasking) && (
              <View style={styles.containerHeadingButton}>
              </View>
            )
          }
          {
            (!collab.call && !multitasking) && (
              <TouchableOpacity
                onPress={()=>handleSelectMenuOption("portfolio")}
                style={styles.containerHeadingButton}
              >
                <Ionicons
                  name="ios-arrow-back"
                  size={30}
                  color="#2185d0"
                />
              </TouchableOpacity>
            )
          }
          <View style={styles.containerHeadingDescription}>
            <Foundation
              name="bitcoin-circle"
              size={30}
              color={collab.call && multitasking ? "white" : "black"}
            />
            <Text
              style={[styles.headingText, collab.call && multitasking ? {color: "white"} : {color: "black"}]}
            >
              CryptoBank Help Service
            </Text>
          </View>
          {
            !collab.registered &&
              (
                <View style={[styles.containerHeadingButtonGroup, {width: 90}]}>
                </View>
              )
          }
          {
            (!loading && !webexTeamsNotAvailable && collab.registered) &&
              !collab.call && (
                  <View style={styles.containerHeadingButtonGroup}>
                    <TouchableOpacity
                      onPress={handleStartVideoChat}
                      style={[styles.containerHeadingButton, {width: 45}]}
                    >
                      <Ionicons
                        name="ios-videocam"
                        size={30}
                        color="#2185d0"
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleStartAudioCall}
                      style={[styles.containerHeadingButton, {width: 45}]}
                    >
                      <Ionicons
                        name="ios-call"
                        size={30}
                        color="#2185d0"
                      />
                    </TouchableOpacity>
                  </View>
                )
            }
            {
              (!loading && !webexTeamsNotAvailable && collab.registered) &&
                (collab.call && collab.callType === "video") && (
                  <Animated.View style={[styles.containerHeadingButtonGroup, {opacity: fadeAnim}]}>
                    <TouchableOpacity
                      onPress={handleStartVideoChat}
                      style={[styles.containerHeadingButton, {width: 90}]}
                    >
                      <Ionicons
                        name="ios-videocam"
                        size={30}
                        color="white"
                      />
                    </TouchableOpacity>
                  </Animated.View>
                )
            }
            {
              (!loading && !webexTeamsNotAvailable && collab.registered) &&
                (collab.call && collab.callType === "audio") && (
                  <Animated.View style={[styles.containerHeadingButtonGroup, {opacity: fadeAnim}]}>
                    <TouchableOpacity
                      onPress={handleStartAudioCall}
                      style={[styles.containerHeadingButton, {width: 90}]}
                    >
                      <Ionicons
                        name="ios-call"
                        size={30}
                        color="white"
                      />
                    </TouchableOpacity>
                  </Animated.View>
                )
            }
        </View>
        {
          loading && (
            <View
              style={styles.containerChatArea}
            >
              <View
                style={styles.containerLoading}
              >
                <Image
                  style={{width: "25%"}}
                  source={require("../assets/logo/ciscoWebexTeams.png")}
                  resizeMode="contain"
                />
                <ActivityIndicator size="large"/>
              </View>
            </View>
          )
        }
        {
          (!loading && webexTeamsNotAvailable) && (
            <View
              style={styles.containerChatArea}
            >
              <View
                style={styles.containerLoading}
              >
                <Image
                  style={{width: "25%"}}
                  source={require("../assets/logo/ciscoWebexTeams.png")}
                  resizeMode="contain"
                />
                <Text style={[styles.headingText, {color: "red"}]}>Service Not Available</Text>
              </View>
            </View>
          )
        }
        {
          (!loading && !webexTeamsNotAvailable) && (
            <ChatMessages
              collab={collab}
              scrollToEnd={chatBoxFocused}
              resetChatBoxFocused={this.resetChatBoxFocused}
            />
          )
        }
        {
          (!loading && !webexTeamsNotAvailable) && (
            <View
              style={styles.containerTypeChat}
            >
              <View style={styles.containerChatTextInput}>
                <TextInput
                  value={chatMessage}
                  onFocus={this.handleFocusChatBox}
                  onChangeText={this.handleChatBox}
                  onSubmitEditing={this.handleAddReply}
                  style={styles.textInput}
                  autoCorrect={true}
                  clearButtonMode="always"
                  placeholder="Type a message"
                  placeholderTextColor="#696969"
                  returnKeyType="send"
                />
              </View>
              <TouchableOpacity
                onPress={this.handleAddReply}
                style={styles.containerHeadingButton}
              >
                <Ionicons
                  name="ios-send"
                  size={30}
                  color="#2185d0"
                />
              </TouchableOpacity>
            </View>
          )
        }
      </KeyboardAvoidingView>
    );
  }
}

module.exports = Collaboration;
