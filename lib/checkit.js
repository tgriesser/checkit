//     Checkit.js 0.6.0
//     http://tgriesser.com/checkit
//     (c) 2013-2015 Tim Griesser
//     Checkit may be freely distributed under the MIT license.
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var _marked = [validationRunner, asyncValidationRunner].map(regeneratorRuntime.mark);

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var co = require('co');
var _ = require('lodash');
var Err = require('es6-error');

// The top level `Checkit` constructor, accepting the
// `validations` to be run and any additional `options`.

var Checkit = function () {
  function Checkit() {
    var validations = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, Checkit);

    this.options = _.assign({
      single: false,
      failFast: false,
      language: checkit.i18n[options.language || checkit.language] || {},
      labels: {},
      messages: {},
      labelTransform: options.labelTransform || checkit.labelTransform,
      rethrow: maybeRethrow
    }, options);
    this.conditional = [];
    this.validations = prepValidations(validations, this.options);
  }

  // Asynchronously runs a validation block, returning a promise
  // which resolves with the validated object items, or is rejected
  // with a `Checkit.Error`


  _createClass(Checkit, [{
    key: 'run',
    value: function run(target, context) {
      return co(asyncValidationRunner(this, target, context)).then(function (result) {
        if (!_.isEmpty(result.errors)) {
          throw new CheckitError(result.errors);
        }
        return result.validated;
      });
    }

    // Synchronously runs a validation block, returning an object of all fields
    // validated, or throwing a `Checkit.Error` object.

  }, {
    key: 'runSync',
    value: function runSync(target, context) {
      var runner = validationRunner(this, target, context);
      var tmp = void 0,
          result = void 0;
      while (true) {
        // eslint-disable-line
        tmp = runner.next(tmp && tmp.value);
        if (tmp.done) {
          result = tmp.value;
          break;
        }
        if (tmp.value && typeof tmp.value.then === 'function') {
          console.error( //eslint-disable-line
          new Error('Trying to process an async validation synchronously'));
        }
      }
      if (!_.isEmpty(result.errors)) {
        return [new CheckitError(result.errors)];
      }
      return [null, result.validated];
    }

    // Alias for .run

  }, {
    key: 'validate',
    value: function validate(target, context) {
      return this.run(target, context);
    }
    // Alias for .runSync

  }, {
    key: 'validateSync',
    value: function validateSync(target, context) {
      return this.runSync(target, context);
    }

    // Possibly run a validations on this object, depending on the
    // result of the `conditional` handler.

  }, {
    key: 'maybe',
    value: function maybe() {
      var validations = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
      var conditional = arguments[1];

      this.conditional.push([conditional, prepValidations(validations, this.options)]);
      return this;
    }
  }, {
    key: 'requirements',
    value: function requirements() {
      var req = {};
      for (var key in this.validations) {
        req[key] = this.validations[key].map(function (v) {
          return v.message;
        });
      }
      return req;
    }
  }]);

  return Checkit;
}();

function checkit(validations, options) {
  return new Checkit(validations, options);
}

// The default language for all validations, defaults to "en" which
// is included with the library by default. To add additional languages,
// add them to the `Checkit.i18n` object.
checkit.language = 'en';

// Make a an individual key & rule, for convenience:
// e.g. `
//   const rule = checkit.single('email', 'email')
//   rule('foo@bar.com')
// `
checkit.single = function (key, rules, options) {
  var c = checkit(_defineProperty({}, key, rules), options);
  function fn(value) {
    return c.run(_defineProperty({}, key, value)).catch(function (err) {
      if (err instanceof CheckitError) {
        throw err.get(key);
      }
      throw err;
    });
  }
  fn.requirements = function () {
    return _.get(c.requirements(), key);
  };
  return fn;
};
checkit.singleSync = function (key, rules, options) {
  var c = checkit(_defineProperty({}, key, rules), options);
  function fn(value) {
    var _c$runSync = c.runSync(_defineProperty({}, key, value));

    var _c$runSync2 = _slicedToArray(_c$runSync, 2);

    var err = _c$runSync2[0];
    var val = _c$runSync2[1];

    return err === null ? [err, val] : [err instanceof CheckitError ? err.get(key) : err, val];
  }
  fn.requirements = function () {
    return _.get(c.requirements(), key);
  };
  return fn;
};

