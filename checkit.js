//     CheckIt.js 0.1.0
//     http://tgriesser.com/checkit
//     (c) 2013 Tim Griesser
//     CheckIt may be freely distributed under the MIT license.
(function(CheckitLib) {

  if (typeof exports === 'object') {
    module.exports = CheckitLib(require('when'), require('underscore-contrib'));
  } else if (typeof define === "function" && define.amd) {
    define(['when', 'underscore'], function(when, _) {
      return CheckitLib(when, _);
    });
  } else {
    var root = this;
    var lastCheckIt = root.CheckIt;
    var CheckIt     = root.CheckIt = CheckitLib(root.when, root._);
    CheckIt.noConflict = function() {
      root.CheckIt = lastCheckIt;
      return CheckIt;
    };
  }

}).call(this, (function(when, _) {

  "use strict";

  // The top level `CheckIt` is a passthrough to the `CheckIt.Ctor` object.
  // Takes a two arguments, a required `target` - the object being checked, and
  // an optional `options` hash.
  var CheckIt = function(target, options) {
    return new CheckIt.Ctor(target, options);
  };

  // Sets the default language for all validations, defaults to "en" which
  // is included with the library by default. To add additional languages,
  // add them to the `CheckIt.i18n` object.
  CheckIt.language = 'en';

  // Determines (globally) whether the promises being `run` are asynchronous. Set to `true` by
  // default, unless it isn't defined, so we can use this nicely in the browser if
  // we haven't included `when` and don't really need async validations since
  // it's just about simple validations... all the fun stuff happens on the server anyway.
  CheckIt.async = when !== void 0;

  // Constructor for the CheckIt object.
  CheckIt.Ctor = function(target, options) {
    options || (options = {});
    this.target     = target;
    this._applyAll  = [];
    this.labels     = {};
    this.async      = _.has(options, 'async') ? options.async : CheckIt.async;
    this.language   = _.has(options, 'language') ? options.language : CheckIt.language;
    _.bindAll(this, '_asyncError');
  };

  _.extend(CheckIt.Ctor.prototype, {

    // Sets any labels for the current validation values,
    // so error messages aren't weird looking and such.
    setLabels: function(labels) {
      _.extend(this.labels, labels);
      return this;
    },

    // Applies a `validator` to all of the values in the current object being validated.
    applyToAll: function(validator) {
      this._applyAll = this._applyAll.concat(validator);
      return this;
    },

    // Runs a validation block, returning a deferred object, or
    // a boolean if the validations are run asynchronously.
    run: function(validations) {
      this.validations = this._prepValidations(validations || {});
      return this.async ? this._runAsync() : this._runSync();
    },

    // Preps the validations being sent to the `run` block, to standardize
    // the format and allow for maximum flexibility when passing to the
    // validation blocks.
    _prepValidations: function(validations) {
      var key;
      if (this._applyAll.length > 0) {
        for (key in this.target) validations[key] || (validations[key] = []);
      }
      for (key in validations) {
        var validation = validations[key];
        if (!_.isArray(validation)) validation = [validation];
        if (this._applyAll.length > 0) validation = validation.concat(this._applyAll);
        validations[key] = validation;
        for (var i = 0, l = validation.length; i < l; i++) {
          if (!this.isLiteral(validation[i])) {
            validation[i] = this._assembleValidation(validation[i]);
          }
        }
      }
      return validations;
    },

    // Turns the current validation item into an object literal,
    // containing the rule, any arguments split from the `:` delimeter,
    // and the
    _assembleValidation: function(validation) {
      if (_.isString(validation)) {
        var splitRule = validation.split(':');
        return {rule: splitRule[0], param: _.rest(splitRule)};
      } else if (_.isFunction(validation)) {
        return {rule: validation, param: []};
      }
    },

    // Asynchronously runs a block of validations,
    // returning a deferred object.
    _runAsync: function() {
      if (!when) throw new Error('The when.js library is required to run asynchronous validations, please require it.');
      var key, pending = [];
      var validations = this.validations;
      for (key in validations) {
        var validation = validations[key];
        for (var i = 0, l = validation.length; i < l; i++) {
          pending.push(this._processItem(validation[i], this.target[key]));
        }
      }
      return when.settle(pending).then(this._asyncError);
    },

    // Processes the errors in an async validation after all of the validations
    // are guarenteed to be settled. If the result is explicitly false or a rejected
    // promise, then they are considered to be failures and will be added to the "errors"
    // stack for the current object.
    _asyncError: function() {
      var errors = this.errors = {};
      var validations = this.validations;
      for (var key in validations) {
        var line = validations[key];
        for (var i = 0, l = line.length; i < l; i++) {
          var result = line[i].result;
          if (_.isBoolean(result)) {
            if (result === false) {
              (errors[key] || (errors[key] = [])).push(line[i]);
            }
          }
          // If this is a promise, inspect & set the value properly.
          if (result.inspect) {
            var inspected = result.inspect();
            if (inspected.state === 'fulfilled') line[i].result = inspected.value;
            if (inspected.state === 'rejected') {
              line[i].result = inspected.reason;
              (errors[key] || (errors[key] = [])).push(line[i]);
            }
          }
        }
      }
      return (!_.isEmpty(errors) ? when.reject(new CheckIt.Error(this)) : this);
    },

    // Processes the values synchronously, adding an error to the stack when a
    // falsy value occurs.
    _runSync: function() {
      var validations = this.validations;
      var errors = this.errors = {};
      for (var key in validations) {
        var line = validations[key];
        for (var i = 0, l = line.length; i < l; i++) {
          var processed = this._processItem(line[i], this.target[key]);
          if (processed === false || processed instanceof Error) {
            (errors[key] || (errors[key] = [])).push(line[i]);
          }
        }
      }
      // If `this.errors` isn't empty, go ahead and set the `validationError` property
      // on this instance to a new `CheckIt.Error` object.
      if (!_.isEmpty(this.errors)) {
        this.validationError = new CheckIt.Error(this);
        return false;
      }
      return true;
    },

    // Processes an individual item in the validation collection for the current
    // validation object. Returns the value from the completed validation, which will
    // be a boolean, or potentially a promise if the current object is an async validation.
    _processItem: function(currentValidation, value) {
      var result, rule = currentValidation.rule;
      var param = [value].concat(currentValidation.param);

      // If the rule isn't an existence / required check, return
      // true if the value doesn't exist.
      if (rule !== 'exists' && rule !== 'required') {
        if (value === '' || value == null) result = true;
      }

      if (!result) {
        // Need to try/catch block this whole deal, since
        // we're not guarenteed to be inside of promise land, can't have
        // any uncaught exceptions.
        try {
          if (_.isFunction(rule)) {
            result = rule.apply(this, param);
          } else if (this[rule]) {
            result = this[rule].apply(this, param);
          } else if (regex[rule]) {
            result = regex[rule].test(value);
          } else {
            throw new Error('No validation defined for ' + rule);
          }
        } catch (e) {
          result = (this.async ? when.reject(e) : e);
        }
      }

      return currentValidation.result = result;
    },

    // Validations
    // ------------------------------------------------

    // Key must not be `undefined`.
    exists: function(val) {
      return val !== void 0;
    },

    // Field is required and not empty
    required: function(val) {
      return (val != null && val !== '' ? true : false);
    },

    // Check that an item contains another item
    contains: function(val, item) {
      if (_.isString(val)) return val.indexOf(item) !== -1;
      if (_.isArray(val))  return _.indexOf(val, item) !== -1;
      if (_.isObject(val)) return _.has(val, item);
      return false;
    },

    // Check that an item is a valid email
    validEmail: function(val) {
      return regex.email.test(val);
    },

    // Matches another named field in the current validation object.
    matchesField: function(val, field) {
      return _.isEqual(val, this.target[field]);
    },

    // Check that an item is a minimum length
    minLength: function(val, length) {
      return checkInt(length) || val.length >= length;
    },

    // Check that an item is less than a length
    maxLength: function(val, length) {
      return checkInt(length) || val.length <= length;
    },

    // Check if two items are the exact same length
    exactLength: function(val, length) {
      return checkInt(length) || val.length === parseInt(length, 10);
    },

    // Check if one items is greater than another
    greaterThan: function(val, param) {
      return checkNumber(val) || checkNumber(param) || parseFloat(val) > parseFloat(param);
    },

    // Check if one item is less than another
    lessThan: function(val, param) {
      return checkNumber(val) || checkNumber(param) || parseFloat(val) < parseFloat(param);
    },

    // Check if this item is an object literal.
    isLiteral: function(val) {
      return (_.isObject(val) && !_.isFunction(val) && !_.isArray(val));
    }

  });

  var checkInt = function(val) {
    if (!_.isInteger(val)) throw new Error("The validator argument must be a valid integer");
  };
  var checkNumber = function(val) {
    if (!_.isNumeric(val)) throw new Error("The validator argument must be a valid number");
  };

  // Mixin all relevant functions to be added from underscore & underscore-contrib to the CheckIt prototype

  // Predicates from the `underscore.js` library.
  var basePredicates = ['isEmpty', 'isEqual', 'isElement',
  'isArray', 'isObject', 'isArguments', 'isFunction', 'isString', 'isNumber', 'isFinite',
  'isBoolean', 'isDate', 'isRegExp', 'isNaN', 'isNull', 'isUndefined'];

  // Predicates from the `underscore-contrib.js` library.
  var contribPredicates = ['isInstanceOf', 'isAssociative', 'isIndexed', 'isSequential', 'isZero',
  'isEven', 'isOdd', 'isPositive', 'isNegative', 'isValidDate', 'isNumeric', 'isInteger', 'isFloat',
  'isIncreasing', 'isDecreasing'];

  // Add each of the underscore and underscore-contrib functions to the `CheckIt.prototype`,
  _.each(basePredicates.concat(contribPredicates), function(method) {
    CheckIt.Ctor.prototype[method] = _[method];
  });

  // Standard regular expression validators.
  var regex = CheckIt.regex = {
    integer: /^\-?[0-9]+$/,
    email: /^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,6}$/i,
    alpha: /^[a-z]+$/i,
    alphaNumeric: /^[a-z0-9]+$/i,
    alphaDash: /^[a-z0-9_\-]+$/i,
    alphaUnderscore: /^[a-z0-9_]+$/i,
    natural: /^[0-9]+$/i,
    naturalNonZero: /^[1-9][0-9]*$/i,
    ipv4: /^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})$/i,
    base64: /^(?:[A-Za-z0-9+\/]{4})*(?:[A-Za-z0-9+\/]{2}==|[A-Za-z0-9+\/]{3}=)?$/,
    luhn: /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$/
  };

  // An object that inherits from the `Error` prototype,
  // but contains methods for working with the individual errors
  // created by the failed CheckIt validation object.
  CheckIt.Error = function(instance) {
    this.checkit  = instance;
    this.language = CheckIt.i18n[instance.language] || CheckIt.i18n['en'];
    this.message  = this.toString();
  };

  var ctor = function(){};
  ctor.prototype = new Error;
  CheckIt.Error.prototype = ctor.prototype;

  _.extend(CheckIt.Error.prototype, {

    // Gets & formats the validation error message for an `item`.
    get: function(key) {
      var items;
      if (items = this.checkit.errors[key]) {
        return _.map(items, function(item) {
          return this.format(key, item);
        }, this);
      }
    },

    // Returns the first validation error for an `item`.
    first: function(key) {
      var item;
      if (item = this.checkit.errors[key]) {
        return this.format(key, item[0]);
      }
    },

    // Formats the particular item
    format: function(key, item) {
      var label = item.label || this.checkit.labels[key] || key;
      var message = item.message || this.language[item.rule] || this.language.fallback;
      if (message) {
        message = message.replace(labelRegex, label);
        for (var i = 0, l = item.param.length; i < l; i++) {
          message = message.replace(varRegex(i+1), item.param[i]);
        }
      }
      return message;
    },

    toString: function() {
      return 'The validation failed with ' + _.reduce(this.checkit.errors, function(memo, val) {
        memo += val.length;
        return memo;
      }, 0) + ' errors.';
    },

    // Creates a JSON object of the validations, if `true` is passed to `all` - it will
    // return an array for each object property, rather than the first failed validation.
    toJSON: function(all) {
      return _.reduce(this.checkit.errors, function(memo, val, key) {
        memo[key] = all ? this.get(key) : this.first(key);
        return memo;
      }, {}, this);
    }

  });

  // Regular expression for matching the `field_name` and `var_n`
  var labelRegex = /\{\{label\}\}/g;
  var varRegex   = function(i) { return new RegExp('{{var_' + i + '}}', 'g'); };

  // Object containing languages for the validations... Feel free to
  // add anything to this object.
  CheckIt.i18n = {

    en: {
      generic: 'Validation for {{label}} did not pass',

      // Custom Predicates
      isRequired: 'The {{label}} is required',
      isMinLength: 'The {{label}} must be at least {{var_1}} characters long',
      isMaxLength: 'The {{label}} must not exceed {{var_1}} characters long',
      isExactLength: 'The {{label}} must be exactly {{var_1}} characters long',
      isGreaterThan: 'The {{label}} must contain a number greater than {{var_1}}',
      isLessThan: 'The {{label}} must contain a number less than {{var_1}}',
      validEmail: 'The {{label}} must contain a valid email address',

      // Underscore Predicates
      isEqual: 'The {{label}} does not match {{var_1}}',
      isBoolean: 'The {{label}} must be type "boolean"',
      isEmpty: 'The {{label}} must be empty',
      isArray: 'The {{label}} must be an array',

      // Underscore-contrib Predicates
      isNumeric: 'The {{label}} must contain only numbers',
      isInteger: 'The {{label}} must contain an integer',
      isFloat: 'The {{label}} must contain a floating point number',

      // Regex specific messages.
      alpha: 'The {{label}} must only contain alphabetical characters',
      alphaDash: 'The {{label}} must only contain alpha-numeric characters, underscores, and dashes',
      alphaNumeric: 'The {{label}} must only contain alpha-numeric characters',
      alphaUnderscore: 'The {{label}} must only contain alpha-numeric characters, underscores, and dashes',
      natural: 'The {{label}} must contain only positive numbers',
      naturalNonZero: 'The {{label}} must contain a number greater than zero',
      ipv4: 'The {{label}} must contain a valid IPv4 string',
      base64: 'The {{label}} must contain a base64 string',
      luhn: 'The {{label}} must contain a valid credit card number',

      // If there is no validation provided for an item, use this generic line.
      fallback: 'Validation for {{label}} did not pass'
    }
  };

  return CheckIt;

}));