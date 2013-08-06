Checkit
===============

[![Build Status](https://travis-ci.org/tgriesser/checkit.png)](https://travis-ci.org/tgriesser/checkit)

## Simple, DOM independent javascript validations for Node.js and the browser

The Checkit library aims to be a lightweight, flexible, validation library,
with no dependence on the DOM, targeting both Node.js and the browser.

Checkit depends on [underscore.js](http://underscorejs.org), and (optionally)
[when.js](https://github.com/cujojs/when) for using the library asynchronously with promises. If you
wish to use when, but would rather use browser globals than a package manager, a shimmed version of
when is included in the `/lib` directory for your convenience.

## Getting Started

Creating a Checkit object starts with specifying a **target** to be validated, as well as an optional
**options** object to help setup the validation settings such as **language** and **async**.

```js
var validator  = Checkit(target, options);
```

## Validating an object

The `run` method passes through to `runAsync` or `runSync` depending on whether the async flag is set globally or in the
options passed to the `Checkit` object.

```js
validator.run(validations);
```

### Methods:

**run([rules])**

The rules are optional, particularly

### Validation options:

If no language is specified, then the value of `Checkit.defaultLanguage` will
be used (defaults to "en").

### Checkit.Error

The `Checkit.Error` object is used to handle all errors. If a validation is run synchronously,
the validation will return false and this value will be set to the `.validationError` property
on the currently validating instance. If the validation is run asynchronously, this error will
be passed in rejecting the promise.

**get(key)**

Gets the array of validation error messages for a particular key off the validation object.

**first(key)**

Gets the first of validation error messages for a particular key.

**toJSON([all])**

Turns the validation errors into a hash. If the optional **all** is set to true, then it
returns an array of messages rather than the first validation message for each error key.

**toString()**

A string saying how many errors have been triggered total in the current validation.

---

### Example Data:

```js
var example = {
  'user' : 'Joe User',
  'email' : 'joe@example.com',
  'password' : '123',
  'password_confirm' : '456'
};
```

#### Example 1: Simple Validation

```js
Checkit(example).run({
  'user'     : ['required', 'alphaDash', 'maxLength:255'],
  'email'    : ['required', 'validEmail'],
  'password' : ['required']
  'password_confirm': ['matchesField:password']
}).then(function(validator) {

}, function(err) {

});
```

### Example 2: Custom Validation

```js
Checkit(example).run({
  'user'     : ['']
});

```

