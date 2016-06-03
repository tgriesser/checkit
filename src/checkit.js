//     Checkit.js 0.6.0
//     http://tgriesser.com/checkit
//     (c) 2013-2015 Tim Griesser
//     Checkit may be freely distributed under the MIT license.
'use strict';

const co = require('co')
const _ = require('lodash')
const Err = require('es6-error')

// The top level `Checkit` constructor, accepting the
// `validations` to be run and any additional `options`.
class Checkit {

  constructor(validations = {}, options = {}) {
    this.options = _.assign({
      single: false,
      failFast: false,
      language: checkit.i18n[options.language || checkit.language] || {},
      labels: {},
      messages: {},
      labelTransform: options.labelTransform || checkit.labelTransform
    }, options)
    this.conditional = [];
    this.validations = prepValidations(validations, this.options);
  }

  // Asynchronously runs a validation block, returning a promise
  // which resolves with the validated object items, or is rejected
  // with a `Checkit.Error`
  run(target, context) {
    return asyncValidationRunner(this, target, context).then(result => {
      if (!_.isEmpty(result.errors)) {
        throw new CheckitError(result.errors)
      }
      return result.validated
    })
  }

  // Synchronously runs a validation block, returning an object of all fields
  // validated, or throwing a `Checkit.Error` object.
  runSync(target, context) {
    const runner = validationRunner(this, target, context)
    let tmp, result
    while (true) { // eslint-disable-line
      tmp = runner.next(tmp && tmp.value)
      if (tmp.done) {
        result = tmp.value
        break;
      }
      if (typeof tmp.value.then === 'function') {
        console.error( //eslint-disable-line
          new Error('Trying to process an async validation synchronously')
        )
      }
    }
    if (!_.isEmpty(result.errors)) {
      return [new CheckitError(result.errors)]
    }
    return [null, result.validated]
  }

  // Alias for .run
  validate(target, context) {
    return this.run(target, context)
  }
  // Alias for .runSync
  validateSync(target, context) {
    return this.runSync(target, context)
  }

  // Possibly run a validations on this object, depending on the
  // result of the `conditional` handler.
  maybe(validations = {}, conditional) {
    this.conditional.push([conditional, prepValidations(validations, this.options)]);
    return this;
  }

  requirements() {
    const req = {}
    for (const key in this.validations) {
      req[key] = this.validations[key].map(v => v.message)
    }
    return req
  }

}

function checkit(validations, options) {
  return new Checkit(validations, options)
}

// The default language for all validations, defaults to "en" which
// is included with the library by default. To add additional languages,
// add them to the `Checkit.i18n` object.
checkit.language = 'en'

// Make a an individual key & rule, for convenience:
// e.g. `
//   const rule = checkit.single('email', 'email')
//   rule('foo@bar.com')
// `
checkit.single = function(key, rules, options) {
  const c = checkit({[key]: rules}, options)
  function fn(value) {
    return c.run({[key]: value}).catch(err => {
      if (err instanceof CheckitError) {
        throw err.get(key)
      }
      throw err
    })
  }
  fn.requirements = () => _.get(c.requirements(), key)
  return fn
}
checkit.singleSync = function(key, rules, options) {
  const c = checkit({[key]: rules}, options)
  function fn(value) {
    const [err, val] = c.runSync({[key]: value})
    return err === null
      ? [err, val]
      : [err instanceof CheckitError ? err.get(key) : err, val]
  }
  fn.requirements = () => _.get(c.requirements(), key)
  return fn
}

// Runs validation on an individual rule & value, for convenience.
// e.g. `Checkit.check('email', 'foo@domain', 'email').then(...`
checkit.check = function(key, value, rules, options) {
  return checkit.single(key, rules, options)(value)
}
checkit.checkSync = function(key, value, rules, options) {
  return checkit.singleSync(key, rules, options)(value)
}

// Used to transform the label before using it, can be
// set globally or in the `options` for the Checkit object.
checkit.labelTransform = function(label) {
  return label;
}

// Object containing languages for the validations... Feel free to
// add anything to this object.
checkit.i18n = {
  en: require('../lang/en'),
  es: require('../lang/es'),
  ru: require('../lang/ru'),
  fr: require('../lang/fr')
}

checkit.addRule = function(name, fn, replace) {
  if (!replace) maybeAdd(name, checkit.validators, '')
  checkit.validators[name] = fn
  return checkit
}
checkit.addRefRule = function(name, fn, replace) {
  if (!replace) maybeAdd(name, checkit.refValidators, 'ref ')
  function wrapper() {
    return fn(...arguments)
  }
  wrapper.ref = REF
  checkit.refValidators[name] = wrapper
  return checkit
}

function maybeAdd(name, target, type) {
  if (target.hasOwnProperty(name)) {
    throw new TypeError(`
      Cannot replace existing validation ${type}rule ${name}
      without passing true as the third argument
    `)
  }
}

