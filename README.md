
CheckIt
===============

## Simple validations for node.js and the browser

The CheckIt library aims to be a lightweight, flexible, validation library,
with no dependence on the DOM, targeting both Node.js and the browser.

CheckIt depends on [underscore.js](http://underscorejs.org), the underscore.function.predicates.js
of [underscore-contrib](https://github.com/documentcloud/underscore-contrib) and (optionally)
[when.js](https://github.com/cujojs/when) for using the library asynchronously with promises. If you
wish to use when, but would rather use browser globals than a package manager, a shimmed version of
when is included in the `/lib` directory for your convenience.

## Getting Started

Creating a CheckIt object starts with specifying a **target** to be validated, as well as an optional
**options** object to help setup the validation settings such as **language** and **async**.

```js
var validator  = CheckIt(target, options);
```

## Validating an object

The `run` method passes through to `runAsync` or `runSync` depending on whether the async flag is set globally or in the
options passed to the `CheckIt` object.

```js
validator.run(validations);
```

### Methods:

**setLabels(labels)**

Applies the labels for the current validation values, so error messages aren't weird looking and such.

**applyToAll(rules)**

Takes a rule, or array of rules to be applied against each item in the validation target.

**run([rules])**

The rules are optional, particularly

## Validation options:

If no language is specified, then the value of `CheckIt.defaultLanguage` will
be used (defaults to "en").


### Errors:

The `CheckIt.Error` object is used to handle all errors. If a validation is run synchronously,
the validation will return false and this value will be set to the `.validationError` property
on the currently validating instance. If the validation is run asynchronously, this error will
be passed in rejecting the promise.

---

### Example:

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
CheckIt(example).run({
  'user'     : ['required', 'alphaDash', 'maxLength:255'],
  'email'    : ['required', 'validEmail'],
  'password' : ['required']
  'password_confirm': ['matchesField:password']
}).then(function(validator) {

}, function(err) {

});
```