// Runs validation on an individual rule & value, for convenience.
// e.g. `Checkit.check('email', 'foo@domain', 'email').then(...`
checkit.check = function (key, value, rules, options) {
  return checkit.single(key, rules, options)(value);
};
checkit.checkSync = function (key, value, rules, options) {
  return checkit.singleSync(key, rules, options)(value);
};

// Used to transform the label before using it, can be
// set globally or in the `options` for the Checkit object.
checkit.labelTransform = function (label) {
  return label;
};

// Object containing languages for the validations... Feel free to
// add anything to this object.
checkit.i18n = {
  en: require('../lang/en'),
  es: require('../lang/es'),
  ru: require('../lang/ru'),
  fr: require('../lang/fr')
};

checkit.addRule = function (name, fn, replace) {
  if (!replace) maybeAdd(name, checkit.validators, '');
  checkit.validators[name] = fn;
  return checkit;
};
checkit.addRefRule = function (name, fn, replace) {
  if (!replace) maybeAdd(name, checkit.refValidators, 'ref ');
  function wrapper() {
    return fn.apply(undefined, arguments);
  }
  wrapper.ref = REF;
  checkit.refValidators[name] = wrapper;
  return checkit;
};

function maybeAdd(name, target, type) {
  if (target.hasOwnProperty(name)) {
    throw new TypeError('\n      Cannot replace existing validation ' + type + 'rule ' + name + '\n      without passing true as the third argument\n    ');
  }
}

// The validator is the object which is dispatched with the `run`
// call from the `checkit.run` method.
// Runs the validations on a specified "target".
function validationRunner(checkit, target) {
  var context = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];
  var isAsync = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];

  var conditional, options, validations, single, failFast, rethrow, validated, errors, addError, valKeys, i, l, key, validationItems, i2, l2, validation, passed, _i, _l, result, _conditional$_i, predicate, validate, c, val;

  return regeneratorRuntime.wrap(function validationRunner$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          addError = function addError(key, validation, originalError) {
            var message = validation.message;
            var label = validation.label;
            var params = validation.params;

            var finalMessage = originalError ? originalError.message : formatMessage(label, message, params);
            errors[key] = errors[key] || new FieldError(finalMessage, key, single);
            errors[key].errors.push(new ValidationError(finalMessage, key, validation, originalError));
          };

          conditional = checkit.conditional;
          options = checkit.options;
          validations = checkit.validations;
          single = options.single;
          failFast = options.failFast;
          rethrow = options.rethrow;
          validated = {};
          errors = {};
          valKeys = Object.keys(validations);

          // Processes an individual item in the validation collection for the current
          // validation object. Returns the value from the completed validation, which will
          // be a boolean, or potentially a promise if the current object is an async validation.

          i = 0, l = valKeys.length;

        case 11:
          if (!(i < l)) {
            _context.next = 42;
            break;
          }

          key = valKeys[i];
          validationItems = validations[key];
          i2 = 0, l2 = validationItems.length;

        case 15:
          if (!(i2 < l2)) {
            _context.next = 38;
            break;
          }

          validation = validationItems[i2];
          _context.prev = 17;
          _context.next = 20;
          return processRule(key, target, validation, options, context);

        case 20:
          passed = _context.sent;

          if (!(passed === false)) {
            _context.next = 25;
            break;
          }

          addError(key, validation);

          if (!single) {
            _context.next = 25;
            break;
          }

          return _context.abrupt('break', 38);

        case 25:
          _context.next = 35;
          break;

        case 27:
          _context.prev = 27;
          _context.t0 = _context['catch'](17);

          rethrow(_context.t0);
          addError(key, validation, _context.t0);

          if (!failFast) {
            _context.next = 33;
            break;
          }

          return _context.abrupt('return', { errors: errors });

        case 33:
          if (!single) {
            _context.next = 35;
            break;
          }

          return _context.abrupt('break', 38);

        case 35:
          i2++;
          _context.next = 15;
          break;

        case 38:
          if (!_.get(errors, key)) {
            validated[key] = target[key];
          }

        case 39:
          i++;
          _context.next = 11;
          break;

        case 42:
          if (!(conditional && conditional.length > 0)) {
            _context.next = 77;
            break;
          }

          _i = 0, _l = conditional.length;

        case 44:
          if (!(_i < _l)) {
            _context.next = 77;
            break;
          }

          result = void 0;
          _conditional$_i = _slicedToArray(conditional[_i], 2);
          predicate = _conditional$_i[0];
          validate = _conditional$_i[1];
          _context.prev = 49;
          _context.next = 52;
          return predicate.call(context, target);

        case 52:
          result = _context.sent;
          _context.next = 58;
          break;

        case 55:
          _context.prev = 55;
          _context.t1 = _context['catch'](49);

          rethrow(_context.t1);

        case 58:
          _context.prev = 58;

          if (!(result !== true)) {
            _context.next = 61;
            break;
          }

          return _context.abrupt('continue', 74);

        case 61:
          c = { validations: validate, options: options };

          if (!isAsync) {
            _context.next = 67;
            break;
          }

          return _context.delegateYield(asyncValidationRunner(c, target, context), 't3', 64);

        case 64:
          _context.t2 = _context.t3;
          _context.next = 69;
          break;

        case 67:
          return _context.delegateYield(validationRunner(c, target, context), 't4', 68);

        case 68:
          _context.t2 = _context.t4;

        case 69:
          val = _context.t2;

          if (!(failFast && !_.isEmpty(val.errors))) {
            _context.next = 72;
            break;
          }

          return _context.abrupt('return', val);

        case 72:
          if (!_.isEmpty(val.errors)) {
            _.each(val.errors, function (v, k) {
              errors[k] = errors[k] ? errors[k].errors.concat(v.errors) : v;
            });
          } else {
            _.assign(validated, val.validated);
          }
          return _context.finish(58);

        case 74:
          _i++;
          _context.next = 44;
          break;

        case 77:
          return _context.abrupt('return', {
            errors: errors,
            validated: validated
          });

        case 78:
        case 'end':
          return _context.stop();
      }
    }
  }, _marked[0], this, [[17, 27], [49, 55, 58, 74]]);
}

