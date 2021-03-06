'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _socketBase = require('./socket-base');

var _socketBase2 = _interopRequireDefault(_socketBase);

var _ws = require('ws');

var _ws2 = _interopRequireDefault(_ws);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*!
 * Copyright (c) 2015-2017 Cisco Systems, Inc. See LICENSE file.
 */

_socketBase2.default.getWebSocketConstructor = function getWebSocketConstructor() {
  return _ws2.default;
};

exports.default = _socketBase2.default;
//# sourceMappingURL=socket.js.map
