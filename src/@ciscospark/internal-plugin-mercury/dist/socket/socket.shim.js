'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _socketBase = require('./socket-base');

var _socketBase2 = _interopRequireDefault(_socketBase);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_socketBase2.default.getWebSocketConstructor = function getWebSocketConstructor() {
  return WebSocket;
}; /*!
    * Copyright (c) 2015-2017 Cisco Systems, Inc. See LICENSE file.
    */

/* eslint-env browser */

exports.default = _socketBase2.default;
//# sourceMappingURL=socket.shim.js.map
