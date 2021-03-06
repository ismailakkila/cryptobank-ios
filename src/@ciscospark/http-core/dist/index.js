'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.detectSync = exports.detect = exports.HttpStatusInterceptor = exports.HttpError = exports.Interceptor = exports.ProgressEvent = exports.request = exports.defaults = undefined;

var _deleteProperty = require('babel-runtime/core-js/reflect/delete-property');

var _deleteProperty2 = _interopRequireDefault(_deleteProperty);

var _defineProperty = require('babel-runtime/core-js/reflect/define-property');

var _defineProperty2 = _interopRequireDefault(_defineProperty);

var _getOwnPropertyDescriptor = require('babel-runtime/core-js/reflect/get-own-property-descriptor');

var _getOwnPropertyDescriptor2 = _interopRequireDefault(_getOwnPropertyDescriptor);

var _isString2 = require('lodash/isString');

var _isString3 = _interopRequireDefault(_isString2);

var _defaults2 = require('lodash/defaults');

var _defaults3 = _interopRequireDefault(_defaults2);

var _curry2 = require('lodash/curry');

var _curry3 = _interopRequireDefault(_curry2);

var _assign2 = require('lodash/assign');

var _assign3 = _interopRequireDefault(_assign2);

var _progressEvent = require('./progress-event');

Object.defineProperty(exports, 'ProgressEvent', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_progressEvent).default;
  }
});

var _interceptor = require('./lib/interceptor');

Object.defineProperty(exports, 'Interceptor', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_interceptor).default;
  }
});

var _httpError = require('./http-error');

Object.defineProperty(exports, 'HttpError', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_httpError).default;
  }
});

var _httpStatus = require('./interceptors/http-status');

Object.defineProperty(exports, 'HttpStatusInterceptor', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_httpStatus).default;
  }
});

var _detect = require('./lib/detect');

Object.defineProperty(exports, 'detect', {
  enumerable: true,
  get: function get() {
    return _detect.detect;
  }
});
Object.defineProperty(exports, 'detectSync', {
  enumerable: true,
  get: function get() {
    return _detect.detectSync;
  }
});

var _httpStatus2 = _interopRequireDefault(_httpStatus);

var _request2 = require('./request');

var _request3 = _interopRequireDefault(_request2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Curry protorequest so we generate a function with default options built in.
/*!
 * Copyright (c) 2015-2017 Cisco Systems, Inc. See LICENSE file.
 */

var protorequest = (0, _curry3.default)(function protorequest(defaultOptions, options) {
  // allow for options to be a string (and therefore expect options in the third
  // position) to match request's api.
  if ((0, _isString3.default)(options)) {
    var uri = options;
    /* eslint prefer-rest-params: [0] */
    options = arguments[2] || {};
    options.uri = uri;
  }

  // Hide useless elements from logs
  ['download', 'interceptors', 'logger', 'upload'].forEach(function (prop) {
    var descriptor = (0, _getOwnPropertyDescriptor2.default)(options, prop);
    descriptor = (0, _assign3.default)({}, descriptor, {
      enumerable: false,
      writable: true
    });
    (0, _defineProperty2.default)(options, prop, descriptor);
  });

  (0, _defaults3.default)(options, defaultOptions);

  if (!options.json) {
    (0, _deleteProperty2.default)(options, 'json');
  }

  options.logger = options.logger || console;

  return (0, _request3.default)(options);
});

var defaultOptions = {
  json: true,
  interceptors: [
  // Reminder: this is supposed to be an instantiated interceptor.
  _httpStatus2.default.create()]
};

var defaults = exports.defaults = protorequest;
var request = exports.request = protorequest(defaultOptions);
//# sourceMappingURL=index.js.map
