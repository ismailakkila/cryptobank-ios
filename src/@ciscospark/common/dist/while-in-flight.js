'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _apply = require('babel-runtime/core-js/reflect/apply');

var _apply2 = _interopRequireDefault(_apply);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _wrap2 = require('lodash/wrap');

var _wrap3 = _interopRequireDefault(_wrap2);

exports.default = whileInFlight;

var _tap = require('./tap');

var _tap2 = _interopRequireDefault(_tap);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * While the promise returned by the decorated is unfullfilled, sets, the
 * specified boolean on the target class to `true`
 * @param {string} param
 * @returns {Function}
 */
function whileInFlight(param) {
  return function whileInFlightDecorator(target, name, descriptor) {
    descriptor.value = (0, _wrap3.default)(descriptor.value, function whileInFlightExecutor(fn) {
      var _this = this;

      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      return new _promise2.default(function (resolve) {
        _this[param] = true;
        resolve((0, _apply2.default)(fn, _this, args).then((0, _tap2.default)(function () {
          _this[param] = false;
        })).catch(function (reason) {
          _this[param] = false;
          return _promise2.default.reject(reason);
        }));
      });
    });
  };
} /*!
   * Copyright (c) 2015-2017 Cisco Systems, Inc. See LICENSE file.
   */

/* eslint no-invalid-this: [0] */
//# sourceMappingURL=while-in-flight.js.map
