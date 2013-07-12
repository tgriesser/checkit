var _         = require('underscore-contrib');
var CheckIt   = require('../checkit.js');
var testBlock = require('./block.js');
var equal     = require('assert').equal;
var deepEqual = require('assert').deepEqual;

describe('async validations', function() {

  var checkit;

  beforeEach(function() {
    checkit = CheckIt(testBlock);
  });

  describe('applyToAll', function() {

    it('passes when run on a block with no validations', function(ok) {
      var numerics = _.pick(testBlock, 'isNumber', 'isNumberInt', 'integer', 'negativeInteger', 'stringInteger', 'negativeStringInteger');
      checkit = CheckIt(numerics).applyToAll(['isNumeric']).run().then(function() { ok(); }, ok);
    });

  });

  describe('emails', function() {

    it('passes with a valid email, does not run on empty input', function(ok) {
      checkit.run({
        email: ['validEmail']
      })
      .then(function() {
        return CheckIt({}).run({email: ['validEmail']});
      })
      .then(function() { ok(); }, ok);
    });

    it('fails with an invalid email', function(ok) {
      checkit.run({
        emailFail: ['validEmail']
      }).then(ok, function(err) {
        equal(err.get('emailFail'), 'The emailFail must contain a valid email address');
        ok();
      }).then(null, ok);
    });

  });

  describe('misc', function() {

    it('should check ipv4 and addresses', function(ok) {
      checkit.run({
        ipv4: ['ipv4']
      }).then(function() { ok(); }, ok);
    });

    it('should return true on a valid base64 string', function(ok) {
      checkit.run({
        base64: 'base64'
      }).then(function() { ok(); }, ok);
    });

  });

  describe('integer, numeric, number, NaN, bool validations', function() {

    describe('integer', function() {
      it('should pass for numbers and strings (positive and negative)', function(ok) {
        checkit.run({
          integer: 'integer',
          negativeInteger: 'integer',
          stringInteger: 'integer',
          negativeStringInteger: 'integer'
        }).then(function() { ok(); }, ok);
      });
    });

    describe('numeric', function() {
      it('should only pass for numbers for negative numbers and strings', function(ok) {
        checkit.run({
          negativeInteger: 'isNumeric',
          negativeStringInteger: 'isNumeric'
        }).then(function() { ok(); }, ok);
      });

      it('should pass for positive numbers and strings', function(ok) {
        checkit.run({
          integer: 'isNumeric',
          stringInteger: 'isNumeric'
        }).then(function() { ok(); }, ok);
      });

      it('should fail for NaN', function(ok) {
        checkit.run({
          isNaN: 'isNumeric'
        }).then(ok, function() { ok(); });
      });

    });

    describe('isNumber', function() {

      it('should only pass for numbers', function(ok) {
        checkit.run({
          integer: ['isNumber'],
          negativeInteger: ['isNumber']
        }).then(function() { ok(); }, ok);
      });

      it('should fail for numbers in strings', function(ok) {
        checkit.run({
          stringInteger: ['isNumber']
        }).then(ok, function() { ok(); });
      });

      it('should pass for NaN', function(ok) {
        checkit.run({
          isNaN: ['isNumber']
        }).then(function() { ok(); }, ok);
      });

    });

    describe('isNaN', function() {
      it('should only pass for NaN', function(ok) {
        checkit.run({
          isNaN: ['isNaN']
        }).then(function() { ok(); }, ok);
      });
    });

    describe('isBoolean', function() {

      it('should pass for true and false', function(ok) {
        checkit.run({
          isBooleanTrue: ['isBoolean'],
          isBooleanFalse: ['isBoolean']
        }).then(function() { ok(); }, ok);
      });

      it('should not pass for "true" and "false"', function(ok) {
        checkit.run({
          trueString: ['isBoolean'],
          falseString: ['isBoolean']
        }).then(ok, function() { ok(); });
      });

      it('should not pass for 0 and 1', function(ok) {
        checkit.run({
          zero: ['isBoolean'],
          one: ['isBoolean']
        }).then(ok, function() { ok(); });
      });

    });
  });

  describe('arguments', function() {

    it('should pass with arguments', function(ok) {
      checkit.run({
        isArguments: "isArguments"
      }).then(function() { ok(); }, ok);
    });

  });

  describe('isEmpty', function() {

    it('passes on empty string, array, object, null', function(ok) {
      checkit.run({
        isEmptyArray:  ['isEmpty'],
        isEmptyString: ['isEmpty'],
        isEmptyObject: ['isEmpty'],
        isEmptyNull:   ['isEmpty']
      }).then(function() { ok(); }, ok);
    });

  });

});

