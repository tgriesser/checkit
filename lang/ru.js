module.exports = {

  accepted: ['on', 'yes', 1, '1', true, 'true', 'да'],

  labels: {},

  messages: {

    // Custom Predicates
    accepted: '{{label}} должно быть да, on, yes, true или 1',
    email: '{{label}} должно быть валидным email адресом',
    exactLength: 'Длина {{label}} должна быть {{var_1}} символов',
    exists: '{{label}} должно быть определено',
    required: '{{label}} обязательно',
    minLength: '{{label}} должно быть не короче {{var_1}} символов',
    maxLength: '{{label}} не должно быть длинее {{var_1}} символов',
    lessThan: '{{label}} должно быть числом меньше чем {{var_1}}',
    lessThanEqualTo: '{{label}} должно быть числом, меньше или равным {{var_1}}',
    greaterThan: '{{label}} должно быть числом, больше чем {{var_1}}',
    greaterThanEqualTo: '{{label}} должно быть числом, больше или равным {{var_1}}',
    between: '{{label}} должно быть числом между {{var_1}} и {{var_2}}',
    range: '{{label}} должно быть числом, не менее {{var_1}} и не более {{var_2}}',
    contains: '{{label}} должно содержать {{var_1}}',
    string: '{{label}} должно быть "string"',
    numeric: '{{label}} должно быть числом',
    matchesField: '{{label}} должно точно совпадать с {{var_1}}',
    different: '{{label}} должно быть отлично {{var_1}}',
    isPlainObject: '{{label}} должно быть объектом',

    // Underscore Predicates
    date: '{{label}} должно быть датой',
    equal: '{{label}} не совпадает с {{var_1}}',
    'boolean': '{{label}} должно быть булевым',
    empty: '{{label}} должно быть пустым',
    array: '{{label}} должно быть массивом',
    'null': '{{label}} должно быть "null"',
    'NaN': '{{label}} должно быть "NaN"',
    finite: '{{label}} должно быть числом',
    'function': '{{label}} должно быть функцией',
    'arguments': '{{label}} должно быть типа "arguments"',
    regExp: '{{label}} должно быть регулярным выражением',

    // Regex specific messages.
    alpha: '{{label}} должно включать только алфавитные символы',
    alphaDash: '{{label}} должно включать только алфавитные символы, нижнее подчеркивание, или тире',
    alphaNumeric: '{{label}} должно состоять только из цифр',
    alphaUnderscore: '{{label}} должно включать только алфавитные символы, нижнее подчеркивание, или тире',
    natural: '{{label}} должно быть положительным числом',
    naturalNonZero: '{{label}} должно быть числом больше нуля',
    ipv4: '{{label}} должно быть валидным IPv4 адресом',
    ipv6: '{{label}} должно быть валидным IPv6 адресом',
    base64: '{{label}} должно быть валидной base64 строкой',
    luhn: '{{label}} должно быть валидным номером кредитной карты',
    uuid: '{{label}} должно быть валидным уникальным идентификатором (uuid)',

    // If there is no validation provided for an item, use this generic line.
    fallback: '{{label}} не прошло валидацию'
  }
}