// The validator is the object which is dispatched with the `run`
// call from the `checkit.run` method.
// Runs the validations on a specified "target".
function* validationRunner(checkit, target, context = {}, isAsync = false) {
  const {conditional, options, validations} = checkit
  const {single, failFast} = options
  const validated = {}
  const errors = {}

  function addError(key, {message, label, params}) {
    const msg = formatMessage(label, message, params)
    errors[key] = errors[key] || new FieldError(msg, key, single)
    errors[key].errors.push(new ValidationError(msg))
  }

  const valKeys = Object.keys(validations)

  // Processes an individual item in the validation collection for the current
  // validation object. Returns the value from the completed validation, which will
  // be a boolean, or potentially a promise if the current object is an async validation.
  for (let i = 0, l = valKeys.length; i < l; i++) {
    const key = valKeys[i]
    const validationItems = validations[key]
    for (let i2 = 0, l2 = validationItems.length; i2 < l2; i2++) {
      const validation = validationItems[i2]
      try {
        const passed = yield processRule(key, target, validation, options, context)
        if (passed === false) {
          addError(key, validation)
          if (single) break;
        }
      } catch (e) {
        maybeRethrow(e)
        addError(key, validation, e)
        if (failFast) {
          return {errors}
        }
        if (single) break;
      }
    }
    if (!_.get(errors, key)) {
      validated[key] = target[key]
    }
  }

  // Runs through each of the `conditional` validations, and
  // merges them with the other validations if the condition passes;
  // either by returning `true` or a fulfilled promise.
  if (conditional && conditional.length > 0) {
    for (let i = 0, l = conditional.length; i < l; i++) {
      let result; const [predicate, validate] = conditional[i]
      try {
        result = yield predicate.call(context, target)
      } catch (e) {
        maybeRethrow(e)
      } finally {
        if (result !== true) continue;
        const c = {validations: validate, options}
        const val = yield* isAsync
          ? asyncValidationRunner(c, target, context)
          : validationRunner(c, target, context)
        if (failFast && !_.isEmpty(val.errors)) {
          return val
        }
        if (!_.isEmpty(val.errors)) {
          _.each(val.errors, (v, k) => {
            errors[k] = errors[k] ? errors[k].errors.concat(v.errors) : v
          })
        }
        _.assign(validated, val.validated)
      }
    }
  }
  return {
    errors,
    validated
  }
}

const asyncValidationRunner = co.wrap(function* (checkit, target, context) {
  const iterator = validationRunner(checkit, target, context, true)
  let tmp, returnVal
  while (true) { //eslint-disable-line
    tmp = iterator.next(tmp.value)
    tmp = tmp.value && typeof tmp.value.then === 'function'
      ? yield tmp
      : yield Promise.resolve(tmp)
    if (tmp.done) {
      returnVal = tmp.value
      break;
    }
  }
  return returnVal
})

function maybeRethrow(e) {
  if (e instanceof TypeError) {
    process.nextTick(() => {
      throw e
    })
  }
}

// Get value corresponding to key containing "." from nested object.
// If key containing "." is proper in object (e.g. {"foo.bar": 100}) return 100.
function processRule(key, target, validation, options, context) {
  const value = _.get(target, key)
  const {rule, params, ruleFn} = validation
  const fn = ruleFn.ref === REF ? ruleFn(target) : ruleFn

  // If the rule isn't an existence / required check, return
  // true if the value doesn't exist.
  if (rule !== 'accepted' && rule !== 'exists' && rule !== 'required') {
    if (value === '' || value === null || value === undefined) {
      return;
    }
  }
  return fn.apply(context, [value, ...params].concat(context))
}

function getRule(rule, options) {
  if (rule === 'accepted') {
    return makeAccepted(options.language.accepted || DEFAULT_ACCEPTED)
  }
  if (typeof checkit.validators[rule] === 'function') {
    return checkit.validators[rule]
  }
  if (checkit.Regex[rule]) {
    const regex = checkit.Regex[rule]
    return val => regex.test(val)
  }
  if (checkit.refValidators[rule]) {
    return checkit.refValidators[rule]
  }
  if (typeof _['is' + _.capitalize(rule)] === 'function') {
    return _['is' + _.capitalize(rule)]
  }
  if (typeof _[rule] === 'function') {
    return _[rule]
  }
  throw new TypeError('No validation defined for rule: ' + rule);
}

// Checkit Predicates:

// Check if the value is an "accepted" value, useful for form submissions.
function makeAccepted(acceptedValues) {
  return function accepted(val) {
    return _.includes(acceptedValues, val);
  }
}

const REF = {}
const DEFAULT_ACCEPTED = ['on', 'yes', 1, '1', true, 'true']

const accepted = makeAccepted(DEFAULT_ACCEPTED)

// The item must be a number between the given `min` and `max` values.
function between(val, min, max) {
  return (greaterThan(val, min) && lessThan(val, max));
}

// The item must be a number equal or larger than the given `min` and
// equal or smaller than the given `max` value.
function range(val, min, max) {
  return (greaterThanEqualTo(val, min) && lessThanEqualTo(val, max));
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
  return function(val, field) {
    return !_.isEqual(val, obj[field]);
  }
}
different.ref = REF

