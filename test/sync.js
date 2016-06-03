/* eslint-env mocha */
const _ = require('lodash')
const expect = require('expect')
const checkit = require('../src/checkit')
const testBlock = require('./block')

function equal(a, b) {
  return expect(a).toEqual(b)
}
function assert(val) {
  return expect(val).toEqual(true)
}

describe('checkit - sync', () => {

  describe('.checkSync', () => {

    it('should accept a field, value, and rules', () => {
      const arr = checkit.checkSync('email', 'tim@tgriesser', ['required', 'email'])
      equal((arr[0] instanceof checkit.FieldError), true);
      equal(arr[0].message, 'email must be a valid email address');
    });

  });

  describe('.singleSync', () => {

    it('should create a checkit instance which validates a single item', () => {
      const c = checkit.singleSync('email', ['required', 'email'])
      equal(c.requirements(), [
        'email is required',
        'email must be a valid email address'
      ])
    })

  })

  describe('validators', () => {

    describe('accepted', () => {

      it('passes with on', () => {
        return checkit({
          accepted1: 'accepted',
          accepted2: 'accepted',
          accepted3: 'accepted',
          accepted4: 'accepted'
        }).runSync(testBlock);
      });

    });

    describe('between', () => {

      it('should pass for numbers', () => {
        return checkit({
          integer: ['between:10:15']
        }).runSync(testBlock)
      });

      it('should pass for numbers in strings', () => {
        return checkit({
          stringInteger: ['between:10:15']
        }).runSync(testBlock)
      });

      it('should fail if the value is outside the range', () => {
        const arr = checkit({
          integer: ['between:0:10']
        }).runSync(testBlock)
        assert(arr[0] instanceof checkit.Error)
      })

    });

    describe('range', () => {
      it('should pass for numbers', () => {
        return checkit({
          integer: ['between:10:15']
        }).runSync(testBlock)
      });

      it('should pass for numbers in strings', () => {
        equal(checkit({
          stringInteger: ['between:10:15']
        }).runSync(testBlock)[1], {stringInteger: testBlock.stringInteger})
      });

      it('should fail if the value is outside the range', () => {
        const arr = checkit({integer: ['between:0:10']}).runSync(testBlock)
        assert(arr[0] instanceof checkit.Error)
      });

      it('should treat the min values as inclusive', () => {
        return checkit({
          integer: ['range:12:13']
        }).runSync(testBlock);
      });

      it('should treat the max values as inclusive', () => {
        return checkit({
          integer: ['range:0:12']
        }).runSync(testBlock)
      });
    });

    describe('emails', () => {

      it('passes with a valid email', () => {
        const [e] = checkit({email: ['email']}).runSync(testBlock)
        expect(e).toNotExist()
      });

      it('does not run on an empty input', () => {
        const [e] = checkit({email: ['email']}).runSync(testBlock)
        expect(e).toNotExist()
      });

      it('fails with an invalid email', () => {
        const [e] = checkit({emailFail: ['email']}).runSync(testBlock)
        equal(e.get('emailFail').toString(), 'emailFail: emailFail must be a valid email address')
      });

    });

    describe('integer', () => {
      it('should pass for numbers and strings (positive and negative)', () => {
        return checkit({
          integer: 'integer',
          negativeInteger: 'integer',
          stringInteger: 'integer',
          negativeStringInteger: 'integer'
        }).run(testBlock)
      });
    });

    describe('numeric', () => {
      it('should only pass for numbers for negative numbers and strings', () => {
        return checkit({
          negativeInteger: 'numeric',
          negativeStringInteger: 'numeric'
        }).run(testBlock)
      });

      it('should pass for positive numbers and strings', () => {
        return checkit({
          integer: 'numeric',
          stringInteger: 'numeric'
        }).run(testBlock)
      });

      it('should fail for NaN', () => {
        const arr = checkit({
          isNaN: 'numeric'
        }).runSync(testBlock)
        assert(arr[0] instanceof checkit.Error)
      });

    });

    describe('isNumber', () => {

      it('should only pass for numbers', () => {
        return checkit({
          integer: ['isNumber'],
          negativeInteger: ['isNumber']
        }).runSync(testBlock)
      });

      it('should fail for numbers in strings', () => {
        const arr = checkit({
          stringInteger: ['isNumber']
        }).runSync(testBlock)
        assert(arr[0] instanceof checkit.Error)
      });

      it('should pass for NaN', () => {
        return checkit({
          isNaN: ['isNumber']
        }).run(testBlock)
      });

    });

    describe('isNaN', () => {
      it('should only pass for NaN', () => {
        return checkit({
          isNaN: ['isNaN']
        }).run(testBlock)
      });
    });

    describe('boolean', () => {

      it('should pass for true and false', () => {
        return checkit({
          booleanTrue: ['boolean'],
          booleanFalse: ['boolean']
        }).run(testBlock)
      });

      it('should not pass for "true" and "false"', () => {
        return checkit({
          trueString: ['boolean'],
          falseString: ['boolean']
        }).run(testBlock).catch(() => {
          return true;
        }).then(function(val) { equal(val, true) })
      });

      it('should not pass for 0 and 1', () => {
        return checkit({
          zero: ['boolean'],
          one: ['boolean']
        }).run(testBlock).catch(() => {
          return true;
        }).then(function(val) { equal(val, true) })
      });

    });

    describe('ipv6', () => {

      it('should pass for short ipv6', () => {
        return checkit({
          ipv6Short: ['ipv6']
        }).run(testBlock)
      });

      it('should pass for long ipv6', () => {
        return checkit({
          ipv6Long: ['ipv6']
        }).run(testBlock)
      });

    });

    describe('uuid', () => {

      it('should pass for uuid v1', () => {
        return checkit({
          uuidv1: ['uuid']
        }).run(testBlock)
      });

      it('should pass for uuid v4', () => {
        return checkit({
          uuidv4: ['uuid']
        }).run(testBlock)
      });

    });

    describe('url', () => {

      it('should validate a http url', () => {
        return checkit({
          url1: ['url']
        }).run(testBlock)
      });

      it('should validate a https url', () => {
        return checkit({
          url2: ['url']
        }).run(testBlock)
      });

    });

    describe('misc', () => {

      it('should check ipv4 and addresses', () => {
        return checkit({ipv4: ['ipv4']}).run(testBlock)
      });

      it('should return true on a valid base64 string', () => {
        return checkit({base64: 'base64'}).run(testBlock)
      });

    });

    describe('arguments', () => {

      it('should pass with arguments', () => {
        return checkit({isArguments: "isArguments"}).run(testBlock)
      });

    });

    describe('isEmpty', () => {

      it('passes on empty string, array, object, null', () => {
        return checkit({
          isEmptyArray:  ['isEmpty'],
          isEmptyString: ['isEmpty'],
          isEmptyObject: ['isEmpty'],
          isEmptyNull:   ['isEmpty']
        }).run(testBlock)
      });

    });

  });

  describe('custom validation objects', () => {

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

    it('allows for custom labels and messages', () => {
      return checkit(vals).run({email: ''}).then(null, function(err) {
        equal(err.get('email').message, 'Email Address Field is required');
        equal(err.get('first_name').message, 'You must supply a first name value');
        return checkit(vals).run({first_name: 't'});
      }).then(null, function(err) {
        equal(err.get('first_name').message, 'first name of this application must be at least 3 characters long');
      });
    });

    it('allows for custom params', () => {
      const containsTest = {
        arr: {
          rule: 'contains',
          params: [10]
        }
      };
      return checkit(containsTest).run({arr: [0, 10, 20]}).then(() => {
        return checkit(_.extend(containsTest, {arr: 'contains:10'})).run({arr: [0, 10, 20]});
      }).then(null, function(err) {
        equal(err.get('arr').message, 'arr must contain 10');
      });
    });

  });

  describe('custom validation rules', () => {

    it('should run the rule function on the supplied value', () => {
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

    it('should fail when the validation rule throws an error', () => {
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

    it('should pass the supplied parameter to the validation rule', () => {
      const parameter = 'parameter';
      const rulesTest = {
        parameterTest: {
          rule: function(val, param){
            equal(parameter, param);
          },
          params: parameter
        }
      };
      return checkit(rulesTest).run({parameterTest: "value"})
    })

    it('should pass the context property supplied to the run function to the rule function', () => {
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

  describe('conditional items', () => {

    const chain = checkit({
      email: ['email']
    });
    chain.maybe({email: ['contains:tim']}, function(item) {
      return item.first_name === 'tim';
    });

    it('validates for items that pass the conditional', () => {
      const [e] = chain.runSync({email: 'joe@gmail.com', first_name: 'tim'})
      expect(e).toBeAn(Error)
      equal(`${e}`, 'email: email must contain tim')
    });

    it('doesnt validate if the item doesnt pass the conditional', () => {
      return chain.run({email: 'joe@gmail.com', first_name: 'joe'})
    });

  });

  describe('nested items', () => {
    it('validates for nested items', () => {
      return checkit({"info.email": ['required', 'email']}).runSync({info: {email: "joe@gmail.com"}})
    });
  });

});
