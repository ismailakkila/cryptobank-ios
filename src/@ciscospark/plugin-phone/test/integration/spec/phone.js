/*!
 * Copyright (c) 2015-2017 Cisco Systems, Inc. See LICENSE file.
 */
import '@ciscospark/internal-plugin-user';
import '@ciscospark/plugin-phone';

import {assert} from '@ciscospark/test-helper-chai';
import sinon from '@ciscospark/test-helper-sinon';
import CiscoSpark from '@ciscospark/spark-core';
import testUsers from '@ciscospark/test-helper-test-users';
import {browserOnly, handleErrorEvent} from '@ciscospark/test-helper-mocha';

import {
  expectCallCreatedEvent,
  expectCallIncomingEvent,
  expectChangeLocusEvent,
  expectConnectedEvent,
  expectDisconnectedEvent,
  expectMembershipConnectedEvent,
  expectMembershipDisconnectedEvent
} from '../lib/event-expectations';


if (process.env.NODE_ENV !== 'test') {
  throw new Error('Cannot run the plugin-phone test suite without NODE_ENV === "test"');
}

browserOnly(describe)('plugin-phone', function () {
  this.timeout(60000);

  describe('Phone', () => {
    let mccoy, spock;
    before('create users and register', () => testUsers.create({count: 2})
      .then((users) => {
        [mccoy, spock] = users;
        spock.spark = new CiscoSpark({
          credentials: {
            authorization: spock.token
          }
        });

        spock.spark2 = new CiscoSpark({
          credentials: {
            authorization: spock.token
          }
        });

        mccoy.spark = new CiscoSpark({
          credentials: {
            authorization: mccoy.token
          }
        });
        return Promise.all([
          spock.spark.phone.register(),
          mccoy.spark.phone.register()
            .then(() => mccoy.spark.request({
              method: 'GET',
              service: 'hydra',
              resource: 'people/me'
            })
              .then((res) => {
                mccoy.hydraUserId = res.body.id;
              }))
        ]);
      }));

    let ringMccoy;
    beforeEach(() => {
      ringMccoy = sinon.spy();
      mccoy.spark.phone.on('call:incoming', ringMccoy);
    });

    beforeEach('end outstanding calls', () => spock.spark.internal.device.registered && spock.spark.internal.locus.list()
      .then((loci) => {
        if (loci.length) {
          return spock.spark.internal.locus.leave(loci[0]);
        }
        return Promise.resolve();
      }));

    after('unregister spock and mccoy', () => Promise.all([
      spock && spock.spark.phone.deregister()
        // eslint-disable-next-line no-console
        .catch((reason) => console.warn('could not disconnect spock from mercury', reason)),
      mccoy && mccoy.spark.phone.deregister()
        // eslint-disable-next-line no-console
        .catch((reason) => console.warn('could not disconnect mccoy from mercury', reason))
    ]));

    describe('#createLocalMediaStream()', () => {
      it('returns a MediaStreamObject', () => spock.spark.phone.createLocalMediaStream()
        .then((stream) => {
          assert.instanceOf(stream, MediaStream);
        }));
    });

    describe('#deregister()', () => {
      let mercuryDisconnectSpy;
      beforeEach(() => {
        mercuryDisconnectSpy = sinon.spy(spock.spark.internal.mercury, 'disconnect');
      });

      afterEach(() => mercuryDisconnectSpy.restore());

      it('disconnects from mercury', () => spock.spark.phone.deregister()
        .then(() => assert.calledOnce(mercuryDisconnectSpy))
        .then(() => assert.isFalse(spock.spark.internal.mercury.connected, 'Mercury is not connected'))
        .then(() => assert.isFalse(spock.spark.phone.connected, 'Mercury (proxied through spark.phone) is not connected'))
        .then(() => mercuryDisconnectSpy.restore()));

      it('unregisters from wdm', () => spock.spark.phone.deregister()
        .then(() => assert.isUndefined(spock.spark.internal.device.url))
        .then(() => spock.spark.phone.register()));

      it('is a noop when not registered', () => spock.spark.phone.deregister()
        .then(() => spock.spark.phone.deregister())
        .then(() => spock.spark.phone.register()));
    });

    describe('#dial()', () => {
      describe('by email address', () => {
        it('initiates an audio-only call', () => handleErrorEvent(spock.spark.phone.dial(mccoy.email, {
          constraints: {
            video: false,
            audio: true
          }
        }), (call) => expectCallIncomingEvent(mccoy.spark.phone)
          .then((mc) => Promise.all([
            expectConnectedEvent(call),
            mc.answer()
          ]))
          .then(() => {
            assert.isTrue(call.sendingAudio);
            assert.isFalse(call.sendingVideo);
            assert.isTrue(call.receivingAudio);
            assert.isFalse(call.receivingVideo);
          })));

        it('initiates a video-only call', () => handleErrorEvent(spock.spark.phone.dial(mccoy.email, {
          constraints: {
            video: true,
            audio: false
          }
        }), (call) => expectCallIncomingEvent(mccoy.spark.phone)
          .then((mc) => Promise.all([
            expectConnectedEvent(call),
            mc.answer()
          ]))
          .then(() => {
            assert.isFalse(call.sendingAudio);
            assert.isTrue(call.sendingVideo);
            assert.isFalse(call.receivingAudio);
            assert.isTrue(call.receivingVideo);
          })));

        it('initiates a receive-only call', () => handleErrorEvent(spock.spark.phone.dial(mccoy.email, {
          constraints: {
            video: false,
            audio: false
          },
          offerOptions: {
            offerToReceiveAudio: true,
            offerToReceiveVideo: true
          }
        }), (call) => expectCallIncomingEvent(mccoy.spark.phone)
          .then((mc) => Promise.all([
            expectConnectedEvent(call),
            mc.answer()
          ]))
          .then(() => {
            assert.isFalse(call.sendingAudio);
            assert.isFalse(call.sendingVideo);
            assert.isTrue(call.receivingAudio);
            assert.isTrue(call.receivingVideo);
          })));

        it('places a call with an existing MediaStreamObject', () => spock.spark.phone.createLocalMediaStream()
          .then((localMediaStream) => handleErrorEvent(
            spock.spark.phone.dial(mccoy.email, {localMediaStream}),
            (call) => Promise.all([
              expectCallIncomingEvent(mccoy.spark.phone)
                .then((c) => {
                  assert.isDefined(call.media.localMediaStream, 'call.media.localMediaStream is defined');
                  assert.isDefined(call.localMediaStream, 'call.localMediaStream is defined');
                  return c.answer();
                }),
              expectConnectedEvent(call)
                .then(() => {
                  assert.equal(call.status, 'connected');
                  assert.isDefined(call.media.localMediaStream, 'call.media.localMediaStream is defined');
                  assert.isDefined(call.localMediaStream, 'call.localMediaStream is defined');
                })
            ])
          )));
      });

      it('calls a user by hydra user id', () => handleErrorEvent(spock.spark.phone.dial(mccoy.hydraUserId), (call) => Promise.all([
        expectConnectedEvent(call)
          .then(() => {
            assert.isDefined(call.correlationId);
            assert.equal(call.locus.self.devices[0].correlationId, call.correlationId);
          }),
        expectCallIncomingEvent(mccoy.spark.phone)
          .then((c) => c.answer()
            .then(() => {
              assert.equal(c.locus.self.devices[0].correlationId, c.correlationId);
              assert.isDefined(c.correlationId);
            }))
      ])));

      it('calls a user by uuid', () => handleErrorEvent(spock.spark.phone.dial(mccoy.id), (call) => Promise.all([
        expectConnectedEvent(call)
          .then(() => {
            assert.isDefined(call.correlationId);
            assert.equal(call.locus.self.devices[0].correlationId, call.correlationId);
          }),
        expectCallIncomingEvent(mccoy.spark.phone)
          .then((c) => c.answer()
            .then(() => {
              assert.equal(c.locus.self.devices[0].correlationId, c.correlationId);
              assert.isDefined(c.correlationId);
            }))
      ])));

      // Note: This does not actually use sip to make the connection, but
      // determines who the user is from their sip address and then places a 1:1
      // space call
      it('calls a user by sip uri', () => mccoy.spark.internal.user.get()
        .then((mu) => {
          assert.property(mu, 'sipAddresses', 'McCoy\'s user object contains a sip address array');
          assert.isAbove(mu.sipAddresses.length, 0, 'McCoy\'s user object contains one or more sip addresses');

          return handleErrorEvent(spock.spark.phone.dial(mu.sipAddresses[0].value), (call) => Promise.all([
            // Spock's view of the call
            expectMembershipConnectedEvent(call)
              .then(() => Promise.all([
                expectMembershipDisconnectedEvent(call),
                expectDisconnectedEvent(call)
              ])),

            // McCoy's view of the call
            expectCallIncomingEvent(mccoy.spark.phone)
              .then((mc) => Promise.all([
                expectMembershipConnectedEvent(mc),
                mc.answer()
              ])
                .then(() => mc.hangup()))
          ]));
        }));
    });

    describe('#listActiveCalls()', () => {
      beforeEach('empty emittedCalls collection', () => {
        spock.spark.phone.emittedCalls.reset();
      });

      describe('when no ongoing calls exist', () => {
        it('returns an empty array', () =>
          spock.spark.phone.listActiveCalls()
            .then((callList) => {
              assert.isTrue(Array.isArray(callList));
              assert.equal(callList.length, 0);
            }));
      });

      describe('when an incoming call is ringing', () => {
        let incomingCall;
        beforeEach('create an incoming call', () => handleErrorEvent(mccoy.spark.phone.dial(spock.email), () =>
          expectCallIncomingEvent(spock.spark.phone, 'spock should receive an incoming call from mccoy')));

        afterEach('hangup incoming call', () => incomingCall.hangup());

        it('emits a call incoming event for an unanswered call', () => {
          // Manually reset the emittedCalls collection
          spock.spark.phone.emittedCalls.reset();
          return Promise.all([
            spock.spark.phone.listActiveCalls(),
            expectCallIncomingEvent(spock.spark.phone, 'spock should emit an incoming call event')
              .then((call) => {
                incomingCall = call;
              })
          ])
            .then(() => Promise.all([
              // Answer the call so it can cleanup properly
              incomingCall.answer(),
              expectConnectedEvent(incomingCall)
            ]));
        });
      });

      describe('when a ongoing call exists', () => {
        let connectedCall;
        beforeEach('create an existing call', () => handleErrorEvent(spock.spark.phone.dial(mccoy.email), (call) =>
          Promise.all([
            expectCallIncomingEvent(mccoy.spark.phone).then((mc) => mc.answer()),
            expectConnectedEvent(call)
          ])
            .then(() => {
              connectedCall = call;
            })));

        afterEach(() => connectedCall.hangup());

        it('lists the existing call', () => {
          assert.isDefined(connectedCall);
          return spock.spark.phone.listActiveCalls()
            .then((result) => {
              assert.isTrue(Array.isArray(result));
              assert.equal(result.length, 1);
              const activeCall = result[0];
              assert.equal(activeCall.id, connectedCall.id);
              assert.equal(activeCall.id, connectedCall.id);
            });
        });

        it('adds the existing call to the emittedCalls collection', () => {
          // Remove our connected call from the collection
          spock.spark.phone.emittedCalls.reset();
          assert.equal(spock.spark.phone.emittedCalls.length, 0, 'emitted calls collection should have no calls');
          return spock.spark.phone.listActiveCalls()
            .then((result) => {
              const activeCall = result[0];
              assert.isAtLeast(spock.spark.phone.emittedCalls.length, 1, 'emitted calls collection should have at least one call');
              assert.isDefined(spock.spark.phone.emittedCalls.get(activeCall.internalCallId));
            });
        });

        it('does not add the existing call to the emittedCalls collection if it exists', () => {
          assert.equal(spock.spark.phone.emittedCalls.length, 1, 'emitted calls collection should have one calls');
          return spock.spark.phone.listActiveCalls()
            .then((result) => {
              const activeCall = result[0];
              assert.equal(spock.spark.phone.emittedCalls.length, 1, 'emitted calls collection should have one call');
              assert.isDefined(spock.spark.phone.emittedCalls.get(activeCall.internalCallId));
            });
        });

        it('emits a call created event for the existing call', () => {
          spock.spark.phone.emittedCalls.reset();
          return Promise.all([
            spock.spark.phone.listActiveCalls(),
            expectCallCreatedEvent(spock.spark.phone)
          ]);
        });
      });
    });

    describe('#register()', () => {
      let kirk;
      beforeEach(() => testUsers.create({count: 1})
        .then(([user]) => {
          kirk = user;
          kirk.spark = new CiscoSpark({
            credentials: {
              authorization: kirk.token
            }
          });
        }));

      afterEach('unregister kirk', () => kirk && kirk.spark.phone.deregister());

      it('registers with wdm', () => {
        const spy = sinon.spy();
        kirk.spark.phone.on('change:registered', spy);
        return kirk.spark.phone.register()
          .then(() => {
            assert.isDefined(kirk.spark.internal.device.url);
            assert.called(spy);
          });
      });

      it('connects to mercury', () => {
        assert.isFalse(kirk.spark.internal.mercury.connected, 'Mercury is not connected');
        assert.isFalse(kirk.spark.phone.connected, 'Mercury (proxied through spark.phone) is not conneted');
        const spy = sinon.spy();
        kirk.spark.phone.on('change:connected', spy);
        return kirk.spark.phone.register()
          .then(() => {
            assert.isTrue(kirk.spark.internal.mercury.connected, 'Mercury is connected after calling register');
            assert.isTrue(kirk.spark.phone.connected, 'spark.phone.connected proxies to spark.internal.mercury.connected');
            assert.called(spy);
          });
      });

      it('fetches active calls', () =>
        // use change:locus as the trigger for determining when the post to
        // /call completes.
        handleErrorEvent(spock.spark.phone.dial(kirk.email), (call) => expectChangeLocusEvent(call)
          .then(() => {
            assert.isFalse(kirk.spark.phone.registered);
            kirk.spark.phone.register();
            return expectCallIncomingEvent(kirk.spark.phone)
              .then(() => assert.isTrue(kirk.spark.phone.registered, 'By the time spark.phone can emit call:incoming, spark.phone.registered must be true'));
          })));

      it('is a noop when already registered', () => spock.spark.phone.register());
    });

    describe('when a call is received', () => {
      it('emits a call:incoming event', () => {
        spock.spark.phone.dial(mccoy.email);
        return expectCallIncomingEvent(mccoy.spark.phone)
          .then(() => assert.calledOnce(ringMccoy));
      });
    });

    describe('when a call is created elsewhere', () => {
      it('emits a call:created event', () => {
        const emittedCallsLength = spock.spark.phone.emittedCalls.length;
        spock.spark2.phone.dial(mccoy.email);
        return expectCallCreatedEvent(spock.spark.phone)
          .then((createdCall) => {
            assert.equal(spock.spark.phone.emittedCalls.length, emittedCallsLength + 1, 'emitted calls collection should have one additional call');
            assert.isDefined(spock.spark.phone.emittedCalls.get(createdCall.internalCallId));
          });
      });
    });
  });
});
