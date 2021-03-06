/*!
 * Copyright (c) 2015-2017 Cisco Systems, Inc. See LICENSE file.
 */

import {inBrowser} from '@ciscospark/common';

export default {
  device: {
    preDiscoveryServices: {
      metricsServiceUrl: process.env.METRICS_SERVICE_URL || 'https://metrics-a.wbx2.com/metrics/api/v1'
    }
  },
  metrics: {
    appType: inBrowser ? 'browser' : 'nodejs',
    batcherWait: 500,
    batcherMaxCalls: 50,
    batcherMaxWait: 1500,
    batcherRetryPlateau: 32000
  }
};
