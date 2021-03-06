'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _deleteProperty = require('babel-runtime/core-js/reflect/delete-property');

var _deleteProperty2 = _interopRequireDefault(_deleteProperty);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _clone2 = require('lodash/clone');

var _clone3 = _interopRequireDefault(_clone2);

var _httpCore = require('@ciscospark/http-core');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var requestHeaderName = 'cisco-no-http-redirect'; /*!
                                                   * Copyright (c) 2015-2017 Cisco Systems, Inc. See LICENSE file.
                                                   */

var responseHeaderName = 'cisco-location';

/**
 * @class
 */

var RedirectInterceptor = function (_Interceptor) {
  (0, _inherits3.default)(RedirectInterceptor, _Interceptor);

  function RedirectInterceptor() {
    (0, _classCallCheck3.default)(this, RedirectInterceptor);
    return (0, _possibleConstructorReturn3.default)(this, (RedirectInterceptor.__proto__ || (0, _getPrototypeOf2.default)(RedirectInterceptor)).apply(this, arguments));
  }

  (0, _createClass3.default)(RedirectInterceptor, [{
    key: 'onRequest',


    /**
     * @see Interceptor#onRequest
     * @param {Object} options
     * @returns {Object}
     */
    value: function onRequest(options) {
      if (options.uri.includes(this.spark.config.credentials.samlUrl) || options.uri.includes(this.spark.config.credentials.tokenUrl) || options.uri.includes(this.spark.config.credentials.authorizeUrl)) {
        return options;
      }

      // If cisco-no-http-redirect is already set, don't overwrite it
      if (requestHeaderName in options.headers) {
        // If cisco-no-http-redirect is set to null, false, or undefined, delete
        // it to prevent a CORS preflight.
        if (!options.headers[requestHeaderName]) {
          (0, _deleteProperty2.default)(options.headers, requestHeaderName);
        }
        return options;
      }
      options.headers[requestHeaderName] = true;
      options.$redirectCount = options.$redirectCount || 0;
      return options;
    }

    /**
     * @see Interceptor#onResponse
     * @param {Object} options
     * @param {HttpResponse} response
     * @returns {Object}
     */

  }, {
    key: 'onResponse',
    value: function onResponse(options, response) {
      if (response.headers && response.headers[responseHeaderName]) {
        options = (0, _clone3.default)(options);
        options.uri = response.headers[responseHeaderName];
        options.$redirectCount += 1;
        if (options.$redirectCount > this.spark.config.maxAppLevelRedirects) {
          return _promise2.default.reject(new Error('Maximum redirects exceeded'));
        }

        return this.spark.request(options);
      }

      return response;
    }
  }], [{
    key: 'create',

    /**
     * @returns {RedirectInterceptor}
     */
    value: function create() {
      return new RedirectInterceptor({ spark: this });
    }
  }]);
  return RedirectInterceptor;
}(_httpCore.Interceptor);

exports.default = RedirectInterceptor;
//# sourceMappingURL=redirect.js.map