// Matches another named field in the current validation object.
function matchesField(obj) {
  return function(val, field) {
    return _.isEqual(val, obj[field]);
  }
}
different.ref = REF

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
  return (val != null && val !== '' ? true : false);
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
  return (typeof val === 'string');
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
const Regex = checkit.Regex = {
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
class CheckitError extends Err {

  constructor(errors) {
    super(...arguments)
    this.errors = errors
  }

  get(name) {
    return this.errors[name];
  }

  // Convert the current error object toString, by stringifying the JSON representation
  // of the object.
  toString() {
    return _.values(this.errors).map(e => e.toString()).join('\n');
  }

  // Creates a JSON object of the validations, if `true` is passed - it will
  // flatten the error into a single value per item.
  toJSON() {
    const json = {}
    for (const key in this.errors) {
      const err = this.errors[key]
      if (typeof err.toJSON === 'function') {
        json[key] = err.toJSON()
      } else {
        json[key] = err.message
      }
    }
    return json
  }

}

// An `Error` object specific to an individual field,
// useful in the `Checkit.check` method when you're only
// validating an individual field. It contains an "errors"
// array which keeps track of any falidations
class FieldError extends Err {

  constructor(message, key, single) {
    super(message)
    this.key = key
    this.errors = []
    this._single = single
  }

  // Call `toString` on the current field, which should
  // turn the error into the format:
  toString() {
    const errors = this._single ? this.errors.slice(0, 1) : this.errors;
    return this.key + ': ' + errors.map(e => e.message).join(', ')
  }

  // Returns the current error in json format, by calling `toJSON`
  // on the error, if there is one, otherwise returning the message.
  toJSON() {
    const result = this.errors.map(err => {
      return typeof err.toJSON === 'function'
        ? err.toJSON()
        : err.message
    })
    return this._single ? result[0] : result
  }

}

class ValidationError extends Err {}

// Assorted Helper Items:
// --------------------------

// Regular expression for matching the `field_name` and `var_n`
const labelRegex = /\{\{label\}\}/g;
function varRegex(i) {
  return new RegExp('{{var_' + i + '}}', 'g')
}

// Preps the validations being sent to the `run` block, to standardize
// the format and allow for maximum flexibility when passing to the
// validation blocks.
function prepValidations(validations, options) {
  const preparedValidations = {}
  for (const key in validations) {
    const validation = validations[key]
    preparedValidations[key] = _.isArray(validation)
      ? validation.filter(_.identity).map(v => assembleValidation(key, v, options))
      : [assembleValidation(key, validation, options)]
  }
  return preparedValidations;
}

function getLabel(key, options) {
  const {labels, language: {labels: languageLabels}, labelTransform} = options
  return labels[key] || languageLabels[key] || labelTransform(key);
}
function getMessage(key, options) {
  const {messages, language: {messages: languageMessages}} = options
  return messages[key] || languageMessages[key] || languageMessages.fallback;
}
function formatMessage(label, message, params) {
  message = message.replace(labelRegex, label);
  for (let i = 0, l = params.length; i < l; i++) {
    message = message.replace(varRegex(i + 1), params[i]);
  }
  return message;
}

// Turns the current validation item into an object literal,
// containing the rule, any arguments split from the `:` delimeter
function assembleValidation(key, validation, options) {
  let rule, ruleFn, label = key, params = []
  if (_.isString(validation)) {
    [rule, ...params] = validation.split(':');
    validation = {
      rule,
      params
    }
  }
  if (_.isFunction(validation)) {
    validation = {
      rule: validation
    }
  }
  if (!_.isPlainObject(validation)) {
    throw new TypeError('Expected validation to be an object, saw ' + validation)
  }

  rule = validation.rule
  if (_.isArray(validation.params)) {
    params = validation.params
  }
  if (_.isString(rule)) {
    if (!_.isArray(validation.params)) {
      [rule, ...params] = rule.split(':')
    }
    ruleFn = getRule(rule, options)
  }
  if (_.isFunction(validation.rule)) {
    rule = 'Function'
    ruleFn = validation.rule
  }
  label = validation.label || ruleFn.label || getLabel(key, options)
  const message = validation.message || ruleFn.message || getMessage(rule, options)
  return {
    rule,
    ruleFn,
    params,
    label,
    message: formatMessage(label, message, params)
  }
}

checkit.validators = {
  accepted,
  between,
  range,
  contains,
  exactLength,
  exists,
  required,
  minLength,
  maxLength,
  greaterThan,
  greaterThanEqualTo,
  gte: greaterThanEqualTo,
  lessThan,
  lte: lessThanEqualTo,
  lessThanEqualTo,
  string,
  numeric
}

checkit.refValidators = {
  different,
  matchesField
}

checkit.Error = checkit.CheckitError = CheckitError
checkit.ValidationError = ValidationError
checkit.FieldError = FieldError

module.exports = checkit
