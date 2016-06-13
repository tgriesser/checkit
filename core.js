//     Checkit.js 0.6.0
//     http://tgriesser.com/checkit
//     (c) 2013-2015 Tim Griesser
//     Checkit may be freely distributed under the MIT license.
module.exports = function(_, Promise) {

var inherits = require('inherits')

// The top level `Checkit` constructor, accepting the
// `validations` to be run and any additional `options`.
function Checkit(validations, options) {
  if (!(this instanceof Checkit)) {
    return new Checkit(validations, options);
  }
  this.conditional    = [];
  options             = _.clone(options || {});
  this.labels         = options.labels   || {};
  this.messages       = options.messages || {};
  this.language       = Checkit.i18n[options.language || Checkit.language] || {};
  this.labelTransform = options.labelTransform || Checkit.labelTransform
  this.validations    = prepValidations(validations || {});
}

Checkit.VERSION = '0.6.0';

// Possibly run a validations on this object, depending on the
// result of the `conditional` handler.
Checkit.prototype.maybe = function(validations, conditional) {
  this.conditional.push([prepValidations(validations), conditional]);
  return this;
}

// Asynchronously runs a validation block, returning a promise
// which resolves with the validated object items, or is rejected
// with a `Checkit.Error`
Checkit.prototype.run =
Checkit.prototype.validate = function(target, context) {
  return new Runner(this, target, context).run();
}

// Synchronously runs a validation block, returning an object of all fields
// validated, or throwing a `Checkit.Error` object.
Checkit.prototype.runSync =
Checkit.prototype.validateSync = function(target, context) {
  try  {
    return [null, new SyncRunner(this, target, context).run()]
  } catch (err) {
    return [err, null]
  }
}

Checkit.prototype.getMessage = function(item, key) {
  var language = this.language;
  var label    = item.label   || this.labels[key] || language.labels[key] || this.labelTransform(key);
  var message  = item.message || this.messages[item.rule] || language.messages[item.rule] || language.messages.fallback;
  message = message.replace(labelRegex, label);
  for (var i = 0, l = item.params.length; i < l; i++) {
    message = message.replace(varRegex(i+1), item.params[i]);
  }
  return message;
}

// Used to transform the label before using it, can be
// set globally or in the `options` for the Checkit object.
Checkit.labelTransform = function(label) {
  return label;
}

// Object containing languages for the validations... Feel free to
// add anything to this object.
Checkit.i18n = {
  en: require('./lang/en'),
  es: require('./lang/es'),
  ru: require('./lang/ru'),
  fr: require('./lang/fr')
}

// The default language for all validations, defaults to "en" which
// is included with the library by default. To add additional languages,
// add them to the `Checkit.i18n` object.
Checkit.language = 'en';

// Runs validation on an individual rule & value, for convenience.
// e.g. `Checkit.check('email', 'foo@domain', 'email').then(...`
Checkit.check = function(key, value, rules, sync) {
  var input = {}, validations = {};
  input[key] = value;
  validations[key] = rules;
  if (sync) {
    return checkSync(validations, input, key)
  } else {
    return new Checkit(validations).run(input).then(null, function(err) {
      if (err instanceof CheckitError) throw err.get(key);
      throw err
    })
  }
}
Checkit.checkSync = function(key, value, rules) {
  return Checkit.check(key, value, rules, true)
}

// Synchronously check an individual field against a rule.
function checkSync(validations, input, key) {
  var arr = new Checkit(validations).runSync(input);
  if (arr[0] === null) return arr;
  if (arr[0] instanceof CheckitError) {
    return [arr[0].get(key), null]
  }
  return arr;
}

// The validator is the object which is dispatched with the `run`
// call from the `checkit.run` method.
function Runner(checkit, target, context) {
  this.errors         = {};
  this.checkit        = checkit;
  this.conditional    = checkit.conditional;
  this.target         = _.clone(target || {})
  this.context        = _.clone(context || {})
  this.validator      = new Validator(this.target, checkit.language)
}

// Runs the validations on a specified "target".
Runner.prototype.run = function(target, context) {
  var runner  = this;
  var target  = this.target
  var context = this.context

  var validationHash = _.clone(this.checkit.validations);
  var errors         = {}

  var pendingConditionals = _.map(this.conditional, function(conditional) {
    return Promise.resolve(checkConditional(runner, conditional))
      .then(function(result) {
        if (result !== true) return;
        addVerifiedConditional(validationHash, conditional)
      })
      .catch(function() {})
  })

  return Promise.all(pendingConditionals)
    .then(function() {
      var pending = []
      _.each(validationHash, function(validations, key) {
        _.each(validations, function(validation) {
          pending.push(processItemAsync(runner, validation, key, context).catch(addError(errors, key, validation)))
        })
      })
      return Promise.all(pending)
    })
    .then(function() {
      if (!_.isEmpty(errors)) {
        var err = new CheckitError(_.keys(errors).length + ' invalid values');
            err.errors = errors;
        throw err;
      }
      return _.pick(target, _.keys(validationHash));
    });
};

// Only if we explicitly return `true` do we go ahead
// and add the validations to the stack for a particular rule.
function addVerifiedConditional(validations, conditional) {
  _.each(conditional[0], function(val, key) {
    validations[key] = validations[key] || [];
    validations[key] = validations[key].concat(val);
  })
}

// Runs through each of the `conditional` validations, and
// merges them with the other validations if the condition passes;
// either by returning `true` or a fulfilled promise.
function checkConditional(runner, conditional) {
  try {
    return conditional[1].call(runner, runner.target);
  } catch (e) {}
}

// Get value corresponding to key containing "." from nested object.
// If key containing "." is proper in object (e.g. {"foo.bar": 100}) return 100.
function getVal(target, key){
  var value = _.clone(target), keys;
  if(value[key]) return value[key];
  if((keys = key.split('.')).length === 0) return undefined;
  while(keys.length > 0){
    value = value[keys.shift()];
  }
  return value;
}

function processItem(runner, currentValidation, key, context) {
  var value   = getVal(runner.target, key);
  var rule    = currentValidation.rule;
  var params  = [value].concat(currentValidation.params).concat(context);

  // If the rule isn't an existence / required check, return
  // true if the value doesn't exist.
  if (rule !== 'accepted' && rule !== 'exists' && rule !== 'required') {
    if (value === '' || value == null) return;
  }
  var result = runRule(runner.validator, runner, rule, params)
  if (_.isBoolean(result) && result === false) {
    throw new ValidationError(runner.checkit.getMessage(currentValidation, key));
  }
  return result;
}

// Processes an individual item in the validation collection for the current
// validation object. Returns the value from the completed validation, which will
// be a boolean, or potentially a promise if the current object is an async validation.
function processItemAsync(runner, currentValidation, key, context) {
  return Promise.resolve(true).then(function() {
    return processItem(runner, currentValidation, key, context)
  });
}

function addError(errors, key, validation) {
  return function(err) {
    var fieldError = errors[key];
    if (!fieldError) {
      fieldError = errors[key] = new FieldError(err.message)
      fieldError.key = key
    }
    err.rule = validation.rule
    fieldError.errors.push(err);
  }
}

function runRule(validator, runner, rule, params) {
  var result;
  if (_.isFunction(rule)) {
    result = rule.apply(runner, params);
  }
  else if (typeof validator[rule] === 'function') {
    result = validator[rule].apply(validator, params);
  }
  else if (typeof _[rule] === 'function') {
    result = _[rule].apply(_, params);
  }
  else if (Checkit.Regex[rule]) {
    result = Checkit.Regex[rule].test(params[0]);
  }
  else if (typeof _['is' + capitalize(rule)] === 'function') {
    result = _['is' + capitalize(rule)].apply(_, params);
  }
  else {
    throw new ValidationError('No validation defined for ' + rule);
  }
  return result;
}

function SyncRunner() {
  Runner.apply(this, arguments)
}
inherits(SyncRunner, Runner)

// Runs the validations on a specified "target".
SyncRunner.prototype.run = function() {
  var runner = this;
  var target = this.target;
  var context = this.context;
  var validationHash = _.clone(this.checkit.validations);
  var errors         = {}

  _.each(this.conditional, function(conditional) {
    var result = checkConditional(runner, conditional)
    if (result !== true) return;
    addVerifiedConditional(validationHash, conditional)
  })

  _.each(validationHash, function(validations, key) {
    _.each(validations, function(validation) {
      try {
        processItem(runner, validation, key, context)
      } catch(err) {
        addError(errors, key, validation)(err)
      }
    })
  })

  if (!_.isEmpty(errors)) {
    var err = new CheckitError(_.keys(errors).length + ' invalid values');
        err.errors = errors;
    throw err;
  }

  return _.pick(target, _.keys(validationHash));
}

// Constructor for running the `Validations`.
function Validator(target, language) {
  this._target = target
  this._language = language
}

_.extend(Validator.prototype, {

  // Check if the value is an "accepted" value, useful for form submissions.
  accepted: function(val) {
    return _.includes(this._language.accepted, val);
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

  // Check if the value is a string
  string: function(val) {
    return (typeof val === 'string');
  },

  // Check if the value is numeric
  numeric: numeric

})

// Validation helpers & regex

function checkInt(val) {
  if (!val.match(Regex.integer))
    throw new Error('The validator argument must be a valid integer');
}

function checkNumber(val) {
  if (!numeric(val))
    throw new Error('The validator argument must be a valid number');
}

function numeric(val) {
  return !isNaN(parseFloat(val)) && isFinite(val);
}

// Standard regular expression validators.
var Regex = Checkit.Regex = {
  alpha: /^[a-z]+$/i,
  alphaDash: /^[a-z0-9_\-]+$/i,
  alphaNumeric: /^[a-z0-9]+$/i,
  alphaUnderscore: /^[a-z0-9_]+$/i,
  base64: /^(?:[A-Za-z0-9+\/]{4})*(?:[A-Za-z0-9+\/]{2}==|[A-Za-z0-9+\/]{3}=)?$/,
  email: /^(.+)@(.+)\.(.+)$/i,
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


// An error for an individual "validation", where one or more "validations"
// make up a single ruleset. These are grouped together into a `FieldError`.
function ValidationError(message) {
  this.message = message
}
ValidationError.prototype = new Error;
ValidationError.prototype.toString = function() {
  return this.message
}

// An `Error` object specific to an individual field,
// useful in the `Checkit.check` method when you're only
// validating an individual field. It contains an "errors"
// array which keeps track of any falidations
function FieldError(message) {
  this.message = message
  this.errors  = []
}

FieldError.prototype = new Error;

_.extend(FieldError.prototype, {

  // Call `toString` on the current field, which should
  // turn the error into the format:
  toString: function(flat) {
    var errors = flat ? [this.errors[0]] : this.errors;
    return this.key + ': ' +
      _.map(errors, 'message').join(', ');
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
function CheckitError(message) {
  this.message = message;
  this.errors  = {}
}

CheckitError.prototype = new Error();

_.extend(CheckitError.prototype, {

  get: function(name) {
    return this.errors[name];
  },

  // Convert the current error object toString, by stringifying the JSON representation
  // of the object.
  toString: function(flat) {
    return 'Checkit Errors - ' + this.invokeMap('toString', flat).join('; ');
  },

  // Creates a JSON object of the validations, if `true` is passed - it will
  // flatten the error into a single value per item.
  toJSON: function(flat) {
    return this.transform(function(acc, val, key) {
      var json = val.toJSON();
      acc[key] = flat && _.isArray(json) ? json[0] : json
    }, {});
  }

});

// Similar to a Backbone.js `Model` or `Collection`, we'll mixin the underscore
// methods that make sense to act on `CheckitError.errors` or `FieldError.errors`.
var objMethods   = ['keys', 'values', 'toPairs', 'invert', 'pick', 'omit'];
var arrMethods   = ['head', 'initial', 'tail', 'last'];
var shareMethods = ['forEach', 'each', 'map', 'reduce', 'transform', 'reduceRight',
  'find', 'filter', 'reject', 'invokeMap', 'toArray', 'size', 'shuffle'];

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
  validations = _.cloneDeep(validations);
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
// containing the rule, any arguments split from the `:` delimeter
function assembleValidation(validation) {
  if (!_.isPlainObject(validation)) {
    validation = {rule: validation, params: []};
  }
  if (_.isString(validation.rule)) {
    var splitRule = validation.rule.split(':');
    validation.rule = splitRule[0];
    if (_.isEmpty(validation.params)) {
      validation.params = _.tail(splitRule);
    }
  } else if (!_.isFunction(validation.rule)) {
    throw new TypeError('Invalid validation');
  }
  return validation;
}

Checkit.FieldError      = FieldError
Checkit.Error           = CheckitError
Checkit.ValidationError = ValidationError
Checkit.Runner          = Runner
Checkit.SyncRunner      = SyncRunner
Checkit.Validator       = Validator

return Checkit;

}
