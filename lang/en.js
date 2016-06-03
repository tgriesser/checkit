module.exports = {

  accepted: ['on', 'yes', 1, '1', true, 'true'],

  labels: {},

  messages: {

    // Custom Predicates
    accepted: '{{label}} must be yes, on, true, or 1',
    email: '{{label}} must be a valid email address',
    exactLength: '{{label}} must be exactly {{var_1}} characters long',
    exists: '{{label}} must be defined',
    required: '{{label}} is required',
    minLength: '{{label}} must be at least {{var_1}} characters long',
    maxLength: '{{label}} must not exceed {{var_1}} characters long',
    lessThan: '{{label}} must be a number less than {{var_1}}',
    lessThanEqualTo: '{{label}} must be a number less than or equal to {{var_1}}',
    greaterThan: '{{label}} must be a number greater than {{var_1}}',
    greaterThanEqualTo: '{{label}} must be a number greater than or equal to {{var_1}}',
    between: '{{label}} must be a number between {{var_1}} and {{var_2}}',
    range: '{{label}} must be a number equal or larger than {{var_1}} and equal or smaller than {{var_2}}',
    contains: '{{label}} must contain {{var_1}}',
    string: '{{label}} must be type "string"',
    numeric: '{{label}} must be a numeric value',
    matchesField: '{{label}} must exactly match the {{var_1}}',
    different: '{{label}} must be different than the {{var_1}}',
    isPlainObject: '{{label}} must be a plain object',

    // Underscore Predicates
    date: '{{label}} must be a Date',
    equal: '{{label}} must match {{var_1}}',
    'boolean': '{{label}} must be type "boolean"',
    empty: '{{label}} must be empty',
    array: '{{label}} must be an array',
    'null': '{{label}} must be null',
    'NaN': '{{label}} must be NaN',
    finite: '{{label}} must be a finite number',
    'function': '{{label}} must be a function',
    'arguments': '{{label}} must be a javascript "arguments" object',
    regExp: '{{label}} must be a javascript RegExp object',

    // Regex specific messages.
    alpha: '{{label}} must only contain alphabetical characters',
    alphaDash: '{{label}} must only contain alpha-numeric characters, underscores, and dashes',
    alphaNumeric: '{{label}} must only contain alpha-numeric characters',
    alphaUnderscore: '{{label}} must only contain alpha-numeric characters, underscores, and dashes',
    natural: '{{label}} must be a positive number',
    naturalNonZero: '{{label}} must be a number greater than zero',
    integer: '{{label}} must be a valid integer',
    ipv4: '{{label}} must be a valid IPv4 string',
    ipv6: '{{label}} must be a valid IPv6 address',
    base64: '{{label}} must be a base64 string',
    luhn: '{{label}} must be a valid credit card number',
    uuid: '{{label}} must be a valid uuid',

    // If there is no validation provided for an item, use this generic line.
    fallback: 'Validation for {{label}} did not pass'
  }
}
