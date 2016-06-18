# Checkit.js

A DOM-independent validation library for **Node.js**, **io.js** and the **browser**.

It supports both sync

It allows you to seamlessly validate full javascript objects, defining custom messages, labels, and validations, with full support for asynchronous validations with promises. It supports [conditional validations](#conditional-validations), and has powerful, consistent [error structuring](#checkit-errors) and [utility methods](#error-utility-methods) for manipulating your errors' output any way you can imagine.

```js
var mainRules = Checkit(rules);

mainRules
  .run(obj)
  .then(function(validatedFields) {
    console.log('The fields: ' + _.keys(validatedFields).join(', ') + ' were validated!');
  })
  .caught(Checkit.Error, function(err) {
    $("#errors").html(err.map(function(val, key) {
      return '<li>' + key + ': ' + val.first().message + '</li>';
    }).join(''));
  });
```

#### Node.js

```
npm install checkit
```

#### Browser

The easiest way to use the library is with [webpack](http://webpack.github.io) or [browserify](http://browserify.org)

## API:

### Checkit(validators, [options])

The main `Checkit` constructor may be called with or without the `new` keyword, taking a hash of fields/rules for these fields to be validated.

#### Options:

##### language

Used to specify the default language key for using a particular language file, currently en, es, ru and fr are supported.

##### labels

Specifies labels for use in error messages for specific keys

##### messages

Adds specific messages for individual errors

#### Example:

### checkit.run
### checkit.validate (alias)

```js
var checkit = new Checkit({
  firstName: 'required',
  lastName: 'required',
  email: ['required', 'email']
});

var body = {
  email: 'test@example.com',
  firstName: 'Tim',
  lastName: 'Griesser',
  githubUsername: 'tgriesser'
};

checkit.run(body).then(function(validated) {
  console.log(validated);
}).catch(Checkit.Error, function(err) {
  console.log(err.toJSON());
})
```

### checkit.runSync
### checkit.validateSync (alias)

```js
var checkit = new Checkit({
  firstName: 'required',
  lastName: 'required',
  email: ['required', 'email']
});

var body = {
  email: 'test@example.com',
  firstName: 'Tim',
  lastName: 'Griesser',
  githubUsername: 'tgriesser'
};

var [err, validated] = checkit.validateSync(body)

// ...

```

### Checkit.check(key, value, rules)

```js
Checkit.check('email', email, ['required', 'validEmail'])
  .catch(function(err) {
    console.log(err.message)
  });
```

### Checkit.checkSync(key, value, rules)

```js
// ES6...
var [err, resp] = Checkit.checkSync('email', email, ['required', 'validEmail'])  

if (err) {

} else {
  // ...
}
```

## Available Validators

<table>
  <thead>
    <tr>
      <th style="min-width:250px;">Validation Name</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>accepted</td>
      <td>The value must be yes, on, or 1. This is useful for validating "Terms of Service" acceptance.</td>
    </tr>
    <tr>
      <td>alpha</td>
      <td>The value must be entirely alphabetic characters.</td>
    </tr>
    <tr>
      <td>alphaDash</td>
      <td>The value may have alpha-numeric characters, as well as dashes and underscores.</td>
    </tr>
    <tr>
      <td>alphaNumeric</td>
      <td>The value must be entirely alpha-numeric characters.</td>
    </tr>
    <tr>
      <td>alphaUnderscore</td>
      <td>The value must be entirely alpha-numeric, with underscores but not dashes.</td>
    </tr>
    <tr>
      <td>arguments</td>
      <td>The value must be
      a javascript "arguments" object.</td>
    </tr>
    <tr>
      <td>array</td>
      <td>The value must be
      a valid array object.</td>
    </tr>
    <tr>
      <td>base64</td>
      <td>The value must be a base64 encoded value.</td>
    </tr>
    <tr>
      <td>between:min:max</td>
      <td>The value must have a size between the given min and max.</td>
    </tr>
    <tr>
      <td>boolean</td>
      <td>The value must be a javascript boolean.</td>
    </tr>
    <tr>
      <td>contains:value</td>
      <td>The value must contain the value. For a string, it does an "indexOf" check, an array "_.indexOf" and for an object "_.has".</td>
    </tr
    <tr>
      <td>date</td>
      <td>The value must be a valid date object.</td>
    </tr>
    <tr>
      <td>different:fieldName</td>
      <td>The given field must be different than the `fieldName` under validation.</td>
    </tr>
    <tr>
      <td>email</td>
      <td>The field must be a valid formatted e-mail address.</td>
    </tr>
    <tr>
      <td>empty</td>
      <td>The value under validation must be empty; either an empty string, an empty, array, empty object, or a falsy value.</td>
    </tr>
    <tr>
      <td>exactLength:value</td>
      <td>The field must have the exact length of "val".</td>
    </tr>
    <tr>
      <td>exists</td>
      <td>The value under validation must not be undefined.</td>
    </tr>
    <tr>
      <td>finite</td>
      <td>The value under validation must be a finite number.</td>
    </tr>
    <tr>
      <td>function</td>
      <td>The value under validation must be a function.</td>
    </tr>
    <tr>
      <td>greaterThan:value</td>
      <td>The value under validation must be "greater than" the given value.</td>
    </tr>
    <tr>
      <td>greaterThanEqualTo:value</td>
      <td>The value under validation must be "greater than" or "equal to" the given value.</td>
    </tr>
    <tr>
      <td>integer</td>
      <td>The value must have an integer value.</td>
    </tr>
    <tr>
      <td>ipv4</td>
      <td>The value must be formatted as an IPv4 address.</td>
    </tr>
    <tr>
      <td>ipv6</td>
      <td>The value must be formatted as an IPv6 address.</td>
    </tr>
    <tr>
      <td>lessThan:value</td>
      <td>The value must be "less than" the specified value.</td>
    </tr>
    <tr>
      <td>lessThanEqualTo:value</td>
      <td>The value must be "less than" or "equal to" the specified value.</td>
    </tr>
    <tr>
      <td>luhn</td>
      <td>The given value must pass a basic luhn (credit card) check regular expression.</td>
    </tr>
    <tr>
      <td>matchesField:fieldName</td>
      <td>The value must exactly match the value of another `fieldName` under validation.</td>
    </tr>
    <tr>
      <td>max:value</td>
      <td>The value must be less than a maximum value. Strings, numerics, and files are evaluated in the same fashion as the size rule.</td>
    </tr>
    <tr>
      <td>maxLength:value</td>
      <td>The value must have a length property which is less than or equal to the specified value. Note, this may be used with both arrays and strings.</td>
    </tr>
    <tr>
      <td>min:value</td>
      <td>The value must have a minimum value. Strings, numerics, and files are evaluated in the same fashion as the size rule.</td>
    </tr>
    <tr>
      <td>minLength:value</td>
      <td>The value must have a length property which is greater than or equal to the specified value. Note, this may be used with both arrays and strings.</td>
    </tr>
    <tr>
      <td>NaN</td>
      <td>The value must be <tt>NaN</tt>.</td>
    </tr>
    <tr>
      <td>natural</td>
      <td>The value must be a natural number (a number greater than or equal to 0).</td>
    </tr>
    <tr>
      <td>naturalNonZero</td>
      <td>The value must be a natural number, greater than or equal to 1.</td>
    </tr>
    <tr>
      <td>null</td>
      <td>The value must be <tt>null</tt>.</td>
    </tr>
    <tr>
      <td>number</td>
      <td>The value must be a javascript <tt>Number</tt>.</td>
    </tr>
    <tr>
      <td>numeric</td>
      <td>The value must have a numeric value.</td>
    </tr>
    <tr>
      <td>object</td>
      <td>The value must pass an <tt>_.isObject</tt> check.</td>
    </tr>
    <tr>
      <td>plainObject</td>
      <td>The value must be an object literal.</td>
    </tr>
    <tr>
      <td>regExp</td>
      <td>The value must be a javascript <tt>RegExp</tt> object.</td>
    </tr>
    <tr>
      <td>required</td>
      <td>The value must be present in the input data.</td>
    </tr>
    <tr>
      <td>string</td>
      <td>The value must be a string type.</td>
    </tr>
    <tr>
      <td>url</td>
      <td>The value must be formatted as an URL.</td>
    </tr>
    <tr>
      <td>uuid</td>
      <td>Passes for a validly formatted UUID.</td>
    </tr>
  </tbody>
</table>


## Conditional Validations

Sometimes you may wish to require a given field conditionally, for example require a field only if another field has a greater value than 100. Or you may need two fields to have a given value only when another field is present. Adding these validation rules doens't have to be a pain. First, create a `Checkit` instance with the main rules that never change:

```js
var checkit = new Checkit({
  firstName: ['required'],
  lastName: ['required'],
  email: ['required', 'email']
});
```

Then use the `maybe` method to add additional rules:

### .maybe(rules, handler)

The first of the `maybe` method is the hash of validation fields / settings, similar to the main `Checkit` object. The second argument is a function, evaluated with the object being validated, and if it returns explicitly `true` or with a promise fulfilling with `true`, it will add an additional validator to the `Checkit` object.

This method makes building complex conditional validations a snap.

```js
// In this example, the "authorBio" field is only required if there are
// more than 5 books specified in the input object
checkit.maybe({authorBio: ['required', 'max:500']}, function(input) {
  return input.books > 5;
});
```

## Advanced &amp; Custom Validators:

First, and simplest, you can specify a function on the validation array for a property. For example:

```js
{
  email: ['email', function(val) {
    return knex('accounts').where('email', '=', val).then(function(resp) {
      if (resp.length > 0) throw new Error('The email address is already in use.')
    })
  }]
}
```

You may also specify an object in one of the validator slots, specifying at the minimum a **rule**, and optionally *params*, *label*, and *message*.

```js
{
  email: {
    rule: 'email',
    label: 'Email'
  },
  first_name: [{
    rule: 'required',
    message: 'You must supply a first name value!!'
  }, {
    rule: 'minLength:3',
    label: 'first name of this application'
  }],
  arr: {
    rule: 'contains',
    params: [10] // Number => Different behavior than "contains:10"
  }
}
```

You may also use the `context` parameter passed to `run` when using a function on the validation array of a property. This can be particularly useful if your validation function needs to execute within a transaction:

```js
{
  email: {
    rule: function(val, params, context){
      var query = knex('users');
      if (context && context.transacting){
        query.transacting(context.transacting);
      }

      return query.where('email', '=', val)
        .andWhere('id', '<>', this.target.id)
        .then(function(resp){
          if (resp.length > 0){
            throw new Error('The email address is already in use.');
          }
        });
    }
  }
}
```

Second, you may add a custom validator to the `Checkit.Validator` object's prototype, returning a boolean value or a promise.

```js
Checkit.Validator.prototype.unused = function(val, table, column) {
  return knex(table).where(column, '=', val).andWhere('id', '<>', this._target.id).then(function(resp) {
    if (resp.length > 0) {
      throw new Error('The ' + table + '.' + column + ' field is already in use.');
    }
  });
}

{
  email: ['email', 'unused:accounts:email']
}
```

## Checkit Errors

One of the main features of `Checkit` is the error handling; By extending the error object with utility methods from underscore, the errors are even easier to work with.

- [Checkit.Error](#checkiterror)
- [Checkit.FieldError](#checkitfielderror)
- [Checkit.ValidationError](#checkitvalidationerrror)

### Checkit.Error

The main Error object, `Checkit.Error` is returned from the has several helper methods & properties, as well as a number of utility methods:

#### .errors

The "errors" property of a `Checkit.Error` object is a hash of errors for each of the fields which are considered "invalid" in any way by the validation rules. The keys in this hash are the invalid fields, and the values are [Checkit.FieldError](#checkitfielderror) objects, which in-turn have an `errors` attribute, an array containing errors for each failed rule.

#### .get(key)

The `get` method returns the `Checkit.FieldError` object for a specific key, or `undefined` if one does not exist.

#### .toString([flat])

Useful for debugging, the `toString` method converts the `Checkit` error into a human readable representation of the failed validation. If the `flat` argument is passed as a "truthy" value, it will output only the first `ValidationError` in the `FieldError`; otherwise it will output each validation message in a comma separated string.

#### .toJSON()

Converts the current error object to a json representation of the error, for easy use/refinement elsewhere. For other methods, such as map, reduce, each, see the [utility methods](#utility-methods) section.

### Checkit.FieldError

A `FieldError` is an error that contains all of the sub-errors for the validation of an individual item in the validated hash.

#### fieldError.errors

The `errors` property of a `FieldError` is

### Checkit.ValidationErrror

A `ValidationError` is the result of an individual error in the field rule.

### Error Utility Methods

The following methods are underscore methods proxied to the `Checkit.Error` and `Checkit.FieldError` objects, for easy manipulation of the `.errors` object contained in each.

##### shared (Checkit.Error & FieldError)

- [each](http://underscorejs.org/#each)
- [forEach](http://underscorejs.org/#each)
- [map](http://underscorejs.org/#map)
- [reduce](http://underscorejs.org/#reduce)
- [reduceRight](http://underscorejs.org/#reduceRight)
- [find](http://underscorejs.org/#find)
- [filter](http://underscorejs.org/#filter)
- [reject](http://underscorejs.org/#reject)
- [invoke](http://underscorejs.org/#invoke)
- [toArray](http://underscorejs.org/#toArray)
- [size](http://underscorejs.org/#size)
- [shuffle](http://underscorejs.org/#shuffle)

##### Checkit.Error only

- [keys](http://underscorejs.org/#keys)
- [values](http://underscorejs.org/#values)
- [pairs](http://underscorejs.org/#pairs)
- [invert](http://underscorejs.org/#invert)
- [pick](http://underscorejs.org/#pick)
- [omit](http://underscorejs.org/#omit)

##### Checkit.FieldError only

- [first](http://underscorejs.org/#first)
- [initial](http://underscorejs.org/#initial)
- [rest](http://underscorejs.org/#rest)
- [last](http://underscorejs.org/#last)

## Other Helpers

### Checkit.labelTransform(fn)

The `Checkit.labelTransform` method takes a function that receives the field name and returns a human-readable label for use in error messages.


## Change Log

### 0.7.0

- Expect a global `Promise` instance. **Breaking change** #69
- Add meaningful message for integer validation. #46
- Add string validation. #58
- Compatible with Lodash 4.x only. #55
- More permissive email regex. #61, #68
- Only bundle required lodash methods. #69

### 0.6.0

- Separate codepath for server (bluebird) and client (when.js)
- Add French and Russian translations.
- Allow new longer top level domains in emails.

### 0.5.1

- Minor bugfixes

### 0.5.0

- Major internal refactoring, using when.js to shave bytes in the browser build.
- Added sync api with runSync / checkSync / validateSync
- Alias `validate` for `run`

### 0.2.0

- `CheckIt` is now renamed `Checkit`
- Flipped the `validations` and `target` arguments, so the syntax is now `Checkit(validations).run(input)` rather than `Checkit(input).run(validations)`, allowing for re-use of the validation objects.
- Tons of other internal changes, probably too many to list, pretty much a rewrite from 0.1.0

### 0.1.0

Initial release
