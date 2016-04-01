describe('Checkit', function() {

  describe('.check', function() {

    it('should accept a field, value, and rules', function() {

      return Checkit.check('email', 'tim@tgriesser', ['required', 'email']).catch(function(err) {
        equal(err instanceof Checkit.FieldError, true);
        equal(err.message, 'The email must be a valid email address');
      });

    });

  });

  describe('validators', function() {

    describe('accepted', function() {

      it('passes with on', function() {
        return Checkit({
          accepted1: 'accepted',
          accepted2: 'accepted',
          accepted3: 'accepted',
          accepted4: 'accepted'
        }).run(testBlock);
      });

    });

    describe('between', function() {

      it('should pass for numbers', function() {
        return Checkit({
          integer: ['between:10:15']
        }).run(testBlock)
      });

      it('should pass for numbers in strings', function() {
        return Checkit({
          stringInteger: ['between:10:15']
        }).run(testBlock)
      });

      it('should fail if the value is outside the range', function() {
        return Checkit({
          integer: ['between:0:10']
        }).run(testBlock).catch(function() {
          return true;
        }).then(function(val) { equal(val, true) })
      });

    });

    describe('range', function() {
      it('should pass for numbers', function() {
        return Checkit({
          integer: ['between:10:15']
        }).run(testBlock)
      });

      it('should pass for numbers in strings', function() {
        return Checkit({
          stringInteger: ['between:10:15']
        }).run(testBlock)
      });

      it('should fail if the value is outside the range', function() {
        return Checkit({
          integer: ['between:0:10']
        }).run(testBlock).catch(function() {
          return true;
        }).then(function(val) { equal(val, true) })
      });

      it('should not treat the min values as inclusive', function() {
        return Checkit({
          integer: ['between:12:13']
        }).run(testBlock).catch(function() {
          return true;
        }).then(function(val) { equal(val, true) })
      });

      it('should not treat the max values as inclusive', function() {
        return Checkit({
          integer: ['between:0:12']
        }).run(testBlock).catch(function() {
          return true;
        }).then(function(val) { equal(val, true) })
      });
    });

    describe('emails', function() {

      it('passes with a valid email', function() {
        return Checkit({email: ['email']}).run(testBlock)
      });

      it('does not run on an empty input', function() {
        return Checkit({email: ['email']}).run(testBlock)
      });

      it('fails with an invalid email', function() {
        return Checkit({emailFail: ['email']}).run(testBlock).catch(function(err) {
          equal(err.get('emailFail').toString(), 'emailFail: The emailFail must be a valid email address');
        });
      });

    });

    describe('string', function() {
      it('should pass for strings', function() {
        return Checkit({
          isString: 'string'
        }).run(testBlock);
      });
    });

    describe('integer', function() {
      it('should pass for numbers and strings (positive and negative)', function() {
        return Checkit({
          integer: 'integer',
          negativeInteger: 'integer',
          stringInteger: 'integer',
          negativeStringInteger: 'integer'
        }).run(testBlock)
      });
    });

    describe('numeric', function() {
      it('should only pass for numbers for negative numbers and strings', function() {
        return Checkit({
          negativeInteger: 'numeric',
          negativeStringInteger: 'numeric'
        }).run(testBlock)
      });

      it('should pass for positive numbers and strings', function() {
        return Checkit({
          integer: 'numeric',
          stringInteger: 'numeric'
        }).run(testBlock)
      });

      it('should fail for NaN', function() {
        return Checkit({
          isNaN: 'numeric'
        }).run(testBlock).catch(function() {
          return true;
        }).then(function(val) { equal(val, true) })
      });

    });

    describe('isNumber', function() {

      it('should only pass for numbers', function() {
        return Checkit({
          integer: ['isNumber'],
          negativeInteger: ['isNumber']
        }).run(testBlock)
      });

      it('should fail for numbers in strings', function() {
        return Checkit({
          stringInteger: ['isNumber']
        }).run(testBlock).catch(function() {
          return true;
        }).then(function(val) { equal(val, true) })
      });

      it('should pass for NaN', function() {
        return Checkit({
          isNaN: ['isNumber']
        }).run(testBlock)
      });

    });

    describe('isNaN', function() {
      it('should only pass for NaN', function() {
        return Checkit({
          isNaN: ['isNaN']
        }).run(testBlock)
      });
    });

    describe('boolean', function() {

      it('should pass for true and false', function() {
        return Checkit({
          booleanTrue: ['boolean'],
          booleanFalse: ['boolean']
        }).run(testBlock)
      });

      it('should not pass for "true" and "false"', function() {
        return Checkit({
          trueString: ['boolean'],
          falseString: ['boolean']
        }).run(testBlock).catch(function() {
          return true;
        }).then(function(val) { equal(val, true) })
      });

      it('should not pass for 0 and 1', function() {
        return Checkit({
          zero: ['boolean'],
          one: ['boolean']
        }).run(testBlock).catch(function() {
          return true;
        }).then(function(val) { equal(val, true) })
      });

    });

    describe('ipv6', function() {

      it('should pass for short ipv6', function() {
        return Checkit({
          ipv6Short: ['ipv6']
        }).run(testBlock)
      });

      it('should pass for long ipv6', function() {
        return Checkit({
          ipv6Long: ['ipv6']
        }).run(testBlock)
      });

    });

    describe('uuid', function() {

      it('should pass for uuid v1', function() {
        return Checkit({
          uuidv1: ['uuid']
        }).run(testBlock)
      });

      it('should pass for uuid v4', function() {
        return Checkit({
          uuidv4: ['uuid']
        }).run(testBlock)
      });

    });

    describe('url', function() {

      it('should validate a http url', function() {
        return Checkit({
          url1: ['url']
        }).run(testBlock)
      });

      it('should validate a https url', function() {
        return Checkit({
          url2: ['url']
        }).run(testBlock)
      });

    });

    describe('misc', function() {

      it('should check ipv4 and addresses', function() {
        return Checkit({ipv4: ['ipv4']}).run(testBlock)
      });

      it('should return true on a valid base64 string', function() {
        return Checkit({base64: 'base64'}).run(testBlock)
      });

    });

    describe('arguments', function() {

      it('should pass with arguments', function() {
        return Checkit({isArguments: "isArguments"}).run(testBlock)
      });

    });

    describe('isEmpty', function() {

      it('passes on empty string, array, object, null', function() {
        return Checkit({
          isEmptyArray:  ['isEmpty'],
          isEmptyString: ['isEmpty'],
          isEmptyObject: ['isEmpty'],
          isEmptyNull:   ['isEmpty']
        }).run(testBlock)
      });

    });

  });

  describe('custom validation objects', function() {

    var vals = {
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
      return Checkit(vals).run({email: ''}).then(null, function(err) {
        equal(err.get('email').message, 'The Email Address Field is required');
        equal(err.get('first_name').message, 'You must supply a first name value');
        return Checkit(vals).run({first_name: 't'});
      }).then(null, function(err) {
        equal(err.get('first_name').message, 'The first name of this application must be at least 3 characters long');
      });
    });

    it('allows for custom params', function() {
      var containsTest = {
        arr: {
          rule: 'contains',
          params: [10]
        }
      };
      return Checkit(containsTest).run({arr: [0, 10, 20]}).then(function() {
        return Checkit(_.extend(containsTest, {arr: 'contains:10'})).run({arr: [0, 10, 20]});
      }).then(null, function(err) {
        equal(err.get('arr').message, 'The arr must contain 10');
      });
    });

  });

  describe('custom validation rules', function() {

    it('should run the rule function on the supplied value', function() {
      var value = 'value';
      var rulesTest = {
        valueTest: {
          rule: function(val) {
            equal(value, val);
          }
        }
      };
      return Checkit(rulesTest).run({valueTest: value})
    })

    it('should fail when the validation rule throws an error', function(){
      var rulesTest = {
        failedRuleTest: {
          rule: function(val){
            throw new Error('thrown from rule function');
          }
        }
      };
      return Checkit(rulesTest).run({failedRuleTest: "value"}).then(null, function(err){
        equal(err.get('failedRuleTest').message, 'thrown from rule function');
      });
    })

    it('should pass the supplied parameter to the validation rule', function(){
      var parameter = 'parameter';
      var rulesTest = {
        parameterTest: {
          rule: function(val, param){
            equal(parameter, param);
          },
          params: parameter
        }
      };
      return Checkit(rulesTest).run({parameterTest: "value"})
    })

    it('should pass the context property supplied to the run function to the rule function', function(){
      var runContext = 'the context';
      var rulesTest = {
        contextTest: {
          rule: function(val, params, context){
            equal(runContext, context);
          }
        }
      }
      return Checkit(rulesTest).run({contextTest: "value"}, runContext)
    })

  });

  describe('conditional items', function() {

    var checkit = Checkit({
      email: ['email']
    });
    checkit.maybe({email: ['contains:tim']}, function(item) {
      return item.first_name === 'tim';
    });

    it('validates for items that pass the conditional', function() {
      return checkit.run({email: 'joe@gmail.com', first_name: 'tim'})
        .then(function() {
          return Promise.reject(new Error('Should not pass'));
        }).catch(function(err) {
          equal(err.toString(), 'Checkit Errors - email: The email must contain tim');
        })
        .then(function() {
          return checkit.run({email: 'tim@gmail', first_name: 'tim'});
        })
        .then(function() {
          return Promise.reject(new Error('Should not pass'));
        })
        .catch(function(err) {
          equal(err.toString(), 'Checkit Errors - email: The email must be a valid email address');
        })
    });

    it('doesnt validate if the item doesnt pass the conditional', function() {
      return checkit.run({email: 'joe@gmail.com', first_name: 'joe'})
    });

    it('matches', function() {
      return Checkit({matchesEmail: ['matchesField:email']}).validate(testBlock)
    })

  });

  describe('nested items', function(){
    it('validates for nested items', function(){
      return Checkit({
        "info.email": ['required', 'email']
      }).run({info: {email: "joe@gmail.com"}})
    });
  });

});
