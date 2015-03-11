
var uuid = typeof require !== "undefined" ? require('node-uuid') : global.uuid;

global.testBlock = (function(){

return {
  email: 'tgriesser10@gmail.com',
  emailFail: 'tgriesser(at)gmail(dot)com',

  matchesEmail: 'tgriesser10@gmail.com',

  accepted1: 'true',
  accepted2: '1',
  accepted3: 1,
  accepted4: 'on',

  integer: 12,
  negativeInteger: -12,
  stringInteger: '12',
  negativeStringInteger: '-12',

  lessThan4: '123',
  greaterThan4: '12345',

  isEmptyArray: [],
  isEmptyString: '',
  isEmptyObject: {},
  isEmptyNull: null,

  isEqual: ["tim", "tim"],
  isElement: {
    element: true
  },

  isArguments: arguments,

  ipv4: '192.168.0.1',

  ipv6Long: '2001:cdba:0000:0000:0000:0000:3257:9652',
  ipv6Short: '::',

  isFunction: function() {
    return true;
  },

  // isString
  isString: 'tim',

  // isNumber
  isNumber: '123',
  isNumberInt: 123,
  isNumberFail: 'abc',

  // isBool
  isBooleanFalse: false,
  isBooleanTrue: true,

  // isBool (fail)
  trueString: "true",
  falseString: "false",
  zero: 0,
  one: 1,

  isFinite: '',
  isFiniteFail: Infinity,

  isDate: new Date(),
  isRegExp: /^[0-9]$/g,
  isNaN: NaN,
  isNull: null,

  url1: 'http://google.com',
  url2: 'https://google.com',

  uuidv1: uuid.v1(),
  uuidv4: uuid.v4(),

  base64: 'TWFuIGlzIGRpc3Rpbmd1aXNoZWQsIG5vdCBvbmx5IGJ5IGhpcyByZWFzb24sIGJ1dCBieSB0aGlzI\
HNpbmd1bGFyIHBhc3Npb24gZnJvbSBvdGhlciBhbmltYWxzLCB3aGljaCBpcyBhIGx1c3Qgb2YgdGhlIG1pbmQsIHRo\
YXQgYnkgYSBwZXJzZXZlcmFuY2Ugb2YgZGVsaWdodCBpbiB0aGUgY29udGludWVkIGFuZCBpbmRlZmF0aWdhYmxlIGdl\
bmVyYXRpb24gb2Yga25vd2xlZGdlLCBleGNlZWRzIHRoZSBzaG9ydCB2ZWhlbWVuY2Ugb2YgYW55IGNhcm5hbCBwbGVhc3VyZS4='

  // , isUndefined :

};

})();