describe('sync validations', function() {

  var checkit;

  beforeEach(function() {
    CheckIt.async = false;
    checkit = CheckIt(testBlock);
  });

  describe('emails', function() {

    it('passes with a valid email, does not run on empty input', function() {
      equal(checkit.run({email: ['validEmail']}), true);
      equal(CheckIt({}).run({email: ['validEmail']}), true);
    });

    it('fails with an invalid email', function() {
      var run = checkit.run({emailFail: ['validEmail']});
      equal(run, false);
      equal(checkit.validationError.get('emailFail'), 'The emailFail must contain a valid email address');
    });

  });

  describe('misc', function() {

    it('should check ipv4 and addresses', function() {
      equal(checkit.run({
        ipv4: ['ipv4']
      }), true);
    });

    it('should return true on a valid base64 string', function() {
      equal(checkit.run({
        base64: 'base64'
      }), true);
    });

  });

  describe('integer, numeric, number, NaN, bool validations', function() {

    describe('integer', function() {
      it('should pass for numbers and strings (positive and negative)', function() {
        equal(checkit.run({
          integer: 'integer',
          negativeInteger: 'integer',
          stringInteger: 'integer',
          negativeStringInteger: 'integer'
        }), true);
      });
    });

    describe('numeric', function() {
      it('should only pass for numbers for negative numbers and strings', function() {
        equal(checkit.run({
          negativeInteger: 'isNumeric',
          negativeStringInteger: 'isNumeric'
        }), true);
      });

      it('should pass for positive numbers and strings', function() {
        equal(checkit.run({
          integer: 'isNumeric',
          stringInteger: 'isNumeric'
        }), true);
      });

      it('should fail for NaN', function() {
        equal(checkit.run({
          isNaN: 'isNumeric'
        }), false);
      });

    });

    describe('isNumber', function() {

      it('should only pass for numbers', function() {
        equal(checkit.run({
          integer: ['isNumber'],
          negativeInteger: ['isNumber']
        }), true);
      });

      it('should fail for numbers in strings', function() {
        equal(checkit.run({
          stringInteger: ['isNumber']
        }), false);
      });

      it('should pass for NaN', function() {
        equal(checkit.run({
          isNaN: ['isNumber']
        }), true);
      });

    });

    describe('isBoolean', function() {

      it('should pass for true and false', function() {
        equal(checkit.run({
          isBooleanTrue: ['isBoolean'],
          isBooleanFalse: ['isBoolean']
        }), true);
      });

      it('should not pass for "true" and "false"', function() {
        var run = checkit.run({
          trueString: ['isBoolean'],
          falseString: ['isBoolean']
        });
        equal(run, false);
        equal(checkit.validationError.get('trueString'), 'The trueString must be type "boolean"');
        equal(checkit.validationError.get('falseString'), 'The falseString must be type "boolean"');
      });

      it('should not pass for 0 and 1', function() {
        var run = checkit.run({
          zero: ['isBoolean'],
          one: ['isBoolean']
        });
        equal(run, false);
        equal(checkit.validationError.get('zero'), 'The zero must be type "boolean"');
      });

    });
  });

  describe('arguments', function() {

    it('should pass with arguments', function() {
      equal(checkit.run({
        isArguments: "isArguments"
      }), true);
    });

  });

  describe('isEmpty', function() {

    it('passes on empty string, array, object, null', function() {
      equal(checkit.run({
        isEmptyArray:  ['isEmpty'],
        isEmptyString: ['isEmpty'],
        isEmptyObject: ['isEmpty'],
        isEmptyNull:   ['isEmpty']
      }), true);
    });

  });

});