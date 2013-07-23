
module.exports = {
  email: 'tgriesser10@gmail.com',
  emailFail: 'tgriesser(at)gmail(dot)com',

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
  ipv6: '2001:0db8:85a3:0000:0000:8a2e:0370:7334',

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

  base64: 'TWFuIGlzIGRpc3Rpbmd1aXNoZWQsIG5vdCBvbmx5IGJ5IGhpcyByZWFzb24sIGJ1dCBieSB0aGlzI\
HNpbmd1bGFyIHBhc3Npb24gZnJvbSBvdGhlciBhbmltYWxzLCB3aGljaCBpcyBhIGx1c3Qgb2YgdGhlIG1pbmQsIHRo\
YXQgYnkgYSBwZXJzZXZlcmFuY2Ugb2YgZGVsaWdodCBpbiB0aGUgY29udGludWVkIGFuZCBpbmRlZmF0aWdhYmxlIGdl\
bmVyYXRpb24gb2Yga25vd2xlZGdlLCBleGNlZWRzIHRoZSBzaG9ydCB2ZWhlbWVuY2Ugb2YgYW55IGNhcm5hbCBwbGVhc3VyZS4='

  // , isUndefined :
};
