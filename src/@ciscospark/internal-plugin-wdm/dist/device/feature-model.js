'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _isNan = require('babel-runtime/core-js/number/is-nan');

var _isNan2 = _interopRequireDefault(_isNan);

var _apply = require('babel-runtime/core-js/reflect/apply');

var _apply2 = _interopRequireDefault(_apply);

var _isObject2 = require('lodash/isObject');

var _isObject3 = _interopRequireDefault(_isObject2);

var _defaults2 = require('lodash/defaults');

var _defaults3 = _interopRequireDefault(_defaults2);

var _ampersandState = require('ampersand-state');

var _ampersandState2 = _interopRequireDefault(_ampersandState);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var FeatureModel = _ampersandState2.default.extend({
  props: {
    key: 'string',
    lastModified: 'date',
    mutable: 'boolean',
    type: 'string',
    val: 'string',
    value: 'any'
  },

  constructor: function constructor(attrs, options) {
    options = options || {};
    (0, _defaults3.default)(options, { parse: true });
    return (0, _apply2.default)(_ampersandState2.default.prototype.constructor, this, [attrs, options]);
  },


  idAttribute: 'key',

  parse: function parse(attrs) {
    if (!attrs) {
      return {};
    }

    var num = Number(attrs.val);
    if (attrs.val && !(0, _isNan2.default)(num)) {
      // Handle numbers.
      attrs.value = num;
      attrs.type = 'number';
    }
    // Handle booleans.
    else if (attrs.val === 'true') {
        attrs.value = true;
        attrs.type = 'boolean';
      } else if (attrs.val === 'false') {
        attrs.value = false;
        attrs.type = 'boolean';
      }
      // It must be a string, so return it.
      else {
          attrs.value = attrs.val;
          attrs.type = 'string';
        }

    return attrs;
  },
  serialize: function serialize() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var attrs = (0, _apply2.default)(_ampersandState2.default.prototype.serialize, this, args);
    if (attrs.lastModified) {
      attrs.lastModified = new Date(attrs.lastModified).toISOString();
    }

    return attrs;
  },


  // Override set to make sure we always run features through parse()
  // See https://github.com/AmpersandJS/ampersand-state/issues/146 for related
  // bug
  set: function set(key, value, options) {
    var attrs = void 0;
    // Handle both `"key", value` and `{key: value}` -style arguments.
    // The next block is a direct copy from ampersand-state, so no need to test
    // both scenarios.
    /* istanbul ignore next */
    if ((0, _isObject3.default)(key) || key === null) {
      attrs = key;
      options = value;
    } else {
      attrs = {};
      attrs[key] = value;
    }

    attrs = this.parse(attrs, options);
    return (0, _apply2.default)(_ampersandState2.default.prototype.set, this, [attrs, options]);
  }
}); /*!
     * Copyright (c) 2015-2017 Cisco Systems, Inc. See LICENSE file.
     */

exports.default = FeatureModel;
//# sourceMappingURL=feature-model.js.map
