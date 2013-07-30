var when      = require('when');
var _         = require('underscore-contrib');
var Checkit   = require('../checkit');
var testBlock = require('./block');
var equal     = require('assert').equal;
var deepEqual = require('assert').deepEqual;

var suite = function(type) {

  describe(type + ' validations', function() {

    var checkit;

    beforeEach(function() {
      if (type === 'sync') Checkit.async = false;
      checkit = Checkit(testBlock);
    });

    var handler = function(dfd, ok, syncVal, onFulfilled, onRejected) {
      if (syncVal == void 0) syncVal = true;
      if (type === 'sync') {
        when(dfd).then(function(resp) {
          ok(equal(resp, syncVal));
        });
      } else {
        when(dfd).then(onFulfilled, onRejected).then(function() {
          ok();
        }).then(null, ok);
      }
    };

    describe('emails', function() {

      it('passes with a valid email', function(ok) {
        handler(checkit.run({email: ['validEmail']}), ok);
      });

      it('does not run on an empty input', function(ok) {
        handler(Checkit({}).run({email: ['validEmail']}), ok);
      });

      it('fails with an invalid email', function(ok) {
        handler(checkit.run({emailFail: ['validEmail']}), ok, false, null, function(err) {
          equal(err.get('emailFail'), 'The emailFail must contain a valid email address');
        });
      });

    });

    describe('integer, numeric, number, NaN, bool validations', function() {

      describe('integer', function() {
        it('should pass for numbers and strings (positive and negative)', function(ok) {
          handler(checkit.run({
            integer: 'integer',
            negativeInteger: 'integer',
            stringInteger: 'integer',
            negativeStringInteger: 'integer'
          }), ok);
        });
      });

      describe('numeric', function() {
        it('should only pass for numbers for negative numbers and strings', function(ok) {
          handler(checkit.run({
            negativeInteger: 'isNumeric',
            negativeStringInteger: 'isNumeric'
          }), ok);
        });

        it('should pass for positive numbers and strings', function(ok) {
          handler(checkit.run({
            integer: 'isNumeric',
            stringInteger: 'isNumeric'
          }), ok);
        });

        it('should fail for NaN', function(ok) {
          handler(checkit.run({
            isNaN: 'isNumeric'
          }), ok, false, null, function() {});
        });

      });

      describe('isNumber', function() {

        it('should only pass for numbers', function(ok) {
          handler(checkit.run({
            integer: ['isNumber'],
            negativeInteger: ['isNumber']
          }), ok);
        });

        it('should fail for numbers in strings', function(ok) {
          handler(checkit.run({
            stringInteger: ['isNumber']
          }), ok, false, null, function() {});
        });

        it('should pass for NaN', function(ok) {
          handler(checkit.run({
            isNaN: ['isNumber']
          }), ok);
        });

      });

      describe('isNaN', function(ok) {
        it('should only pass for NaN', function(ok) {
          handler(checkit.run({
            isNaN: ['isNaN']
          }), ok);
        });
      });

      describe('isBoolean', function() {

        it('should pass for true and false', function(ok) {
          handler(checkit.run({
            isBooleanTrue: ['isBoolean'],
            isBooleanFalse: ['isBoolean']
          }), ok);
        });

        it('should not pass for "true" and "false"', function(ok) {
          handler(checkit.run({
            trueString: ['isBoolean'],
            falseString: ['isBoolean']
          }), ok, false, null, function() {});
        });

        it('should not pass for 0 and 1', function(ok) {
          handler(checkit.run({
            zero: ['isBoolean'],
            one: ['isBoolean']
          }), ok, false, null, function() {});
        });

      });

    });

    describe('misc', function() {

      it('should check ipv4 and addresses', function(ok) {
        handler(checkit.run({ipv4: ['ipv4']}), ok);
      });

      it('should return true on a valid base64 string', function(ok) {
        handler(checkit.run({base64: 'base64'}), ok);
      });

    });


    describe('arguments', function() {

      it('should pass with arguments', function(ok) {
        handler(checkit.run({isArguments: "isArguments"}), ok);
      });

    });

    describe('isEmpty', function() {

      it('passes on empty string, array, object, null', function(ok) {
        handler(checkit.run({
          isEmptyArray:  ['isEmpty'],
          isEmptyString: ['isEmpty'],
          isEmptyObject: ['isEmpty'],
          isEmptyNull:   ['isEmpty']
        }), ok);
      });

    });

    describe('Checkit.Error', function () {

      it('should be an instanceof Error', function () {
        var error = new Checkit.Error(checkit);
        equal((error instanceof Error), true);
      });

    });

  });

};

suite('async');
suite('sync');
