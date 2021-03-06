'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _defineProperties = require('babel-runtime/core-js/object/define-properties');

var _defineProperties2 = _interopRequireDefault(_defineProperties);

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

var _httpError = require('../http-error');

var _httpError2 = _interopRequireDefault(_httpError);

var _interceptor = require('../lib/interceptor');

var _interceptor2 = _interopRequireDefault(_interceptor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @class
 */
/*!
 * Copyright (c) 2015-2017 Cisco Systems, Inc. See LICENSE file.
 */

var HttpStatusInterceptor = function (_Interceptor) {
  (0, _inherits3.default)(HttpStatusInterceptor, _Interceptor);

  /**
   * @param {Object} spark
   * @param {Object} options
   * @returns {HttpStatusInterceptor}
   */
  function HttpStatusInterceptor(spark, options) {
    (0, _classCallCheck3.default)(this, HttpStatusInterceptor);

    var _this = (0, _possibleConstructorReturn3.default)(this, (HttpStatusInterceptor.__proto__ || (0, _getPrototypeOf2.default)(HttpStatusInterceptor)).call(this, spark));

    var ErrorConstructor = options && (options.error || options.ErrorConstructor) || _httpError2.default;

    (0, _defineProperties2.default)(_this, {
      ErrorConstructor: {
        value: ErrorConstructor
      }
    });
    return _this;
  }

  /**
   * @param {Object} options
   * @returns {HttpStatusInterceptor}
   */


  (0, _createClass3.default)(HttpStatusInterceptor, [{
    key: 'onResponse',


    /**
     * @param {Object} options
     * @param {HttpResponse} response
     * @returns {Promise}
     */
    value: function onResponse(options, response) {
      if (response.statusCode && response.statusCode < 400) {
        return _promise2.default.resolve(response);
      }
      // Note: the extra parenthesis below are required to make sure `new` is
      // applied to the correct method (i.e., the result of `select()`, not
      // `select()` itself).
      return _promise2.default.reject(new (this.ErrorConstructor.select(response.statusCode))(response));
    }
  }], [{
    key: 'create',
    value: function create(options) {
      return new HttpStatusInterceptor(this, options);
    }
  }]);
  return HttpStatusInterceptor;
}(_interceptor2.default);

exports.default = HttpStatusInterceptor;
//# sourceMappingURL=http-status.js.map
