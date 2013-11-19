# Checkit.js

A promise based, DOM-independent validation module for Node.js and the Browser.

The [annotated source]() code is available for browsing.

## Basic Usage

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
})
```

-----

## Available Validators

<table>
  <thead>
    <tr>
      <th style="min-width:250px;">Validation Name</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr><td colspan="2">TODO</td></tr>
    <!--
    <tr>
      <td>accepted</td>
      <td>The field under validation must be yes, on, or 1. This is useful for validating "Terms of Service" acceptance.</td>
    </tr>
    <tr>
      <td>alpha</td>
      <td>The field under validation must be entirely alphabetic characters.</td>
    </tr>
    <tr>
      <td>alphaDash</td>
      <td>The field under validation may have alpha-numeric characters, as well as dashes and underscores.</td>
    </tr>
    <tr>
      <td>alphaNumeric</td>
      <td>The field under validation must be entirely alpha-numeric characters.</td>
    </tr>
    <tr>
      <td>alphaUnderscore</td>
      <td>The field under validation must be entirely alpha-numeric, with underscores but not dashes.</td>
    </tr>
    <tr>
      <td>base64</td>
      <td>The field under validation must be a base64 encoded value.</td>
    </tr>
    <tr>
      <td>between:min:max</td>
      <td>The field under validation must have a size between the given min and max.</td>
    </tr>
    <tr>
      <td>date</td>
      <td>The field under validation must be a valid date object.</td>
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
      <td>in:foo,bar,...</td>
      <td>The field under validation must be included in the given list of values.</td>
    </tr>
    <tr>
      <td>integer</td>
      <td>The field under validation must have an integer value.</td>
    </tr>
    <tr>
      <td>matchesField:fieldName</td>
      <td>The field under validation must exactly match the value of another `fieldName` under validation.</td>
    </tr>
    <tr>
      <td>ipv4</td>
      <td>The field under validation must be formatted as an IP address.</td>
    </tr>
    <tr>
      <td>max:value</td>
      <td>The field under validation must be less than a maximum value. Strings, numerics, and files are evaluated in the same fashion as the size rule.</td>
    </tr>
    <tr>
      <td>min:value</td>
      <td>The field under validation must have a minimum value. Strings, numerics, and files are evaluated in the same fashion as the size rule.</td>
    </tr>
    <tr>
      <td>not_in:foo,bar,...</td>
      <td>The field under validation must not be included in the given list of values.</td>
    </tr>
    <tr>
      <td>numeric</td>
      <td>The field under validation must have a numeric value.</td>
    </tr>
    <tr>
      <td>regex:pattern</td>
      <td>The field under validation must match the given regular expression.</td>
    </tr>
    <tr>
      <td>required</td>
      <td>The field under validation must be present in the input data.</td>
    </tr>
    <tr>
      <td>required_if:field,value</td>
      <td>The field under validation must be present if the field field is equal to value.</td>
    </tr>
    <tr>
      <td>required_with:foo,bar,...</td>
      <td>The field under validation must be present only if the other specified fields are present.</td>
    </tr>
    <tr>
      <td>required_without:foo,bar,...</td>
      <td>The field under validation must be present only when the other specified fields are not present.</td>
    </tr>
    <tr>
      <td>url</td>
      <td>The field under validation must be formatted as an URL.</td>
    </tr>
    -->
  </tbody>
</table>


### Conditionally adding rules

Sometimes you may wish to require a given field conditionally, for example require a field only if another field has a greater value than 100. Or you may need two fields to have a given value only when another field is present. Adding these validation rules doens't have to be a pain. First, create a `Checkit` instance with the main rules that never change:

```js
var checkit = new Checkit({
  firstName: ['required'],
  lastName: ['required'],
  email: ['required', 'email']
});
```

The first of the `maybe` method is the hash of validation fields / settings. The second argument is the function, evaluated with the object passed to the `Checkit` instance, and will add . This method makes it a breeze to build complex conditional validations.

```js
checkit.maybe({reason: ['required', 'max:500']}, function(input) {
    return input.games >= 100;
});
```

### Advanced &amp; Custom Validators:

Custom validators can be added in several ways. First, you may add a function to the `Checkit.Ctor.prototype`, returning a boolean value or a promise, with whether multiple

### Custom Error Messages:

If needed, you may use custom error messages for validation instead of the defaults. There are several ways to specify custom messages.

### Validation Examples:

TODO

### Change Log

#### 0.2.0

- `CheckIt` is now renamed `Checkit`
- Flipped the `validations` and `target` arguments, so the syntax is now `Checkit(validations).run(input)` rather than `Checkit(input).run(validations)`, allowing for re-use of the validation objects.
- Tons of other internal changes, probably too many to list, pretty much a rewrite from 0.1.0

#### 0.1.0

Initial release

