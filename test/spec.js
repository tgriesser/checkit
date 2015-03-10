describe('Checkit', function() {

  var handler = function(dfd, ok, onRejected) {
    dfd.then(null, onRejected).then(function() {
      ok();
    }).then(null, function(err) {
      ok(err.toString());
    });
  };

  describe('.check', function() {

    it('should accept a field, value, and rules', function(ok) {

      Checkit.check('email', 'tim@tgriesser', ['required', 'email']).then(null, function(err) {
        equal(err instanceof Checkit.FieldError, true);
        equal(err.message, 'The email must be a valid email address');
        ok();
      });

    });

  });

  describe('validators', function() {

    describe('accepted', function() {

      it('passes with on', function(ok) {
        handler(Checkit({
          accepted1: 'accepted',
          accepted2: 'accepted',
          accepted3: 'accepted',
          accepted4: 'accepted'
        }).run(testBlock), ok);
      });

    });

    describe('between', function() {

      it('should pass for numbers', function(ok) {
        handler(Checkit({
          integer: ['between:10:15']
        }).run(testBlock), ok);
      });

      it('should pass for numbers in strings', function(ok) {
        handler(Checkit({
          stringInteger: ['between:10:15']
        }).run(testBlock), ok);
      });

      it('should fail if the value is outside the range', function(ok) {
        handler(Checkit({
          integer: ['between:0:10']
        }).run(testBlock), ok, function() {});
      });

    });

    describe('range', function() {
      it('should pass for numbers', function(ok) {
        handler(Checkit({
          integer: ['between:10:15']
        }).run(testBlock), ok);
      });

      it('should pass for numbers in strings', function(ok) {
        handler(Checkit({
          stringInteger: ['between:10:15']
        }).run(testBlock), ok);
      });

      it('should fail if the value is outside the range', function(ok) {
        handler(Checkit({
          integer: ['between:0:10']
        }).run(testBlock), ok, function() {});
      });

      it('should treat the min values as inclusive', function(ok) {
        handler(Checkit({
          integer: ['between:12:13']
        }).run(testBlock), ok, function() {});
      });

      it('should treat the max values as inclusive', function(ok) {
        handler(Checkit({
          integer: ['between:0:12']
        }).run(testBlock), ok, function() {});
      });
    });

    describe('emails', function() {

      it('passes with a valid email', function(ok) {
        handler(Checkit({email: ['email']}).run(testBlock), ok);
      });

      it('does not run on an empty input', function(ok) {
        handler(Checkit({email: ['email']}).run(testBlock), ok);
      });

      it('fails with an invalid email', function(ok) {
        handler(Checkit({emailFail: ['email']}).run(testBlock), ok, function(err) {
          equal(err.get('emailFail').toString(), 'emailFail: The emailFail must be a valid email address');
        });
      });

    });

    describe('integer', function() {
      it('should pass for numbers and strings (positive and negative)', function(ok) {
        handler(Checkit({
          integer: 'integer',
          negativeInteger: 'integer',
          stringInteger: 'integer',
          negativeStringInteger: 'integer'
        }).run(testBlock), ok);
      });
    });

    describe('numeric', function() {
      it('should only pass for numbers for negative numbers and strings', function(ok) {
        handler(Checkit({
          negativeInteger: 'numeric',
          negativeStringInteger: 'numeric'
        }).run(testBlock), ok);
      });

      it('should pass for positive numbers and strings', function(ok) {
        handler(Checkit({
          integer: 'numeric',
          stringInteger: 'numeric'
        }).run(testBlock), ok);
      });

      it('should fail for NaN', function(ok) {
        handler(Checkit({
          isNaN: 'numeric'
        }).run(testBlock), ok, function() {});
      });

    });

    describe('isNumber', function() {

      it('should only pass for numbers', function(ok) {
        handler(Checkit({
          integer: ['isNumber'],
          negativeInteger: ['isNumber']
        }).run(testBlock), ok);
      });

      it('should fail for numbers in strings', function(ok) {
        handler(Checkit({
          stringInteger: ['isNumber']
        }).run(testBlock), ok, function() {});
      });

      it('should pass for NaN', function(ok) {
        handler(Checkit({
          isNaN: ['isNumber']
        }).run(testBlock), ok);
      });

    });

    describe('isNaN', function(ok) {
      it('should only pass for NaN', function(ok) {
        handler(Checkit({
          isNaN: ['isNaN']
        }).run(testBlock), ok);
      });
    });

    describe('boolean', function() {

      it('should pass for true and false', function(ok) {
        handler(Checkit({
          booleanTrue: ['boolean'],
          booleanFalse: ['boolean']
        }).run(testBlock), ok);
      });

      it('should not pass for "true" and "false"', function(ok) {
        handler(Checkit({
          trueString: ['boolean'],
          falseString: ['boolean']
        }).run(testBlock), ok, function() {});
      });

      it('should not pass for 0 and 1', function(ok) {
        handler(Checkit({
          zero: ['boolean'],
          one: ['boolean']
        }).run(testBlock), ok, function() {});
      });

    });

    describe('ipv6', function() {

      it('should pass for short ipv6', function(ok) {
        handler(Checkit({
          ipv6Short: ['ipv6']
        }).run(testBlock), ok);
      });

      it('should pass for long ipv6', function(ok) {
        handler(Checkit({
          ipv6Long: ['ipv6']
        }).run(testBlock), ok);
      });

    });

    describe('uuid', function() {

      it('should pass for uuid v1', function(ok) {
        handler(Checkit({
          uuidv1: ['uuid']
        }).run(testBlock), ok);
      });

      it('should pass for uuid v4', function(ok) {
        handler(Checkit({
          uuidv4: ['uuid']
        }).run(testBlock), ok);
      });

    });

    describe('url', function() {

      it('should validate a http url', function(ok) {
        handler(Checkit({
          url1: ['url']
        }).run(testBlock), ok);
      });

      it('should validate a https url', function(ok) {
        handler(Checkit({
          url2: ['url']
        }).run(testBlock), ok);
      });

    });

    describe('misc', function() {

      it('should check ipv4 and addresses', function(ok) {
        handler(Checkit({ipv4: ['ipv4']}).run(testBlock), ok);
      });

      it('should return true on a valid base64 string', function(ok) {
        handler(Checkit({base64: 'base64'}).run(testBlock), ok);
      });

    });

    describe('arguments', function() {

      it('should pass with arguments', function(ok) {
        handler(Checkit({isArguments: "isArguments"}).run(testBlock), ok);
      });

    });

    describe('isEmpty', function() {

      it('passes on empty string, array, object, null', function(ok) {
        handler(Checkit({
          isEmptyArray:  ['isEmpty'],
          isEmptyString: ['isEmpty'],
          isEmptyObject: ['isEmpty'],
          isEmptyNull:   ['isEmpty']
        }).run(testBlock), ok);
      });

    });

  });

  describe('Checkit.Error', function () {

    it('should be an instanceof Error', function () {
      var error = new Checkit.Error(Checkit());
      equal((error instanceof Error), true);
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

    it('allows for custom labels and messages', function(ok) {
      Checkit(vals).run({email: ''}).then(null, function(err) {
        equal(err.get('email').message, 'The Email Address Field is required');
        equal(err.get('first_name').message, 'You must supply a first name value');
        return Checkit(vals).run({first_name: 't'});
      }).then(null, function(err) {
        equal(err.get('first_name').message, 'The first name of this application must be at least 3 characters long');
      }).then(function() {
        ok();
      }, ok);
    });

    it('allows for custom params', function(ok) {
      var containsTest = {
        arr: {
          rule: 'contains',
          params: [10]
        }
      };
      Checkit(containsTest).run({arr: [0, 10, 20]}).then(function() {
        return Checkit(_.extend(containsTest, {arr: 'contains:10'})).run({arr: [0, 10, 20]});
      }).then(null, function(err) {
        equal(err.get('arr').message, 'The arr must contains 10');
      }).then(function() {
        ok();
      }, ok);
    });

  });

  describe('custom validation rules', function() {
    
    it('should run the rule function on the supplied value', function(ok) {
      var value = 'value';
      var rulesTest = {
        valueTest: {
          rule: function(val) {
            equal(value, val);
          }
        }
      };
      handler(Checkit(rulesTest).run({valueTest: value}), ok);
    })
    
    it('should fail when the validation rule throws an error', function(ok){
      var rulesTest = {
        failedRuleTest: {
          rule: function(val){
            throw new Error('thrown from rule function');
          }
        }
      };
      Checkit(rulesTest).run({failedRuleTest: "value"}).then(null, function(err){
        equal(err.get('failedRuleTest').message, 'thrown from rule function');
      }).then(function() {
        ok();
      }, ok);
    })
    
    it('should pass the supplied parameter to the validation rule', function(ok){
      var parameter = 'parameter';
      var rulesTest = {
        parameterTest: {
          rule: function(val, param){
            equal(parameter, param);
          },
          params: parameter
        }
      };
      handler(Checkit(rulesTest).run({parameterTest: "value"}), ok);
    })
    
    it('should pass the context property supplied to the run function to the rule function', function(ok){
      var runContext = 'the context';
      var rulesTest = {
        contextTest: {
          rule: function(val, params, context){
            equal(runContext, context);
          }
        }
      }
      handler(Checkit(rulesTest).run({contextTest: "value"}, runContext), ok);
    })
    
  });

  describe('conditional items', function() {

    var checkit = Checkit({
      email: ['email']
    });
    checkit.maybe({email: ['contains:tim']}, function(item) {
      return item.first_name === 'tim';
    });

    it('validates for items that pass the conditional', function(ok) {
      checkit.run({email: 'joe@gmail.com', first_name: 'tim'})
        .then(function() {
          return Promise.reject(new Error('Should not pass'));
        }, function(err) {
          equal(err.toString(), 'Checkit Errors - email: The email must contains tim');
        })
        .then(null, ok)
        .then(function() {
          return checkit.run({email: 'tim@gmail', first_name: 'tim'});
        })
        .then(function() {
          return Promise.reject(new Error('Should not pass'));
        }, function(err) {
          equal(err.toString(), 'Checkit Errors - email: The email must be a valid email address');
          ok();
        })
        .then(null, ok);
    });

    it('doesnt validate if the item doesnt pass the conditional', function(ok) {
      checkit.run({email: 'joe@gmail.com', first_name: 'joe'}).then(function() {
        ok();
      });
    });

  });

  describe('nested items', function(){
    it('validates for nested items', function(ok){
      handler(Checkit({
        "info.email": ['required', 'email']
      }).run({info: {email: "joe@gmail.com"}}), ok);
    });
  });

});
