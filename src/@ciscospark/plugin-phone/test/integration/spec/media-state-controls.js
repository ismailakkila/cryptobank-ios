/*!
 * Copyright (c) 2015-2017 Cisco Systems, Inc. See LICENSE file.
 */

import browser from 'bowser';
import {boolToStatus, remoteParticipant} from '@ciscospark/plugin-phone';
import {assert} from '@ciscospark/test-helper-chai';
import sinon from '@ciscospark/test-helper-sinon';
import CiscoSpark from '@ciscospark/spark-core';
import testUsers from '@ciscospark/test-helper-test-users';
import {browserOnly, expectExactlyNEvents, handleErrorEvent} from '@ciscospark/test-helper-mocha';

import {
  expectCallIncomingEvent,
  expectConnectedEvent,
  expectRemoteAudioMutedChangeEvent,
  expectRemoteVideoMutedChangeEvent
} from '../lib/event-expectations';

function assertLocusMediaState(call, {
  sendingAudio,
  sendingVideo,
  receivingAudio,
  receivingVideo
}) {
  assertMediaState(call, {
    sendingAudio,
    sendingVideo,
    receivingAudio,
    receivingVideo
  });
  // Locus State
  assert.equal(call.locus.self
    .status
    .audioStatus
    .toLowerCase(), boolToStatus(sendingAudio, receivingAudio), 'Locus State');
  assert.equal(call.locus.self
    .status
    .videoStatus
    .toLowerCase(), boolToStatus(sendingVideo, receivingVideo), 'Locus State');
}

function assertMediaState(call, {
  sendingAudio,
  sendingVideo,
  receivingAudio,
  receivingVideo
}) {
  // Local State
  assert.equal(call.sendingAudio, sendingAudio, `The call ${sendingAudio ? 'is' : 'is not'} sending audio`);
  assert.equal(call.sendingVideo, sendingVideo, `The call ${sendingVideo ? 'is' : 'is not'} sending video`);

  // Media State
  assert.equal(call.media.sendingAudio, sendingAudio, `The call's media layer's sendingAudio is ${sendingAudio}`);
  assert.equal(call.media.sendingVideo, sendingVideo, `The call's media layer's sendingVideo is ${sendingVideo}`);
  assert.equal(call.media.receivingAudio, receivingAudio, `The call's media layer's receivingAudio is ${receivingAudio}`);
  assert.equal(call.media.receivingVideo, receivingVideo, `The call's media layer's receivingVideo is ${receivingVideo}`);
}

