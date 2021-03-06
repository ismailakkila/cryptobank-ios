'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _deleteProperty = require('babel-runtime/core-js/reflect/delete-property');

var _deleteProperty2 = _interopRequireDefault(_deleteProperty);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _pick2 = require('lodash/pick');

var _pick3 = _interopRequireDefault(_pick2);

var _isArray2 = require('lodash/isArray');

var _isArray3 = _interopRequireDefault(_isArray2);

var _defaults2 = require('lodash/defaults');

var _defaults3 = _interopRequireDefault(_defaults2);

exports.default = _request;

var _qs = require('qs');

var _qs2 = _interopRequireDefault(_qs);

var _xhr = require('../lib/xhr');

var _xhr2 = _interopRequireDefault(_xhr);

var _detect = require('../lib/detect');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @name request
 * @param {Object} options
 * @returns {Promise}
 */
function _request(options) {
  return new _promise2.default(function (resolve) {
    var params = (0, _pick3.default)(options, 'method', 'uri', 'withCredentials', 'headers', 'timeout', 'responseType');

    // Set `response` to `true` to approximate an `HttpResponse` object
    params.response = true;

    bindProgressEvents(params, options);
    setAuth(params, options);
    setCookies(params, options);
    setDefaults(params, options);
    setResponseType(params, options);
    setContentType(params, options);
    setPayload(params, options);
    setQs(params, options);

    var x = (0, _xhr2.default)(params, function (error, response) {
      /* istanbul ignore next */
      if (error) {
        options.logger.warn(error);
      }

      /* istanbul ignore else */
      if (response) {
        response.options = options;
        processResponseJson(response, params);
        resolve(response);
      } else {
        resolve({
          statusCode: 0,
          options: options,
          headers: options.headers,
          method: options.method,
          url: options.uri,
          body: error
        });
      }
    });

    x.onprogress = options.download.emit.bind(options.download, 'progress');
  }).catch(function (error) {
    /* eslint arrow-body-style: [0] */
    /* istanbul ignore next */
    return {
      statusCode: 0,
      options: options,
      headers: options.headers,
      method: options.method,
      url: options.uri,
      body: error
    };
  });

  /**
   * @param {Object} params
   * @param {Object} o
   * @private
   * @returns {undefined}
   */
  function bindProgressEvents(params, o) {
    if (params.method && ['PATCH', 'POST', 'PUT'].includes(params.method.toUpperCase())) {
      params.xhr = new XMLHttpRequest();
      params.xhr.upload.onprogress = o.upload.emit.bind(o.upload, 'progress');
    }
  }

  /**
   * @param {Object} params
   * @param {Object} o
   * @private
   * @returns {undefined}
   */
  function setAuth(params, o) {
    if (o.auth) {
      if (o.auth.bearer) {
        params.headers.authorization = 'Bearer ' + o.auth.bearer;
      } else {
        var user = o.auth.user || o.auth.username;
        var pass = o.auth.pass || o.auth.password;

        var token = btoa(user + ':' + pass);
        params.headers.authorization = 'Basic ' + token;
      }
    }
  }

  /**
   * @param {Object} params
   * @param {Object} o
   * @private
   * @returns {undefined}
   */
  function setCookies(params, o) {
    if (o.jar) {
      params.withCredentials = true;
    }
  }

  /**
   * @param {Object} params
   * @param {Object} o
   * @private
   * @returns {undefined}
   */
  function setDefaults(params, o) {
    var defs = {
      cors: true,
      // raynos/xhr defaults withCredentials to true if cors is true, so we need
      // to make it explicitly false by default
      withCredentials: false,
      timeout: 0
    };

    (0, _defaults3.default)(params, (0, _pick3.default)(o, (0, _keys2.default)(defs)), defs);
  }

  /**
   * @param {Object} params
   * @param {Object} o
   * @private
   * @returns {undefined}
   */
  function setResponseType(params, o) {
    if (o.responseType === 'buffer') {
      params.responseType = 'arraybuffer';
    }
  }

  /**
   * @param {Object} params
   * @param {Object} o
   * @private
   * @returns {undefined}
   */
  function setContentType(params, o) {
    if (o.body instanceof Blob || o.body instanceof ArrayBuffer) {
      o.json = params.json = false;
      params.headers['content-type'] = params.headers['content-type'] || (0, _detect.detectSync)(o.body);
    }
  }

  /**
   * @param {Object} params
   * @param {Object} o
   * @private
   * @returns {undefined}
   */
  function setQs(params, o) {
    if (o.qs) {
      params.uri += '?' + _qs2.default.stringify(o.qs);
    }
  }

  /**
   * Converts arraybuffers to blobs before uploading them
   * @param {mixed} file
   * @private
   * @returns {mixed}
   */
  function ensureBlob(file) {
    if (file instanceof ArrayBuffer) {
      var ret = file.type ? new Blob([file], { type: file.type }) : new Blob([file]);
      ret.filename = file.filename || file.name || 'untitled';
      return ret;
    }

    return file;
  }

  /**
   * Appends an item to a form
   * @param {FormData} form
   * @param {string} key
   * @param {mixed} value
   * @returns {undefined}
   */
  function append(form, key, value) {
    if ((0, _isArray3.default)(value)) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = (0, _getIterator3.default)(value), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var v = _step.value;

          append(form, key, v);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return;
    }

    value = ensureBlob(value);
    if (value.name) {
      value.filename = value.name;
      form.append(key, value, value.name);
    } else {
      form.append(key, value);
    }
  }

  /**
   * @param {Object} params
   * @param {Object} o
   * @private
   * @returns {undefined}
   */
  function setPayload(params, o) {
    if ((!('json' in o) || o.json === true) && o.body) {
      params.json = o.body;
    } else if (o.form) {
      params.headers['Content-Type'] = 'application/x-www-form-urlencoded';
      params.body = _qs2.default.stringify(o.form);
      (0, _deleteProperty2.default)(params, 'json');
    } else if (o.formData) {
      params.body = (0, _keys2.default)(o.formData).reduce(function (fd, key) {
        var value = o.formData[key];
        append(fd, key, value);
        return fd;
      }, new FormData());
    } else {
      params.body = o.body;
      (0, _deleteProperty2.default)(params, 'json');
    }
  }

  /**
   * @param {Object} response
   * @param {Object} params
   * @private
   * @returns {undefined}
   */
  function processResponseJson(response, params) {
    // If params.json is not defined, xhr won't deserialize the response
    // so we should give it a shot just in case.
    if (!params.json && (0, _typeof3.default)(response.body) !== 'object') {
      try {
        response.body = JSON.parse(response.body);
      } catch (e) {
        /* eslint no-empty: [0] */
      }
    }
  }
} /*!
   * Copyright (c) 2015-2017 Cisco Systems, Inc. See LICENSE file.
   */

/* eslint-env browser */

// Note: several code paths are ignored in this file. As far as I can tell, any
// error conditions that would provoke those paths are otherwise prevented and
// reported.
//# sourceMappingURL=request.shim.js.map
