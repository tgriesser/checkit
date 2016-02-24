module.exports = {

  accepted: ['on', 'yes', 1, '1', true, 'true'],

  labels: {},

  messages: {

    // Custom Predicates
    accepted: 'Le champ {{label}} doit être yes, on, true, ou 1',
    email: 'Le champ {{label}} doit être une adresse mail valide',
    exactLength: 'Le champ {{label}} doit avoir une longueur exacte de {{var_1}} caractères',
    exists: 'Le champ {{label}} doit être défini',
    required: 'Le champ {{label}} est requis',
    minLength: 'Le champ {{label}} doit avoir une longueur minimum de {{var_1}} caractères',
    maxLength: 'Le champ {{label}} ne doit pas dépasser {{var_1}} caractères',
    lessThan: 'Le champ {{label}} doit être un nombre inférieur à {{var_1}}',
    lessThanEqualTo: 'Le champ {{label}} doit être un nombre inférieur ou égal à {{var_1}}',
    greaterThan: 'Le champ {{label}} doit être un nombre supérieur à {{var_1}}',
    greaterThanEqualTo: 'Le champ {{label}} doit être un nombre supérieur ou égal à {{var_1}}',
    between: 'Le champ {{label}} doit être un nombre compris entre {{var_1}} et {{var_2}}',
    range: 'Le champ {{label}} doit être un nombre supérieur ou égal à {{var_1}} ou inférieur ou égal à {{var_2}}',
    contains: 'Le champ {{label}} doit contenir {{var_1}}',
    string: 'Le champ {{label}} doit être de type "string"',
    numeric: 'Le champ {{label}} doit être une valeur numérique',
    matchesField: 'Le champ {{label}} doit doit correspondre exactement à {{var_1}}',
    different: 'Le champ {{label}} doit être différent de {{var_1}}',
    isPlainObject: 'Le champ {{label}} doit être un "plain object"',

    // Underscore Predicates
    date: 'Le champ {{label}} doit être une date',
    equal: 'Le champ {{label}} ne correspond pas à {{var_1}}',
    'boolean': 'Le champ {{label}} doit être de type "booléen"',
    empty: 'Le champ {{label}} doit être vide',
    array: 'Le champ {{label}} doit être un tableau',
    'null': 'Le champ {{label}} doit être "null"',
    'NaN': 'Le champ {{label}} doit être "NaN"',
    finite: 'Le champ {{label}} doit être un nombre fini',
    'function': 'Le champ {{label}} doit être une fonction',
    'arguments': 'Le champ {{label}} doit être un objet "argument" javascript',
    regExp: 'Le champ {{label}} doit être un objet d\'expression régulière javascript',

    // Regex specific messages.
    alpha: 'Le champ {{label}} ne doit contenir que des caractères alphabétiques',
    alphaDash: 'Le champ {{label}} ne doit contenir que des caractères alpha-numériques, des underscores, ou des tirets',
    alphaNumeric: 'Le champ {{label}} ne doit contenir que des caractères alpha-numériques',
    alphaUnderscore: 'Le champ {{label}} ne doit contenir que des caractères alpha-numériques, des underscores, ou des tirets',
    natural: 'Le champ {{label}} doit être un nombre positif',
    naturalNonZero: 'Le champ {{label}} doit être un nombre supérieur à zéro',
    integer: 'Le champ {{label}} doit être un entier',
    ipv4: 'Le champ {{label}} doit être une chaîne IPv4 valide',
    ipv6: 'Le champ {{label}} doit être une adresse IPv6 valide',
    base64: 'Le champ {{label}} doit être une chaîne en base64',
    luhn: 'Le champ {{label}} doit être un numéro de carte de crédit valide',
    uuid: 'Le champ {{label}} doit être un numéro de série valide',

    // If there is no validation provided for an item, use this generic line.
    fallback: 'L\'étape de validation du champ {{label}} a échoué'
  }
}