browserOnly(describe)('plugin-phone', function () {
  this.timeout(30000);

  describe('Call', () => {
    describe('Media State Controls', () => {
      /* eslint max-statements: [0] */
      let mccoy, spock;
      // I was getting weird cross talk from sharing the same users across all
      // the tests. I think it was a latency issue on the locus or linus side
      // where not all the cloud pieces were fully aware the previous test's
      // call had ended. As such, it seems necessary to use new users for each
      // test.
      beforeEach('create caller', () => testUsers.create({count: 1})
        .then(([user]) => {
          spock = user;
          spock.spark = new CiscoSpark({
            credentials: {
              authorization: spock.token
            }
          });

          return spock.spark.phone.register();
        }));

      beforeEach('create callee', () => testUsers.create({count: 1})
        .then(([user]) => {
          mccoy = user;
          mccoy.spark = new CiscoSpark({
            credentials: {
              authorization: mccoy.token
            }
          });

          return mccoy.spark.phone.register();
        }));

      afterEach(() => mccoy && mccoy.spark.phone.deregister()
        .catch((reason) => console.warn('could not disconnect mccoy from mercury', reason)));

      afterEach(() => spock && spock.spark.phone.deregister()
        .catch((reason) => console.warn('could not disconnect spock from mercury', reason)));

      // For quite awhile, locus didn't actually allow send-only audio. This
      // test is here as a sanity check for all the other tests that may put us
      // in that state
      it('starts a send-only call', () => handleErrorEvent(spock.spark.phone.dial(mccoy.email, {
        constraints: {
          audio: true,
          video: true
        },
        offerOptions: {
          offerToReceiveAudio: false,
          offerToReceiveVideo: false
        }
      }), (call) => Promise.all([
        expectCallIncomingEvent(mccoy.spark.phone)
          .then((c) => handleErrorEvent(c, () => c.answer())),
        expectConnectedEvent(call)
          .then(() => assertLocusMediaState(call, {
            sendingAudio: true,
            sendingVideo: true,
            receivingAudio: false,
            receivingVideo: false
          }))
      ])));

      describe('#toggleReceivingAudio()', () => {
        describe('when the call is started with audio', () => {
          it('stops receiving audio and starts receiving audio', () => {
            const call = spock.spark.phone.dial(mccoy.email);
            return Promise.all([
              expectCallIncomingEvent(mccoy.spark.phone)
                .then((c) => handleErrorEvent(c, () => c.answer())),
              handleErrorEvent(call, () => expectConnectedEvent(call)
                .then(() => assertLocusMediaState(call, {
                  sendingAudio: true,
                  sendingVideo: true,
                  receivingAudio: true,
                  receivingVideo: true
                }))
                // .then(() => console.log(`TOGGLING FOR FIRST TIME`))
                .then(() => call.toggleReceivingAudio())
                .then(() => assertMediaState(call, {
                  sendingAudio: true,
                  sendingVideo: true,
                  receivingAudio: false,
                  receivingVideo: true
                }))
                .then(() => call.toggleReceivingAudio()))
                .then(() => assertMediaState(call, {
                  sendingAudio: true,
                  sendingVideo: true,
                  receivingAudio: true,
                  receivingVideo: true
                }))
            ]);
          });
        });

        describe('when the call is started without audio', () => {
          // TODO Chrome fails at setting remote answer sdp when going from inactive
          // to active and back to inactive, skipping test for now until core issue
          // is found. Could be locus or Chrome bug
          (browser.chrome ? it.skip : it)('starts receiving audio and stops receiving audio', () => {
            const call = spock.spark.phone.dial(mccoy.email, {
              constraints: {
                audio: false,
                video: true
              }
            });
            return Promise.all([
              expectCallIncomingEvent(mccoy.spark.phone)
                .then((c) => handleErrorEvent(c, () => c.answer())),
              handleErrorEvent(call, () => expectConnectedEvent(call)
                .then(() => assertLocusMediaState(call, {
                  sendingAudio: false,
                  sendingVideo: true,
                  receivingAudio: false,
                  receivingVideo: true
                }))
                // .then(() => console.log(`TOGGLING FOR FIRST TIME`))
                .then(() => call.toggleReceivingAudio())
                .then(() => assertMediaState(call, {
                  sendingAudio: false,
                  sendingVideo: true,
                  receivingAudio: true,
                  receivingVideo: true
                }))
                // .then(() => console.log(`TOGGLING FOR SECOND TIME`))
                .then(() => call.toggleReceivingAudio()))
                .then(() => assertMediaState(call, {
                  sendingAudio: false,
                  sendingVideo: true,
                  receivingAudio: false,
                  receivingVideo: true
                }))
            ]);
          });
        });
      });

      describe('#toggleReceivingVideo()', () => {
        describe('when the call is started with video', () => {
          it('stops receiving video and starts receiving video', () => {
            const call = spock.spark.phone.dial(mccoy.email);
            return Promise.all([
              expectCallIncomingEvent(mccoy.spark.phone)
                .then((c) => handleErrorEvent(c, () => c.answer())),
              handleErrorEvent(call, () => expectConnectedEvent(call)
                .then(() => assertLocusMediaState(call, {
                  sendingAudio: true,
                  sendingVideo: true,
                  receivingAudio: true,
                  receivingVideo: true
                }))
                // .then(() => console.log(`TOGGLING FOR FIRST TIME`))
                .then(() => call.toggleReceivingVideo())
                .then(() => assertMediaState(call, {
                  sendingAudio: true,
                  sendingVideo: true,
                  receivingAudio: true,
                  receivingVideo: false
                }))
                // .then(() => console.log(`TOGGLING FOR SECOND TIME`))
                .then(() => call.toggleReceivingVideo()))
                .then(() => assertMediaState(call, {
                  sendingAudio: true,
                  sendingVideo: true,
                  receivingAudio: true,
                  receivingVideo: true
                }))
            ]);
          });
        });

        describe('when the call is started without video', () => {
          // TODO Chrome fails at setting remote answer sdp when going from inactive
          // to active and back to inactive, skipping test for now until core issue
          // is found. Could be locus or Chrome bug
          (browser.chrome ? it.skip : it)('starts receiving video and stops receiving video', () => {
            const call = spock.spark.phone.dial(mccoy.email, {
              constraints: {
                audio: true,
                video: false
              }
            });
            return Promise.all([
              expectCallIncomingEvent(mccoy.spark.phone)
                .then((c) => handleErrorEvent(c, () => c.answer())),
              handleErrorEvent(call, () => expectConnectedEvent(call)
                .then(() => assertLocusMediaState(call, {
                  sendingAudio: true,
                  sendingVideo: false,
                  receivingAudio: true,
                  receivingVideo: false
                }))
                .then(() => call.toggleReceivingVideo())
                .then(() => assertMediaState(call, {
                  sendingAudio: true,
                  sendingVideo: false,
                  receivingAudio: true,
                  receivingVideo: true
                }))
                .then(() => call.toggleReceivingVideo()))
                .then(() => assertMediaState(call, {
                  sendingAudio: true,
                  sendingVideo: false,
                  receivingAudio: true,
                  receivingVideo: false
                }))
            ]);
          });
        });
      });

      describe('#toggleSendingAudio()', () => {
        describe('when the call is started with audio', () => {
          it('stops sending audio then starts sending audio', () => {
            const call = spock.spark.phone.dial(mccoy.email);
            let mccoyCall;
            return Promise.all([
              expectCallIncomingEvent(mccoy.spark.phone)
                .then((c) => {
                  mccoyCall = c;
                  return handleErrorEvent(c, () => c.answer());
                }),
              handleErrorEvent(call, () => expectConnectedEvent(call)
                .then(() => assertLocusMediaState(call, {
                  sendingAudio: true,
                  sendingVideo: true,
                  receivingAudio: true,
                  receivingVideo: true
                }))
                .then(() => spock.spark.logger.info('muting audio'))
                .then(() => Promise.all([
                  expectRemoteAudioMutedChangeEvent(mccoyCall),
                  expectExactlyNEvents(2500, 1, 'remoteAudioMuted:change', mccoyCall),
                  call.toggleSendingAudio()
                ]))
                .then(() => {
                  assert.isTrue(mccoyCall.remoteAudioMuted);
                  assert.isFalse(call.sendingAudio);
                })
                .then(() => assertLocusMediaState(call, {
                  sendingAudio: false,
                  sendingVideo: true,
                  receivingAudio: true,
                  receivingVideo: true
                }))
                .then(() => {
                  assert.equal(remoteParticipant(mccoyCall.locus)
                    .status
                    .audioStatus
                    .toLowerCase(), boolToStatus(false, true));
                  assert.equal(remoteParticipant(mccoyCall.locus)
                    .status
                    .videoStatus
                    .toLowerCase(), boolToStatus(true, true));
                })
                .then(() => spock.spark.logger.info('unmuting audio'))
                .then(() => Promise.all([
                  expectRemoteAudioMutedChangeEvent(mccoyCall),
                  expectExactlyNEvents(2500, 1, 'remoteAudioMuted:change', mccoyCall),
                  call.toggleSendingAudio()
                ]))
                .then(() => {
                  assert.isFalse(mccoyCall.remoteAudioMuted);
                  assert.isTrue(call.sendingAudio);
                })
                .then(() => assertLocusMediaState(call, {
                  sendingAudio: true,
                  sendingVideo: true,
                  receivingAudio: true,
                  receivingVideo: true
                }))
                .then(() => {
                  assert.equal(remoteParticipant(mccoyCall.locus)
                    .status
                    .audioStatus
                    .toLowerCase(), boolToStatus(true, true));
                  assert.equal(remoteParticipant(mccoyCall.locus)
                    .status
                    .videoStatus
                    .toLowerCase(), boolToStatus(true, true));
                }))
            ]);
          });
        });

        describe('when the call is started without audio', () => {
          // TODO Chrome fails at setting remote answer sdp when going from inactive
          // to active and back to inactive, skipping test for now until core issue
          // is found. Could be locus or Chrome bug
          (browser.chrome ? it.skip : it)('starts sending audio and stops sending audio', () => {
            const call = spock.spark.phone.dial(mccoy.email, {
              constraints: {
                audio: false,
                video: true
              }
            });
            let mccoyCall;
            return Promise.all([
              expectCallIncomingEvent(mccoy.spark.phone)
                .then((c) => {
                  mccoyCall = c;
                  return handleErrorEvent(c, () => c.answer());
                }),
              handleErrorEvent(call, () => expectConnectedEvent(call)
                .then(() => assertLocusMediaState(call, {
                  sendingAudio: false,
                  sendingVideo: true,
                  receivingAudio: false,
                  receivingVideo: true
                }))
                .then(() => spock.spark.logger.info('unmuting audio'))
                .then(() => Promise.all([
                  expectExactlyNEvents(2500, 1, 'remoteAudioMuted:change', mccoyCall),
                  expectRemoteAudioMutedChangeEvent(mccoyCall),
                  call.toggleSendingAudio()
                ]))
                .then(() => assertLocusMediaState(call, {
                  sendingAudio: true,
                  sendingVideo: true,
                  receivingAudio: false,
                  receivingVideo: true
                }))
                .then(() => {
                  assert.equal(remoteParticipant(mccoyCall.locus)
                    .status
                    .audioStatus
                    .toLowerCase(), boolToStatus(true, false));
                  assert.equal(remoteParticipant(mccoyCall.locus)
                    .status
                    .videoStatus
                    .toLowerCase(), boolToStatus(true, true));
                })
                .then(() => spock.spark.logger.info('muting audio'))
                .then(() => Promise.all([
                  expectRemoteAudioMutedChangeEvent(mccoyCall),
                  expectExactlyNEvents(2500, 1, 'remoteAudioMuted:change', mccoyCall),
                  call.toggleSendingAudio()
                ]))
                .then(() => assertMediaState(call, {
                  sendingAudio: false,
                  sendingVideo: true,
                  receivingAudio: false,
                  receivingVideo: true
                })))
              // .then(() => {
              //   // Deprecate: It's no longer valid to assume that the remote participant
              //   // directly reflects the local media state since there is a media server
              //   // in between.
              //   assert.equal(remoteParticipant(mccoyCall.locus)
              //     .status
              //     .audioStatus
              //     .toLowerCase(), audioDirection);
              //   assert.equal(remoteParticipant(mccoyCall.locus)
              //     .status
              //     .videoStatus
              //     .toLowerCase(), boolToStatus(true, true));
              // }))
            ]);
          });
        });
      });

      describe('#toggleSendingVideo()', () => {
        describe('when the call is started with video', () => {
          it('stops sending video then starts sending video', () => {
            const call = spock.spark.phone.dial(mccoy.email);
            let mccoyCall;
            return Promise.all([
              expectCallIncomingEvent(mccoy.spark.phone)
                .then((c) => {
                  mccoyCall = c;
                  return handleErrorEvent(c, () => c.answer());
                }),
              handleErrorEvent(call, () => expectConnectedEvent(call)
                .then(() => assertLocusMediaState(call, {
                  sendingAudio: true,
                  sendingVideo: true,
                  receivingAudio: true,
                  receivingVideo: true
                }))
                .then(() => Promise.all([
                  expectRemoteVideoMutedChangeEvent(mccoyCall),
                  expectExactlyNEvents(2500, 1, 'remoteVideoMuted:change', mccoyCall),
                  call.toggleSendingVideo()
                ]))
                .then(() => assertLocusMediaState(call, {
                  sendingAudio: true,
                  sendingVideo: false,
                  receivingAudio: true,
                  receivingVideo: true
                }))
                .then(() => {
                  assert.equal(remoteParticipant(mccoyCall.locus)
                    .status
                    .audioStatus
                    .toLowerCase(), boolToStatus(true, true));
                  assert.equal(remoteParticipant(mccoyCall.locus)
                    .status
                    .videoStatus
                    .toLowerCase(), boolToStatus(false, true));
                })
                .then(() => Promise.all([
                  expectRemoteVideoMutedChangeEvent(mccoyCall),
                  expectExactlyNEvents(2500, 1, 'remoteVideoMuted:change', mccoyCall),
                  call.toggleSendingVideo()
                ]))
                .then(() => assertLocusMediaState(call, {
                  sendingAudio: true,
                  sendingVideo: true,
                  receivingAudio: true,
                  receivingVideo: true
                }))
                .then(() => {
                  assert.equal(remoteParticipant(mccoyCall.locus)
                    .status
                    .audioStatus
                    .toLowerCase(), boolToStatus(true, true));
                  assert.equal(remoteParticipant(mccoyCall.locus)
                    .status
                    .videoStatus
                    .toLowerCase(), boolToStatus(true, true));
                }))
            ]);
          });
        });

        describe('when the call is started without video', () => {
          // TODO Chrome fails at setting remote answer sdp when going from inactive
          // to active and back to inactive, skipping test for now until core issue
          // is found. Could be locus or Chrome bug
          (browser.chrome ? it.skip : it)('starts sending video and stops sending video', () => {
            const call = spock.spark.phone.dial(mccoy.email, {
              constraints: {
                audio: true,
                video: false
              }
            });
            let mccoyCall;
            return Promise.all([
              expectCallIncomingEvent(mccoy.spark.phone)
                .then((c) => {
                  mccoyCall = c;
                  return handleErrorEvent(c, () => c.answer());
                }),
              handleErrorEvent(call, () => expectConnectedEvent(call)
                .then(() => assertLocusMediaState(call, {
                  sendingAudio: true,
                  sendingVideo: false,
                  receivingAudio: true,
                  receivingVideo: false
                }))
                .then(() => Promise.all([
                  expectRemoteVideoMutedChangeEvent(mccoyCall),
                  call.toggleSendingVideo()
                ]))
                .then(() => assertLocusMediaState(call, {
                  sendingAudio: true,
                  sendingVideo: true,
                  receivingAudio: true,
                  receivingVideo: false
                }))
                .then(() => {
                  assert.equal(remoteParticipant(mccoyCall.locus)
                    .status
                    .audioStatus
                    .toLowerCase(), boolToStatus(true, true));
                  assert.equal(remoteParticipant(mccoyCall.locus)
                    .status
                    .videoStatus
                    .toLowerCase(), boolToStatus(true, false));
                })
                .then(() => Promise.all([
                  expectRemoteVideoMutedChangeEvent(mccoyCall),
                  call.toggleSendingVideo()
                ]))
                .then(() => {
                  // Firefox generates offer sdps with recv when send is initially
                  // added. When muting send, recv media still exists and locus
                  // reflects this, which is fine.
                  // For other browsers, when we return to a muted state, we set
                  // enabled=false, which does not remove the sender track. This
                  // causes a recvonly state, which matches the FF results.
                  // We just need to ensure the media engine still has the correct state
                  assertMediaState(call, {
                    sendingAudio: true,
                    sendingVideo: false,
                    receivingAudio: true,
                    receivingVideo: false
                  });
                }))
              // Deprecate: It's no longer valid to assume that the remote participant
              // directly reflects the local media state since there is a media server
              // in between.
              // .then(() => {
              //   assert.equal(remoteParticipant(mccoyCall.locus)
              //     .status
              //     .audioStatus
              //     .toLowerCase(), boolToStatus(true, true));
              //   assert.equal(remoteParticipant(mccoyCall.locus)
              //     .status
              //     .videoStatus
              //     .toLowerCase(), boolToStatus(false, false));
              // }))
            ]);
          });
        });
      });

      describe('toggle both', () => {
        describe('when the call starts as an audio only call', () => {
          // TODO [SSDK-576]
          it.skip('adds video to the call', () => {
            const call = spock.spark.phone.dial(mccoy.email, {
              constraints: {
                audio: true,
                video: false
              }
            });
            let mccoyCall;
            sinon.spy(spock.spark.internal.locus, 'updateMedia');
            return Promise.all([
              expectCallIncomingEvent(mccoy.spark.phone)
                .then((c) => {
                  mccoyCall = c;
                  return handleErrorEvent(c, () => c.answer());
                }),
              handleErrorEvent(call, () => expectConnectedEvent(call)
                .then(() => assertLocusMediaState(call, {
                  sendingAudio: true,
                  sendingVideo: false,
                  receivingAudio: true,
                  receivingVideo: false
                }))
                .then(() => Promise.all([
                  call.toggleSendingVideo(),
                  call.toggleReceivingVideo()
                ]))
                .then(() => assertLocusMediaState(call, {
                  sendingAudio: true,
                  sendingVideo: true,
                  receivingAudio: true,
                  receivingVideo: true
                }))
                .then(() => {
                  assert.equal(remoteParticipant(mccoyCall.locus)
                    .status
                    .audioStatus
                    .toLowerCase(), boolToStatus(true, true));
                  assert.equal(remoteParticipant(mccoyCall.locus)
                    .status
                    .videoStatus
                    .toLowerCase(), boolToStatus(true, false));
                  return Promise.all([
                    call.toggleSendingVideo(),
                    call.toggleReceivingVideo()
                  ]);
                }))
                .then(() => assertLocusMediaState(call, {
                  sendingAudio: true,
                  sendingVideo: false,
                  receivingAudio: true,
                  receivingVideo: false
                }))
            ]);
          });
        });
      });
    });
  });
});
