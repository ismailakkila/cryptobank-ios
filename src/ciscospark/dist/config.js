'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _configStorage = require('./config-storage');

var _configStorage2 = _interopRequireDefault(_configStorage);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  hydraServiceUrl: process.env.HYDRA_SERVICE_URL || 'https://api.ciscospark.com/v1',
  credentials: {
    clientType: 'confidential'
  },
  device: {
    ephemeral: true
  },
  storage: _configStorage2.default
}; /*!
    * Copyright (c) 2015-2017 Cisco Systems, Inc. See LICENSE file.
    */
//# sourceMappingURL=config.js.map