function asyncValidationRunner(checkit, target, context) {
  var iterator, tmp, returnVal;
  return regeneratorRuntime.wrap(function asyncValidationRunner$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          iterator = validationRunner(checkit, target, context, true);
          tmp = void 0, returnVal = void 0;

        case 2:
          if (!true) {
            _context2.next = 19;
            break;
          }

          //eslint-disable-line
          tmp = iterator.next(tmp && tmp.value);

          if (!(tmp.value && typeof tmp.value.then === 'function')) {
            _context2.next = 10;
            break;
          }

          _context2.next = 7;
          return tmp;

        case 7:
          _context2.t0 = _context2.sent;
          _context2.next = 13;
          break;

        case 10:
          _context2.next = 12;
          return Promise.resolve(tmp);

        case 12:
          _context2.t0 = _context2.sent;

        case 13:
          tmp = _context2.t0;

          if (!tmp.done) {
            _context2.next = 17;
            break;
          }

          returnVal = tmp.value;
          return _context2.abrupt('break', 19);

        case 17:
          _context2.next = 2;
          break;

        case 19:
          return _context2.abrupt('return', returnVal);

        case 20:
        case 'end':
          return _context2.stop();
      }
    }
  }, _marked[1], this);
}

function maybeRethrow(e) {
  if (e instanceof TypeError || e instanceof SyntaxError || e instanceof ReferenceError) {
    process.nextTick(function () {
      throw e;
    });
  }
}

