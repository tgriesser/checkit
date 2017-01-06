module.exports = {

  accepted: ['on', 'yes', 1, '1', true, 'true'],

  labels: {},

  messages: {

    // Custom Predicates
    accepted: '{{label}} deve ser yes, on, true, or 1',
    email: '{{label}} deve conter um email válido',
    exactLength: '{{label}} deve conter exatamente {{var_1}} caractere(s)',
    exists: '{{label}} deve ser especificado',
    required: '{{label}} é obrigatório',
    minLength: '{{label}} deve conter pelo menos {{var_1}} caractere(s)',
    maxLength: '{{label}} nao deve conter mais que {{var_1}} caracteres',
    lessThan: '{{label}} deve ser um número menor que {{var_1}}',
    lessThanEqualTo: '{{label}} deve ser um número menor ou igual a {{var_1}}',
    greaterThan: '{{label}} deve ser um número maior que {{var_1}}',
    greaterThanEqualTo: '{{label}} deve ser um número maior ou igual a {{var_1}}',
    between: '{{label}} deve ser um número entre {{var_1}} and {{var_2}}',
    range: '{{label}} deve ser um número maior ou igual a {{var_1}} e deve ser menor ou igual a  {{var_2}}',
    contains: '{{label}} deve conter {{var_1}}',
    string: '{{label}} deve ser do tipo "string"',
    numeric: '{{label}} deve ser um valor numérico',
    matchesField: '{{label}} deve coincidir com o valor de {{var_1}}',
    different: '{{label}} deve conter um valor diferente do valor de {{var_1}}',
    isPlainObject: '{{label}} deve ser um objeto simples (plain object)',

    // Underscore Predicates
    date: '{{label}} deve ser uma Data',
    equal: '{{label}} não coincide com o valor de {{var_1}}',
    'boolean': '{{label}} deve ser um booleano',
    empty: '{{label}} deve estar vazio',
    array: '{{label}} deve ser uma lista',
    'null': '{{label}} deve ser nulo',
    'NaN': '{{label}} deve conter um valor do tipo "NaN"',
    finite: '{{label}} deve ser um número finito',
    'function': '{{label}} deve ser uma função',
    'arguments': '{{label}} deve ser um objeto "arguments" do javascript',
    regExp: '{{label}} deve ser uma expressão regular',

    // Regex specific messages.
    alpha: '{{label}} deve conter apenas letras',
    alphaDash: '{{label}} deve conter apenas letras, números, sublinhado e/ou hífen',
    alphaNumeric: '{{label}} deve conter apenas letras e/ou números',
    alphaUnderscore: '{{label}} deve conter apenas letras, números, sublinhado e/ou hífen',
    natural: '{{label}} deve conter um valor positivo',
    naturalNonZero: '{{label}} deve ser maior que zero',
    integer: '{{label}} deve ser um valor inteiro',
    ipv4: '{{label}} deve conter um endereço IPv4 válido',
    ipv6: '{{label}} deve conter um endereço IPv6 válido',
    base64: '{{label}} deve ser uma sequência de caracteres com codificação base64',
    luhn: '{{label}} dever ser um número de cartão de crédito válido',
    uuid: '{{label}} dever ser um uuid válido',

    // If there is no validation provided for an item, use this generic line.
    fallback: 'O campo {{label}} não contém um valor válido'
  }
}