module.exports = {

  accepted: ['on', 'yes', 1, '1', true, 'true'],

  labels: {},

  messages: {

    // Custom Predicates
    accepted: 'Het veld {{label}} moet yes, on, true, of 1 zijn',
    email: 'Het veld {{label}} moet een geldig e-mailadres zijn',
    exactLength: 'Het veld {{label}} moet een exacte lengte hebben van {{var_1}} tekens',
    exists: 'Het veld {{label}} moet worden gedefinieerd',
    required: 'Het veld {{label}} is verplicht',
    minLength: 'Het veld {{label}} moet een minimumlengte hebben van {{var_1}} tekens',
    maxLength: 'Het veld {{label}} moet niet meer zijn dan {{var_1}} tekens',
    lessThan: 'Het veld {{label}} moet een getal zijn kleiner dan {{var_1}}',
    lessThanEqualTo: 'Het veld {{label}} moet een getal zijn kleiner dan of gelijk aan {{var_1}}',
    greaterThan: 'Het veld {{label}} moet een getal zijn groter dan {{var_1}}',
    greaterThanEqualTo: 'Het veld {{label}} moet een getal zijn groter dan of gelijk aan {{var_1}}',
    between: 'Het veld {{label}} moet een getal zijn tussen {{var_1}} en {{var_2}}',
    range: 'Het veld {{label}} moet een getal zijn groter dan of gelijk aan {{var_1}} of kleiner dan of gelijk aan {{var_2}}',
    contains: 'Het veld {{label}} moet {{var_1}} bevatten',
    string: 'Het veld {{label}} moet een "string" zijn',
    numeric: 'Het veld {{label}} moet een numerieke waarde zijn',
    matchesField: 'Het veld {{label}} moet exact overeenkomen met {{var_1}}',
    different: 'Het veld {{label}} moet verschillend zijn van {{var_1}}',
    isPlainObject: 'Het veld {{label}} moet een "plain object" zijn',

    // Underscore Predicates
    date: 'Het veld {{label}} moet een datum zijn',
    equal: 'Het veld {{label}} komt niet overeen met {{var_1}}',
    'boolean': 'Het veld {{label}} moet een "boolean" zijn',
    empty: 'Het veld {{label}} moet leeg zijn',
    array: 'Het veld {{label}} moet een array zijn',
    'null': 'Het veld {{label}} moet "null" zijn',
    'NaN': 'Het veld {{label}} moet "NaN" zijn',
    finite: 'Het veld {{label}} moet een eindig getal zijn',
    'function': 'Het veld {{label}} moet een functie zijn',
    'arguments': 'Het veld {{label}} moet een javascript "arguments" object zijn',
    regExp: 'Het veld {{label}} moet een javascript RegExp object zijn',

    // Regex specific messages.
    alpha: 'Het veld {{label}} mag alleen alfabetische tekens bevatten',
    alphaDash: 'Het veld {{label}} mag alleen alfanumerieke tekens en (onderliggende) streepjes bevatten',
    alphaNumeric: 'Het veld {{label}} mag alleen alfanumerieke tekens bevatten',
    alphaUnderscore: 'Het veld {{label}} mag alleen alfanumerieke tekens en (onderliggende) streepjes bevatten',
    natural: 'Het veld {{label}} moet een positief getal zijn',
    naturalNonZero: 'Het veld {{label}} moet een getal groter zijn dan nul',
    integer: 'Het veld {{label}} moet een geldig geheel getal zijn',
    ipv4: 'Het veld {{label}} moet een geldig IPv4 adres zijn',
    ipv6: 'Het veld {{label}} moet een geldig IPv6 adres zijn',
    base64: 'Het veld {{label}} moet een base64 tekenreeks zijn',
    luhn: 'Het veld {{label}} moet een geldige creditcard nummer zijn',
    uuid: 'Het veld {{label}} moet een geldig uuid zijn',

    // If there is no validation provided for an item, use this generic line.
    fallback: 'Validatie van het veld {{label}} mislukt'
  }
}