// Get value corresponding to key containing "." from nested object.
// If key containing "." is proper in object (e.g. {"foo.bar": 100}) return 100.
function processRule(key, target, validation, options, context) {
  var value = _.get(target, key);
  var rule = validation.rule;
  var params = validation.params;
  var ruleFn = validation.ruleFn;

  var fn = ruleFn.ref === REF ? ruleFn(target) : ruleFn;

  // If the rule isn't an existence / required check, return
  // true if the value doesn't exist.
  if (rule !== 'accepted' && rule !== 'exists' && rule !== 'required') {
    if (value === '' || value === null || value === undefined) {
      return;
    }
  }
  return fn.apply(context, [value].concat(_toConsumableArray(params)).concat(context));
}

function getRule(rule, options) {
  if (rule === 'accepted') {
    return makeAccepted(options.language.accepted || DEFAULT_ACCEPTED);
  }
  if (typeof checkit.validators[rule] === 'function') {
    return checkit.validators[rule];
  }
  if (checkit.Regex[rule]) {
    var _ret = function () {
      var regex = checkit.Regex[rule];
      return {
        v: function v(val) {
          return regex.test(val);
        }
      };
    }();

    if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
  }
  if (checkit.refValidators[rule]) {
    return checkit.refValidators[rule];
  }
  if (typeof _['is' + _.capitalize(rule)] === 'function') {
    return _['is' + _.capitalize(rule)];
  }
  if (typeof _[rule] === 'function') {
    return _[rule];
  }
  throw new TypeError('No validation defined for rule: ' + rule);
}

// Checkit Predicates:

// Check if the value is an "accepted" value, useful for form submissions.
function makeAccepted(acceptedValues) {
  return function accepted(val) {
    return _.includes(acceptedValues, val);
  };
}

var REF = {};
var DEFAULT_ACCEPTED = ['on', 'yes', 1, '1', true, 'true'];

var accepted = makeAccepted(DEFAULT_ACCEPTED);

// The item must be a number between the given `min` and `max` values.
function between(val, min, max) {
  return greaterThan(val, min) && lessThan(val, max);
}

// The item must be a number equal or larger than the given `min` and
// equal or smaller than the given `max` value.
function range(val, min, max) {
  return greaterThanEqualTo(val, min) && lessThanEqualTo(val, max);
}

// Check that an item contains another item, either a string,
// array, or object.
function contains(val, item) {
  if (_.isString(val)) return val.indexOf(item) !== -1;
  if (_.isArray(val)) return _.indexOf(val, item) !== -1;
  if (_.isObject(val)) return _.has(val, item);
  return false;
}

// The current value should be different than another field in the current
// validation object.
function different(obj) {
  return function (val, field) {
    return !_.isEqual(val, obj[field]);
  };
}
different.ref = REF;

// Matches another named field in the current validation object.
function matchesField(obj) {
  return function (val, field) {
    return _.isEqual(val, obj[field]);
  };
}
different.ref = REF;

// Check if two items are the exact same length
function exactLength(val, length) {
  return checkInt(length) || val.length === parseInt(length, 10);
}

// Key must not be `undefined`.
function exists(val) {
  return val !== void 0;
}

// Field is required and not empty (zero does not count as empty).
function required(val) {
  return val != null && val !== '' ? true : false;
}

// Check that an item is a minimum length
function minLength(val, length) {
  return checkInt(length) || val.length >= length;
}

// Check that an item is less than a length
function maxLength(val, length) {
  return checkInt(length) || val.length <= length;
}

// Check if one items is greater than another
function greaterThan(val, param) {
  return checkNumber(val) || checkNumber(param) || parseFloat(val) > parseFloat(param);
}

// Check if one items is greater than or equal to another
function greaterThanEqualTo(val, param) {
  return checkNumber(val) || checkNumber(param) || parseFloat(val) >= parseFloat(param);
}

// Check if one item is less than another
function lessThan(val, param) {
  return checkNumber(val) || checkNumber(param) || parseFloat(val) < parseFloat(param);
}

// Check if one item is less than or equal to another
function lessThanEqualTo(val, param) {
  return checkNumber(val) || checkNumber(param) || parseFloat(val) <= parseFloat(param);
}

// Check if the value is a string
function string(val) {
  return typeof val === 'string';
}

// Check if the value is numeric
function numeric(val) {
  return !isNaN(parseFloat(val)) && isFinite(val);
}

