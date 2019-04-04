var React = require("react");

var {Audio} = require("expo");
var SelfVideoView = require("./SelfVideoView");
var FullScreenVideoCall = require("./FullScreenVideoCall");
var FullScreenAudioCall = require("./FullScreenAudioCall");
var CallProgress = require("./CallProgress");
var InCallManager = require('react-native-incall-manager').default;

class Video extends React.Component {
  constructor(props) {
    super(props);
    this.muteRemoteMediaStreamTrack = this.muteRemoteMediaStreamTrack.bind(this);
    this.unmuteRemoteMediaStreamTrack = this.unmuteRemoteMediaStreamTrack.bind(this);
  }

  muteRemoteMediaStreamTrack() {
    var {remoteMediaStream} = this.props.collab;
    if (remoteMediaStream) {
      remoteMediaStream.getTracks().forEach(function(track) {
        if (track.enabled) {
          console.log("muting")
          track.enabled = false;
        }
      });
    }
  }

  unmuteRemoteMediaStreamTrack() {
    var {remoteMediaStream} = this.props.collab;
    if (remoteMediaStream) {
      remoteMediaStream.getTracks().forEach(function(track) {
        if (!track.enabled) {
          console.log("unmuting")
          track.enabled = true;
        }
      });
    }
  }

  render() {
    var {
      collab,
      startCall,
      cancelSelfView,
      showSelfView,
      handleDisconnectCall,
      handleMuteAudio,
      handleUnmuteAudio,
      handleMuteVideo,
      handleUnmuteVideo,
      handleEnableLoudSpeaker,
      handleDisableLoudSpeaker,
      audioMuted,
      videoMuted,
      loudSpeaker,
      enableMultiTasking
    } = this.props;
    var {
      muteRemoteMediaStreamTrack,
      unmuteRemoteMediaStreamTrack
    } = this;
    if (collab.call) {
      switch(collab.call.status) {
        case "connected":
          if (collab.callType === "video") {
            return (
              <FullScreenVideoCall
                localMediaStream={collab.localMediaStream}
                remoteMediaStream={collab.remoteMediaStream}
                handleDisconnectCall={handleDisconnectCall}
                handleMuteAudio={handleMuteAudio}
                handleUnmuteAudio={handleUnmuteAudio}
                handleEnableLoudSpeaker={handleEnableLoudSpeaker}
                handleDisableLoudSpeaker={handleDisableLoudSpeaker}
                handleMuteVideo={handleMuteVideo}
                handleUnmuteVideo={handleUnmuteVideo}
                audioMuted={audioMuted}
                loudSpeaker={loudSpeaker}
                videoMuted={videoMuted}
                enableMultiTasking={enableMultiTasking}
              />
            );
          }
          if (collab.callType === "audio") {
            return (
              <FullScreenAudioCall
                agentId={Number(collab.cryptobankRep.agentId)}
                handleDisconnectCall={handleDisconnectCall}
                handleMuteAudio={handleMuteAudio}
                handleUnmuteAudio={handleUnmuteAudio}
                handleEnableLoudSpeaker={handleEnableLoudSpeaker}
                handleDisableLoudSpeaker={handleDisableLoudSpeaker}
                audioMuted={audioMuted}
                loudSpeaker={loudSpeaker}
                enableMultiTasking={enableMultiTasking}
              />
            );
          }
          break;
        case "initiated":
          switch(collab.callType) {
            case "video":
              InCallManager.start({media: 'video'});
              InCallManager.setForceSpeakerphoneOn(true);
              break;
            case "audio":
              InCallManager.start({media: 'audio'});
              break;
          }
          return (
            <CallProgress
              handleDisconnectCall={handleDisconnectCall}
              agentId={Number(collab.cryptobankRep.agentId)}
              callState="Calling"
            />
          );
          break;
        case "ringing":
          return (
            <CallProgress
              handleDisconnectCall={handleDisconnectCall}
              agentId={Number(collab.cryptobankRep.agentId)}
              callState="Ringing"
            />
          );
          break;
        default:
          return null;
      }
    }
    else {
      if (showSelfView) {
        return (
          <SelfVideoView
            localMediaStream={collab.localMediaStream}
            cryptobankRep={collab.cryptobankRep}
            cancelSelfView={cancelSelfView}
            startCall={startCall}
            webexClientTools={collab.webexClientTools}
          />
        );
      }
    }
  }
}

module.exports = Video;
