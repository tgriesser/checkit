module.exports = {

  accepted: ['on', 'yes', 1, '1', true, 'true', 'si'],

  labels: {},

  messages: {
    email: '{{label}} debe de ser una dirección válida de correo electrónico',
    exactLength: '{{label}} debe de ser de exactamente {{var_1}} caracteres',
    exists: '{{label}} debe de existir',
    required: '{{label}} es obligatorio',
    minLength: '{{label}} debe de ser de al menos {{var_1}} caracteres',
    maxLength: '{{label}} no debe de ser de más de {{var_1}} caracteres',
    lessThan: '{{label}} debe de ser un número menor que {{var_1}}',
    lessThanEqualTo: '{{label}} debe de ser un número menor o igual a {{var_1}}',
    greaterThan: '{{label}} debe de ser un número mayor que {{var_1}}',
    greaterThanEqualTo: '{{label}} debe de ser un número mayor o igual a {{var_1}}',
    string: '{{label}} debe de ser de tipo "string"',
    numeric: '{{label}} debe de ser un valor numérico',
    matchesField: '{{label}} debe de ser exactamente igual a {{var_1}}',
    different: '{{label}} debe de ser diferente a {{var_1}}',

    // Underscore Predicates
    date: '{{label}} debe de ser una fecha',
    equal: '{{label}} no es igual a {{var_1}}',
    'boolean': '{{label}} debe de ser de tipo "boolean"',
    empty: '{{label}} debe de estar vacío',
    array: '{{label}} debe de ser un arreglo',

    // Regex specific messages.
    alpha: '{{label}} debe de estar compuesto únicamente por carácteres alfabéticos',
    alphaDash: '{{label}} debe de estar compuesto únicamente por caracteres alfanuméricos, guión y guión bajo',
    alphaNumeric: '{{label}} debe de estar compuesto únicamente por caracteres alfanuméricos',
    alphaUnderscore: '{{label}} debe de estar compuesto únicamente por caracteres alfanuméricos, guión y guión bajo',
    natural: '{{label}} debe de ser un número positivo',
    naturalNonZero: '{{label}} debe de ser un número mayor a cero',
    ipv4: '{{label}} debe de ser una dirección válida de IPv4',
    ipv6: '{{label}} debe de ser una dirección válida de IPv6',
    base64: '{{label}} debe de ser una cadena en base64',
    luhn: '{{label}} debe de ser un número válido de tarjeta de crédito',
    uuid: '{{label}} debe de ser un uuid válido',

    // If there is no validation provided for an item, use this generic line.
    fallback: 'Las validaciones para {{label}} fallaron'
  }

}