// Invariants

function checkInt(val) {
  if (!val.match(Regex.integer)) {
    throw new TypeError('The validator argument must be a valid integer');
  }
}

function checkNumber(val) {
  if (!numeric(val)) {
    throw new TypeError('The validator argument must be a valid number');
  }
}

// Standard regular expression validators.
var Regex = checkit.Regex = {
  alpha: /^[a-z]+$/i,
  alphaDash: /^[a-z0-9_\-]+$/i,
  alphaNumeric: /^[a-z0-9]+$/i,
  alphaUnderscore: /^[a-z0-9_]+$/i,
  base64: /^(?:[A-Za-z0-9+\/]{4})*(?:[A-Za-z0-9+\/]{2}==|[A-Za-z0-9+\/]{3}=)?$/,
  email: /^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,63}$/i,
  integer: /^\-?[0-9]+$/,
  ipv4: /^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})$/i,
  ipv6: /^((?=.*::)(?!.*::.+::)(::)?([\dA-F]{1,4}:(:|\b)|){5}|([\dA-F]{1,4}:){6})((([\dA-F]{1,4}((?!\3)::|:\b|$))|(?!\2\3)){2}|(((2[0-4]|1\d|[1-9])?\d|25[0-5])\.?\b){4})$/i,
  luhn: /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$/,
  natural: /^[0-9]+$/i,
  naturalNonZero: /^[1-9][0-9]*$/i,
  url: /^((http|https):\/\/(\w+:{0,1}\w*@)?(\S+)|)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/,
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
};

// Error Types
// ---------------

// An object that inherits from the `Error` prototype,
// but contains methods for working with the individual errors
// created by the failed Checkit validation object.

var CheckitError = function (_Err) {
  _inherits(CheckitError, _Err);

  function CheckitError(errors) {
    _classCallCheck(this, CheckitError);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(CheckitError).apply(this, arguments));

    _this.errors = errors;
    return _this;
  }

  _createClass(CheckitError, [{
    key: 'get',
    value: function get(name) {
      return this.errors[name];
    }

    // Convert the current error object toString, by stringifying the JSON representation
    // of the object.

  }, {
    key: 'toString',
    value: function toString() {
      return _.values(this.errors).map(function (e) {
        return e.toString();
      }).join('\n');
    }

    // Creates a JSON object of the validations, if `true` is passed - it will
    // flatten the error into a single value per item.

  }, {
    key: 'toJSON',
    value: function toJSON() {
      var json = {};
      for (var key in this.errors) {
        var err = this.errors[key];
        if (typeof err.toJSON === 'function') {
          json[key] = err.toJSON();
        } else {
          json[key] = err.message;
        }
      }
      return json;
    }
  }]);

  return CheckitError;
}(Err);

// An `Error` object specific to an individual field,
// useful in the `Checkit.check` method when you're only
// validating an individual field. It contains an "errors"
// array which keeps track of any falidations


var FieldError = function (_Err2) {
  _inherits(FieldError, _Err2);

  function FieldError(message, key, single) {
    _classCallCheck(this, FieldError);

    var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(FieldError).call(this, message));

    _this2.key = key;
    _this2.errors = [];
    _this2._single = single;
    return _this2;
  }

  // Call `toString` on the current field, which should
  // turn the error into the format:

  _createClass(FieldError, [{
    key: 'toString',
    value: function toString() {
      var errors = this._single ? this.errors.slice(0, 1) : this.errors;
      return this.key + ': ' + errors.map(function (e) {
        return e.message;
      }).join(', ');
    }

    // Returns the current error in json format, by calling `toJSON`
    // on the error, if there is one, otherwise returning the message.

  }, {
    key: 'toJSON',
    value: function toJSON() {
      var result = this.errors.map(function (err) {
        return typeof err.toJSON === 'function' ? err.toJSON() : err.message;
      });
      return this._single ? result[0] : result;
    }
  }]);

  return FieldError;
}(Err);

