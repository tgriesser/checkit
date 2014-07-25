//     Checkit.js 0.2.0
//     http://tgriesser.com/checkit
//     (c) 2013 Tim Griesser
//     Checkit may be freely distributed under the MIT license.
(function(factory) {

"use strict";

factory(function(_, createError, Promise) {

  // The top level `Checkit` constructor, accepting the
  // `validations` to be run and any (optional) `options`.
  var Checkit = function(validations, options) {
    if (!(this instanceof Checkit)) {
      return new Checkit(validations, options);
    }
    options = _.clone(options || {});
    this.conditional = [];
    this.language    = options.language;
    this.labels      = options.labels || {};
    this.messages    = options.messages || {};
    this.validations = prepValidations(validations || {});
  };

  Checkit.VERSION = '0.2.0';

  Checkit.prototype = {

    // Possibly run a validations on this object, depending on the
    // result of the `conditional` handler.
    maybe: function(validations, conditional) {
      this.conditional.push([prepValidations(validations), conditional]);
      return this;
    },

    // Asynchronously runs a validation block, returning a promise
    // which resolves with the validated object items, or is rejected
    // with a `Checkit.Error` instance.
    run: function(target) {
      return new Checkit.Runner(this).run(target);
    }

  };

  // The default language for all validations, defaults to "en" which
  // is included with the library by default. To add additional languages,
  // add them to the `Checkit.i18n` object.
  Checkit.language = 'en';

  // Runs validation on an individual rule & value, for convenience.
  // e.g. `Checkit.check('email', 'foo@domain', 'email').then(...`
  Checkit.check = function(key, value, rules) {
    var input = {}, validations = {};
    input[key] = value;
    validations[key] = rules;
    return new Checkit(validations).run(input).then(null, function(err) {
      if (err instanceof Checkit.Error) throw err.get(key);
      throw err;
    });
  };

  // The validator is the object which is dispatched with the `run`
  // call from the `checkit.run` method.
  var Runner = Checkit.Runner = function(base) {
    this.errors      = {};
    this.base        = base;
    this.validations = _.clone(base.validations);
    this.conditional = base.conditional;
    this.language    = Checkit.i18n[base.language || Checkit.language];
    this.labelTransform = base.labelTransform || Checkit.labelTransform;
  };

  Runner.prototype = {

    // Runs the validations on a specified "target".
    run: function(target) {
      target = this.target = _.clone(target || {});
      var runner = this, validations = this.validations,
        errors = this.errors,
        pending = [];

      for (var i = 0, l = this.conditional.length; i < l; i++) {
        pending.push(this.checkConditional(this.conditional[i]));
      }

      return Checkit.Promise.all(pending).then(function() {

        // Use a fresh "pending" stack.
        var pending = [];

        // Loop through each of the `validations`, running
        // each of the validations associated with the `key`.
        for (var key in validations) {
          var validation = validations[key];
          for (var i = 0, l = validation.length; i < l; i++) {
            pending.push(runner.processItem.call(runner, validation[i], key));
          }
        }

        // Once all promise blocks have finished, we'll know whether
        // the promise should be rejected with an error or resolved with
        // the validated items.
        return Checkit.Promise.all(pending).then(function() {
          if (!_.isEmpty(errors)) {
            var err = new CheckitError(_.keys(errors).length + ' invalid values');
                err.errors = errors;
            throw err;
          }
          return _.pick.apply(_, [target].concat(_.keys(validations)));
        });

      });
    },

    // Runs through each of the `conditional` validations, and
    // merges them with the other validations if the condition passes;
    // either by returning `true` or a fulfilled promise.
    checkConditional: function(conditional) {
      var runner = this, validations = this.validations;
      return Checkit.Promise.resolve(true).then(function() {
        return conditional[1].call(runner, runner.target);
      }).then(function(result) {
        // Only if we explicitly return `true` do we go ahead
        // and add the validations to the stack for a particular rule.
        if (result === true) {
          var newVals = conditional[0];
          for (var key in newVals) {
            validations[key] = validations[key] || [];
            validations[key] = validations[key].concat(newVals[key]);
          }
        }
      // We don't need to worry about thrown errors or failed promises,
      // because they're just a sign we're not supposed to run this rule.
      }, function(err) {});
    },

    // Processes an individual item in the validation collection for the current
    // validation object. Returns the value from the completed validation, which will
    // be a boolean, or potentially a promise if the current object is an async validation.
    processItem: function(currentValidation, key) {
      var result;
      var runner  = this, errors  = this.errors;
      var value   = this.target[key];
      var rule    = currentValidation.rule;
      var params  = [value].concat(currentValidation.params);

      // If the rule isn't an existence / required check, return
      // true if the value doesn't exist.
      if (rule !== 'accepted' && rule !== 'exists' && rule !== 'required') {
        if (value === '' || value == null) return;
      }

      // Create a fulfilled promise, so we can safely
      // run any function and not have a thrown error mess up our day.
      return Checkit.Promise.resolve(true).then(function() {
        if (_.isFunction(rule)) {
          result = rule.apply(runner, params);
        } else if (Validators[rule]) {
          var v = new Validator(runner);
          result = v[rule].apply(v, params);
        } else if (_[rule]) {
          result = _[rule].apply(_, params);
        } else if (_['is' + capitalize(rule)]) {
          result = _['is' + capitalize(rule)].apply(_, params);
        } else if (Regex[rule]) {
          result = Regex[rule].test(value);
        } else {
          var valErr = new ValidationError('No validation defined for ' + rule);
              valErr.validationObject = currentValidation;
          throw valErr;
        }
        return result;

      // If the promise is fulfilled, but the value is explicitly `false`,
      // it's a failed validation... throw it as a `Checkit.ValidationError`.
      }).then(function(result) {
        if (_.isBoolean(result) && result === false) {
          throw new ValidationError(runner.getMessage(currentValidation, key));
        }
      // Finally, catch any errors thrown from in the validation.
      }).then(null, function(err) {
        var fieldError;
        if (!(fieldError = errors[key])) {
          fieldError = errors[key] = new FieldError(err);
          fieldError.key = key;
        }
        // Attach the "rule" in case we want to reference it.
        err.rule = rule;
        fieldError.errors.push(err);
      });
    },

    // Gets the formatted messaage for the validation error, depending
    // on what's passed and whatnot.
    getMessage: function(item, key) {
      var base     = this.base;
      var language = this.language;
      var label    = item.label   || base.labels[key] || language.labels[key] || this.labelTransform(key);
      var message  = item.message || base.messages[item.rule] || language.messages[item.rule] || language.messages.fallback;
      message = message.replace(labelRegex, label);
      for (var i = 0, l = item.params.length; i < l; i++) {
        message = message.replace(varRegex(i+1), item.params[i]);
      }
      return message;
    }
  };

  // All of the stock "Validator" functions
  // also attached as `Checkit.Validators` for easy access to add new validators.
  var Validators = Checkit.Validators = {

    // Check if the value is an "accepted" value, useful for form submissions.
    accepted: function(val) {
      return _.contains(this._language.accepted, val);
    },

    // The item must be a number between the given `min` and `max` values.
    between: function(val, min, max) {
      return (this.greaterThan(val, min) &&
        this.lessThan(val, max));
    },
    
    // The item must be a number equal or larger than the given `min` and
    // equal or smaller than the given `max` value.
    range: function(val, min, max) {
      return (this.greaterThanEqualTo(val, min) &&
        this.lessThanEqualTo(val, max));
    },    

    // Check that an item contains another item, either a string,
    // array, or object.
    contains: function(val, item) {
      if (_.isString(val)) return val.indexOf(item) !== -1;
      if (_.isArray(val))  return _.indexOf(val, item) !== -1;
      if (_.isObject(val)) return _.has(val, item);
      return false;
    },

    // The current value should be different than another field in the current
    // validation object.
    different: function(val, field) {
      return !this.matchesField(val, field);
    },

    // Check if two items are the exact same length
    exactLength: function(val, length) {
      return checkInt(length) || val.length === parseInt(length, 10);
    },

    // Key must not be `undefined`.
    exists: function(val) {
      return val !== void 0;
    },

    // Field is required and not empty (zero does not count as empty).
    required: function(val) {
      return (val != null && val !== '' ? true : false);
    },

    // Matches another named field in the current validation object.
    matchesField: function(val, field) {
      return _.isEqual(val, this._target[field]);
    },

    // Check that an item is a minimum length
    minLength: function(val, length) {
      return checkInt(length) || val.length >= length;
    },

    // Check that an item is less than a length
    maxLength: function(val, length) {
      return checkInt(length) || val.length <= length;
    },

    // Check if one items is greater than another
    greaterThan: function(val, param) {
      return checkNumber(val) || checkNumber(param) || parseFloat(val) > parseFloat(param);
    },

    // Check if one items is greater than or equal to another
    greaterThanEqualTo: function(val, param) {
      return checkNumber(val) || checkNumber(param) || parseFloat(val) >= parseFloat(param);
    },

    // Check if one item is less than another
    lessThan: function(val, param) {
      return checkNumber(val) || checkNumber(param) || parseFloat(val) < parseFloat(param);
    },

    // Check if one item is less than or equal to another
    lessThanEqualTo: function(val, param) {
      return checkNumber(val) || checkNumber(param) || parseFloat(val) <= parseFloat(param);
    },

    // Check if this item is a plain object, defaulting to the lodash check,
    // otherwise using a simple underscore fallback.
    isPlainObject: function(val) {
      return _.isPlainObject ? _.isPlainObject.apply(this, arguments) :
        (_.isObject(val) && !_.isFunction(val) && !_.isArray(val));
    },

    // Check if the value is numeric
    numeric: function(val) {
      return !isNaN(parseFloat(val)) && isFinite(val);
    }

  };

  // Constructor for running the `Validations`.
  var Validator = Checkit.Validator = function(runner) {
    this._language = runner.language;
    this._target   = runner.target;
  };
  Validator.prototype = Validators;

  // Validation helpers & regex

  function checkInt(val) {
    if (!val.match(Regex.integer))
      throw new Error("The validator argument must be a valid integer");
  }

  function checkNumber(val) {
    if (!Validators.numeric(val))
      throw new Error("The validator argument must be a valid number");
  }

  function checkString(val) {
    if (!_.isString(val))
      throw new Error("The validator argument must be a valid string");
  }

  // Standard regular expression validators.
  var Regex = Checkit.Regex = {
    alpha: /^[a-z]+$/i,
    alphaDash: /^[a-z0-9_\-]+$/i,
    alphaNumeric: /^[a-z0-9]+$/i,
    alphaUnderscore: /^[a-z0-9_]+$/i,
    base64: /^(?:[A-Za-z0-9+\/]{4})*(?:[A-Za-z0-9+\/]{2}==|[A-Za-z0-9+\/]{3}=)?$/,
    email: /^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,6}$/i,
    integer: /^\-?[0-9]+$/,
    ipv4: /^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})$/i,
    ipv6: /^((?=.*::)(?!.*::.+::)(::)?([\dA-F]{1,4}:(:|\b)|){5}|([\dA-F]{1,4}:){6})((([\dA-F]{1,4}((?!\3)::|:\b|$))|(?!\2\3)){2}|(((2[0-4]|1\d|[1-9])?\d|25[0-5])\.?\b){4})$/i,
    luhn: /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$/,
    natural: /^[0-9]+$/i,
    naturalNonZero: /^[1-9][0-9]*$/i,
    url: /^((http|https):\/\/(\w+:{0,1}\w*@)?(\S+)|)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/,
    uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  };

  // An error for an individual "validation", where one or more "validations"
  // make up a single ruleset. These are grouped together into a `FieldError`.
  var ValidationError = Checkit.ValidationError = createError('ValidationError');

  // An `Error` object specific to an individual field,
  // useful in the `Checkit.check` method when you're only
  // validating an individual field. It contains an "errors"
  // array which keeps track of any falidations
  var FieldError = Checkit.FieldError = createError('FieldError', {errors: []});

  _.extend(FieldError.prototype, {

    // Call `toString` on the current field, which should
    // turn the error into the format:
    toString: function(flat) {
      var errors = flat ? [this.errors[0]] : this.errors;
      return this.key + ': ' +
        _.pluck(errors, 'message').join(', ');
    },

    // Returns the current error in json format, by calling `toJSON`
    // on the error, if there is one, otherwise returning the message.
    toJSON: function() {
      return this.map(function(err) {
        if (err.toJSON) return err.toJSON();
        return err.message;
      });
    }

  });

  // An object that inherits from the `Error` prototype,
  // but contains methods for working with the individual errors
  // created by the failed Checkit validation object.
  var CheckitError = Checkit.Error = createError('CheckitError', {errors: {}});

  _.extend(CheckitError.prototype, {

    get: function(name) {
      return this.errors[name];
    },

    // Convert the current error object toString, by stringifying the JSON representation
    // of the object.
    toString: function(flat) {
      return 'Checkit Errors - ' + this.invoke('toString', flat).join('; ');
    },

    // Creates a JSON object of the validations, if `true` is passed - it will
    // flatten the error into a single value per item.
    toJSON: function(flat) {
      return this.reduce(function(memo, val, key) {
        memo[key] = val.toJSON();
        return memo;
      }, {});
    }

  });

  // Similar to a Backbone.js `Model` or `Collection`, we'll mixin the underscore
  // methods that make sense to act on `CheckitError.errors` or `FieldError.errors`.
  var objMethods   = ['keys', 'values', 'pairs', 'invert', 'pick', 'omit'];
  var arrMethods   = ['first', 'initial', 'rest', 'last'];
  var shareMethods = ['forEach', 'each', 'map', 'reduce', 'reduceRight',
    'find', 'filter', 'reject', 'invoke', 'toArray', 'size', 'shuffle'];

  _.each(shareMethods.concat(objMethods), function(method) {
    CheckitError.prototype[method] = function() {
      return _[method].apply(_, [this.errors].concat(_.toArray(arguments)));
    };
  });
  _.each(shareMethods.concat(arrMethods), function(method) {
    FieldError.prototype[method] = function() {
      return _[method].apply(_, [this.errors].concat(_.toArray(arguments)));
    };
  });

  // Used to transform the label before using it, can be
  // set globally or in the `options` for the Checkit object.
  Checkit.labelTransform = function(label) {
    return label;
  };

  // Object containing languages for the validations... Feel free to
  // add anything to this object.
  Checkit.i18n = {

    en: {

      accepted: ['on', 'yes', 1, '1', true, 'true'],

      labels: {},

      messages: {

        // Custom Predicates
        email: 'The {{label}} must be a valid email address',
        exactLength: 'The {{label}} must be exactly {{var_1}} characters long',
        exists: 'The {{label}} must be defined',
        required: 'The {{label}} is required',
        minLength: 'The {{label}} must be at least {{var_1}} characters long',
        maxLength: 'The {{label}} must not exceed {{var_1}} characters long',
        lessThan: 'The {{label}} must be a number less than {{var_1}}',
        lessThanEqualTo: 'The {{label}} must be a number less than or equal to {{var_1}}',
        greaterThan: 'The {{label}} must be a number greater than {{var_1}}',
        greaterThanEqualTo: 'The {{label}} must be a number greater than or equal to {{var_1}}',
        numeric: 'The {{label}} must be a numeric value',
        matchesField: 'The {{label}} must exactly match the {{var_1}}',
        different: 'The {{label}} must be different than the {{var_1}}',

        // Underscore Predicates
        date: 'The {{label}} must be a Date',
        equal: 'The {{label}} does not match {{var_1}}',
        'boolean': 'The {{label}} must be type "boolean"',
        empty: 'The {{label}} must be empty',
        array: 'The {{label}} must be an array',

        // Regex specific messages.
        alpha: 'The {{label}} must only contain alphabetical characters',
        alphaDash: 'The {{label}} must only contain alpha-numeric characters, underscores, and dashes',
        alphaNumeric: 'The {{label}} must only contain alpha-numeric characters',
        alphaUnderscore: 'The {{label}} must only contain alpha-numeric characters, underscores, and dashes',
        natural: 'The {{label}} must be a positive number',
        naturalNonZero: 'The {{label}} must be a number greater than zero',
        ipv4: 'The {{label}} must be a valid IPv4 string',
        ipv6: 'The {{label}} must be a valid IPv6 address',
        base64: 'The {{label}} must be a base64 string',
        luhn: 'The {{label}} must be a valid credit card number',
        uuid: 'The {{label}} must be a valid uuid',

        // If there is no validation provided for an item, use this generic line.
        fallback: 'Validation for {{label}} did not pass'
      }
    }
  };

  // Assorted Helper Items:
  // --------------------------

  // Regular expression for matching the `field_name` and `var_n`
  var labelRegex = /\{\{label\}\}/g;
  function varRegex(i) { return new RegExp('{{var_' + i + '}}', 'g'); }

  // Simple capitalize helper.
  function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }

  // Preps the validations being sent to the `run` block, to standardize
  // the format and allow for maximum flexibility when passing to the
  // validation blocks.
  function prepValidations(validations) {
    validations = _.clone(validations);
    for (var key in validations) {
      var validation = validations[key];
      if (!_.isArray(validation)) validations[key] = validation = [validation];
      for (var i = 0, l = validation.length; i < l; i++) {
        validation[i] = assembleValidation(validation[i]);
      }
    }
    return validations;
  }

  // Turns the current validation item into an object literal,
  // containing the rule, any arguments split from the `:` delimeter,
  // and the
  function assembleValidation(validation) {
    if (!Validators.isPlainObject(validation)) {
      validation = {rule: validation, params: []};
    }
    if (_.isString(validation.rule)) {
      var splitRule = validation.rule.split(':');
      validation.rule = splitRule[0];
      if (_.isEmpty(validation.params)) {
        validation.params = _.rest(splitRule);
      }
    } else if (!_.isFunction(validation.rule)) {
      throw new TypeError('Invalid validation');
    }
    return validation;
  }

  Checkit.Promise = Promise;

  return Checkit;
});

// Boilerplate UMD definition block...
// get the correct dependencies and initialize everything.
})(function(checkitLib) {

  // AMD setup
  if (typeof define === 'function' && define.amd) {
    define(['lodash', 'create-error', 'bluebird'], checkitLib);
  // CJS setup
  } else if (typeof exports === 'object') {
    module.exports = checkitLib(require('lodash'), require('create-error'), require('bluebird'));
  // Browser globals
  } else {
    var root = this;
    var Checkit = root.Checkit = checkitLib(root._, root.createError, root.Promise);
    Checkit.noConflict = function() {
      root.checkit = lastCheckit;
      return checkit;
    };
  }

});
