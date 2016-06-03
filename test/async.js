/* eslint-env mocha */
const _ = require('lodash')
const expect = require('expect')
const checkit = require('../src/checkit')
const testBlock = require('./block')

function equal(a, b) {
  return expect(a).toEqual(b)
}

describe('Checkit', function() {

  describe('.check', function() {

    it('should accept a field, value, and rules', function() {

      return checkit.check('email', 'tim@tgriesser', ['required', 'email']).catch(function(err) {
        equal(err instanceof checkit.FieldError, true);
        equal(err.message, 'email must be a valid email address');
      });

    });

  });

  describe('validators', function() {

    describe('accepted', function() {

      it('passes with on', function() {
        return checkit({
          accepted1: 'accepted',
          accepted2: 'accepted',
          accepted3: 'accepted',
          accepted4: 'accepted'
        }).run(testBlock);
      });

    });

    describe('between', function() {

      it('should pass for numbers', function() {
        return checkit({
          integer: ['between:10:15']
        }).run(testBlock)
      });

      it('should pass for numbers in strings', function() {
        return checkit({
          stringInteger: ['between:10:15']
        }).run(testBlock)
      });

      it('should fail if the value is outside the range', function() {
        return checkit({
          integer: ['between:0:10']
        }).run(testBlock).catch(function() {
          return true;
        }).then(function(val) { equal(val, true) })
      });

    });

    describe('range', function() {
      it('should pass for numbers', function() {
        return checkit({
          integer: ['between:10:15']
        }).run(testBlock)
      });

      it('should pass for numbers in strings', function() {
        return checkit({
          stringInteger: ['between:10:15']
        }).run(testBlock)
      });

      it('should fail if the value is outside the range', function() {
        return checkit({
          integer: ['between:0:10']
        }).run(testBlock).catch(function() {
          return true;
        }).then(function(val) { equal(val, true) })
      });

      it('should not treat the min values as inclusive', function() {
        return checkit({
          integer: ['between:12:13']
        }).run(testBlock).catch(function() {
          return true;
        }).then(function(val) { equal(val, true) })
      });

      it('should not treat the max values as inclusive', function() {
        return checkit({
          integer: ['between:0:12']
        }).run(testBlock).catch(function() {
          return true;
        }).then(function(val) { equal(val, true) })
      });
    });

    describe('emails', function() {

      it('passes with a valid email', function() {
        return checkit({email: ['email']}).run(testBlock)
      });

      it('does not run on an empty input', function() {
        return checkit({email: ['email']}).run(testBlock)
      });

      it('fails with an invalid email', function() {
        return checkit({emailFail: ['email']}).run(testBlock).catch(function(err) {
          equal(err.get('emailFail').toString(), 'emailFail: emailFail must be a valid email address');
        });
      });

    });

    describe('string', function() {
      it('should pass for strings', function() {
        return checkit({
          isString: 'string'
        }).run(testBlock);
      });
    });

    describe('integer', function() {
      it('should pass for numbers and strings (positive and negative)', function() {
        return checkit({
          integer: 'integer',
          negativeInteger: 'integer',
          stringInteger: 'integer',
          negativeStringInteger: 'integer'
        }).run(testBlock)
      });
    });

    describe('numeric', function() {
      it('should only pass for numbers for negative numbers and strings', function() {
        return checkit({
          negativeInteger: 'numeric',
          negativeStringInteger: 'numeric'
        }).run(testBlock)
      });

      it('should pass for positive numbers and strings', function() {
        return checkit({
          integer: 'numeric',
          stringInteger: 'numeric'
        }).run(testBlock)
      });

      it('should fail for NaN', function() {
        return checkit({
          isNaN: 'numeric'
        }).run(testBlock).catch(function() {
          return true;
        }).then(function(val) { equal(val, true) })
      });

    });

    describe('isNumber', function() {

      it('should only pass for numbers', function() {
        return checkit({
          integer: ['isNumber'],
          negativeInteger: ['isNumber']
        }).run(testBlock)
      });

      it('should fail for numbers in strings', function() {
        return checkit({
          stringInteger: ['isNumber']
        }).run(testBlock).catch(function() {
          return true;
        }).then(function(val) { equal(val, true) })
      });

      it('should pass for NaN', function() {
        return checkit({
          isNaN: ['isNumber']
        }).run(testBlock)
      });

    });

    describe('isNaN', function() {
      it('should only pass for NaN', function() {
        return checkit({
          isNaN: ['isNaN']
        }).run(testBlock)
      });
    });

    describe('boolean', function() {

      it('should pass for true and false', function() {
        return checkit({
          booleanTrue: ['boolean'],
          booleanFalse: ['boolean']
        }).run(testBlock)
      });

      it('should not pass for "true" and "false"', function() {
        return checkit({
          trueString: ['boolean'],
          falseString: ['boolean']
        }).run(testBlock).catch(function() {
          return true;
        }).then(function(val) { equal(val, true) })
      });

      it('should not pass for 0 and 1', function() {
        return checkit({
          zero: ['boolean'],
          one: ['boolean']
        }).run(testBlock).catch(function() {
          return true;
        }).then(function(val) { equal(val, true) })
      });

    });

    describe('ipv6', function() {

      it('should pass for short ipv6', function() {
        return checkit({
          ipv6Short: ['ipv6']
        }).run(testBlock)
      });

      it('should pass for long ipv6', function() {
        return checkit({
          ipv6Long: ['ipv6']
        }).run(testBlock)
      });

    });

    describe('uuid', function() {

      it('should pass for uuid v1', function() {
        return checkit({
          uuidv1: ['uuid']
        }).run(testBlock)
      });

      it('should pass for uuid v4', function() {
        return checkit({
          uuidv4: ['uuid']
        }).run(testBlock)
      });

    });

    describe('url', function() {

      it('should validate a http url', function() {
        return checkit({
          url1: ['url']
        }).run(testBlock)
      });

      it('should validate a https url', function() {
        return checkit({
          url2: ['url']
        }).run(testBlock)
      });

    });

    describe('misc', function() {

      it('should check ipv4 and addresses', function() {
        return checkit({ipv4: ['ipv4']}).run(testBlock)
      });

      it('should return true on a valid base64 string', function() {
        return checkit({base64: 'base64'}).run(testBlock)
      });

    });

    describe('arguments', function() {

      it('should pass with arguments', function() {
        return checkit({isArguments: "isArguments"}).run(testBlock)
      });

    });

    describe('isEmpty', function() {

      it('passes on empty string, array, object, null', function() {
        return checkit({
          isEmptyArray:  ['isEmpty'],
          isEmptyString: ['isEmpty'],
          isEmptyObject: ['isEmpty'],
          isEmptyNull:   ['isEmpty']
        }).run(testBlock)
      });

    });

  });

  describe('custom validation objects', function() {

    const vals = {
      email: ['email', {
        rule: 'required',
        label: 'Email Address Field'
      }],
      first_name: [{
        rule: 'required',
        message: 'You must supply a first name value'
      }, {
        rule: 'minLength:3',
        label: 'first name of this application'
      }]
    };

    it('allows for custom labels and messages', function() {
      return checkit(vals).run({email: ''}).then(null, function(err) {
        equal(err.get('email').message, 'Email Address Field is required');
        equal(err.get('first_name').message, 'You must supply a first name value');
        return checkit(vals).run({first_name: 't'});
      }).then(null, function(err) {
        equal(err.get('first_name').message, 'first name of this application must be at least 3 characters long');
      });
    });

    it('allows for custom params', function() {
      const containsTest = {
        arr: {
          rule: 'contains',
          params: [10]
        }
      };
      return checkit(containsTest).run({arr: [0, 10, 20]}).then(function() {
        return checkit(_.extend(containsTest, {arr: 'contains:10'})).run({arr: [0, 10, 20]});
      }).then(null, function(err) {
        equal(err.get('arr').message, 'arr must contain 10');
      });
    });

  });

  describe('custom validation rules', function() {

    it('should run the rule function on the supplied value', function() {
      const value = 'value';
      const rulesTest = {
        valueTest: {
          rule: function(val) {
            equal(value, val);
          }
        }
      };
      return checkit(rulesTest).run({valueTest: value})
    })

    it('should fail when the validation rule throws an error', function(){
      const rulesTest = {
        failedRuleTest: {
          rule: function(val){
            throw new Error('thrown from rule function');
          }
        }
      };
      return checkit(rulesTest).run({failedRuleTest: "value"}).then(null, function(err){
        equal(err.get('failedRuleTest').message, 'thrown from rule function');
      });
    })

    it('should pass the supplied parameter to the validation rule', function(){
      const parameter = 'parameter';
      const rulesTest = {
        parameterTest: {
          rule: function(val, param){
            return equal(parameter, param);
          },
          params: parameter
        }
      };
      return checkit(rulesTest).run({parameterTest: "value"})
    })

    it('should pass the context property supplied to the run function to the rule function', function(){
      const runContext = 'the context';
      const rulesTest = {
        contextTest: {
          rule: function(val, context){
            return equal(runContext, context);
          }
        }
      }
      return checkit(rulesTest).run({contextTest: "value"}, runContext)
    })

  });

  describe('conditional items', function() {

    const chain = checkit({
      email: ['email']
    });
    chain.maybe({email: ['contains:tim']}, function(item) {
      return item.first_name === 'tim';
    });

    it('validates for items that pass the conditional', function() {
      return chain.run({email: 'joe@gmail.com', first_name: 'tim'})
        .then(function() {
          return Promise.reject(new Error('Should not pass'));
        }).catch(function(err) {
          equal(err.toString(), 'email: email must contain tim');
        })
        .then(function() {
          return chain.run({email: 'tim@gmail', first_name: 'tim'});
        })
        .then(function() {
          return Promise.reject(new Error('Should not pass'));
        })
        .catch(function(err) {
          equal(err.toString(), 'email: email must be a valid email address');
        })
    });

    it('doesnt validate if the item doesnt pass the conditional', function() {
      return chain.run({email: 'joe@gmail.com', first_name: 'joe'})
    });

    it('matches', function() {
      return checkit({matchesEmail: ['matchesField:email']}).validate(testBlock)
    })

  });

  describe('nested items', function(){
    it('validates for nested items', function(){
      return checkit({
        "info.email": ['required', 'email']
      }).run({info: {email: "joe@gmail.com"}})
    });
  });

});