var ValidationError = function (_Err3) {
  _inherits(ValidationError, _Err3);

  function ValidationError(message, key, validation, originalError) {
    _classCallCheck(this, ValidationError);

    var _this3 = _possibleConstructorReturn(this, Object.getPrototypeOf(ValidationError).call(this, message));

    _this3.key = key;
    _this3.validation = validation;
    _this3.originalError = originalError;
    return _this3;
  }

  return ValidationError;
}(Err);

// Assorted Helper Items:
// --------------------------

// Regular expression for matching the `field_name` and `var_n`


var labelRegex = /\{\{label\}\}/g;
function varRegex(i) {
  return new RegExp('{{var_' + i + '}}', 'g');
}

// Preps the validations being sent to the `run` block, to standardize
// the format and allow for maximum flexibility when passing to the
// validation blocks.
function prepValidations(validations, options) {
  var preparedValidations = {};

  var _loop = function _loop(key) {
    var validation = validations[key];
    preparedValidations[key] = _.isArray(validation) ? validation.filter(_.identity).map(function (v) {
      return assembleValidation(key, v, options);
    }) : [assembleValidation(key, validation, options)];
  };

  for (var key in validations) {
    _loop(key);
  }
  return preparedValidations;
}

function getLabel(key, options) {
  var labels = options.labels;
  var languageLabels = options.language.labels;
  var labelTransform = options.labelTransform;

  return labels[key] || languageLabels[key] || labelTransform(key);
}
function getMessage(key, options) {
  var messages = options.messages;
  var languageMessages = options.language.messages;

  return messages[key] || languageMessages[key] || languageMessages.fallback;
}
function formatMessage(label, message, params) {
  message = message.replace(labelRegex, label);
  for (var i = 0, l = params.length; i < l; i++) {
    message = message.replace(varRegex(i + 1), params[i]);
  }
  return message;
}

// Turns the current validation item into an object literal,
// containing the rule, any arguments split from the `:` delimeter
function assembleValidation(key, validation, options) {
  var rule = void 0,
      ruleFn = void 0,
      label = key,
      params = [];
  if (_.isString(validation)) {
    var _validation$split = validation.split(':');

    var _validation$split2 = _toArray(_validation$split);

    rule = _validation$split2[0];
    params = _validation$split2.slice(1);

    validation = {
      rule: rule,
      params: params
    };
  }
  if (_.isFunction(validation)) {
    validation = {
      rule: validation
    };
  }
  if (!_.isPlainObject(validation)) {
    throw new TypeError('Expected validation to be an object, saw ' + validation);
  }

  rule = validation.rule;
  if (_.isString(validation.params)) {
    params = [validation.params];
  }
  if (_.isArray(validation.params)) {
    params = validation.params;
  }
  if (_.isString(rule)) {
    if (!_.isArray(validation.params)) {
      var _rule$split = rule.split(':');

      var _rule$split2 = _toArray(_rule$split);

      rule = _rule$split2[0];
      params = _rule$split2.slice(1);
    }
    ruleFn = getRule(rule, options);
  }
  if (_.isFunction(validation.rule)) {
    rule = 'Function';
    ruleFn = validation.rule;
  }
  label = validation.label || ruleFn.label || getLabel(key, options);
  var message = validation.message || ruleFn.message || getMessage(rule, options);
  return {
    rule: rule,
    ruleFn: ruleFn,
    params: params,
    label: label,
    message: formatMessage(label, message, params)
  };
}

checkit.validators = {
  accepted: accepted,
  between: between,
  range: range,
  contains: contains,
  exactLength: exactLength,
  exists: exists,
  required: required,
  minLength: minLength,
  maxLength: maxLength,
  lessThan: lessThan,
  greaterThan: greaterThan,
  greaterThanEqualTo: greaterThanEqualTo,
  lessThanEqualTo: lessThanEqualTo,
  gte: greaterThanEqualTo,
  lte: lessThanEqualTo,
  string: string,
  numeric: numeric
};

checkit.refValidators = {
  different: different,
  matchesField: matchesField
};

checkit.Error = checkit.CheckitError = CheckitError;
checkit.ValidationError = ValidationError;
checkit.FieldError = FieldError;

module.exports = checkit;