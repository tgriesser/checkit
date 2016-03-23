module.exports = {

  accepted: ['on', 'yes', 1, '1', true, 'true'],

  labels: {},

  messages: {

    // Custom Predicates
    accepted: 'The {{label}} must be yes, on, true, or 1',
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
    between: 'The {{label}} must be a number between {{var_1}} and {{var_2}}',
    range: 'The {{label}} must be a number equal or larger than {{var_1}} and equal or smaller than {{var_2}}',
    contains: 'The {{label}} must contain {{var_1}}',
    string: 'The {{label}} must be type "string"',
    numeric: 'The {{label}} must be a numeric value',
    matchesField: 'The {{label}} must exactly match the {{var_1}}',
    different: 'The {{label}} must be different than the {{var_1}}',
    isPlainObject: 'The {{label}} must be a plain object',

    // Underscore Predicates
    date: 'The {{label}} must be a Date',
    equal: 'The {{label}} does not match {{var_1}}',
    'boolean': 'The {{label}} must be type "boolean"',
    empty: 'The {{label}} must be empty',
    array: 'The {{label}} must be an array',
    'null': 'The {{label}} must be null',
    'NaN': 'The {{label}} must be NaN',
    finite: 'The {{label}} must be a finite number',
    'function': 'The {{label}} must be a function',
    'arguments': 'The {{label}} must be a javascript "arguments" object',
    regExp: 'The {{label}} must be a javascript RegExp object',

    // Regex specific messages.
    alpha: 'The {{label}} must only contain alphabetical characters',
    alphaDash: 'The {{label}} must only contain alpha-numeric characters, underscores, and dashes',
    alphaNumeric: 'The {{label}} must only contain alpha-numeric characters',
    alphaUnderscore: 'The {{label}} must only contain alpha-numeric characters, underscores, and dashes',
    natural: 'The {{label}} must be a positive number',
    naturalNonZero: 'The {{label}} must be a number greater than zero',
    integer: 'The {{label}} must be a valid integer',
    ipv4: 'The {{label}} must be a valid IPv4 string',
    ipv6: 'The {{label}} must be a valid IPv6 address',
    base64: 'The {{label}} must be a base64 string',
    luhn: 'The {{label}} must be a valid credit card number',
    uuid: 'The {{label}} must be a valid uuid',

    // If there is no validation provided for an item, use this generic line.
    fallback: 'Validation for {{label}} did not pass'
  }
}