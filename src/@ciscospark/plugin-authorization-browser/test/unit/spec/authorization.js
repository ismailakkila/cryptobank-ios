/*!
 * Copyright (c) 2015-2017 Cisco Systems, Inc. See LICENSE file.
 */

/* eslint camelcase: [0] */

import {assert} from '@ciscospark/test-helper-chai';
import {browserOnly} from '@ciscospark/test-helper-mocha';
import sinon from '@ciscospark/test-helper-sinon';
import MockSpark from '@ciscospark/test-helper-mock-spark';
import {Credentials} from '@ciscospark/spark-core';
import Authorization from '@ciscospark/plugin-authorization-browser';
import {base64, patterns} from '@ciscospark/common';
import {merge} from 'lodash';
import url from 'url';

browserOnly(describe)('plugin-authorization-browser', () => {
  describe('Authorization', () => {
    function makeSpark(href = 'https://example.com', csrfToken = undefined, config = {}) {
      const mockWindow = {
        history: {
          replaceState(a, b, location) {
            mockWindow.location.href = location;
          }
        },
        location: {
          href
        },
        sessionStorage: {
          getItem: sinon.stub().returns(csrfToken),
          removeItem: sinon.spy(),
          setItem: sinon.spy()
        }
      };

      const spark = new MockSpark({
        children: {
          authorization: Authorization,
          credentials: Credentials
        },
        config: merge({
          credentials: {
            authorizeUrl: 'https://idbroker.webex.com/idb/oauth2/v1/authorize',
            logoutUrl: 'https://idbroker.webex.com/idb/oauth2/v1/logout',
            // eslint-disable-next-line camelcase
            client_id: 'fake',
            // eslint-disable-next-line camelcase
            client_secret: 'fake',
            // eslint-disable-next-line camelcase
            redirect_uri: 'http://example.com',
            // eslint-disable-next-line camelcase
            scope: 'scope:one',
            refreshCallback: () => Promise.resolve()
          }
        }, config),
        getWindow() {
          return mockWindow;
        }
      });

      return spark;
    }

    describe('#initialize()', () => {
      describe('when there is a token in the url', () => {
        it('sets the token and sets ready', () => {
          const spark = makeSpark('http://example.com/#access_token=AT&expires_in=3600&token_type=Bearer');

          assert.isFalse(spark.authorization.ready);
          assert.isFalse(spark.credentials.canAuthorize);

          return spark.authorization.when('change:ready')
            .then(() => {
              assert.isTrue(spark.authorization.ready);
              assert.isTrue(spark.credentials.canAuthorize);
            });
        });

        describe('when url parsing is disabled', () => {
          it('sets ready', () => {
            const spark = new MockSpark({
              children: {
                credentials: Credentials
              },
              getWindow() {
                return {
                  location: {
                    href: 'http://example.com/#access_token=AT&expires_in=3600&token_type=Bearer'
                  }
                };
              }
            });

            spark.authorization = new Authorization({parse: false}, {parent: spark});

            assert.isTrue(spark.authorization.ready);
            assert.isFalse(spark.credentials.canAuthorize);
          });
        });

        it('sets the token, refresh token and sets ready', () => {
          const spark = makeSpark('http://example.com/#access_token=AT&expires_in=3600&token_type=Bearer&refresh_token=RT&refresh_token_expires_in=36000');

          assert.isFalse(spark.authorization.ready);
          assert.isFalse(spark.credentials.canAuthorize);
          assert.isFalse(spark.credentials.canRefresh);

          return spark.authorization.when('change:ready')
            .then(() => {
              assert.isTrue(spark.authorization.ready);
              assert.isTrue(spark.credentials.canAuthorize);
              assert.isTrue(spark.credentials.canRefresh);
            });
        });

        it('validates the csrf token', () => {
          const csrfToken = 'abcd';

          assert.throws(() => {
            // eslint-disable-next-line no-unused-vars
            const spark = makeSpark(`http://example.com/#access_token=AT&expires_in=3600&token_type=Bearer&refresh_token=RT&refresh_token_expires_in=36000&state=${base64.encode(JSON.stringify({csrf_token: 'someothertoken'}))}`, csrfToken);
          }, /CSRF token someothertoken does not match stored token abcd/);

          assert.throws(() => {
            // eslint-disable-next-line no-unused-vars
            const spark = makeSpark(`http://example.com/#access_token=AT&expires_in=3600&token_type=Bearer&refresh_token=RT&refresh_token_expires_in=36000&state=${base64.encode(JSON.stringify({}))}`, csrfToken);
          }, /Expected CSRF token abcd, but not found in redirect hash/);

          assert.throws(() => {
            // eslint-disable-next-line no-unused-vars
            const spark = makeSpark('http://example.com/#access_token=AT&expires_in=3600&token_type=Bearer&refresh_token=RT&refresh_token_expires_in=36000', csrfToken);
          }, /Expected CSRF token abcd, but not found in redirect hash/);

          const spark = makeSpark(`http://example.com/#access_token=AT&expires_in=3600&token_type=Bearer&refresh_token=RT&refresh_token_expires_in=36000&state=${base64.encode(JSON.stringify({csrf_token: csrfToken}))}`, csrfToken);

          return spark.authorization.when('change:ready')
            .then(() => {
              assert.isTrue(spark.credentials.canAuthorize);
              assert.called(spark.getWindow().sessionStorage.removeItem);
            });
        });

        it('removes the oauth parameters from the url', () => {
          const csrfToken = 'abcd';

          const spark = makeSpark(`http://example.com/#access_token=AT&expires_in=3600&token_type=Bearer&refresh_token=RT&refresh_token_expires_in=36000&state=${base64.encode(JSON.stringify({csrf_token: csrfToken, something: true}))}`, csrfToken);

          return spark.authorization.when('change:ready')
            .then(() => {
              assert.isTrue(spark.credentials.canAuthorize);
              assert.called(spark.getWindow().sessionStorage.removeItem);
              assert.equal(spark.getWindow().location.href, `http://example.com/#state=${base64.encode(JSON.stringify({something: true}))}`);
            });
        });

        it('throws a grant error when the url contains one', () => {
          assert.throws(() => {
            makeSpark('http://127.0.0.1:8000/?error=invalid_scope&error_description=The%20requested%20scope%20is%20invalid.');
          }, /The requested scope is invalid./);
        });
      });

      describe('when there is nothing in the url', () => {
        it('sets ready', () => {
          const spark = makeSpark('http://example.com');
          assert.isTrue(spark.authorization.ready);
          assert.isFalse(spark.credentials.canAuthorize);
        });
      });
    });

    describe('#initiateLogin()', () => {
      describe('when clientType is "public"', () => {
        it('calls #initiateImplicitGrant()', () => {
          const spark = makeSpark(undefined, undefined, {
            credentials: {
              clientType: 'public'
            }
          });

          sinon.spy(spark.authorization, 'initiateImplicitGrant');

          return spark.authorization.initiateLogin()
            .then(() => {
              assert.called(spark.authorization.initiateImplicitGrant);
              assert.include(spark.getWindow().location, 'response_type=token');
            });
        });

        it('adds a csrf_token to the login url and sessionStorage', () => {
          const spark = makeSpark(undefined, undefined, {
            credentials: {
              clientType: 'public'
            }
          });

          sinon.spy(spark.authorization, 'initiateImplicitGrant');

          return spark.authorization.initiateLogin()
            .then(() => {
              assert.called(spark.authorization.initiateImplicitGrant);
              assert.include(spark.getWindow().location, 'response_type=token');
              const query = url.parse(spark.getWindow().location, true).query;
              let state = query.state;
              state = JSON.parse(base64.decode(state));
              assert.property(state, 'csrf_token');
              assert.isDefined(state.csrf_token);
              assert.match(state.csrf_token, patterns.uuid);
              assert.called(spark.getWindow().sessionStorage.setItem);
              assert.calledWith(spark.getWindow().sessionStorage.setItem, 'oauth2-csrf-token', state.csrf_token);
            });
        });
      });

      describe('when clientType is "private"', () => {
        it('calls #initiateAuthorizationCodeGrant()', () => {
          const spark = makeSpark(undefined, undefined, {
            credentials: {
              clientType: 'confidential'
            }
          });

          sinon.spy(spark.authorization, 'initiateAuthorizationCodeGrant');

          return spark.authorization.initiateLogin()
            .then(() => {
              assert.called(spark.authorization.initiateAuthorizationCodeGrant);
              assert.include(spark.getWindow().location, 'response_type=code');
            });
        });

        it('adds a csrf_token to the login url and sessionStorage', () => {
          const spark = makeSpark(undefined, undefined, {
            credentials: {
              clientType: 'confidential'
            }
          });

          sinon.spy(spark.authorization, 'initiateAuthorizationCodeGrant');

          return spark.authorization.initiateLogin()
            .then(() => {
              assert.called(spark.authorization.initiateAuthorizationCodeGrant);
              assert.include(spark.getWindow().location, 'response_type=code');
              const query = url.parse(spark.getWindow().location, true).query;
              let state = query.state;
              state = JSON.parse(base64.decode(state));
              assert.property(state, 'csrf_token');
              assert.isDefined(state.csrf_token);
              assert.match(state.csrf_token, patterns.uuid);
              assert.called(spark.getWindow().sessionStorage.setItem);
              assert.calledWith(spark.getWindow().sessionStorage.setItem, 'oauth2-csrf-token', state.csrf_token);
            });
        });
      });

      it('sets #isAuthorizing', () => {
        const spark = makeSpark(undefined, undefined, {
          credentials: {
            clientType: 'confidential'
          }
        });

        assert.isFalse(spark.authorization.isAuthorizing);
        const p = spark.authorization.initiateLogin();
        assert.isTrue(spark.authorization.isAuthorizing);
        return p.then(() => assert.isFalse(spark.authorization.isAuthorizing));
      });

      it('sets #isAuthenticating', () => {
        const spark = makeSpark(undefined, undefined, {
          credentials: {
            clientType: 'confidential'
          }
        });

        assert.isFalse(spark.authorization.isAuthenticating);
        const p = spark.authorization.initiateLogin();
        assert.isTrue(spark.authorization.isAuthenticating);
        return p.then(() => assert.isFalse(spark.authorization.isAuthenticating));
      });
    });

    describe('#_cleanUrl()', () => {
      it('removes the state parameter when it is empty', () => {
        const spark = makeSpark(undefined, undefined, {
          credentials: {
            clientType: 'confidential'
          }
        });
        sinon.spy(spark.authorization, '_cleanUrl');
        [{}, {state: {}}].forEach((hash) => {
          const location = {hash};
          spark.authorization._cleanUrl(location);
          assert.equal(spark.getWindow().location.href, '');
        });
      });

      it('keeps the state parameter when it has keys', () => {
        const spark = makeSpark(undefined, undefined, {
          credentials: {
            clientType: 'confidential'
          }
        });
        const location = {
          hash: {
            state: {
              csrf_token: 'token',
              key: 'value'
            }
          }
        };
        sinon.spy(spark.authorization, '_cleanUrl');
        spark.authorization._cleanUrl(location);
        const href = spark.getWindow().location.href;
        assert.isDefined(href);
        assert.equal(href, `#state=${base64.encode(JSON.stringify({key: 'value'}))}`);
        assert.notInclude(href, 'csrf_token');
      });
    });

    describe('#initiateImplicitGrant()', () => {
      it('redirects to the login page with response_type=token', () => {
        const spark = makeSpark(undefined, undefined, {
          credentials: {
            clientType: 'public'
          }
        });

        sinon.spy(spark.authorization, 'initiateImplicitGrant');

        return spark.authorization.initiateLogin()
          .then(() => {
            assert.called(spark.authorization.initiateImplicitGrant);
            assert.include(spark.getWindow().location, 'response_type=token');
          });
      });
    });

    describe('#initiateAuthorizationCodeGrant()', () => {
      it('redirects to the login page with response_type=code', () => {
        const spark = makeSpark(undefined, undefined, {
          credentials: {
            clientType: 'confidential'
          }
        });

        sinon.spy(spark.authorization, 'initiateAuthorizationCodeGrant');

        return spark.authorization.initiateLogin()
          .then(() => {
            assert.called(spark.authorization.initiateAuthorizationCodeGrant);
            assert.include(spark.getWindow().location, 'response_type=code');
          });
      });
    });
  });
});
